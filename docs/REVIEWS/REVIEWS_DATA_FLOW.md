# 📊 تدفق البيانات في نظام التقييمات - Reviews Data Flow

## 🔄 تدفق البيانات الكامل

### 📥 طبقات النظام (System Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                          🎨 UI LAYER                            │
│   AddReviewForm.tsx, ReviewsList.tsx, ReviewItem.tsx,          │
│   ReviewFilters.tsx, StarRating.tsx, ReviewVoting.tsx          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     🎯 ACTIONS LAYER                            │
│                lib/actions/reviews.ts                           │
│              (Server Actions + Purchase Validation)            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────┴───────────────┐
        ↓                                ↓
┌───────────────────┐          ┌────────────────────┐
│  🔐 AUTH CHECK    │          │  🛒 PURCHASE CHECK │
│  next-auth        │          │   orders table     │
│  session          │          │   + order_items    │
└───────────────────┘          └─────────┬──────────┘
        │                                ↓
        │                      ┌──────────────────────┐
        │                      │   🗄️ DATABASE        │
        │                      │  PostgreSQL          │
        └─────────────────────→│  - reviews           │
                               │  - reviewVotes       │
                               │  - sellerResponses   │
                               └──────────────────────┘
```

---

## 🔍 تفصيل العمليات الأساسية

### ✍️ عملية كتابة تقييم جديد (Add Review Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│                 👤 AUTHENTICATED USER                             │
└──────────────────────────────────────────────────────────────────┘

🖱️ User clicks "اكتب تقييمك" on Product Page
    ↓
📍 ReviewsList.tsx
    ├── 🔍 Check: currentUserId exists?
    ├── ✅ Yes → Show "اكتب تقييمك" button
    └── ❌ No → Show "يجب تسجيل الدخول" message
    ↓
📝 AddReviewForm.tsx - Component Mount
    ├── 🔄 useEffect: checkReviewEligibility()
    ├── 🎯 Call: canUserWriteReview(productId)
    └── 📊 Set component state based on result
    ↓
🎯 lib/actions/reviews.ts - canUserWriteReview()
    ├── 🔐 const session = await getServerSession()
    ├── ❌ !session → return { canWrite: false, reason: "not_authenticated" }
    ├── 🔍 Check existing review in DB
    ├── ❌ exists → return { canWrite: false, reason: "already_reviewed" }
    ├── 🛒 Call: checkPurchaseVerification(userId, productId)
    └── 📊 Return eligibility result
    ↓
🛒 checkPurchaseVerification() Function
    ├── 🔍 Query: SELECT FROM orders o JOIN order_items oi
    ├── ✅ WHERE: o.userId = ? AND oi.productId = ? AND o.status = 'completed'
    └── 📊 Return: boolean (hasPurchased)
    ↓
📱 AddReviewForm.tsx - Render Logic
    ├── 🔄 isLoading → Show skeleton
    ├── ❌ !canWrite → Show appropriate message:
    │   ├── "not_purchased" → Explanation + blue info box
    │   ├── "already_reviewed" → Info message
    │   └── "not_authenticated" → Login required
    └── ✅ canWrite → Show form with "شراء موثق" badge
    ↓
⭐ User fills form and submits
    ├── 📝 Rating selection (1-5 stars)
    ├── 💬 Optional comment
    └── 📤 handleSubmit() calls addReview()
    ↓
🎯 lib/actions/reviews.ts - addReview()
    ├── 🔐 Authentication check
    ├── ✅ Rating validation (1-5)
    ├── 🔍 Check duplicate review
    ├── 🛒 Purchase verification (REQUIRED!)
    ├── ❌ !hasPurchased → return error with Arabic/English message
    ├── 💾 Insert review with verifiedPurchase: true
    └── 🔄 revalidatePath() for product page
    ↓
✅ Success Response
    ├── 🎉 Toast: "تم إضافة التقييم بنجاح"
    ├── 🔄 onReviewAdded() callback
    ├── 📱 Form reset
    └── 🔄 Reviews list refresh
```

---

### 🔍 عملية عرض التقييمات (Display Reviews Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│                    📄 PRODUCT PAGE LOAD                         │
└──────────────────────────────────────────────────────────────────┘

🌐 Server-side: page.tsx
    ├── 🎯 Call: getProductReviews(productId)
    ├── 📊 Get: reviews data + averageRating + totalReviews
    └── 📱 Pass to ReviewsList component
    ↓
📋 ReviewsList.tsx - Component Mount
    ├── 📊 Display reviews summary
    ├── 🔢 Show average rating + total count
    ├── 🎛️ Render ReviewFilters component
    └── 📝 Show add review section (if eligible)
    ↓
🎛️ ReviewFilters.tsx - Filters Application
    ├── ⭐ Rating filter (1-5 stars with counts)
    ├── 📅 Sort options (newest, oldest, helpful)
    ├── ✅ Verified purchases only filter
    └── 🔄 onFiltersChange() → getFilteredProductReviews()
    ↓
