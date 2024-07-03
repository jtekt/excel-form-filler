import { Client } from "minio";
import createHttpError from "http-errors";
import { Context, Next } from "hono";

export const {
  S3_REGION,
  S3_ACCESS_KEY_ID = "",
  S3_SECRET_ACCESS_KEY = "",
  S3_ENDPOINT = "s3.amazonaws.com",
  S3_PORT,
  S3_BUCKET = "",
  S3_USE_SSL,
  S3_FILE_KEY = "",
} = process.env;

export const minioClient = new Client({
  accessKey: S3_ACCESS_KEY_ID,
  secretKey: S3_SECRET_ACCESS_KEY,
  endPoint: S3_ENDPOINT,
  port: Number(S3_PORT),
  useSSL: !!S3_USE_SSL,
  region: S3_REGION,
});

export const sendFormFromS3 = async (c: Context, key: any) => {
  const stream = await minioClient.getObject(S3_BUCKET, key);

  if (!stream) throw "No stream available";

  const readableStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
      stream.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  return c.newResponse(readableStream, {
    headers: {
      "Content-Disposition": `attachment; filename=${encodeURIComponent(key)}`,
    },
  });
};

export const uploadMiddleware = async (c: Context, next: Next) => {
  try {
    let { form } = await c.req.parseBody();
    if (!form || !(form instanceof File))
      throw createHttpError(400, "File not provided");

    const fileName = decodeURIComponent(form.name);
    const arrayBuffer = await form.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await minioClient.putObject(S3_BUCKET, fileName, buffer);
    await next();
  } catch (error) {
    throw error;
  }
};
