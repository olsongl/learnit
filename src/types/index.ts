import { Types } from "mongoose";

// User Types
export type UserRole = "student" | "teacher" | "admin";
export type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "more_info_needed";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "none";

export interface SocialLink {
  platform: string;
  url: string;
}

export interface TeacherProfile {
  bio: string;
  headline: string;
  verificationStatus: VerificationStatus;
  stripeConnectAccountId: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId: string;
  linkedIn: string;
  website: string;
  socialLinks: SocialLink[];
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash?: string;
  name: string;
  avatar: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  suspended: boolean;
  teacherProfile?: TeacherProfile;
  wishlist: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Credential Types
export type CredentialType =
  | "certificate"
  | "diploma"
  | "license"
  | "resume"
  | "other";

export interface ICredential {
  _id: Types.ObjectId;
  teacherId: Types.ObjectId;
  type: CredentialType;
  title: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  fileUrl: string;
  verifiedByAdmin: boolean;
  adminNotes: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

// Course Types
export type PricingModel = "free" | "one_time" | "monthly" | "tiered";
export type CourseStatus = "draft" | "pending_review" | "published" | "archived";
export type Difficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "all_levels";

export interface CourseTier {
  name: string;
  price: number;
  features: string[];
}

export interface PriceBreakdown {
  listPrice: number;
  stripeFee: number;
  platformFee: number;
  teacherPayout: number;
}

export interface ICourse {
  _id: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  promoVideo?: string;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId;
  tags: string[];
  pricingModel: PricingModel;
  price: number;
  tiers: CourseTier[];
  bundleId?: Types.ObjectId;
  priceBreakdown: PriceBreakdown;
  totalDuration: number;
  totalLessons: number;
  difficulty: Difficulty;
  language: string;
  status: CourseStatus;
  publishedAt?: Date;
  featured: boolean;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Module & Lesson Types
export type LessonType = "video" | "text" | "quiz" | "download" | "live_session";
export type CompletionCriteria = "view" | "quiz_pass" | "manual";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface LessonFile {
  name: string;
  url: string;
  size: number;
}

export interface LessonContent {
  videoUrl?: string;
  duration?: number;
  body?: string;
  questions?: QuizQuestion[];
  files?: LessonFile[];
  scheduledAt?: Date;
  meetingUrl?: string;
}

export interface ILesson {
  _id: Types.ObjectId;
  moduleId: Types.ObjectId;
  title: string;
  type: LessonType;
  order: number;
  content: LessonContent;
  isFreePreview: boolean;
  completionCriteria: CompletionCriteria;
}

export interface IModule {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  order: number;
  lessons: ILesson[];
}

// Category Types
export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parentId: Types.ObjectId | null;
  order: number;
  isActive: boolean;
}

// Enrollment Types
export type EnrollmentStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "refunded";

export interface EnrollmentProgress {
  completedLessons: Types.ObjectId[];
  lastAccessedLesson?: Types.ObjectId;
  percentComplete: number;
}

export interface IEnrollment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  pricePaid: number;
  pricingModelAtPurchase: string;
  stripePaymentIntentId: string;
  stripeSubscriptionId?: string;
  status: EnrollmentStatus;
  progress: EnrollmentProgress;
  enrolledAt: Date;
  expiresAt?: Date;
}

// Transaction Types
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface ITransaction {
  _id: Types.ObjectId;
  enrollmentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  stripeFee: number;
  platformFee: number;
  teacherPayout: number;
  stripePaymentIntentId: string;
  stripeTransferId?: string;
  status: TransactionStatus;
  createdAt: Date;
}

// Review Types
export interface IReview {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Bundle Types
export interface IBundle {
  _id: Types.ObjectId;
  teacherId: Types.ObjectId;
  name: string;
  description: string;
  courses: Types.ObjectId[];
  originalTotalPrice: number;
  bundlePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// NextAuth Extensions
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
  }
}

// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
