# Cmart — Course Marketplace Platform

## Project Plan & Architecture

---

## 1. Vision & Overview

Cmart is a **credential-verified course marketplace** inspired by Skool. Sellers (teachers) create and sell courses across categories; buyers (students) browse, purchase, and consume content. The key differentiator is **verified teacher credentials** — every seller's qualifications are visible and admin-verified, building buyer trust.

**Target:** Web application (mobile-responsive, designed for future native app adaptation)

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | Full-stack React, SSR/SSG, API routes, excellent mobile-responsive support, easy AWS deployment |
| **Language** | TypeScript | Type safety, better DX, fewer runtime errors |
| **Database** | MongoDB Atlas (free tier) | Flexible document schema for varied course content, free tier for development |
| **ODM** | Mongoose | Mature MongoDB ODM, schema validation, middleware hooks |
| **Auth** | NextAuth.js v5 | Free, extensible, supports multiple providers, session management |
| **Payments** | Stripe + Stripe Connect | Marketplace payments with split payouts, subscription billing |
| **File Storage** | AWS S3 (+ local fallback) | Video/file uploads, presigned URLs for secure access |
| **Video** | Self-hosted on S3 | HLS streaming via CloudFront CDN for performance |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development, mobile-first, professional component library |
| **State Management** | React Query (TanStack Query) | Server state caching, optimistic updates |
| **Email** | AWS SES (or Resend free tier) | Transactional emails (verification, receipts, notifications) |
| **Deployment** | AWS (Amplify or EC2 + Docker) | User's hosting preference |
| **Monitoring** | CloudWatch (included with AWS) | Logs, metrics, alarms |

---

## 3. User Roles & Permissions

### 3.1 Role Types

| Role | Description |
|------|------------|
| **Student** | Browse, purchase, consume courses, leave reviews |
| **Teacher** | All student abilities + create/manage courses, set pricing, view earnings |
| **Admin** | Full platform control — verify credentials, moderate content, analytics dashboard |

- Users select their intended role at signup (Student or Teacher)
- Any user can later upgrade to Teacher (triggers credential submission flow)
- A Teacher can also purchase/consume courses (dual role)
- Admin is a separate privileged role, not selectable at signup

### 3.2 Auth Flow

1. **Sign Up** → Email/password + OAuth (Google, GitHub) via NextAuth
2. **Role Selection** → Student or Teacher intent
3. **If Teacher** → Credential submission required before publishing courses
4. **Email Verification** → Required for all accounts
5. **2FA** → Optional but encouraged (TOTP-based)

### 3.3 Teacher Onboarding

1. Submit credentials (certificates, diplomas, licenses, resume, LinkedIn)
2. Admin reviews in dashboard → Approve / Request More Info / Reject
3. On approval → Teacher gains course creation access
4. On approval → Stripe Connect onboarding triggered (for payouts)
5. Teacher must activate $5/mo subscription before first course goes live

---

## 4. Data Models

### 4.1 User

```
User {
  _id: ObjectId
  email: string (unique)
  passwordHash: string
  name: string
  avatar: string (S3 URL)
  role: enum [student, teacher, admin]
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date

  // Teacher-specific (populated if role === teacher)
  teacherProfile: {
    bio: string
    headline: string
    credentials: [Credential]
    verificationStatus: enum [pending, approved, rejected, more_info_needed]
    stripeConnectAccountId: string
    subscriptionStatus: enum [active, past_due, cancelled, none]
    subscriptionId: string
    linkedIn: string
    website: string
    socialLinks: { platform: string, url: string }[]
  }

  // Student-specific
  enrolledCourses: [{ courseId, enrolledAt, progress }]
  wishlist: [courseId]
}
```

### 4.2 Credential

```
Credential {
  _id: ObjectId
  teacherId: ObjectId (ref User)
  type: enum [certificate, diploma, license, resume, other]
  title: string
  issuingOrganization: string
  issueDate: Date
  expiryDate: Date (optional)
  fileUrl: string (S3 — private bucket)
  verifiedByAdmin: boolean
  adminNotes: string
  submittedAt: Date
  reviewedAt: Date
}
```

