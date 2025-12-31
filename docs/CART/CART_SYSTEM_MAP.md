# 🗺️ خريطة نظام الكارت الشاملة - Cart System Map

## 📦 هيكل الملفات التفصيلي

```
┌─────────────────────────────────────────────────────────────────┐
│                🏗️ CART SYSTEM ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

📁 lib/
│
├── 🗄️ db/schema.ts                           # تعريف جداول قاعدة البيانات
│   ├── 📊 cart                               # جدول الكارت الرئيسي
│   │   ├── id: serial                        # معرف الكارت
│   │   ├── userId: integer                   # معرف المستخدم (FK)
│   │   ├── totalAmount: decimal              # المجموع الكلي
│   │   ├── couponId: integer                 # معرف الكوبون (FK)
│   │   └── timestamps                        # الإنشاء والتحديث
│   └── 📋 cartItems                          # جدول عناصر الكارت
│       ├── id: serial                        # معرف العنصر
│       ├── cartId: integer                   # معرف الكارت (FK)
│       ├── productId: integer                # معرف المنتج (FK)
│       ├── quantity: integer                 # الكمية
│       └── 🔒 UNIQUE(cartId, productId)      # منع التكرار
│
├── 🎯 actions/cart.ts                        # العمليات على قاعدة البيانات
│   │
│   ├── 🆕 createCart(userId)
│   │   └── ✅ إنشاء كارت جديد للمستخدم
│   │
│   ├── 📥 getCartFull(userId)
│   │   ├── 🔍 جلب الكارت + المنتجات + الكوبون
│   │   └── ⚠️ إضافة حالة المخزون (isOutOfStock, isLowStock)
│   │
│   ├── ➕ addToCartAction(userId, productId, quantity)
│   │   ├── 🔐 Transaction START
│   │   ├── ✔️ التحقق (User, Product, Stock)
│   │   ├── 🔍 البحث/إنشاء الكارت
│   │   ├── 🔍 موجود→تحديث | غير موجود→إضافة
│   │   ├── 🧮 إعادة حساب المجموع
│   │   └── 🔐 Transaction COMMIT
│   │
│   ├── 🔄 updateCartItem(cartItemId, quantity)
│   │   └── 🔐 Transaction → التحقق → التحديث → الحساب
│   │
│   ├── ❌ removeCartItem(cartItemId)
│   │   └── 🔐 Transaction → الحذف → الحساب
│   │
│   ├── 🎟️ applyCouponAction(cartId, code)
│   │   ├── 🔍 البحث + التحقق من الصلاحية
│   │   └── 🔗 ربط الكوبون + الحساب
│   │
│   ├── 🚫 removeCouponAction(cartId)
│   │   └── 🔓 إلغاء الربط + الحساب
│   │
│   ├── 🧹 clearCart(cartId)
│   │   └── 🔐 Transaction → حذف الكل + تصفير
│   │
│   ├── 🔀 mergeGuestCartWithUserCart(userId, guestItems[])
│   │   ├── 🔐 Transaction START
│   │   ├── 📦 Batch: جلب المنتجات (منع N+1)
│   │   ├── 📋 Batch: جلب العناصر الموجودة
│   │   ├── 🔄 تحضير عمليات الإدراج والتحديث
│   │   ├── ➕ تنفيذ Batch INSERT
│   │   ├── 🔄 تنفيذ Batch UPDATE
│   │   └── 🔐 Transaction COMMIT
│   │
│   └── 🧮 recalcCartTotalTx(tx, cartId)
│       └── 📊 حساب المجموع + تطبيق الكوبون
│
├── 🏪 stores/cart-store.ts                   # Zustand Store
│   │
│   ├── 📊 State
│   │   ├── items: CartItem[]                 # العناصر
│   │   ├── isLoading, error                  # الحالة
│   │   ├── 🛡️ isMerging                      # حماية الدمج
│   │   ├── 🔄 isSyncing                      # حماية المزامنة
│   │   └── 🎟️ appliedCoupon                 # الكوبون المطبق
│   │
│   ├── ➕ addItem(item)
│   │   └── موجود→زيادة | غير موجود→إضافة بـID مؤقت
│   │
│   ├── ❌ removeItem(id) → 🗑️ حذف
│   ├── 🔄 updateQuantity(id, qty) → تحديث/حذف
│   ├── 🧹 clearCart() → تفريغ
│   │
│   ├── 🔄 syncWithServer(userId)
│   │   ├── 🛡️ منع التكرار (< 2 ثانية)
│   │   ├── 📡 getCartFull(userId)
│   │   └── 💾 تحديث items من السيرفر
│   │
│   ├── 🔢 getTotalItems() → مجموع الكميات
│   ├── 💰 getTotalPrice(includeCoupon) → السعر الكلي
│   │
│   └── 💾 Persistence
│       ├── 🔒 مسجل → حفظ [] فقط
│       └── 👤 زائر → حفظ جميع items
│
└── 🛠️ utils/
    ├── pricing.ts
    │   ├── 💰 calculateProductPrice()        # سعر المنتج + الخصم
    │   ├── 🧮 calculateCartTotal()           # مجموع الكارت + الكوبون
    │   └── ✅ validateQuantity()             # التحقق من الكمية
    │
    └── cart-merge-lock.ts
        └── 🔒 CartMergeLock
            ├── acquire(userId) → القفل + Auto-release
            ├── release(userId) → فك القفل
            └── isLocked(userId) → التحقق

┌─────────────────────────────────────────────────────────────────┐
│                     🎣 HOOKS & COMPONENTS                        │
└─────────────────────────────────────────────────────────────────┘

📁 hooks/useCart.ts                            # 🎯 الواجهة الموحدة
    │
    ├── ➕ addItem(item)
    │   ├── 1️⃣ addItemLocal() → تحديث فوري ⚡
    │   ├── 2️⃣ if (user) → addToCartAction() → Sync 📡
    │   └── 🔔 Toast + Rollback عند الفشل
    │
    ├── 🔄 updateItemQuantity(id, qty)
    │   └── تحديث فوري + Sync + Rollback
    │
    ├── ❌ removeItem(id)
    │   └── حذف فوري + Sync + Rollback
    │
    └── 📤 Return: { items, totalItems, totalPrice, ... }

📁 components/ui/cart/
    ├── CartItems.tsx → عرض العناصر + حالة المخزون
    ├── CartQuantity.tsx → أزرار +/- للكمية
    ├── OrderSummary.tsx → ملخص الطلب + المجموع
    └── AppliedCoupon.tsx → إدارة الكوبونات

📁 app/[lang]/(site)/cart/
    ├── page.tsx → للمستخدمين المسجلين
    └── _components/GuestCartView.tsx → للزوار
```

