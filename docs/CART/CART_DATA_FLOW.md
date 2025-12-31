# 📊 تدفق البيانات في نظام الكارت - Cart Data Flow

## 🔄 تدفق البيانات الكامل

### 📥 طبقات النظام (System Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                         🎨 UI LAYER                              │
│  Components: CartItems.tsx, CartQuantity.tsx, OrderSummary.tsx  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     🎣 HOOKS LAYER                               │
│              useCart.ts - الواجهة الموحدة                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────┴───────────────┐
        ↓                                ↓
┌───────────────────┐          ┌────────────────────┐
│  💾 CLIENT STATE  │          │  🌐 SERVER ACTIONS │
│  cart-store.ts    │          │    cart.ts         │
│   (Zustand +      │          │  (Server Actions)  │
│   localStorage)   │          │                    │
└───────────────────┘          └─────────┬──────────┘
        │                                ↓
        │                      ┌──────────────────────┐
        │                      │   🗄️ DATABASE        │
        │                      │  PostgreSQL          │
        └─────────────────────→│  - cart              │
          (للزوار فقط)         │  - cartItems         │
                               └──────────────────────┘
```

---

## 🔍 تفصيل العمليات

### ➕ عملية إضافة منتج (Add Item Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│                    GUEST USER (زائر)                             │
└──────────────────────────────────────────────────────────────────┘

🖱️ User clicks "Add to Cart" on ProductCard
    ↓
📍 ProductCard.tsx
    ├─ const { addItem } = useCart()    └─ await addItem({ productId, quantity, product })
        ↓
    📍 hooks/useCart.ts
        ├─ setIsLoading(true)
        ├─ 1️⃣ addItemLocal(item) ← تحديث فوري
        │   ↓
        │   📍 cart-store.ts → addItem()
        │       ├─ const existing = items.find(...)
        │       ├─ if (existing)
        │       │   └─ ✅ UPDATE quantity
        │       └─ else
        │           └─ ✅ INSERT new item with tempId
        │       ↓
        │       💾 Zustand → localStorage['cart-storage']
        │       ↓
        │       ⚡ UI re-renders instantly
        │
        ├─ 2️⃣ if (user?.id) ← لا يوجد user
        │   └─ ❌ SKIP (زائر)
        │
        ├─ setIsLoading(false)
        └─ 🔔 toast({ title: "Added to Cart" })

💡 النتيجة: المنتج محفوظ في localStorage فقط


┌──────────────────────────────────────────────────────────────────┐
│               LOGGED-IN USER (مستخدم مسجل)                       │
└──────────────────────────────────────────────────────────────────┘

🖱️ User clicks "Add to Cart"
    ↓
📍 ProductCard.tsx → useCart().addItem(...)
    ↓
📍 hooks/useCart.ts
    ├─ 1️⃣ LOCAL UPDATE (Optimistic)
    │   ↓
    │   addItemLocal(item)
    │   ↓
    │   📍 cart-store.ts
    │       └─ 💾 localStorage updated ⚡ سريع جداً
    │
    ├─ 2️⃣ SERVER SYNC
    │   ↓
    │   if (user?.id) ✓
    │   ↓
    │   📡 await addToCartAction(user.id, productId, quantity)
    │   ↓
    │   📍 lib/actions/cart.ts → addToCartAction()
    │       ├─ 🔐 db.transaction(async (tx) => {
    │       │
    │       ├─ ✔️ 1. Validate User
    │       │   └─ const user = await tx.query.users.findFirst(...)
    │       │
    │       ├─ ✔️ 2. Validate Product
    │       │   └─ const product = await tx.query.products.findFirst(...)
    │       │
    │       ├─ ✔️ 3. Validate Stock
    │       │   ├─ const stock = product.quantityInStock ?? 0
    │       │   ├─ validateQuantity(quantity, stock)
    │       │   └─ if (stock < quantity) throw Error
    │       │
    │       ├─ 4. Get or Create Cart
    │       │   ├─ let [userCart] = await tx.select().from(cart)...
    │       │   └─ if (!userCart)
    │       │       └─ [userCart] = await tx.insert(cart)...
    │       │
    │       ├─ 5. Check Existing Item
    │       │   └─ let [existing] = await tx.select().from(cartItems)...
    │       │
    │       ├─ 6. Insert or Update
    │       │   ├─ if (existing)
    │       │   │   └─ await tx.update(cartItems)
    │       │   │       .set({ quantity: existing.quantity + quantity })
    │       │   └─ else
    │       │       └─ await tx.insert(cartItems)
    │       │           .values({ cartId, productId, quantity })
    │       │
    │       ├─ 7. Recalculate Total
    │       │   └─ await recalcCartTotalTx(tx, userCart.id)
    │       │       ├─ const items = await tx.query.cartItems.findMany(...)
    │       │       ├─ const { total } = calculateCartTotal(items, coupon)
    │       │       └─ await tx.update(cart).set({ totalAmount: total })
    │       │
    │       └─ }) ← 🔐 COMMIT all changes
    │       ↓
    │       return { success: true, data: item }
    │   ↓
    │   if (result.success)
    │       ✅ router.refresh() → Next.js re-fetches server data
    │   else
    │       ❌ removeItemLocal(productId) → ROLLBACK
    │       throw new Error(result.error)
    │
    └─ 🔔 toast({ title: "Added to Cart" })

💡 النتيجة: المنتج في localStorage + Database
```

