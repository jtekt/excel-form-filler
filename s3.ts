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
