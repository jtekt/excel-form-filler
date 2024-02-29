import express from "express"
import "express-async-errors"

import cors from "cors"
import { S3_BUCKET, S3_ENDPOINT } from "./s3"
import { version, author } from "./package.json"
import { connect as dbConnect } from "./db"
import excelFormsRouter from "./routes/excelForms"

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
  })
})

app.use("/forms", excelFormsRouter)

app.listen(APP_PORT, () => {
  console.log(`Express listening on port ${APP_PORT}`)
})
