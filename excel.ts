import Excel from "exceljs"
import { minioClient, S3_BUCKET } from "./s3"

export async function fillExcel(input: any, config: any) {
  const fileKey = config.fileKey

  console.log(`Fetching ${fileKey} from S3 bucket ${S3_BUCKET}`)
  const fileStream = await minioClient.getObject(S3_BUCKET, fileKey)
  const workbook = new Excel.Workbook()
  await workbook.xlsx.read(fileStream)

  for await (const field of config.fields) {
    const worksheet = workbook.getWorksheet(field.sheet)
    if (!worksheet) throw `Worksheet ${field.sheet} not found`

    const value = input[field.key] ?? field.default
    if (!value && field.required) throw `Missing value for key ${field.key}`
    if (value) {
      const cell = worksheet.getCell(field.cell)
      cell.value = value
    }
  }

  return workbook
}
