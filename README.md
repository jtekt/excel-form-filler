# excel-form-filler

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

## Configuration schema

./config/config.yml

```yml
fileKey: myFile.xlsx
email:
  to: john.doe@example.com
  subject: example
  html: >
    <b>このメールは自動的に送信されました</b>
    <p>お世話になっております</p>
    <p>添付ファイルで送らせて頂きます</p>
    <p>宜しくお願いします</p>
fields:
  - key: 部署名
    cell: D3
    sheet: 新規_申請書
  - key: 社員番号
    sheet: 新規_申請書
    cell: D4
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
