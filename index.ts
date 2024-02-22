import { sendAttachmentByEmail } from "./mail"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { S3_BUCKET, S3_ENDPOINT, getFileList, getConfigFromS3 } from "./s3"
import { fillExcel } from "./excel"
import { version, author } from "./package.json"
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

export type UserEmailConfig = {
  from: string
  to?: string
  html?: string
  subject?: string
  cc?: string
}

export type RequestBody = {
  email: UserEmailConfig
  data: any
}

new Elysia()
  .use(cors())
  .use(swagger())
  .get("/", () => ({
    application: "Excel form filler",
    author,
    version,
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
    const { data, email } = body as RequestBody

    const config: ConfigRecord = await getConfigFromS3(key)
    const workbook = await fillExcel(data, config)

    const fileBuffer = await workbook.xlsx.writeBuffer()
    await sendAttachmentByEmail(fileBuffer, email, config)
    return "OK"
  })
  .listen(APP_PORT, () => {
    console.log(`Elysia listening on port ${APP_PORT}`)
  })
