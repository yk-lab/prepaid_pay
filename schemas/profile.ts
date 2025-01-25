import { z } from "zod";

export const profileSchema = z.object({
	id: z.number().int().positive(),
	uid: z.string(),
	balance: z.number().int().nonnegative(),
});

export type Profile = z.infer<typeof profileSchema>;
