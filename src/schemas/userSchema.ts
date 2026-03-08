import z from "zod";

export const createUserSchema = z.object({
  name: z.string("O nome é obrigatório!")
    .min(4, "O nome precisa ter no mínimo 4 caracteres.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  email: z
    .email("Digite um email válido!")
    .min(1, "Digite um email válido!"),
  password: z
    .string("A senha é obrigatória!")
    .min(6, "A senha precisa de pelo menos 6 caracteres!"),
})

export const updateUserSchema = z.object({
  name: z
    .string("O nome é obrigatório!")
    .min(4, "O nome precisa ter no mínimo 4 caracteres.")
    .max(50, "O nome deve ter no máximo 50 caracteres.")
    .optional(),
  email: z
    .email("Digite um email válido!")
    .trim()
    .min(1, "Digite um email válido!")
    .optional(),
  password: z
    .string("A senha é obrigatória!")
    .min(6, "A senha precisa de pelo menos 6 caracteres!")
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "O telefone deve ter 10 ou 11 dígitos numéricos")
    .optional()
})


export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>