### 4.3 Course

```
Course {
  _id: ObjectId
  teacherId: ObjectId (ref User)
  title: string
  slug: string (unique, URL-friendly)
  description: string (rich text)
  shortDescription: string (for cards)
  thumbnail: string (S3 URL)
  promoVideo: string (S3 URL, optional)

  // Categorization
  category: ObjectId (ref Category)
  subCategory: ObjectId (ref Category)
  tags: [string]

  // Pricing
  pricingModel: enum [free, one_time, monthly, tiered]
  price: number (in cents — for one_time or monthly)
  tiers: [{ name, price, features: [string] }] (for tiered)
  bundleId: ObjectId (ref Bundle, optional)

  // Price breakdown (computed, shown to teacher)
  priceBreakdown: {
    listPrice: number
    stripeFee: number (2.9% + 30¢)
    platformFee: number (1.5%)
    teacherPayout: number
  }

  // Content
  modules: [Module]
  totalDuration: number (minutes, computed)
  totalLessons: number (computed)
  difficulty: enum [beginner, intermediate, advanced, all_levels]
  language: string

  // Status
  status: enum [draft, pending_review, published, archived]
  publishedAt: Date
  featured: boolean

  // Metrics
  enrollmentCount: number
  averageRating: number
  reviewCount: number

  createdAt: Date
  updatedAt: Date
}
```

### 4.4 Module & Lesson

```
Module {
  _id: ObjectId
  courseId: ObjectId
  title: string
  order: number
  lessons: [Lesson]
}

Lesson {
  _id: ObjectId
  moduleId: ObjectId
  title: string
  type: enum [video, text, quiz, download, live_session]
  order: number
  content: {
    // For video
    videoUrl: string (S3)
    duration: number (seconds)
    // For text
    body: string (rich text / markdown)
    // For quiz
    questions: [{ question, options, correctAnswer, explanation }]
    // For download
    files: [{ name, url, size }]
    // For live session
    scheduledAt: Date
    meetingUrl: string
  }
  isFreePreview: boolean
  completionCriteria: enum [view, quiz_pass, manual]
}
```

### 4.5 Category

```
Category {
  _id: ObjectId
  name: string
  slug: string
  description: string
  icon: string
  parentId: ObjectId (null for top-level)
  order: number
  isActive: boolean
}
```

Examples:
- Fitness (parent: null) → Bench Press Programming, Deadlifting, Yoga
- Nutrition (parent: null) → Holistic Eastern Medicine, Meal Planning, Sports Nutrition
- Business (parent: null) → Marketing, Freelancing, E-commerce
- Technology (parent: null) → Web Development, Data Science, Cybersecurity

### 4.6 Enrollment & Payment

```
Enrollment {
  _id: ObjectId
  userId: ObjectId
  courseId: ObjectId
  pricePaid: number (cents)
  pricingModelAtPurchase: string
  stripePaymentIntentId: string
  stripeSubscriptionId: string (for monthly courses)
  status: enum [active, cancelled, expired, refunded]
  progress: {
    completedLessons: [lessonId]
    lastAccessedLesson: lessonId
    percentComplete: number
  }
  enrolledAt: Date
  expiresAt: Date (for monthly)
}
```

```
Transaction {
  _id: ObjectId
  enrollmentId: ObjectId
  teacherId: ObjectId
  studentId: ObjectId
  courseId: ObjectId
  amount: number (cents)
  stripeFee: number
  platformFee: number
  teacherPayout: number
  stripePaymentIntentId: string
  stripeTransferId: string
  status: enum [pending, completed, failed, refunded]
  createdAt: Date
}
```

### 4.7 Review

```
Review {
  _id: ObjectId
  courseId: ObjectId
  userId: ObjectId
  rating: number (1-5)
  title: string
  body: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}
```

### 4.8 Bundle

