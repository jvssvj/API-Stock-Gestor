import { HttpError } from "../errors/HttpError";
import { userRepository } from "../repositories/userRepository";
import { CreateUserInput, createUserSchema, UpdateUserInput } from "../schemas/userSchema";
import * as bcrypt from "bcrypt";
import { cloudinaryService, CloudinaryUploadResult } from "./cloudinaryService";
import { ZodError } from "zod";

export const userService = {
  findAll: async () => {
    return await userRepository.findAll()
  },

  create: async (data: CreateUserInput) => {
    const validatedData = createUserSchema.parse(data)

    const emailInUse = await userRepository.findByEmail(data.email)
    if (emailInUse) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Este e-mail já está cadastrado.'
        }
      ])
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = {
      ...validatedData,
      password: hashedPassword,
      stock: {
        create: {},
      },
    }

    return await userRepository.create(user)
  },

  findById: async (id: string) => {
    const user = await userRepository.findById(id)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")
    return user
  },

  update: async (id: string, userData: UpdateUserInput, file?: Express.Multer.File) => {
    const user = await userRepository.findById(id)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")

    if (userData.email || userData.phone) {
      const conflict = await userRepository.findConflict(id, userData.email, userData.phone)
      if (conflict) {
        const field = conflict.email === userData.email ? "email" : "phone"
        throw new ZodError([
          {
            code: "custom",
            path: [field],
            message: `${field === "email" ? "E-mail" : "Telefone"} já está sendo usado por outro usuário.`
          }
        ])
      }
    }

    let avatarUrl = user.avatarUrl
    let avatarPublicId = user.avatarPublicId

    if (file) {
      if (user.avatarPublicId) {
        await cloudinaryService.delete(user.avatarPublicId)
      }
      const folder = `stock-gestor/user/${user.id}/avatar`
      const uploadResult = await cloudinaryService.upload(file.buffer, folder) as CloudinaryUploadResult
      avatarUrl = uploadResult.url
      avatarPublicId = uploadResult.publicId
    }

    const data = {
      avatarUrl,
      avatarPublicId,
      ...Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== undefined)
      ),
    }

    delete (data as any).removePhone

    return await userRepository.update(id, data)
  },

  delete: async (id: string) => {
    const user = await userRepository.findById(id)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")

    if (user.avatarPublicId) {
      await cloudinaryService.delete(user.avatarPublicId)
    }

    return await userRepository.delete(id)
  },
}
