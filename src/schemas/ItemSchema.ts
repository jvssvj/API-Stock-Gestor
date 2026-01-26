import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  quantity: z
    .number("Formato inválido. Precisa ser um número!")
    .int("A quantidade precisa ser maior que 1!")
    .min(0, "Quantidade não pode ser negativa"),
  priceInCents: z
    .number("Formato inválido. Precisa ser um número!")
    .int("O preço precisa ser maior que 1!")
    .min(1, "O preço não pode ser negativo!"),
  categoryId: z.uuid().optional(),
  sku: z.string("SKU é obrigatório"),
  image: z.string().url("Imagem deve ser uma URL").optional(),
});

export const updateItemSchema = createItemSchema
  .partial()
  .extend({
    reason: z
      .string()
      .optional(),
  })
  .refine((data) => {
    const { reason, ...actualData } = data;
    return Object.keys(actualData).length > 0;
  }, {
    message: "Altere pelo menos um campo (nome, quantidade, etc.) para salvar as mudanças!",
  });

export type UpdateItemDTO = z.infer<typeof updateItemSchema>;
export type CreateItemDTO = z.infer<typeof createItemSchema>;
