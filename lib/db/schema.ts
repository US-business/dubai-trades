import { not, relations } from "drizzle-orm"
import { pgTable, serial, varchar, text, decimal, integer, boolean, timestamp, pgEnum, jsonb, index, unique } from "drizzle-orm/pg-core"

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "viewer", "user"])
export const discountTypeEnum = pgEnum("discount_type", ["fixed", "percentage", "none"])
export const productStatusEnum = pgEnum("product_status", ["best_seller", "new", "coming_soon", "on_sale", "normal"])


// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Made optional for OAuth users
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  role: userRoleEnum("role").notNull().default("user"),
  // OAuth support fields
  image: varchar("image", { length: 500 }),
  googleId: varchar("google_id", { length: 100 }),
  facebookId: varchar("facebook_id", { length: 100 }),
  provider: varchar("provider", { length: 50 }).default("email"),
  emailVerified: timestamp("email_verified"),
  // Account security fields
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Password Reset Tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Email Verification Tokens table
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Auth Audit Logs table - Track all authentication activities
export const authAuditLogs = pgTable("auth_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 50 }).notNull(), // login, logout, register, failed_login, password_change, etc.
  email: varchar("email", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  success: boolean("success").notNull().default(true),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"), // Additional context (e.g., provider, device info)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("auth_audit_user_id_idx").on(table.userId),
  actionIdx: index("auth_audit_action_idx").on(table.action),
  createdAtIdx: index("auth_audit_created_at_idx").on(table.createdAt),
}))

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Products table
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameAr: varchar("name_ar", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    sku: varchar("sku", { length: 50 }).notNull(),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    images: text("images").array().notNull(),
    imageAlt: text("image_alt"),
    detailsEn: jsonb("details_en").$type<{ title: string; description: string }[]>(),
    detailsAr: jsonb("details_ar").$type<{ title: string; description: string }[]>(),
    price: decimal("price", { precision: 10, scale: 2 }),
    isPriceActive: boolean("is_price_active").default(false),
    discountType: discountTypeEnum("discount_type").notNull().default("none"),
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
    quantityInStock: integer("quantity_in_stock").default(0),
    brand: varchar("brand", { length: 100 }),
    isFeatured: boolean("is_featured").default(false),
    offerEn: varchar("offer_en", { length: 200 }),
    offerAr: varchar("offer_ar", { length: 200 }),
    color: varchar("color", { length: 50 }),
    status: productStatusEnum("status").default("new"),
    warrantyEn: varchar("warranty_en", { length: 100 }),
    warrantyAr: varchar("warranty_ar", { length: 100 }),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
)

// Product Relations (for related products)
export const productRelations = pgTable("product_relations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  relatedProductId: integer("related_product_id")
    .references(() => products.id)
    .notNull(),
})


// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  verifiedPurchase: boolean("verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Review Votes table - للتصويت على التقييمات (مفيد/غير مفيد)
export const reviewVotes = pgTable("review_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .references(() => reviews.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  voteType: varchar("vote_type", { length: 20 }).notNull(), // 'helpful' or 'not_helpful'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // منع التصويت المتكرر من نفس المستخدم على نفس التقييم
  uniqueUserReviewVote: unique("unique_user_review_vote").on(table.userId, table.reviewId),
  reviewIdIdx: index("review_votes_review_id_idx").on(table.reviewId),
  userIdIdx: index("review_votes_user_id_idx").on(table.userId),
}))

