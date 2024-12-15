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