```
Bundle {
  _id: ObjectId
  teacherId: ObjectId
  name: string
  description: string
  courses: [ObjectId]
  originalTotalPrice: number
  bundlePrice: number
  isActive: boolean
}
```

---

## 5. Stripe Payment Architecture

### 5.1 Overview

```
[Student] → pays list price → [Stripe] → deducts Stripe fee
                                        → transfers 1.5% to Platform
                                        → transfers remainder to Teacher's Connect account
```

### 5.2 Stripe Connect Flow

1. **Teacher signs up** → We create a Stripe Connect Express account
2. **Teacher completes onboarding** → Stripe handles KYC/identity verification
3. **Student purchases course** → We create a PaymentIntent with:
   - `application_fee_amount` = 1.5% of sale price (our platform cut)
   - `transfer_data.destination` = teacher's Connect account ID
4. Stripe automatically handles the split — teacher receives payout minus Stripe fees and our 1.5%

### 5.3 Price Transparency (Teacher Dashboard)

When a teacher sets a course price, we show a real-time breakdown:

```
Your Price:              $50.00
Stripe Processing Fee:   -$1.75 (2.9% + $0.30)
Platform Fee (1.5%):     -$0.75
─────────────────────────────────
You Receive:             $47.50
```

### 5.4 Subscription Types

| Subscription | Who Pays | Amount | Stripe Product |
|-------------|----------|--------|---------------|
| Teacher Platform Access | Teacher → Cmart | $5/mo (beta) | Stripe Subscription |
| Monthly Course Access | Student → Teacher | Varies | Stripe Subscription via Connect |

### 5.5 Webhook Events to Handle

- `checkout.session.completed` — Enrollment creation
- `invoice.payment_succeeded` — Recurring payment success
- `invoice.payment_failed` — Notify user, grace period
- `customer.subscription.deleted` — Revoke access
- `account.updated` — Connect account status changes

---

## 6. File Storage Architecture (AWS S3)

### 6.1 Bucket Structure

```
cmart-uploads/
├── avatars/{userId}/
├── credentials/{teacherId}/{credentialId}/    (PRIVATE — admin only)
├── courses/{courseId}/
│   ├── thumbnail.{ext}
│   ├── promo-video.{ext}
│   └── lessons/{lessonId}/
│       ├── video.{ext}
│       └── files/{filename}
└── temp/                                       (pre-upload staging)
```

### 6.2 Access Control

- **Public:** Avatars, course thumbnails, promo videos
- **Authenticated (enrolled students):** Lesson videos, downloadable files → presigned URLs with expiry
- **Private (admin only):** Credential documents

### 6.3 Upload Flow

1. Client requests presigned upload URL from API
2. Client uploads directly to S3 (no server bottleneck)
3. Server confirms upload, processes metadata
4. For video: trigger transcoding pipeline (optional, future — HLS via MediaConvert)

### 6.4 Local Development Fallback

- MinIO (S3-compatible) running in Docker for local development
- Environment variable toggle: `STORAGE_PROVIDER=local|s3`

---

## 7. Page Structure & Routes

### 7.1 Public Pages

| Route | Page | Description |
|-------|------|------------|
| `/` | Home | Hero, featured courses, categories, CTA |
| `/courses` | Browse Courses | Search, filter by category/price/rating, sort |
| `/courses/[slug]` | Course Detail | Description, modules preview, teacher profile, reviews, purchase CTA |
| `/categories` | Category Browser | All overarching categories with sub-categories |
| `/categories/[slug]` | Category Page | Courses in this category |
| `/teachers/[id]` | Teacher Profile | Bio, credentials (verified badge), courses, ratings |
| `/auth/signin` | Sign In | Email/password + OAuth |
| `/auth/signup` | Sign Up | Registration + role selection |
| `/auth/verify-email` | Email Verification | Confirmation page |
| `/pricing` | Seller Pricing | $5/mo subscription info for teachers |

### 7.2 Student Dashboard (Authenticated)

