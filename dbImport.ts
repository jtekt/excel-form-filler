import { S3_BUCKET, getFileList, getConfigFromS3 } from "./s3"
import { connect } from "./db"
import ExcelForm from "./models/excelForm"
export const dbImport = async () => {
  await connect()

  const files: any = await getFileList(S3_BUCKET, "yml/")
  for await (const file of files) {
    const config = await getConfigFromS3(file)
    const { fileKey } = config
    await ExcelForm.findOneAndUpdate({ fileKey }, config, { upsert: true })
    console.log(fileKey)
  }
}

dbImport()