📝 ReviewItem.tsx - Individual Review Display
    ├── 👤 User avatar + name
    ├── ✅ Verified purchase badge (if verifiedPurchase: true)
    ├── ⭐ Star rating display
    ├── 💬 Review comment
    ├── 📅 Created date
    ├── 🗳️ Voting buttons (helpful/not helpful)
    ├── ✏️ Edit/Delete (for review owner)
    └── 💬 Seller response (if exists)
```

---

### 🗳️ عملية التصويت على التقييمات (Review Voting Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│                   🗳️ USER VOTING ACTION                          │
└──────────────────────────────────────────────────────────────────┘

🖱️ User clicks "مفيد" or "غير مفيد" button
    ↓
📝 ReviewVoting.tsx
    ├── 🔐 Check: user authentication
    ├── ❌ !authenticated → Show login message
    └── ✅ authenticated → Call voteOnReview()
    ↓
🎯 lib/actions/reviews.ts - voteOnReview()
    ├── 🔐 Session validation
    ├── 🔍 Check existing vote: SELECT FROM reviewVotes
    ├── 📊 Vote exists? → Update voteType
    ├── 📊 No vote? → INSERT new vote
    ├── 🔢 Recalculate counters:
    │   ├── helpfulCount = COUNT WHERE voteType = 'helpful'
    │   └── notHelpfulCount = COUNT WHERE voteType = 'not_helpful'
    └── 💾 UPDATE reviews table with new counters
    ↓
🔄 UI Update
    ├── 📊 Update vote counters
    ├── 🎨 Update button states
    └── 🎉 Show success feedback
```

---

### 💬 عملية رد البائع (Seller Response Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│                   💼 SELLER USER ACTION                          │
└──────────────────────────────────────────────────────────────────┘

👔 Seller views review with response option
    ↓
💬 SellerResponse.tsx
    ├── 🔐 Check: seller permissions
    ├── 📝 Show response form/existing response
    └── 📤 Submit response
    ↓
🎯 lib/actions/reviews.ts - addSellerResponse()
    ├── 🔐 Authentication + role check
    ├── 🔍 Check existing response
    ├── 📝 EXISTS? → Update response
    ├── 📝 NOT EXISTS? → Create new response
    └── 💾 Save to sellerResponses table
    ↓
📱 Review Display Update
    ├── 💬 Show seller response box
    ├── 👔 Display seller name/info
    ├── 📅 Show response date
    └── 🎨 Style as official response
```

---

## 📊 تدفق البيانات في الفلاتر (Filters Data Flow)

### 🎛️ تطبيق الفلاتر المتقدمة

```
🎛️ ReviewFilters.tsx - User Interaction
    ├── ⭐ Select rating filter (1-5)
    ├── 📅 Choose sort option
    └── ✅ Toggle "verified only"
    ↓
🔄 onFiltersChange() Callback
    ├── 📊 Collect all filter values
    └── 🎯 Call: getFilteredProductReviews(productId, filters)
    ↓
🎯 lib/actions/reviews.ts - getFilteredProductReviews()
    ├── 🔍 Build WHERE conditions:
    │   ├── productId = ?
    │   ├── rating = ? (if selected)
    │   └── verifiedPurchase = true (if checked)
    ├── 📊 Apply sorting:
    │   ├── newest → ORDER BY createdAt DESC
    │   ├── oldest → ORDER BY createdAt ASC
    │   └── helpful → ORDER BY helpfulCount DESC
    └── 📤 Return filtered results
    ↓
📋 ReviewsList.tsx - Update Display
    ├── 🔄 Update reviews state
    ├── 📊 Update counters
    └── 🎨 Re-render components
```

---

## 🛡️ تدفق التحقق الأمني (Security Validation Flow)

### 🔐 نظام التحقق المتعدد المستويات

```
📥 Any Reviews Action Request
    ↓
🛡️ Layer 1: Authentication Check
    ├── 🔍 getServerSession(authOptions)
    ├── ❌ No session → Return "authentication required"
    └── ✅ Valid session → Continue to Layer 2
    ↓
🛡️ Layer 2: Action-Specific Validation
    ├── 📝 Add Review:
    │   ├── 🛒 Purchase verification (NEW!)
    │   ├── 🔍 Duplicate check
    │   └── ✅ Rating validation
    ├── ✏️ Edit/Delete Review:
    │   ├── 🔍 Ownership verification
    │   └── 📊 Review existence check
    ├── 🗳️ Vote on Review:
    │   ├── 🔍 Vote duplicate check
    │   └── 📊 Review existence check
    └── 💬 Seller Response:
        ├── 👔 Seller role verification
        └── 📊 Review existence check
    ↓
🛡️ Layer 3: Database Transaction
    ├── 🔐 BEGIN TRANSACTION
    ├── 💾 Execute operation
    ├── ✅ COMMIT on success
    └── ❌ ROLLBACK on error
