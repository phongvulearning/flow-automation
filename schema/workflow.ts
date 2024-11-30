import { z } from "zod";

export const CreateWorkflowSchema = z.object({
  name: z.string(),
  description: z.string().max(80).optional(),
});

export type CreateWorkflowSchema = z.infer<typeof CreateWorkflowSchema>;

export const DuplicateWorkflowSchema = CreateWorkflowSchema.extend({
  workflowId: z.string(),
});

export type DuplicateWorkflowSchema = z.infer<typeof DuplicateWorkflowSchema>;
