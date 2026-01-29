import z from "zod";

export const createUserSchema = z.object({
  image: z.string().optional(),
  name: z.string().nonempty("O nome é obrigatório!"),
  email: z.email("Digite um email válido!").min(1, "Email é obrigatório!"),
  password: z.string().min(3, "A senha é obrigatória!"),
  phone: z.string().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Modifique ao menos um campo para atualizar!",
  });

