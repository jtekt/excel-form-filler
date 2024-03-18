import { createLogger, format, transports } from "winston"
import LokiTransport from "winston-loki"
export const { LOKI_URL } = process.env
const loggerOptions: any = { transports: [] }

if (LOKI_URL) {
  console.log(`[Logger] LOKI_URL provided: ${LOKI_URL}`)
  const lokiTransport = new LokiTransport({
    host: LOKI_URL,
    labels: { app: "Excel form filler" },
    json: true,
    format: format.json(),
    replaceTimestamp: true,
    onConnectionError: (err) => console.error(err),
  })
  loggerOptions.transports.push(lokiTransport)
} else {
  const consoleTransport = new transports.Console({
    format: format.combine(format.simple(), format.colorize()),
  })
  loggerOptions.transports.push(consoleTransport)
}

export const logger = createLogger(loggerOptions)