| Route | Page | Description |
|-------|------|------------|
| `/dashboard` | Student Home | Enrolled courses, progress, recommendations |
| `/dashboard/courses` | My Courses | All enrolled courses with progress |
| `/dashboard/courses/[id]/learn` | Course Player | Video player, lesson content, progress tracking |
| `/dashboard/wishlist` | Wishlist | Saved courses |
| `/dashboard/settings` | Account Settings | Profile, password, 2FA, notifications |
| `/dashboard/billing` | Billing | Payment history, active subscriptions |

### 7.3 Teacher Dashboard (Authenticated + Verified Teacher)

| Route | Page | Description |
|-------|------|------------|
| `/teacher` | Teacher Home | Earnings overview, recent enrollments, course stats |
| `/teacher/courses` | My Courses | All created courses, status, quick actions |
| `/teacher/courses/new` | Create Course | Step-by-step course builder |
| `/teacher/courses/[id]/edit` | Edit Course | Modules, lessons, pricing, settings |
| `/teacher/courses/[id]/analytics` | Course Analytics | Enrollment, revenue, completion rates |
| `/teacher/credentials` | My Credentials | Upload/manage credentials, verification status |
| `/teacher/earnings` | Earnings | Revenue breakdown, payout history, Stripe dashboard link |
| `/teacher/subscription` | Subscription | Manage $5/mo platform subscription |
| `/teacher/bundles` | Bundles | Create/manage course bundles |
| `/teacher/profile` | Public Profile Editor | Edit bio, social links, headline |

### 7.4 Admin Dashboard

| Route | Page | Description |
|-------|------|------------|
| `/admin` | Admin Home | Key metrics, pending actions, system health |
| `/admin/credentials` | Credential Review | Queue of pending teacher credentials, approve/reject |
| `/admin/users` | User Management | Search/filter users, view profiles, ban/suspend |
| `/admin/courses` | Course Management | All courses, status management, featured selection |
| `/admin/categories` | Category Management | CRUD categories and sub-categories |
| `/admin/analytics` | Platform Analytics | Revenue, signups, enrollments, retention charts |
| `/admin/transactions` | Transaction Log | All payments, refunds, disputes |
| `/admin/settings` | Platform Settings | Subscription price, commission rate, feature flags |

---

## 8. API Routes (Next.js API)

### 8.1 Auth

```
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/signout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify
```

### 8.2 Users

```
GET    /api/users/me
PATCH  /api/users/me
PATCH  /api/users/me/avatar
GET    /api/users/[id]/public-profile
POST   /api/users/upgrade-to-teacher
```

### 8.3 Credentials

```
POST   /api/credentials                    (teacher uploads)
GET    /api/credentials/mine               (teacher views own)
DELETE /api/credentials/[id]               (teacher deletes own)
GET    /api/admin/credentials/pending      (admin queue)
PATCH  /api/admin/credentials/[id]/review  (admin approve/reject)
```

### 8.4 Courses

```
GET    /api/courses                        (public browse, with filters)
GET    /api/courses/[slug]                 (public detail)
POST   /api/courses                        (teacher create)
PATCH  /api/courses/[id]                   (teacher update)
DELETE /api/courses/[id]                   (teacher delete/archive)
POST   /api/courses/[id]/publish           (teacher publish → review)
GET    /api/courses/[id]/analytics         (teacher analytics)
```

### 8.5 Modules & Lessons

```
POST   /api/courses/[id]/modules
PATCH  /api/courses/[id]/modules/[moduleId]
DELETE /api/courses/[id]/modules/[moduleId]
POST   /api/courses/[id]/modules/[moduleId]/lessons
PATCH  /api/courses/[id]/modules/[moduleId]/lessons/[lessonId]
DELETE /api/courses/[id]/modules/[moduleId]/lessons/[lessonId]
POST   /api/lessons/[id]/complete          (student marks complete)
```

### 8.6 Enrollments

```
POST   /api/enrollments                    (purchase/enroll)
GET    /api/enrollments/mine               (student's courses)
GET    /api/enrollments/[id]               (enrollment details + progress)
```

