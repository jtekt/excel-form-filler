import mongoose from "mongoose"

export const { MONGODB_CONNECTION_STRING } = process.env

if (!MONGODB_CONNECTION_STRING) throw "MONGODB_CONNECTION_STRING is not set"

export const redactedConnectionString = MONGODB_CONNECTION_STRING.replace(
  /:.*@/,
  "://***:***@"
)

export const connect = () => {
  console.log(`[MongoDB] Connecting to ${redactedConnectionString}...`)

  mongoose
    .connect(MONGODB_CONNECTION_STRING)
    .then(() => {
      console.log("[Mongoose] Initial connection successful")
    })
    .catch((error: Error) => {
      console.log("[Mongoose] Initial connection failed, retrying...")
      console.error(error)
      setTimeout(connect, 5000)
    })
}

export const connected = () => mongoose.connection.readyState
