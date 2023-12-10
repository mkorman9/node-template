import express, {Request} from 'express';
import z, {ZodError, ZodIssue} from 'zod';
import {ServerResponse} from 'http';

export class RequestValidationError extends Error {
  constructor(
    public response: unknown
  ) {
    super();
  }
}

export const BodyParsers = {
  json: express.json(),
  form: express.urlencoded({extended: true})
};

export type BodyParser = keyof typeof BodyParsers;

export type ValidateRequestBodyOptions = {
  parsers: BodyParser[] | undefined
};

export async function validateRequestBody<TSchema extends z.Schema>(
  req: Request,
  schema: TSchema,
  opts: ValidateRequestBodyOptions | undefined = undefined
): Promise<z.infer<TSchema>> {
  const parsers = (opts?.parsers || ['json'])
    .map(parser => BodyParsers[parser]);

  let parsingError = undefined;
  for (const parser of parsers) {
    const promise = new Promise<unknown>((resolve, reject) =>
      parser(req, {} as ServerResponse, (err: Error | undefined) => {
        if (err) {
          return reject(err);
        }

        resolve(req.body);
      })
    );

    try {
      req.body = await promise;
      parsingError = undefined;
      break;
    } catch (e) {
      parsingError = e;
    }
  }

  if (parsingError) {
    throw new RequestValidationError({
      title: 'Provided request body cannot be parsed',
      type: 'MalformedRequestBody',
      cause: process.env.NODE_ENV === 'production'
        ? undefined
        : (parsingError instanceof Error ? parsingError.stack : parsingError)
    });
  }

  try {
    return await schema.parseAsync(req.body);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new RequestValidationError({
        title: 'Provided request body contains schema violations',
        type: 'ValidationError',
        cause: e.issues.map(issue => ({
          field: joinPath(issue.path),
          code: mapIssueCode(issue)
        }))
      });
    }

    throw e;
  }
}

export async function validateRequestQuery<TSchema extends z.Schema>(
  req: Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const query = parseQueryParams(req.query);
  try {
    return await schema.parseAsync(query);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new RequestValidationError({
        title: 'Provided request query parameters contain schema violations',
        type: 'ValidationError',
        cause: e.issues.map(issue => ({
          param: joinPath(issue.path),
          code: mapIssueCode(issue)
        }))
      });
    }

    throw e;
  }
}

function parseQueryParams(target: unknown): unknown {
  switch (typeof (target)) {
  case 'string':
    if (target === '') {
      return '';
    } else if (!isNaN(Number(target))) {
      return Number(target);
    } else if (target === 'true' || target === 'false') {
      return target === 'true';
    } else {
      return target;
    }
  case 'object':
    if (target === null) {
      return null;
    } else if (Array.isArray(target)) {
      return target.map(v => parseQueryParams(v));
    } else {
      const obj = target as Record<string, unknown>;
      Object.keys(obj)
        .forEach(key => obj[key] = parseQueryParams(obj[key]));
      return obj;
    }
  default:
    return target;
  }
}

function joinPath(parts: (string | number)[]) {
  return parts.reduce((acc: string, current: string | number) => {
    if (typeof current === 'number') {
      return `${acc}[${current}]`;
    } else {
      if (acc.length === 0) {
        return current;
      } else {
        return `${acc}.${current}`;
      }
    }
  }, '');
}

function mapIssueCode(issue: ZodIssue) {
  if (issue.code === 'invalid_type') {
    if (issue.received === 'undefined' && issue.expected !== 'undefined') {
      return 'required';
    }
  } else if (issue.code === 'invalid_string') {
    if (typeof issue.validation === 'string') {
      return issue.validation;
    }
  }

  return issue.code;
}
