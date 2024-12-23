# Excel form filler

A simple application used to fill and send Excel application forms.

## Request body

```ts
const body = {
  email: {
    from: 'john.doe@example.com'
  }
  data: {
    name: 'John Doe',
    department: 'Example department'
  }
}
```

## Environment variables

- S3_BUCKET
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_ENDPOINT
- S3_PORT
- SMTP_HOST
- SMTP_PORT
- MONGODB_CONNECTION_STRING
- IDENTIFICATION_URL
- LOKI_URL

## Dev

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