---

### 🔄 عملية تحديث الكمية (Update Quantity Flow)

```
🖱️ User clicks +/- في CartQuantity.tsx
    ↓
📍 CartQuantity.tsx
    ├─ const { updateItemQuantity } = useCart()
    └─ await updateItemQuantity(cartItemId, newQuantity)
        ↓
    📍 hooks/useCart.ts → updateItemQuantity()
        ├─ 💾 const previousItem = getItemById(cartItemId)
        │   └─ الاحتفاظ بالقيمة للRollback
        │
        ├─ 1️⃣ Optimistic Update
        │   └─ updateQuantityLocal(cartItemId, newQuantity)
        │       ↓
        │       📍 cart-store.ts → updateQuantity()
        │           ├─ if (quantity <= 0)
        │           │   └─ removeItem(cartItemId)
        │           └─ else
        │               └─ set({
        │                   items: items.map(item =>
        │                     item.id === cartItemId
        │                       ? { ...item, quantity }
        │                       : item
        │                   )
        │                 })
        │           ↓
        │           💾 localStorage updated ⚡
        │
        ├─ 2️⃣ Server Sync (if logged-in)
        │   ↓
        │   if (user?.id) ✓
        │   ↓
        │   📡 await updateCartItem(cartItemId, newQuantity)
        │   ↓
        │   📍 lib/actions/cart.ts → updateCartItem()
        │       ├─ 🔐 db.transaction(async (tx) => {
        │       │
        │       ├─ const item = await tx.query.cartItems.findFirst({
        │       │   where: eq(cartItems.id, cartItemId),
        │       │   with: { product: true }
        │       │ })
        │       │
        │       ├─ ✔️ Validate Stock
        │       │   ├─ const stock = item.product.quantityInStock
        │       │   └─ validateQuantity(newQuantity, stock)
        │       │
        │       ├─ await tx.update(cartItems)
        │       │   .set({ quantity: newQuantity })
        │       │   .where(eq(cartItems.id, cartItemId))
        │       │
        │       └─ await recalcCartTotalTx(tx, item.cartId)
        │       }) ← 🔐 COMMIT
        │   ↓
        │   if (!result.success)
        │       ❌ updateQuantityLocal(cartItemId, previousItem.quantity)
        │       └─ ROLLBACK to previous value
        │
        └─ 🔔 toast(...)
```

---

### 🔀 عملية دمج الكارت (Cart Merge Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│         SCENARIO: زائر لديه 3 منتجات في localStorage             │
│                    ثم يسجل الدخول                                │
└──────────────────────────────────────────────────────────────────┘

👤 Visitor localStorage:
    └─ items: [
         { id: 1, productId: 101, quantity: 2 },
         { id: 2, productId: 102, quantity: 1 },
         { id: 3, productId: 103, quantity: 3 }
       ]

🔐 User logs in
    ↓