### 8.7 Reviews

```
GET    /api/courses/[slug]/reviews
POST   /api/courses/[slug]/reviews         (enrolled students only)
PATCH  /api/reviews/[id]
DELETE /api/reviews/[id]
```

### 8.8 Payments / Stripe

```
POST   /api/stripe/create-checkout         (course purchase)
POST   /api/stripe/create-subscription     (teacher platform sub)
POST   /api/stripe/connect/onboard         (teacher Connect setup)
GET    /api/stripe/connect/status           (teacher Connect status)
POST   /api/stripe/webhooks                (Stripe webhook handler)
GET    /api/stripe/price-breakdown          (calculate fees for teacher)
```

### 8.9 Categories

```
GET    /api/categories                     (public, hierarchical)
POST   /api/admin/categories               (admin CRUD)
PATCH  /api/admin/categories/[id]
DELETE /api/admin/categories/[id]
```

### 8.10 Uploads

```
POST   /api/uploads/presigned-url          (get S3 presigned URL)
POST   /api/uploads/confirm                (confirm upload complete)
```

### 8.11 Admin

```
GET    /api/admin/analytics                (dashboard metrics)
GET    /api/admin/users                    (user management)
PATCH  /api/admin/users/[id]               (suspend/ban/role change)
GET    /api/admin/courses                  (course moderation)
PATCH  /api/admin/courses/[id]             (feature/archive/approve)
GET    /api/admin/transactions             (payment log)
```

---

## 9. Project Structure

```
cmart/
├── .env.local                          # Environment variables
├── .env.example                        # Template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── prisma/                             # (if we switch to Prisma later)
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (providers, nav)
│   │   ├── page.tsx                    # Home page
│   │   ├── globals.css
│   │   │
│   │   ├── (public)/                   # Public route group
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx            # Browse courses
│   │   │   │   └── [slug]/page.tsx     # Course detail
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── teachers/[id]/page.tsx
│   │   │   └── pricing/page.tsx
│   │   │
│   │   ├── (auth)/                     # Auth route group
│   │   │   ├── signin/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   │
│   │   ├── dashboard/                  # Student dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/learn/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── billing/page.tsx
│   │   │
│   │   ├── teacher/                    # Teacher dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/page.tsx
│   │   │   │       └── analytics/page.tsx
│   │   │   ├── credentials/page.tsx
│   │   │   ├── earnings/page.tsx
│   │   │   ├── subscription/page.tsx
│   │   │   ├── bundles/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── admin/                      # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── credentials/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── api/                        # API routes
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── users/
│   │       ├── courses/
│   │       ├── credentials/
│   │       ├── enrollments/
│   │       ├── reviews/
│   │       ├── categories/
│   │       ├── uploads/
│   │       ├── stripe/
│   │       └── admin/
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── RoleSelector.tsx
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseGrid.tsx
│   │   │   ├── CourseFilters.tsx
│   │   │   ├── CoursePlayer.tsx
│   │   │   ├── ModuleList.tsx
│   │   │   ├── LessonContent.tsx
│   │   │   ├── PricingDisplay.tsx
│   │   │   └── ReviewSection.tsx
│   │   ├── teacher/
│   │   │   ├── CourseBuilder.tsx
│   │   │   ├── PriceCalculator.tsx
│   │   │   ├── CredentialUploader.tsx
│   │   │   └── EarningsChart.tsx
│   │   ├── admin/
│   │   │   ├── CredentialReviewCard.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── AnalyticsWidgets.tsx
│   │   │   └── CategoryManager.tsx
│   │   └── shared/
│   │       ├── SearchBar.tsx
│   │       ├── Pagination.tsx
│   │       ├── FileUploader.tsx
│   │       ├── RichTextEditor.tsx
│   │       ├── StarRating.tsx
│   │       └── VerifiedBadge.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                       # MongoDB connection
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── stripe.ts                   # Stripe client init
│   │   ├── s3.ts                       # S3 client + helpers
│   │   ├── email.ts                    # Email sending utility
│   │   ├── validators.ts              # Zod schemas for API validation
│   │   └── utils.ts                    # General utilities
│   │
│   ├── models/                         # Mongoose models
│   │   ├── User.ts
│   │   ├── Credential.ts
│   │   ├── Course.ts
│   │   ├── Module.ts
│   │   ├── Lesson.ts
│   │   ├── Enrollment.ts
│   │   ├── Transaction.ts
│   │   ├── Review.ts
│   │   ├── Bundle.ts
│   │   └── Category.ts
│   │
│   ├── hooks/                          # React custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCourses.ts
│   │   ├── useUpload.ts
│   │   └── useStripe.ts
│   │
│   ├── types/                          # TypeScript types
│   │   └── index.ts
│   │
│   └── middleware.ts                    # Next.js middleware (auth guards, role checks)
│
├── public/
│   ├── images/
│   └── icons/
│
└── docker-compose.yml                  # Local MongoDB + MinIO
```

