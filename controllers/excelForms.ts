import ExcelForm from "../models/excelForm";
import { Context } from "hono";
import { fillExcel } from "../excel";
import { sendAttachmentByEmail } from "../mail";
import { sendFormFromS3 } from "../s3";
import createHttpError from "http-errors";
import { logger } from "../logger";

export type ConfigField = {
  key: string;
  sheet: string;
  cell: string;
  default?: string;
  required?: boolean;
};

export type UserEmailConfig = {
  from: string;
  to?: string;
  html?: string;
  subject?: string;
  cc?: string;
};

export type RequestBody = {
  email: UserEmailConfig;
  data: any;
};

export const createForm = async (c: Context) => {
  const { form } = await c.req.parseBody();
  if (!form || !(form instanceof File))
    throw createHttpError(400, "File not provided");
  const fileKey = decodeURIComponent(form.name);
  const newItem = await ExcelForm.create({ fileKey });
  return c.json(newItem);
};

export const readForms = async (c: Context) => {
  // TODO: pagination
  const query = {};
  const items = await ExcelForm.find(query);
  const total = await ExcelForm.countDocuments(query);
  return c.json({ items, total });
};

export const readForm = async (c: Context) => {
  const { _id } = c.req.param();
  const item = await ExcelForm.findById(_id);
  return c.json(item);
};

export const updateFile = async (c: Context) => {
  const { form } = await c.req.parseBody();
  const { _id } = c.req.param();
  let body: any = {};
  if (form && form instanceof File) {
    const fileKey = decodeURIComponent(form.name);
    body = { fileKey };
  }
  const item = await ExcelForm.findByIdAndUpdate(_id, body);
  return c.json(item);
};

export const updateForm = async (c: Context) => {
  const { _id } = c.req.param();
  const { _id: _, ...properties } = await c.req.json();
  const item = await ExcelForm.findByIdAndUpdate(_id, properties);
  return c.json(item);
};

export const deleteForm = async (c: Context) => {
  const { _id } = c.req.param();
  const result = await ExcelForm.findByIdAndDelete(_id);
  return c.json(result);
};

export const submitForm = async (c: Context) => {
  const { _id } = c.req.param();
  const { data, email } = await c.req.json();
  const config = await ExcelForm.findById(_id);

  if (!config) throw createHttpError(404, `Form ${_id} not found`);

  const workbook = await fillExcel(data, config);

  const fileBuffer = await workbook.xlsx.writeBuffer();
  await sendAttachmentByEmail(fileBuffer, email, config);

  try {
    logger.info({
      action: "send",
      fileKey: config.fileKey,
      user: c.get("user"),
      email,
      data,
    });
  } catch (error) {
    console.log("Loki logging failed");
    console.error(error);
  }

  return c.json("OK");
};

export const getFormFile = async (c: Context) => {
  const { _id } = c.req.param();
  const config = await ExcelForm.findById(_id);

  if (!config) throw createHttpError(404, `Form ${_id} not found`);

  return sendFormFromS3(c, config.fileKey);
};

export const downloadFilledForm = async (c: Context) => {
  // TODO: make this usable with a GET request as more RESTful
  const { _id } = c.req.param();
  const { data } = await c.req.json();
  const config = await ExcelForm.findById(_id);

  if (!config) throw createHttpError(404, `Form ${_id} not found`);

  const workbook = await fillExcel(data, config);

  const fileBuffer = await workbook.xlsx.writeBuffer();

  // Those cause errors with axios when expected content is blob
  // c.header("Content-Disposition", `attachment; filename="${config.fileKey}"`);
  // c.header(
  //   "Content-Type",
  //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  // );

  try {
    logger.info({
      action: "download",
      fileKey: config.fileKey,
      user: c.get("user"),
      data,
    });
  } catch (error) {
    console.log("Loki logging failed");
    console.error(error);
  }

  return new Response(fileBuffer);
};