📍 lib/stores/unified-auth-store.ts → onAuthSuccess()
    ↓
    ┌─────────────────────────────────────┐
    │  🔒 STEP 1: Acquire Merge Lock      │
    └─────────────────────────────────────┘
    ↓
    📍 lib/utils/cart-merge-lock.ts
        ├─ const locked = await cartMergeLock.acquire(userId)
        ├─ if (locked) ✓
        │   └─ Lock acquired successfully
        └─ else ❌
            └─ Another merge in progress, SKIP

    ↓
    ┌─────────────────────────────────────┐
    │  📋 STEP 2: Get Local Items         │
    └─────────────────────────────────────┘
    ↓
    📍 cart-store.ts → getLocalCartItems()
        └─ returns: [item1, item2, item3]

    ↓
    ┌─────────────────────────────────────┐
    │  🔀 STEP 3: Merge Operation         │
    └─────────────────────────────────────┘
    ↓
    📡 await mergeGuestCartWithUserCart(userId, localItems)
    ↓
    📍 lib/actions/cart.ts → mergeGuestCartWithUserCart()
        ├─ 🔐 db.transaction(async (tx) => {
        │
        ├─ 1. Get or Create User Cart
        │   ├─ const existingCart = await tx.select().from(cart)...
        │   └─ if (!existingCart)
        │       └─ [userCart] = await tx.insert(cart)...
        │
        ├─ 2. Batch Fetch Products (منع N+1 query problem)
        │   ├─ const productIds = [101, 102, 103]
        │   ├─ const allProducts = await tx.query.products.findMany({
        │   │   where: inArray(products.id, productIds)
        │   │ })
        │   └─ const productsMap = new Map([
        │       [101, product101],
        │       [102, product102],
        │       [103, product103]
        │     ])
        │
        ├─ 3. Batch Fetch Existing Cart Items
        │   ├─ const existingItems = await tx.query.cartItems.findMany({
        │   │   where: and(
        │   │     eq(cartItems.cartId, userCart.id),
        │   │     inArray(cartItems.productId, [101,102,103])
        │   │   )
        │   │ })
        │   └─ const existingMap = new Map([
        │       [102, { id: 50, quantity: 2 }] ← user already has this
        │     ])
        │
        ├─ 4. Prepare Batch Operations
        │   ├─ const toInsert = []
        │   ├─ const toUpdate = []
        │   │
        │   ├─ Loop: item1 (productId: 101)
        │   │   ├─ product = productsMap.get(101) ✓
        │   │   ├─ existing = existingMap.get(101) ✗
        │   │   ├─ stock check: 2 <= 10 ✓
        │   │   └─ toInsert.push({ cartId, productId: 101, quantity: 2 })
        │   │
        │   ├─ Loop: item2 (productId: 102)
        │   │   ├─ product = productsMap.get(102) ✓
        │   │   ├─ existing = existingMap.get(102) ✓ quantity: 2
        │   │   ├─ finalQty = 2 + 1 = 3
        │   │   ├─ stock check: 3 <= 5 ✓
        │   │   └─ toUpdate.push({ id: 50, quantity: 3 })
        │   │
        │   └─ Loop: item3 (productId: 103)
        │       ├─ product = productsMap.get(103) ✓
        │       ├─ existing = existingMap.get(103) ✗
        │       ├─ stock check: 3 <= 20 ✓
        │       └─ toInsert.push({ cartId, productId: 103, quantity: 3 })
        │
        ├─ 5. Execute Batch INSERT
        │   └─ if (toInsert.length > 0)
        │       └─ await tx.insert(cartItems).values([
        │           { cartId: X, productId: 101, quantity: 2 },
        │           { cartId: X, productId: 103, quantity: 3 }
        │         ])
        │
        ├─ 6. Execute Batch UPDATE
        │   └─ if (toUpdate.length > 0)
        │       └─ await tx.update(cartItems)
        │           .set({ quantity: 3 })
        │           .where(eq(cartItems.id, 50))
        │
        ├─ 7. Recalculate Cart Total
        │   └─ await recalcCartTotalTx(tx, userCart.id)
        │
        └─ }) ← 🔐 COMMIT all changes

    ↓
    ┌─────────────────────────────────────┐
    │  🔓 STEP 4: Release Lock            │
    └─────────────────────────────────────┘
    ↓
    cartMergeLock.release(userId)

    ↓
    ┌─────────────────────────────────────┐
    │  🔄 STEP 5: Sync with Server        │
    └─────────────────────────────────────┘
    ↓
    📍 cart-store.ts → syncWithServer(userId)
        ├─ 📡 const serverCart = await getCartFull(userId)
        └─ 💾 setItems(serverCart.data.items)
            └─ localStorage now has server data

    ↓
    ┌─────────────────────────────────────┐
    │  🏁 STEP 6: Mark Merge Complete     │
    └─────────────────────────────────────┘
    ↓
    localStorage.setItem('cart_merged_' + userId, 'true')

    ↓
    🎉 MERGE COMPLETE!
    
