import Excel from "exceljs"
import YAML from "yaml"
import { sendAttachmentByEmail } from "./mail"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { minioClient, S3_BUCKET, S3_ENDPOINT } from "./s3"

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

async function fillExcel(input: any, config: any) {
  // Excel file
  const fileKey = `xlsx/${config.fileKey}`

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

const stream2Buffer = (dataStream: any) =>
  new Promise((resolve, reject) => {
    const chunks: any = []
    dataStream.on("data", (chunk: any) => chunks.push(chunk))
    dataStream.on("end", () => resolve(Buffer.concat(chunks)))
    dataStream.on("error", reject)
  })

const getFileList = (bucket: string, prefix: string) =>
  new Promise(async (resolve, reject) => {
    const stream = await minioClient.listObjects(bucket, prefix)
    const objects: any[] = []
    stream.on("data", function (obj) {
      objects.push(obj.name?.split(prefix)[1])
    })
    stream.on("error", function (err) {
      reject(err)
    })
    stream.on("end", () => {
      resolve(objects)
    })
  })

const getConfigFromS3 = async (bucket: string, key: string) => {
  const stream = await minioClient.getObject(
    S3_BUCKET,
    `yml/${decodeURIComponent(key)}`
  )
  const buffer: any = await stream2Buffer(stream)
  return YAML.parse(buffer.toString())
}
new Elysia()
  .use(cors())
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
    return getConfigFromS3(S3_BUCKET, key)
  })
  .post("/applications/:key", async ({ body, params }) => {
    const { key: ApplicationKey } = params
    const { data, email }: any = body

    const config: any = await getConfigFromS3(S3_BUCKET, ApplicationKey)

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