---

## 10. UI/UX Design Principles

### 10.1 Mobile-First

- All layouts designed mobile-first, scaling up to desktop
- Bottom navigation bar on mobile (like Skool app)
- Responsive grid: 1 col mobile → 2 col tablet → 3-4 col desktop for course cards
- Touch-friendly tap targets (min 44px)
- Swipeable carousels for course categories on mobile

### 10.2 Design System

- **Colors:** Clean, professional palette — primary blue/indigo, success green, warning amber
- **Typography:** Inter or system font stack for performance
- **Cards:** Rounded corners, subtle shadows, hover elevation
- **Verified Badge:** Prominent green checkmark + "Verified Teacher" label on teacher profiles and course cards
- **Dark mode:** Support via Tailwind `dark:` classes (toggle in settings)

### 10.3 Key UX Flows

**Student Purchase Flow:**
1. Browse/search → Course card click → Course detail page
2. View teacher credentials (verified badge, click to see details)
3. Select pricing tier (if applicable) → "Enroll Now" button
4. Stripe Checkout → Success page → Redirect to course player

**Teacher Course Creation Flow:**
1. Teacher dashboard → "Create Course" → Step wizard:
   - Step 1: Basic info (title, description, category, thumbnail)
   - Step 2: Content (add modules → add lessons, upload media)
   - Step 3: Pricing (select model, set price, view fee breakdown)
   - Step 4: Review & Publish
2. Course enters "pending review" or goes live immediately (configurable)

---

## 11. Security Considerations

| Area | Approach |
|------|---------|
| **Authentication** | NextAuth with JWT + secure httpOnly cookies, CSRF protection |
| **Password Storage** | bcrypt with salt rounds ≥ 12 |
| **API Protection** | Middleware-based auth guards, role-based route protection |
| **Input Validation** | Zod schemas on every API endpoint |
| **File Uploads** | Type validation, size limits, virus scanning (ClamAV, future), presigned URLs |
| **SQL/NoSQL Injection** | Mongoose parameterized queries, no raw query strings |
| **XSS** | React's built-in escaping, DOMPurify for rich text |
| **CORS** | Strict origin whitelist |
| **Rate Limiting** | Per-endpoint rate limits (upstash/ratelimit or custom) |
| **Credential Files** | Private S3 bucket, presigned URLs with short expiry, admin-only access |
| **Stripe Webhooks** | Signature verification on all webhook endpoints |
| **HTTPS** | Enforced in production via AWS ALB/CloudFront |
| **Content Security Policy** | Strict CSP headers |

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [x] Project plan ← you are here
- [ ] Next.js project scaffolding with TypeScript
- [ ] Tailwind CSS + shadcn/ui setup
- [ ] MongoDB connection + Mongoose models
- [ ] NextAuth setup (email/password + Google OAuth)
- [ ] Role selection at signup
- [ ] Basic layout (Navbar, Footer, MobileNav, Sidebar)
- [ ] Environment config (.env, docker-compose for local MongoDB)