// Seller Responses table - لردود البائع على التقييمات
export const sellerResponses = pgTable("seller_responses", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .references(() => reviews.id, { onDelete: "cascade" })
    .notNull(),
  sellerId: integer("seller_id")
    .references(() => users.id)
    .notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  reviewIdIdx: index("seller_responses_review_id_idx").on(table.reviewId),
  sellerIdIdx: index("seller_responses_seller_id_idx").on(table.sellerId),
}))

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  discountType: discountTypeEnum("discount_type").notNull().default("none"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Cart table
export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  couponId: integer("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Cart Items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .references(() => cart.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Prevent duplicate products in same cart
  uniqueCartProduct: unique("unique_cart_product").on(table.cartId, table.productId),
  // Indexes for performance
  cartIdIdx: index("cart_items_cart_id_idx").on(table.cartId),
  productIdIdx: index("cart_items_product_id_idx").on(table.productId),
}))

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Wishlist Items table
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id")
    .references(() => wishlist.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Prevent duplicate products in same wishlist
  uniqueWishlistProduct: unique("unique_wishlist_product").on(table.wishlistId, table.productId),
  // Indexes for performance
  wishlistIdIdx: index("wishlist_items_wishlist_id_idx").on(table.wishlistId),
  productIdIdx: index("wishlist_items_product_id_idx").on(table.productId),
}))

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingMethod: varchar("shipping_method", { length: 50 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  couponId: integer("coupon_id").references(() => coupons.id), // إضافة حقل الكوبون
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // المجموع قبل الضريبة والشحن
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // المجموع النهائي
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  paymentType: varchar("payment_type", { length: 50 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})


// Order Items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),

})

// Order Notes table
export const orderNotes = pgTable("order_notes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  cart: many(cart),
  orders: many(orders),
  wishlist: many(wishlist),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  orderItems: many(orderItems),
  relatedProducts: many(productRelations, { relationName: "product" }),
  relatedTo: many(productRelations, { relationName: "relatedProduct" }),
}))

export const productRelationsRelations = relations(productRelations, ({ one }) => ({
  product: one(products, {
    fields: [productRelations.productId],
    references: [products.id],
    relationName: "product",
  }),
  relatedProduct: one(products, {
    fields: [productRelations.relatedProductId],
    references: [products.id],
    relationName: "relatedProduct",
  }),
}))

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  votes: many(reviewVotes),
  sellerResponse: one(sellerResponses),
}))

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
}))

export const sellerResponsesRelations = relations(sellerResponses, ({ one }) => ({
  review: one(reviews, {
    fields: [sellerResponses.reviewId],
    references: [reviews.id],
  }),
  seller: one(users, {
    fields: [sellerResponses.sellerId],
    references: [users.id],
  }),
}))

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(users, {
    fields: [cart.userId],
    references: [users.id],
  }),
  items: many(cartItems),
  coupon: one(coupons, {
    fields: [cart.couponId],
    references: [coupons.id],
  }),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItems.cartId],
    references: [cart.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}))

export const wishlistRelations = relations(wishlist, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  items: many(wishlistItems),
}))

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlist, {
    fields: [wishlistItems.wishlistId],
    references: [wishlist.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}))

export const couponsRelations = relations(coupons, ({ many }) => ({
  carts: many(cart),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  notes: many(orderNotes),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const orderNotesRelations = relations(orderNotes, ({ one }) => ({
  order: one(orders, {
    fields: [orderNotes.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [orderNotes.userId],
    references: [users.id],
  }),
}))

// Gallery Images table with indexes for performance
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  titleEn: varchar("title_en", { length: 200 }),
  titleAr: varchar("title_ar", { length: 200 }),
  altTextEn: varchar("alt_text_en", { length: 200 }),
  altTextAr: varchar("alt_text_ar", { length: 200 }),
  url: varchar("url", { length: 500 }).notNull(),
  publicId: varchar("public_id", { length: 200 }).notNull().unique(),
  fileName: varchar("file_name", { length: 200 }).notNull(),
  fileSize: integer("file_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  format: varchar("format", { length: 10 }),
  tags: text("tags").array(),
  isFeatured: boolean("is_featured").default(false),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Indexes for better query performance
  fileNameIdx: index("gallery_file_name_idx").on(table.fileName),
  isFeaturedIdx: index("gallery_is_featured_idx").on(table.isFeatured),
  isDefaultIdx: index("gallery_is_default_idx").on(table.isDefault),
  createdAtIdx: index("gallery_created_at_idx").on(table.createdAt),
  // Composite index for common query patterns
  featuredCreatedIdx: index("gallery_featured_created_idx").on(table.isFeatured, table.createdAt),
}))

export const galleryImagesRelations = relations(galleryImages, ({ many }) => ({
  // Can be extended for relationships with products, categories, etc.
}))

// NextAuth.js required tables
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
})

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires").notNull(),
})

// Relations for NextAuth tables
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const authAuditLogsRelations = relations(authAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [authAuditLogs.userId],
    references: [users.id],
  }),
}))