---

## 🔄 سيناريوهات عمل النظام

### 🎬 SCENARIO 1: زائر يضيف منتج

```
👤 Visitor
  ↓
  🖱️ Click "Add to Cart"
  ↓
  🎣 useCart().addItem(product)
  ↓
  💾 Zustand Store → localStorage
  ↓
  ⚡ UI يتحديث فوراً
  ↓
  🔔 Toast: "Added to Cart"
  ↓
  ✅ Complete (لا توجد مزامنة مع السيرفر)
```

---

### 🎬 SCENARIO 2: مستخدم مسجل يضيف منتج

```
👨‍💼 User (Logged-in)
  ↓
  🖱️ Click "Add to Cart"
  ↓
  🎣 useCart().addItem(product)
  ↓
  ╔═══════════════════════════════════╗
  ║  1️⃣ LOCAL UPDATE (Optimistic)     ║
  ╠═══════════════════════════════════╣
  ║  💾 localStorage ← product        ║
  ║  ⚡ UI يتحديث فوراً               ║
  ╚═══════════════════════════════════╝
  ↓
  ╔═══════════════════════════════════╗
  ║  2️⃣ SERVER SYNC                   ║
  ╠═══════════════════════════════════╣
  ║  📡 addToCartAction(...)          ║
  ║  ├─ 🔐 Transaction START          ║
  ║  ├─ ✔️ التحقق من المخزون         ║
  ║  ├─ 🔍 البحث/إنشاء الكارت       ║
  ║  ├─ ➕ INSERT/UPDATE               ║
  ║  ├─ 🧮 حساب المجموع              ║
  ║  └─ 🔐 COMMIT                     ║
  ╚═══════════════════════════════════╝
  ↓
  ✅ Success → router.refresh()
  ❌ Fail → removeItemLocal() [Rollback]
  ↓
  🔔 Toast: "Added to Cart"
```

---

### 🎬 SCENARIO 3: زائر يسجل الدخول (Cart Merge)

```
👤 Visitor (has 3 items in localStorage)
  ↓
  🔐 Login Success
  ↓
  🎣 unified-auth-store → onAuthSuccess()
  ↓
  ╔═══════════════════════════════════════════╗
  ║  🔒 MERGE LOCK                            ║
  ╠═══════════════════════════════════════════╣
  ║  cartMergeLock.acquire(userId)            ║
  ║  ├─ ✓ تحقق من عدم وجود قفل               ║
  ║  └─ ✓ تحقق من Cooldown (5 sec)           ║
  ╚═══════════════════════════════════════════╝
  ↓
  📋 getLocalCartItems()
  └─ [item1, item2, item3]
  ↓
  ╔═══════════════════════════════════════════╗
  ║  🔀 MERGE OPERATION                       ║
  ╠═══════════════════════════════════════════╣
  ║  mergeGuestCartWithUserCart(...)          ║
  ║  ├─ 🔐 Transaction START                  ║
  ║  ├─ 🔍 البحث/إنشاء كارت المستخدم         ║
  ║  ├─ 📦 Batch: جلب جميع المنتجات          ║
  ║  ├─ 📋 Batch: جلب العناصر الموجودة       ║
  ║  ├─ 🔄 Loop على guestItems               ║
  ║  │   ├─ ✔️ تحقق من المخزون               ║
  ║  │   ├─ موجود → toUpdate[]               ║
  ║  │   └─ جديد → toInsert[]                ║
  ║  ├─ ➕ Batch INSERT (2 items)             ║
  ║  ├─ 🔄 Batch UPDATE (1 item)              ║
  ║  ├─ 🧮 recalcCartTotalTx()                ║
  ║  └─ 🔐 COMMIT                             ║
  ╚═══════════════════════════════════════════╝
  ↓
  🔓 cartMergeLock.release(userId)
  ↓
  ╔═══════════════════════════════════════════╗
  ║  🔄 SYNC                                  ║
  ╠═══════════════════════════════════════════╣
  ║  syncWithServer(userId)                   ║
  ║  ├─ 📡 getCartFull(userId)                ║
  ║  └─ 💾 setItems(serverItems)              ║
  ╚═══════════════════════════════════════════╝
  ↓
  🧹 localStorage['cart_merged_userId'] = 'true'
  ↓
  🎉 Merge Complete!
```

