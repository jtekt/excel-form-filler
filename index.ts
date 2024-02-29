import express from "express"
import "express-async-errors"

import cors from "cors"
import { S3_BUCKET, S3_ENDPOINT, getFileList } from "./s3"
import { version, author } from "./package.json"
import {
  getConnectionState,
  connect as dbConnect,
  redactedConnectionString,
} from "./db"
import excelFormsRouter from "./routes/excelForms"

import { getConfigFromS3 } from "./s3"
import { fillExcel } from "./excel"
import { sendAttachmentByEmail } from "./mail"
const { APP_PORT = 80 } = process.env

dbConnect()

const app = express()
app.use(cors())
app.use(express.json())
app.get("/", (req, res) => {
  res.send({
    application: "Excel form filler",
    author,
    version,
    s3: {
      bucket: S3_BUCKET,
      endpoint: S3_ENDPOINT,
    },
    mongodb: {
      url: redactedConnectionString,
      connected: getConnectionState(),
    },
  })
})

app.use("/forms", excelFormsRouter)

// Legacy endpoints
app.get("/applications", async (req, res) => {
  const files = await getFileList(S3_BUCKET, "yml/")
  res.send(files)
})
app.get("/applications/:key", async (req, res) => {
  const { key } = req.params

  const config = await getConfigFromS3(key)

  res.send(config)
})
app.post("/applications/:key", async (req, res) => {
  const { key } = req.params
  const { data, email } = req.body

  const config = await getConfigFromS3(key)
  const workbook = await fillExcel(data, {
    ...config,
    fileKey: `xlsx/${config.fileKey}`,
  })

  const fileBuffer = await workbook.xlsx.writeBuffer()
  await sendAttachmentByEmail(fileBuffer, email, config)
  res.send("OK")
})

app.listen(APP_PORT, () => {
  console.log(`Express listening on port ${APP_PORT}`)
})
