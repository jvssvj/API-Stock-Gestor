import { Prisma, User } from "@prisma/client";
import { HttpError } from "../errors/HttpError";
import { userRepository } from "../repositories/userRepository";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";

export const userService = {
  findAll: async (): Promise<User[] | []> => {
    const users = await userRepository.findAll();

    if (users.length === 0 || !users) {
      throw new HttpError(404, "Nenhum usuário encontrado!");
    }

    return users;
  },

  create: async (data: unknown) => {
    const validatedData = createUserSchema.parse(data);

    const user: Prisma.UserCreateInput = {
      ...validatedData,
      stock: {
        create: {},
      },
    };

    return await userRepository.create(user);
  },

  findById: async (id: string): Promise<User | null> => {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!");
    return user;
  },

  update: async (id: string, data: unknown) => {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!");

    const validatedData = updateUserSchema.parse(data);
    return await userRepository.update(id, validatedData);
  },

  delete: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!");
    return await userRepository.delete(id);
  },
};
