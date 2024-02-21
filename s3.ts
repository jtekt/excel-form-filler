import { Client } from "minio"
import path from "path"
import YAML from "yaml"

export const {
  S3_REGION,
  S3_ACCESS_KEY_ID = "",
  S3_SECRET_ACCESS_KEY = "",
  S3_ENDPOINT = "s3.amazonaws.com",
  S3_PORT,
  S3_BUCKET = "",
  S3_USE_SSL,
  S3_FILE_KEY = "",
} = process.env

export const minioClient = new Client({
  accessKey: S3_ACCESS_KEY_ID,
  secretKey: S3_SECRET_ACCESS_KEY,
  endPoint: S3_ENDPOINT,
  port: Number(S3_PORT),
  useSSL: !!S3_USE_SSL,
  region: S3_REGION,
})

export const getFileList = (bucket: string, prefix: string) =>
  new Promise(async (resolve, reject) => {
    const stream = await minioClient.listObjects(bucket, prefix)
    const objects: any[] = []
    stream.on("data", (obj) => {
      if (!obj.name) return
      const { name } = path.parse(obj?.name)
      objects.push(name)
    })
    stream.on("error", (err) => {
      reject(err)
    })
    stream.on("end", () => {
      resolve(objects)
    })
  })

const stream2Buffer = (dataStream: any) =>
  new Promise((resolve, reject) => {
    const chunks: any = []
    dataStream.on("data", (chunk: any) => chunks.push(chunk))
    dataStream.on("end", () => resolve(Buffer.concat(chunks)))
    dataStream.on("error", reject)
  })

export const getConfigFromS3 = async (key: string) => {
  const stream = await minioClient.getObject(
    S3_BUCKET,
    `yml/${decodeURIComponent(key)}.yml`
  )
  const buffer: any = await stream2Buffer(stream)
  return YAML.parse(buffer.toString())
}
