import { HttpError } from "../errors/HttpError";
import { userRepository } from "../repositories/userRepository";
import { CreateUserInput, createUserSchema, UpdateUserInput, updateUserSchema } from "../schemas/userSchema";
import * as bcrypt from "bcrypt";
import { cloudinaryService } from "./cloudinaryService";

export const userService = {
  findAll: async () => {
    const users = await userRepository.findAll();

    if (users.length === 0 || !users) {
      throw new HttpError(404, "Nenhum usuário encontrado!");
    }

    return users;
  },

  create: async (data: CreateUserInput) => {
    const validatedData = createUserSchema.parse(data);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = {
      ...validatedData,
      password: hashedPassword,
      stock: {
        create: {},
      },
    };

    return await userRepository.create(user);
  },

  findById: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!");
    return user;
  },

  update: async (id: string, userData: UpdateUserInput, file?: Express.Multer.File) => {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!");

    const validatedData = updateUserSchema.parse(userData);
    let avatarUrl = user.avatarUrl
    let avatarPublicId = user.avatarPublicId;

    if (file) {
      if (user.avatarPublicId) {
        await cloudinaryService.delete(user.avatarPublicId);
      }
      const folder = `stock-gestor/user/${user.id}/avatar`;
      const uploadResult = await cloudinaryService.upload(file.buffer, folder) as any;
      avatarUrl = uploadResult.url;
      avatarPublicId = uploadResult.publicId;
    }

    const data = {
      avatarUrl,
      avatarPublicId,
      ...Object.fromEntries(
        Object.entries(validatedData).filter(([_, v]) => v !== undefined)
      ),
    };

    delete (data as any).removePhone;

    return await userRepository.update(id, data);
  },

  delete: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!");

    if (user.avatarPublicId) {
      await cloudinaryService.delete(user.avatarPublicId)
    }

    return await userRepository.delete(id);
  },
};
