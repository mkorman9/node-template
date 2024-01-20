# Node.js project template

`create-node-project` script

```sh
#!/usr/bin/env bash

SOURCE_BRANCH="master"
PROJECT_NAME="$1"

while [[ $# -gt 0 ]]; do
  case $1 in
    --web)
      SOURCE_BRANCH="web"
      shift
      ;;
    *)
      PROJECT_NAME="$1"
      shift
      ;;
  esac
done

if [[ -z "$PROJECT_NAME" ]]; then
  echo "usage: create-node-project [--web] <PROJECT_NAME>"
  exit 1
fi

git clone --branch ${SOURCE_BRANCH} git@github.com:mkorman9/node-template.git "${PROJECT_NAME}" && \
  rm -rf "${PROJECT_NAME}/.git" "${PROJECT_NAME}/README.md" && \
  sed -i "s/node-template-project/${PROJECT_NAME}/g" "${PROJECT_NAME}/package.json" && \
  cp "${PROJECT_NAME}/.env.template" "${PROJECT_NAME}/.env" && \
  cd "${PROJECT_NAME}" && \
  npm install --save \
    dotenv \
    envalid && \
  npm install --save-dev \
    typescript \
    tsc-watch \
    eslint \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin \
    @types/node

if [[ "${SOURCE_BRANCH}" == "web" ]]; then
  npm install --save \
    zod \
    express \
    express-async-errors \
    cors && \
  npm install --save-dev \
    @types/express \
    @types/cors
fi
```