```

---

## 📱 تدفق تجربة المستخدم (UX Flow)

### 🎯 مسارات المستخدم المختلفة

```
┌─────────────────────────────────────────────────────────────────┐
│                      🚶‍♂️ USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

👤 زائر غير مسجل (Guest User)
    ├── 👀 Can view all reviews
    ├── 📊 Can see ratings and statistics  
    ├── ❌ Cannot vote or interact
    └── 🔗 "تسجيل الدخول" prompts for actions
    
👤 مستخدم مسجل لم يشتري (Registered Non-Buyer)
    ├── 👀 Can view all reviews
    ├── 🗳️ Can vote on reviews (helpful/not helpful)
    ├── ❌ Cannot write reviews
    └── 💡 See "يجب شراء المنتج أولاً" message
    
👤 مستخدم اشترى المنتج (Verified Buyer)
    ├── 👀 Can view all reviews
    ├── 🗳️ Can vote on reviews
    ├── ✍️ Can write ONE review
    ├── ✏️ Can edit/delete own review
    └── ✅ Review shows "شراء موثق" badge
    
👤 بائع (Seller)
    ├── 👀 Can view all reviews
    ├── 🗳️ Can vote on reviews
    ├── 💬 Can respond to reviews
    └── ✏️ Can edit own responses
    
👤 مدير (Admin)
    ├── 👀 Can view all reviews
    ├── 🗑️ Can delete any review
    ├── 📊 Access to admin dashboard
    └── 📈 Can view detailed analytics
```

---

## 🔄 دورة حياة التقييم الكاملة (Complete Review Lifecycle)

```
📝 Review Creation
    ├── 🛒 Purchase Product
    ├── ✅ Complete Order (status = 'completed')
    ├── 📝 Write Review (with purchase verification)
    └── 💾 Store as verified review
    ↓
📊 Review Display & Interaction
    ├── 🏷️ Show with "شراء موثق" badge
    ├── 🗳️ Receive votes from users
    ├── 💬 May receive seller response
    └── 📈 Contribute to product average rating
    ↓
🔄 Review Management
    ├── ✏️ Owner can edit content
    ├── 🗑️ Owner can delete
    ├── 📊 Admin can moderate
    └── 📈 Analytics tracking
    ↓
💫 Review Impact
    ├── 📊 Influences product rating
    ├── 🎯 Affects search rankings
    ├── 💰 Impacts sales conversion
    └── 🏆 Builds seller reputation
```

---

## 🚀 الابتكارات الجديدة في النظام

### ✨ متطلب الشراء المسبق (Purchase Verification)

```
🎯 Implementation Flow:
📋 User Action → 🔍 Check Authentication → 🛒 Verify Purchase → ✅ Allow Review

🔍 Purchase Verification Query:
SELECT EXISTS (
    SELECT 1 FROM orders o 
    JOIN order_items oi ON o.id = oi.order_id 
    WHERE o.user_id = ? 
    AND oi.product_id = ? 
    AND o.status = 'completed'
)

📊 Benefits:
├── ✅ 100% verified reviews
├── 🛡️ Prevents fake reviews  
├── 💯 Increases trust
└── 📈 Improves conversion
```

### 🎨 واجهة المستخدم التفاعلية

```
🎭 Dynamic UI States:
├── 🟢 Eligible → Green badge + form
├── 🔴 Not eligible → Red message + explanation  
├── 🔵 Info mode → Blue info box + education
└── ⚪ Loading → Skeleton animation

💬 Multilingual Support:
├── 🌐 Arabic (RTL) 
├── 🌐 English (LTR)
└── 🔄 Dynamic direction switching
```

### 📊 تحليلات متقدمة

```
📈 New Metrics:
├── 📊 Verification Rate (100% with new system)
├── 🎯 Purchase-to-Review Conversion
├── 💰 Review Impact on Sales
└── ⭐ Quality Score Trending
```

---

## 🔧 متطلبات التكامل (Integration Requirements)

### 🛒 تكامل مع نظام الطلبات

```
📦 Required Tables:
├── 🛒 orders (existing)
├── 📋 order_items (existing)  
└── 🔗 Relationship: orders.id → order_items.order_id

🔍 Required Fields:
├── orders.user_id
├── orders.status ('completed' required)
├── order_items.product_id  
└── order_items.order_id
```

### 🔐 تكامل مع نظام المصادقة

```
🔑 Required Session Data:
├── user.id (for ownership checks)
├── user.role (for permissions)
└── user.email (for display)

🛡️ Required Checks:
├── Authentication status
├── User ownership verification  
└── Role-based permissions
```

---

**📅 تاريخ آخر تحديث:** 2025-11-14  
**🔄 إصدار تدفق البيانات:** 2.0  
**🎯 التركيز:** Purchase Verification Integration  
**👨‍💻 المطور:** Cascade AI Assistant
