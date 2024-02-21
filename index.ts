import { sendAttachmentByEmail } from "./mail"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { S3_BUCKET, S3_ENDPOINT, getFileList, getConfigFromS3 } from "./s3"
import { fillExcel } from "./excel"

const { APP_PORT = 80 } = process.env

export type ConfigField = {
  key: string
  sheet: string
  cell: string
  default?: string
  required?: boolean
}

export type ConfigRecord = {
  fileKey: string
  email: {
    to: string
    subject: string
    html: string
  }
  fields: ConfigField[]
}

new Elysia()
  .use(cors())
  .use(swagger())
  .get("/", () => ({
    application: "Excel form filler",
    author: "Maxime Moreillon",
    s3: {
      bucket: S3_BUCKET,
      endpoint: S3_ENDPOINT,
    },
  }))
  .get("/applications", async () => await getFileList(S3_BUCKET, "yml/"))
  .get("/applications/:key", async ({ params }) => {
    const { key } = params
    return getConfigFromS3(key)
  })
  .post("/applications/:key", async ({ body, params }) => {
    const { key } = params
    const { data, email }: any = body

    const config: any = await getConfigFromS3(key)
    const workbook = await fillExcel(data, config)

    if (email?.from && config.email?.to) {
      const { from } = email
      console.log(`Sending email to ${config.email.to}`)
      const fileBuffer = await workbook.xlsx.writeBuffer()
      await sendAttachmentByEmail(fileBuffer, from, config)
      return "OK"
    } else {
      // TODO: respond with file
      return "Not implemented"
    }
  })
  .listen(APP_PORT, () => {
    console.log(`Elysia listening on port ${APP_PORT}`)
  })
