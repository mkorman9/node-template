# Node.js project template

`create-node-project` script

```sh
#!/usr/bin/env bash

PROJECT_NAME="$1"

if [[ -z "$PROJECT_NAME" ]]; then
  echo "usage: create-node-project <PROJECT_NAME>"
  exit 1
fi

git clone git@github.com:mkorman9/node-template.git "${PROJECT_NAME}" && \
  rm -rf "${PROJECT_NAME}/.git" "${PROJECT_NAME}/README.md" && \
  sed -i "s/node-template-project/${PROJECT_NAME}/g" "${PROJECT_NAME}/package.json" && \
  cp "${PROJECT_NAME}/.env.template" "${PROJECT_NAME}/.env" && \
  cd "${PROJECT_NAME}" && \
  npm install --save \
    dotenv \
    zod && \
  npm install --save-dev \
    typescript \
    tsc-watch \
    jest \
    ts-jest \
    eslint \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin \
    @types/node \
    @types/jest
```
