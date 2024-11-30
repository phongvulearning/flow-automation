import { z } from "zod";

export const CreateCredentailSchema = z.object({
  name: z.string().max(30),
  value: z.string().max(500),
});

export type CreateCredentailSchema = z.infer<typeof CreateCredentailSchema>;
