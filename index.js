#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// copy template
fs.cpSync(path.join(__dirname, 'template'), process.cwd(), {
  recursive: true
});
fs.cpSync(path.join(__dirname, '__gitignore'), path.join(process.cwd(), '.gitignore'));  // Node bug?

// install dependencies
const PROD_DEPS = [
  'dotenv'
];

const DEV_DEPS = [
  '@types/jest',
  '@types/node',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-prettier',
  'jest',
  'prettier',
  'ts-jest',
  'tsc-watch',
  'typescript'
];

execSync(`npm install ${PROD_DEPS.join(' ')}`);
execSync(`npm install -D ${DEV_DEPS.join(' ')}`);

// init git repo
execSync('git init');
execSync('git add .');
