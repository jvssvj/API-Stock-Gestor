const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CLOUDINARY_NAME",
  "CLOUDINARY_KEY",
  "CLOUDINARY_SECRET",
  "ALLOWED_ORIGIN",
] as const

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((envName) => !process.env[envName])

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}`)
  }

  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres.")
  }
}
