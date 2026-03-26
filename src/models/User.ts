import mongoose, { Schema, model, models } from "mongoose";

const socialLinkSchema = new Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const teacherProfileSchema = new Schema(
  {
    bio: { type: String, default: "" },
    headline: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "more_info_needed"],
      default: "pending",
    },
    stripeConnectAccountId: { type: String, default: "" },
    subscriptionStatus: {
      type: String,
      enum: ["active", "past_due", "cancelled", "none"],
      default: "none",
    },
    subscriptionId: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    website: { type: String, default: "" },
    socialLinks: [socialLinkSchema],
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    emailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordTokenExpiry: { type: Date, select: false },
    suspended: { type: Boolean, default: false },
    teacherProfile: { type: teacherProfileSchema, default: undefined },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "teacherProfile.verificationStatus": 1 });

const User = models.User || model("User", userSchema);

export default User;
