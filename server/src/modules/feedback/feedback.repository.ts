import { FeedbackModel } from "./feedback.model";

export const feedbackRepository = {
  create(data: Record<string, unknown>) {
    return FeedbackModel.create(data);
  },

  findForUser(userId: string) {
    return FeedbackModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }
};
