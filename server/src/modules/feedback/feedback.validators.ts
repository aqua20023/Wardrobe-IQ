import { z } from "zod";
import { feedbackActions } from "./feedback.model";

export const createFeedbackSchema = z.object({
  outfitId: z.string().regex(/^[a-f\d]{24}$/i),
  action: z.enum(feedbackActions)
});
