import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  quantity: z.number().int().min(0, "Quantidade não pode ser negativa"),
  priceInCents: z.number().int().min(1, "Preço inválido"),
  category: z.string().min(1, "Categoria é obrigatória"),
  sku: z.string().min(1, "SKU é obrigatório"),
  image: z.string().url("Imagem deve ser uma URL").optional(),
});

export const updateItemSchema = createItemSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Atualize ao menos um campo para atualizar!",
  });

export type UpdateItemDTO = z.infer<typeof updateItemSchema>;
export type CreateItemDTO = z.infer<typeof createItemSchema>;
