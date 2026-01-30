import { z } from "zod"

export const createItemSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().optional(),
  quantity: z.coerce
    .number("Formato inválido. Precisa ser um número!")
    .min(0, "Quantidade não pode ser negativa"),
  priceInCents: z.coerce
    .number("Formato inválido. Precisa ser um número!")
    .min(1, "O preço não pode ser negativo!"),
  categoryId: z.string(),
  sku: z.string("SKU é obrigatório").trim().min(1, "SKU é obrigatório"),
})

export const updateItemSchema = createItemSchema
  .partial()
  .extend({
    reason: z
      .string()
      .optional(),
  })

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>;