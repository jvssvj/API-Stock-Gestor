import { z } from "zod"

export const createItemSchema = z.object({
  name: z
    .string("O nome é obrigatório")
    .min(4, "O precisa de no mínimo 4 caracteres."),
  description: z
    .string()
    .optional(),
  quantity: z.coerce
    .number("Formato inválido. Precisa ser um número!")
    .min(0, "Quantidade não pode ser negativa"),
  priceInCents: z.coerce
    .number("Formato inválido. Precisa ser um número!")
    .min(1, "O preço não pode ser negativo!"),
  categoryId: z
    .string()
    .optional(),
  sku: z
    .string("SKU é obrigatório")
    .min(1, "SKU é obrigatório")
    .trim(),
})

export const updateItemSchema = createItemSchema
  .partial()
  .extend({
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      const { reason, ...fields } = data;
      return Object.values(fields).some((value) => value !== undefined);
    },
    {
      path: ["form"],
      message: "Atualize pelo menos um campo para atualizar.",
    }
  )
  .refine(
    (data) => {
      const { reason, ...fields } = data;
      const hasFields = Object.values(fields).some((value) => value !== undefined);
      return !hasFields || (hasFields && !!reason);
    },
    {
      path: ["reason"],
      message: "O motivo da atualização é obrigatório.",
    }
  );

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>;