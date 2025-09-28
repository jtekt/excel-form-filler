import dotenv from "dotenv";
dotenv.config();

import { Hono, Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import authMiddleware from "@moreillon/hono-oidc-middleware";

import { S3_BUCKET, S3_ENDPOINT } from "./s3";
import { version, author } from "./package.json";
import {
  getConnectionState,
  connect as dbConnect,
  redactedConnectionString,
} from "./db";
import excelFormsRouter from "./routes/excelForms";
import { LOKI_URL } from "./logger";
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE } from "./mail";

const { APP_PORT = 80, OIDC_JWKS_URI } = process.env;
if (!OIDC_JWKS_URI) throw "OIDC_JWKS_URI not set";

dbConnect();

const app = new Hono();

app.use(cors());
app.get("/", (c: Context) => {
  return c.json({
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
      url: OIDC_JWKS_URI,
    },
    smtp: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: !!SMTP_SECURE,
    },
    loki: LOKI_URL,
  });
});

app.use(authMiddleware({ jwksUri: OIDC_JWKS_URI }));
app.route("/forms", excelFormsRouter);

app.onError((err: Error, c: Context) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.text(err.message, { status: 500 });
});

export default {
  port: Number(APP_PORT),
  fetch: app.fetch,
};
