import { Schema, model } from "mongoose"

const fieldSchema = new Schema({
  key: String,
  cell: String,
  sheet: String,
  required: Boolean,
  autoFill: String,
  default: String,
})
const excelFormSchema = new Schema({
  fileKey: {
    type: String,
    unique: true,
  },
  description: String,
  email: {
    to: String,
    cc: String,
    from: String,
    subject: String,
    html: String,
  },
  fields: [fieldSchema],
})

const ExcelForm = model("excelForm", excelFormSchema)
export default ExcelForm