💾 Final State:
  ├─ localStorage: [serverItem1, serverItem2, serverItem3, serverItem4]
  └─ Database: same items with real IDs
```

---

## 🗄️ تفاعل مع قاعدة البيانات

### 📊 Database Schema Relations

```
┌──────────────────┐         ┌──────────────────┐
│     users        │         │    coupons       │
│ ─────────────    │         │ ──────────────   │
│ • id (PK)        │         │ • id (PK)        │
│ • email          │         │ • code           │
│ • username       │         │ • discountType   │
└────────┬─────────┘         │ • discountValue  │
         │                   └────────┬─────────┘
         │ 1                          │
         │                            │ 0..1
         │ has                        │ applied to
         │                            │
         ↓ *                          ↓ *
┌──────────────────────────────────────────────┐
│                 cart                         │
│ ──────────────────────────────────────       │
│ • id (PK)                                    │
│ • userId (FK → users.id) UNIQUE              │
│ • totalAmount                                │
│ • couponId (FK → coupons.id)                 │
└────────┬─────────────────────────────────────┘
         │ 1
         │
         │ contains
         │
         ↓ *
┌──────────────────────────────────────────────┐
│              cartItems                       │
│ ──────────────────────────────────────       │
│ • id (PK)                                    │
│ • cartId (FK → cart.id)                      │
│ • productId (FK → products.id)               │
│ • quantity                                   │
│ • UNIQUE(cartId, productId) ← منع التكرار   │
└────────┬─────────────────────────────────────┘
         │ *
         │
         │ references
         │
         ↓ 1
┌──────────────────┐
│    products      │
│ ──────────────   │
│ • id (PK)        │
│ • nameEn         │
│ • nameAr         │
│ • price          │
│ • discountType   │
│ • discountValue  │
│ • quantityInStock│
└──────────────────┘
```

---

## 💾 localStorage Structure

```javascript
// للزوار (Guests)
localStorage['cart-storage'] = {
  state: {
    items: [
      {
        id: 1699876543210.123,  // ← Temporary ID
        productId: 101,
        quantity: 2,
        product: {
          id: 101,
          nameEn: "Product Name",
          price: "99.99",
          images: [...],
          quantityInStock: 10,
          discountType: "percentage",
          discountValue: "20"
        }
      }
    ],
    appliedCoupon: null
  }
}

// للمستخدمين المسجلين (بعد الدمج)
localStorage['cart-storage'] = {
  state: {
    items: [],  // ← فارغ! البيانات من السيرفر
    appliedCoupon: { ... }  // ← الكوبون فقط
  }
}

localStorage['cart_merged_123'] = 'true'  // ← علامة الدمج
```

---

## 🔄 Data Consistency Strategy

### للزوار:
```
Single Source of Truth: localStorage
  └─ No sync needed
```

### للمستخدمين المسجلين:
```
Primary Source: Database (PostgreSQL)
Secondary Source: localStorage (for instant UI updates)

Sync Strategy:
  ├─ Write: localStorage first → then Database
  ├─ Read: localStorage (instant) → refresh from Database
  └─ On conflict: Database wins (router.refresh())
```

---

## ⚡ Performance Optimizations

### 1️⃣ Optimistic Updates
```
User Action → localStorage ⚡ (instant)
              ↓
         Show in UI immediately
              ↓
         Sync to server in background
```

### 2️⃣ Batch Operations
```
❌ BAD: N+1 Query Problem
  for each guestItem:
    fetch product from DB  ← N queries!

✅ GOOD: Batch Fetch
  fetch ALL products in one query
  create Map for O(1) lookup
```

### 3️⃣ Transaction Batching
```
✅ Single Transaction:
  BEGIN
    INSERT items[0]
    INSERT items[1]
    UPDATE items[2]
    RECALC total
  COMMIT  ← All or nothing!
```

---

## 🎯 ملخص تدفق البيانات

| عملية | زائر | مستخدم مسجل |
|------|------|-------------|
| **إضافة منتج** | localStorage only | localStorage + DB |
| **تحديث كمية** | localStorage only | localStorage + DB |
| **حذف منتج** | localStorage only | localStorage + DB |
| **عرض الكارت** | من localStorage | من DB (with localStorage cache) |
| **تطبيق كوبون** | localStorage only | DB only |
| **دمج عند Login** | N/A | localStorage → DB merge |
| **المزامنة** | لا يوجد | تلقائية بعد كل عملية |
