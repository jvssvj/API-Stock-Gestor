import z from "zod";

export const createUserSchema = z.object({
  name: z.coerce.string("O nome é obrigatório!"),
  email: z.coerce.string("Digite um email válido!"),
  password: z.coerce.string("A senha é obrigatória!"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    phone: z.coerce.string("Digite um número de celular válido!"),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Modifique ao menos um campo para atualizar!",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>