---

### 🎬 SCENARIO 4: تحديث كمية منتج

```
👨‍💼 User
  ↓
  🖱️ Click +/- في CartQuantity
  ↓
  🎣 useCart().updateItemQuantity(cartItemId, newQuantity)
  ↓
  💾 الاحتفاظ بالقيمة السابقة (للRollback)
  ↓
  1️⃣ updateQuantityLocal(id, newQty) → تحديث فوري ⚡
  ↓
  2️⃣ if (user?.id)
  │   ↓
  │   📡 await updateCartItem(cartItemId, newQty)
  │   ├─ 🔐 Transaction
  │   ├─ ✔️ تحقق من المخزون
  │   ├─ 📝 UPDATE quantity
  │   └─ 🧮 حساب المجموع
  │   ↓
  │   ✅ Success → router.refresh()
  │   ❌ Fail → استرجاع القيمة السابقة
  ↓
  🔔 Toast (success/error)
```

---

### 🎬 SCENARIO 5: تطبيق كوبون

```
👨‍💼 User في صفحة الكارت
  ↓
  📝 إدخال كود الكوبون: "SAVE20"
  ↓
  🖱️ Click "Apply"
  ↓
  🎨 <AppliedCoupon /> Component
  ↓
  📡 await applyCouponAction(cartId, "SAVE20")
  ↓
  ╔═══════════════════════════════════════╗
  ║  SERVER VALIDATION                    ║
  ╠═══════════════════════════════════════╣
  ║  🔍 البحث عن الكوبون في DB            ║
  ║  ├─ ✔️ موجود؟                         ║
  ║  ├─ ✔️ isActive = true؟               ║
  ║  ├─ ✔️ validFrom <= now؟              ║
  ║  └─ ✔️ validTo >= now؟                ║
  ╚═══════════════════════════════════════╝
  ↓
  ✅ Valid
  │   ↓
  │   🔗 UPDATE cart SET couponId = X
  │   ↓
  │   🧮 recalcCartTotal(cartId)
  │   │   ├─ calculateCartTotal(items, coupon)
  │   │   ├─ تطبيق الخصم
  │   │   └─ UPDATE totalAmount
  │   ↓
  │   🔄 router.refresh()
  │   ↓
  │   🔔 Toast: "Coupon Applied! Save 20%"
  │   ↓
  │   🎨 UI يعرض الخصم
  │
  ❌ Invalid
      ↓
      🔔 Toast: "Invalid or expired coupon"
```

---

## 🔐 آليات الحماية والأمان

### 1️⃣ Transaction Safety
```
🔐 db.transaction(async (tx) => {
  ├─ جميع العمليات داخل Transaction واحدة
  ├─ ✅ Success → COMMIT جميع التغييرات
  └─ ❌ Error → ROLLBACK تلقائي
})
```

### 2️⃣ Stock Validation
```
✔️ قبل كل عملية:
  ├─ validateQuantity(qty, stock)
  ├─ quantity > 0
  └─ quantity <= stock
```

### 3️⃣ Merge Lock
```
🔒 منع عمليات الدمج المتزامنة:
  ├─ Lock timeout: 10 sec
  ├─ Cooldown: 5 sec بين العمليات
  └─ Auto-release عند الانتهاء
```

### 4️⃣ Sync Protection
```
🛡️ منع المزامنة المتكررة:
  ├─ isSyncing flag
  ├─ lastSyncTimestamp
  └─ block if < 2 seconds
```

---

## 💡 نقاط مهمة

### ✅ المميزات
- 🚀 **Optimistic Updates**: تحديث فوري للواجهة
- 🔄 **Auto Sync**: مزامنة تلقائية للمستخدمين المسجلين
- 💾 **Hybrid Storage**: localStorage للزوار + DB للمستخدمين
- 🔐 **Transaction Safety**: ضمان سلامة البيانات
- 📦 **Batch Operations**: تحسين الأداء
- 🛡️ **Race Condition Protection**: حماية من التعارضات
- ⏪ **Rollback**: استرجاع عند الفشل

### 🎯 أفضل الممارسات
- استخدم `useCart()` Hook دائماً (لا تستخدم Store مباشرة)
- التحقق من المخزون في كل عملية
- استخدام Transactions للعمليات المعقدة
- Batch Operations لتحسين الأداء
- Toast notifications للتواصل مع المستخدم
