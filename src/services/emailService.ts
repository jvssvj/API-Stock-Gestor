import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL!

export const emailService = {
    sendOtp: async (to: string, firstName: string, code: string) => {
        await resend.emails.send({
            from: FROM,
            to,
            subject: "Seu código de verificação — Stock Gestor",
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Olá, ${firstName}!</h2>
          <p>Use o código abaixo para continuar. Ele expira em <strong>10 minutos</strong>.</p>
          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 24px;
            background: #f4f4f5;
            border-radius: 8px;
            margin: 24px 0;
          ">
            ${code}
          </div>
          <p style="color: #71717a; font-size: 14px;">
            Se você não solicitou esse código, ignore este email.
          </p>
        </div>
      `,
        })
    },
}