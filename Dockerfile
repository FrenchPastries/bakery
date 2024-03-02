# This Dockerfile is a multistage build.
#   This Dockerfile is composed of multiple instructions to potentially
# improve the Docker cache. Each step can be cached as long as source files
# remains the same.

# Building the app with the monorepo
FROM --platform=linux/amd64 node:20-alpine AS builder
WORKDIR /app

# Copy the source files.
COPY tsconfig.json    tsconfig.json
COPY package.json     package.json
COPY yarn.lock        yarn.lock
COPY src              src
COPY backoffice       backoffice

RUN yarn --cwd backoffice install --immutable
RUN yarn install --immutable

# Running the app with only the API
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

# Copy Nest.js API built code.
COPY --from=builder /app/dist             dist
COPY --from=builder /app/package.json     package.json
COPY --from=builder /app/yarn.lock        yarn.lock
COPY --from=builder /app/tsconfig.json    tsconfig.json
COPY --from=builder /app/backoffice/dist  backoffice/dist

RUN yarn install --immutable --production

CMD ["yarn", "start"]
