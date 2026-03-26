import { Schema, model, models } from "mongoose";

const questionSchema = new Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const fileSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const contentSchema = new Schema(
  {
    videoUrl: { type: String },
    duration: { type: Number },
    body: { type: String },
    questions: [questionSchema],
    files: [fileSchema],
    scheduledAt: { type: Date },
    meetingUrl: { type: String },
  },
  { _id: false }
);

const lessonSchema = new Schema(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["video", "text", "quiz", "download", "live_session"],
      required: true,
    },
    order: { type: Number, default: 0 },
    content: { type: contentSchema, default: () => ({}) },
    isFreePreview: { type: Boolean, default: false },
    completionCriteria: {
      type: String,
      enum: ["view", "quiz_pass", "manual"],
      default: "view",
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ moduleId: 1, order: 1 });

const Lesson = models.Lesson || model("Lesson", lessonSchema);

export default Lesson;
