import nodemailer from "nodemailer"
import { type ConfigRecord } from "."

const { SMTP_HOST = "localhost", SMTP_PORT = "25" } = process.env

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  // secure: true,
  // auth: {
  //   user: "REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM",
  //   pass: "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
  // },
})

export async function sendAttachmentByEmail(
  fileBuffer: any,
  from: string,
  configRecord: ConfigRecord
) {
  const {
    email: { to, subject, html },
    fileKey,
  } = configRecord

  const info = await transporter.sendMail({
    from,
    to,
    cc: from,
    subject,
    html,
    attachments: [
      {
        filename: fileKey,
        content: fileBuffer,
      },
    ],
  })

  console.log("Message sent: %s", info.messageId)
}
