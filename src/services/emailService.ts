export const emailService = {
  sendOtp: async (to: string, firstName: string, code: string) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_FROM_NAME,
          email: process.env.BREVO_FROM_EMAIL,
        },
        to: [{ email: to, name: firstName }],
        subject: "Seu código de verificação — Stock Gestor",
        htmlContent: `
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
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erro ao enviar email: ${JSON.stringify(error)}`)
    }
  },
}