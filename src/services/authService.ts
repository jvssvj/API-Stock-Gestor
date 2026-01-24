import { prisma } from "../database"; // ou onde está seu prisma client
import { loginSchema } from "../schemas/authSchema";
import { HttpError } from "../errors/HttpError";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export const authService = {
  login: async (data: unknown) => {
    const { email, password } = loginSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpError(401, "E-mail ou senha inválidos");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, "E-mail ou senha inválidos");
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign({ userId: user.id, userName: user.name }, secret, { expiresIn: "1d" });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
};
