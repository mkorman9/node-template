# Node.js project template

`create-node-project` script

```sh
#!/usr/bin/env bash

WEB="0"
PROJECT_NAME="$1"

while [[ $# -gt 0 ]]; do
  case $1 in
    --web)
      WEB="1"
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

if [[ "${WEB}" == "0" ]]; then
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
else
  git clone --branch web git@github.com:mkorman9/node-template.git "${PROJECT_NAME}" && \
    rm -rf "${PROJECT_NAME}/.git" "${PROJECT_NAME}/README.md" && \
    sed -i "s/node-template-project/${PROJECT_NAME}/g" "${PROJECT_NAME}/package.json" && \
    cp "${PROJECT_NAME}/.env.template" "${PROJECT_NAME}/.env" && \
    cd "${PROJECT_NAME}" && \
    npm install --save \
      dotenv \
      zod \
      express \
      express-async-errors && \
    npm install --save-dev \
      typescript \
      tsc-watch \
      jest \
      ts-jest \
      eslint \
      @typescript-eslint/parser \
      @typescript-eslint/eslint-plugin \
      @types/node \
      @types/jest \
      @types/express \
      chai \
      chai-http
fi
```
