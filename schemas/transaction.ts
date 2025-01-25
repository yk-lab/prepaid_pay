import { z } from "zod";

const TransactionStatus = z.enum(["pending", "completed", "failed"]);

export const transactionSchema = z.object({
	transactionId: z.string().uuid(),
	amount: z.number().int().positive(),
	status: TransactionStatus,
});

export type Transaction = z.infer<typeof transactionSchema>;
