import { HttpError } from "../errors/HttpError";
import { userRepository } from "../repositories/userRepository";
import { CreateUserInput, createUserSchema, UpdateUserInput, updateUserSchema } from "../schemas/userSchema";
import * as bcrypt from "bcrypt";
import { cloudinaryService, CloudinaryUploadResult } from "./cloudinaryService";
import { ZodError } from "zod";
import { otpService } from "./otpService";
import { changePasswordSchema } from "../schemas/authSchema";

export const userService = {
  create: async (data: CreateUserInput) => {
    const validatedData = createUserSchema.parse(data)

    const emailInUse = await userRepository.findByEmail(validatedData.email)
    if (emailInUse) {
      throw new ZodError([{
        code: 'custom',
        path: ['email'],
        message: 'Este e-mail já está cadastrado.'
      }])
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await userRepository.create({
      ...validatedData,
      password: hashedPassword,
      emailVerified: false,
      stock: { create: {} },
    })

    // Envia OTP de verificação
    await otpService.generate(user.id, user.email, user.firstName)

    return { email: user.email }  // retorna só o email pro front redirecionar
  },

  findById: async (userId: string) => {
    const user = await userRepository.findById(userId)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")
    const { avatarPublicId, ...publicUser } = user
    return publicUser
  },

  update: async (userId: string, userData: UpdateUserInput, file?: Express.Multer.File) => {
    const user = await userRepository.findById(userId)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")

    const validatedData = updateUserSchema.parse(userData)

    if (validatedData.email || validatedData.phone) {
      const conflict = await userRepository.findConflict(userId, validatedData.email, validatedData.phone)
      if (conflict) {
        const field = conflict.email === validatedData.email ? "email" : "phone"
        throw new ZodError([{
          code: "custom",
          path: [field],
          message: `${field === "email" ? "E-mail" : "Telefone"} já está sendo usado por outro usuário.`
        }])
      }
    }

    if (validatedData.email && validatedData.email !== user.email) {
      if (!userData.otpCode) {
        throw new ZodError([{
          code: "custom",
          path: ["otpCode"],
          message: "Código de verificação obrigatório para alterar o e-mail."
        }])
      }
      await otpService.validate(userId, userData.otpCode)
    }

    const shouldRemoveImage = userData.removeImage === "true"

    let avatarUrl = user.avatarUrl
    let avatarPublicId = user.avatarPublicId
    let newAvatarPublicId: string | null = null

    if (file) {
      const folder = `stock-gestor/user/${user.id}/avatar`
      const uploadResult = await cloudinaryService.upload(file.buffer, folder) as CloudinaryUploadResult
      avatarUrl = uploadResult.url
      avatarPublicId = uploadResult.publicId
      newAvatarPublicId = uploadResult.publicId
    } else if (shouldRemoveImage && user.avatarPublicId) {
      await cloudinaryService.delete(user.avatarPublicId)
      avatarUrl = null
      avatarPublicId = null
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
    delete (data as any).removeImage
    delete (data as any).otpCode

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

  changePassword: async (userId: string, data: unknown) => {
    const { otpCode, newPassword } = changePasswordSchema.parse(data)

    const user = await userRepository.findById(userId)
    if (!user) throw new HttpError(404, "Usuário não encontrado.")

    await otpService.validate(userId, otpCode)

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await userRepository.update(userId, { password: hashedPassword })
  },

  delete: async (userId: string) => {
    const user = await userRepository.findById(userId)
    if (!user) throw new HttpError(404, "Nenhum usuário encontrado!")

    const deletedUser = await userRepository.delete(userId)

    if (user.avatarPublicId) {
      await cloudinaryService.delete(user.avatarPublicId)
    }

    return deletedUser
  },
}