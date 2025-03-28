import nodemailer from "nodemailer"
import { UserEmailConfig } from "./controllers/excelForms"

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
  userEmailConfig: UserEmailConfig,
  configRecord: any
) {
  const { from } = userEmailConfig
  const { email: configEmail, fileKey } = configRecord

  const to = userEmailConfig.to || configEmail.to
  const cc = userEmailConfig.cc || from
  const subject = userEmailConfig.subject || configEmail.subject || "申請書"
  const html = userEmailConfig.html || configEmail.html || "ご確認ください"

  if (!from) throw "Sender email not defined"
  if (!to) throw "Recipient email not defined"

  console.log(`Sending email with subject ${subject} from ${from} to ${to}`)

  await transporter.sendMail({
    from,
    to,
    cc,
    subject,
    html,
    attachments: [
      {
        filename: fileKey,
        content: fileBuffer,
      },
    ],
  })
}
