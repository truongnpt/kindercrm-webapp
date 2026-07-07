import { z } from 'zod';

export const ReviewDemoRequestSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
});

export type ReviewDemoRequestInput = z.infer<typeof ReviewDemoRequestSchema>;
