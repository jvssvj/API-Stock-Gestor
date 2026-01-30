import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório!"),
  email: z.email("Digite um email válido!").trim().min(1, "Digite um email válido!"),
  password: z.string().min(1, "A senha é obrigatória!"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    phone: z.coerce.string("Digite um número de celular válido!").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Modifique ao menos um campo para atualizar!",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>