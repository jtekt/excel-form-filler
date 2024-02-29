import ExcelForm from "../models/excelForm"
import { Request, Response } from "express"
import { fillExcel } from "../excel"
import { sendAttachmentByEmail } from "../mail"

export type ConfigField = {
  key: string
  sheet: string
  cell: string
  default?: string
  required?: boolean
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

export type UserEmailConfig = {
  from: string
  to?: string
  html?: string
  subject?: string
  cc?: string
}

export type RequestBody = {
  email: UserEmailConfig
  data: any
}

export const createForm = async (req: Request, res: Response) => {
  const { file } = req
  if (!file) throw "File not provided"
  const fileKey = file.originalname
  const newItem = await ExcelForm.create({ fileKey })
  res.send(newItem)
}

export const readForms = async (req: Request, res: Response) => {
  const query = {}
  const items = await ExcelForm.find(query)
  const total = await ExcelForm.countDocuments(query)
  res.send({ items, total })
}

export const readForm = async (req: Request, res: Response) => {
  const { _id } = req.params
  const item = await ExcelForm.findById(_id)
  res.send(item)
}

export const updateForm = async (req: Request, res: Response) => {
  res.send("Not implemented")
}

export const deleteForm = async (req: Request, res: Response) => {
  const { _id } = req.params
  const result = await ExcelForm.findByIdAndDelete(_id)
  res.send(result)
}

export const submitForm = async (req: Request, res: Response) => {
  const { _id } = req.params
  const { data, email } = req.body
  const config = await ExcelForm.findById(_id)

  const workbook = await fillExcel(data, config)

  const fileBuffer = await workbook.xlsx.writeBuffer()
  await sendAttachmentByEmail(fileBuffer, email, config)

  res.send("OK")
}
