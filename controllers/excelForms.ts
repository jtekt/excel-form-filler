import ExcelForm from "../models/excelForm"

export const createForm = async () => {
  return "Not implemented"
}

export const readForms = async () => {
  const query = {}
  const items = await ExcelForm.find(query)
  const total = await ExcelForm.countDocuments(query)
  return { items, total }
}

export const readForm = async () => {
  return "Not implemented"
}

export const updateForm = async () => {
  return "Not implemented"
}

export const deleteForm = async () => {
  return "Not implemented"
}
