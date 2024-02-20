FROM oven/bun:1.0.6
WORKDIR /usr/src/app
COPY package*.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 80
CMD [ "bun", "run", "index.ts" ]
