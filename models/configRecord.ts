// WIP
import { Schema, model } from "mongoose"

const configFieldSchema = new Schema({
  key: String,
  cell: String,
  sheet: String,
  default: String,
})

const configSchema = new Schema({
  name: String,
  description: String,
  fileKey: String,
  email: {
    to: String,
    subject: String,
    html: String,
  },
  fields: [configFieldSchema],
})

const ConfigRecord = model("configRecord", configSchema)

export default ConfigRecord
