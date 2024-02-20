import Excel from "exceljs"
import YAML from "yaml"
import { readFileSync } from "fs"
import { sendAttachmentByEmail } from "./mail"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { minioClient, S3_BUCKET } from "./s3"
const { APP_PORT = 80 } = process.env
export type ConfigField = {
  key: string
  sheet: string
  cell: string
  default?: string
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

// Config
const configFilePath = "./config/config.yml"
const configFile = readFileSync(configFilePath, "utf8")
const config: ConfigRecord = YAML.parse(configFile)

async function fillExcel(input: any) {
  // Excel file
  const { fileKey } = config
  console.log(`Fetching ${fileKey} from S3 bucket ${S3_BUCKET}`)
  const fileStream = await minioClient.getObject(S3_BUCKET, fileKey)
  const workbook = new Excel.Workbook()
  await workbook.xlsx.read(fileStream)

  for await (const field of config.fields) {
    const worksheet = workbook.getWorksheet(field.sheet)
    if (!worksheet) throw `Worksheet ${field.sheet} not found`

    // TODO: deal with required / not required
    const value = input[field.key] ?? field.default
    if (!value) throw `Missing value for key ${field.key}`

    const cell = worksheet.getCell(field.cell)
    cell.value = value
  }

  return workbook
}

new Elysia()
  .use(cors())
  .get("/", () => ({
    application: "Excel form filler",
    // version,
  }))
  .get("/config", () => config)
  .post("/data", async ({ body }) => {
    const { data, email }: any = body

    const workbook = await fillExcel(data)

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
