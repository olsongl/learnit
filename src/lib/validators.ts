import { z } from "zod";

// Auth
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["student", "teacher"]),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});

// User
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  headline: z.string().max(200).optional(),
  linkedIn: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
});

// Credential
export const createCredentialSchema = z.object({
  type: z.enum(["certificate", "diploma", "license", "resume", "other"]),
  title: z.string().min(1).max(200),
  issuingOrganization: z.string().min(1).max(200),
  issueDate: z.string().datetime().or(z.string()),
  expiryDate: z.string().datetime().or(z.string()).optional(),
  fileUrl: z.string(),
});

// Course
export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10).max(10000),
  shortDescription: z.string().max(300).optional(),
  category: z.string(),
  subCategory: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "all_levels"]),
  language: z.string().default("English"),
  pricingModel: z.enum(["free", "one_time", "monthly", "tiered"]),
  price: z.number().int().min(0).optional(),
  tiers: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().int().min(0),
        features: z.array(z.string()),
      })
    )
    .optional(),
  thumbnail: z.string().optional(),
  promoVideo: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Module
export const createModuleSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().min(0).optional(),
});

// Lesson
export const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["video", "text", "quiz", "download", "live_session"]),
  order: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
  completionCriteria: z.enum(["view", "quiz_pass", "manual"]).default("view"),
  content: z.object({
    videoUrl: z.string().optional(),
    duration: z.number().optional(),
    body: z.string().optional(),
    questions: z
      .array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number(),
          explanation: z.string().optional(),
        })
      )
      .optional(),
    files: z
      .array(
        z.object({
          name: z.string(),
          url: z.string(),
          size: z.number(),
        })
      )
      .optional(),
    scheduledAt: z.string().datetime().optional(),
    meetingUrl: z.string().url().optional(),
  }),
});

// Review
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().max(5000),
});

// Category
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

// Bundle
export const createBundleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  courses: z.array(z.string()).min(2, "Bundle must contain at least 2 courses"),
  bundlePrice: z.number().int().min(0),
});

// Upload
export const presignedUrlSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  folder: z.enum([
    "avatars",
    "credentials",
    "courses",
    "lessons",
    "temp",
  ]),
});

// Admin
export const reviewCredentialSchema = z.object({
  status: z.enum(["approved", "rejected", "more_info_needed"]),
  adminNotes: z.string().max(1000).optional(),
});

export const updateUserAdminSchema = z.object({
  role: z.enum(["student", "teacher", "admin"]).optional(),
  suspended: z.boolean().optional(),
});

export const updateCourseAdminSchema = z.object({
  featured: z.boolean().optional(),
  status: z.enum(["published", "archived", "pending_review"]).optional(),
});
