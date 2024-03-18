import dotenv from "dotenv"
dotenv.config()

import express from "express"
import "express-async-errors"

import auth from "@moreillon/express_identification_middleware"
import cors from "cors"
import { S3_BUCKET, S3_ENDPOINT } from "./s3"
import { version, author } from "./package.json"
import {
  getConnectionState,
  connect as dbConnect,
  redactedConnectionString,
} from "./db"
import excelFormsRouter from "./routes/excelForms"
import { LOKI_URL } from "./logger"

const { APP_PORT = 80, IDENTIFICATION_URL } = process.env

const authOptions = { url: IDENTIFICATION_URL }

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
    auth: {
      url: IDENTIFICATION_URL,
    },
    loki: LOKI_URL,
  })
})

app.use(auth(authOptions))
app.use("/forms", excelFormsRouter)

app.listen(APP_PORT, () => {
  console.log(`Express listening on port ${APP_PORT}`)
})