### Phase 2: Core User Flows (Week 3-4)
- [ ] Student dashboard shell
- [ ] Teacher dashboard shell
- [ ] Teacher credential upload + submission
- [ ] Admin credential review queue
- [ ] Category CRUD (admin) + category browsing (public)
- [ ] User profile pages (public teacher profile)

### Phase 3: Course System (Week 5-7)
- [ ] Course creation wizard (multi-step form)
- [ ] Module & lesson CRUD
- [ ] File upload to S3 (presigned URLs)
- [ ] Video player component
- [ ] Rich text editor for text lessons
- [ ] Quiz builder & player
- [ ] Course browsing with search & filters
- [ ] Course detail page

### Phase 4: Payments (Week 8-9)
- [ ] Stripe integration setup
- [ ] Teacher Stripe Connect onboarding
- [ ] Teacher $5/mo subscription
- [ ] Course checkout (one-time, monthly, tiered, free)
- [ ] Price calculator with fee transparency
- [ ] Bundle creation & purchase
- [ ] Webhook handling (payment success/failure, subscription events)
- [ ] Transaction recording

### Phase 5: Learning Experience (Week 10)
- [ ] Course player / learning view
- [ ] Progress tracking (lesson completion, percentage)
- [ ] Review & rating system
- [ ] Wishlist functionality
- [ ] Certificate of completion (stretch)

### Phase 6: Admin & Analytics (Week 11)
- [ ] Admin dashboard with key metrics
- [ ] User management (search, suspend, role changes)
- [ ] Course moderation tools
- [ ] Transaction log & revenue analytics
- [ ] Platform settings panel

### Phase 7: Polish & Launch Prep (Week 12)
- [ ] Responsive testing across devices
- [ ] Performance optimization (image optimization, lazy loading, caching)
- [ ] SEO (meta tags, OG images, sitemap)
- [ ] Email templates (welcome, verification, purchase receipt, payout)
- [ ] Error handling & loading states throughout
- [ ] 404 & error pages
- [ ] AWS deployment setup (Amplify or ECS)
- [ ] Domain & SSL configuration

---

## 13. Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cmart

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder

# Stripe
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_placeholder

# Stripe Pricing
STRIPE_TEACHER_SUBSCRIPTION_PRICE_ID=price_placeholder
PLATFORM_COMMISSION_RATE=0.015

# AWS S3
AWS_ACCESS_KEY_ID=placeholder
AWS_SECRET_ACCESS_KEY=placeholder
AWS_REGION=us-east-1
AWS_S3_BUCKET=cmart-uploads

# Storage (local or s3)
STORAGE_PROVIDER=local

# Email (AWS SES)
AWS_SES_FROM_EMAIL=noreply@cmart.com
```

---

## 14. Open Questions / Decisions Needed

These are questions I'll ask as we build:

1. **Refund policy** — Do we support refunds? If so, within what window? Who absorbs the Stripe fee on refunds?
2. **Course approval** — Should courses require admin approval before going live, or can verified teachers publish immediately?
3. **Teacher free trial** — Should teachers get a free trial period before the $5/mo subscription kicks in?
4. **Search** — Basic MongoDB text search for MVP, or integrate Algolia/Meilisearch for better results?
5. **Notifications** — Email only, or in-app notifications too?
6. **Dispute resolution** — How do we handle student complaints about course quality?
7. **Content DRM** — Any concern about video piracy, or acceptable risk for MVP?
8. **Analytics depth** — Simple counts/totals, or do we want time-series charts from day one?
9. **Internationalization** — English only for MVP?
10. **Landing page** — Marketing-style landing page or jump straight to course browsing?

---

## 15. Success Metrics (Post-Launch)

- Teacher signup → credential submission conversion rate
- Credential review turnaround time
- Course creation completion rate (start wizard → publish)
- Student browse → purchase conversion rate
- Monthly active users (student + teacher)
- Platform revenue (subscriptions + commission)
- Average course rating
- Course completion rates

---

*This plan is a living document. It will be updated as we make decisions and progress through implementation.*
