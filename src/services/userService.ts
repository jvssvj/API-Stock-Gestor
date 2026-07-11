import { HttpError } from "../errors/HttpError";
import { userRepository } from "../repositories/userRepository";
import { CreateUserInput, createUserSchema, UpdateUserInput, updateUserSchema } from "../schemas/userSchema";
import * as bcrypt from "bcrypt";
import { cloudinaryService, CloudinaryUploadResult } from "./cloudinaryService";
import { ZodError } from "zod";

export const userService = {
  create: async (data: CreateUserInput) => {
    const validatedData = createUserSchema.parse(data)

    const emailInUse = await userRepository.findByEmail(validatedData.email)
    if (emailInUse) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Este e-mail já está cadastrado.'
        }
      ])
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = {
      ...validatedData,
      password: hashedPassword,
      stock: {
        create: {},
      },
    }

    return await userRepository.create(user)
  },

  findMe: async (userId: string) => {
    const user = await userRepository.findMe(userId)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")
    const { avatarPublicId, ...publicUser } = user
    return publicUser
  },

  update: async (userId: string, userData: UpdateUserInput, file?: Express.Multer.File) => {
    const user = await userRepository.findMe(userId)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")

    const validatedData = updateUserSchema.parse(userData)

    if (validatedData.email || validatedData.phone) {
      const conflict = await userRepository.findConflict(userId, validatedData.email, validatedData.phone)
      if (conflict) {
        const field = conflict.email === validatedData.email ? "email" : "phone"
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
    let newAvatarPublicId: string | null = null

    if (file) {
      const folder = `stock-gestor/user/${user.id}/avatar`
      const uploadResult = await cloudinaryService.upload(file.buffer, folder) as CloudinaryUploadResult
      avatarUrl = uploadResult.url
      avatarPublicId = uploadResult.publicId
      newAvatarPublicId = uploadResult.publicId
    }

    const data: any = {
      avatarUrl,
      avatarPublicId,
      ...Object.fromEntries(
        Object.entries(validatedData).filter(([_, v]) => v !== undefined)
      ),
    }

    if (validatedData.password) {
      data.password = await bcrypt.hash(validatedData.password, 10)
    }

    delete (data as any).removePhone

    try {
      const updatedUser = await userRepository.update(userId, data)

      if (newAvatarPublicId && user.avatarPublicId) {
        await cloudinaryService.delete(user.avatarPublicId)
      }

      return updatedUser
    } catch (error) {
      if (newAvatarPublicId) {
        await cloudinaryService.delete(newAvatarPublicId)
      }
      throw error
    }
  },

  delete: async (userId: string) => {
    const user = await userRepository.findMe(userId)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")

    const deletedUser = await userRepository.delete(userId)

    if (user.avatarPublicId) {
      await cloudinaryService.delete(user.avatarPublicId)
    }

    return deletedUser
  },
}
