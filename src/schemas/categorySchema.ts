import z from "zod";

export const createCategorySchema = z.object({
    name: z.string("O nome da categoria é obrigatório!"),
    color: z.string('Selecione uma cor!'),
    iconName: z.string("Selecione um ícone")
})

export const updateCategorySchema = createCategorySchema.partial().refine(data => {
    const keys = Object.keys(data)
    return keys.length > 0
}, {
    path: ["form"],
    message: "Altere ao menos um campo para enviar!"
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>