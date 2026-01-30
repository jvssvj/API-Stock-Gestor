import { z } from "zod"
export interface CreateItemRepositoryDTO {
  name: string
  quantity: number
  priceInCents: number
  sku: string
  stockId: string
  categoryId?: string
  imageUrl?: string | null
  imagePublicId?: string | null
}
export interface UpdateItemRepositoryDTO {
  name?: string | null
  quantity?: number | null
  priceInCents?: number | null
  sku?: string | null
  description?: string | null
  categoryId?: string | null
  imageUrl?: string | null
  imagePublicId?: string | null
}

export const createItemSchema = z.object({
  name: z.coerce.string("O nome é obrigatório"),
  description: z.coerce.string().optional(),
  quantity: z.coerce
    .number("Formato inválido. Precisa ser um número!")
    .min(0, "Quantidade não pode ser negativa"),
  priceInCents: z.coerce
    .number("Formato inválido. Precisa ser um número!")
    .min(1, "O preço não pode ser negativo!"),
  categoryId: z.uuid().optional(),
  sku: z.coerce.string("SKU é obrigatório"),
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