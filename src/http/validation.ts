import express, {Request} from 'express';
import z, {ZodError} from 'zod';
import {ServerResponse} from 'http';
import {HttpResponseError} from './app_template';

export const BodyParserTypes = {
  json: {
    contentType: 'application/json',
    parser: express.json()
  },
  form: {
    contentType: 'application/x-www-form-urlencoded',
    parser: express.urlencoded({extended: true})
  },
  text: {
    contentType: '',
    parser: express.text({type: '*/*'})
  },
  raw: {
    contentType: '',
    parser: express.raw({type: '*/*'})
  }
};

export type BodyParserType = keyof typeof BodyParserTypes;

export type ValidateRequestBodyOptions = {
  parsers?: BodyParserType[]
};

export async function validateRequestBody<TSchema extends z.Schema>(
  req: Request,
  schema: TSchema,
  opts?: ValidateRequestBodyOptions
): Promise<z.TypeOf<TSchema>> {
  const parser = (opts?.parsers || ['json'])
    .map(types => BodyParserTypes[types])
    .filter(types => (req.header('Content-Type') || '').startsWith(types.contentType))
    .map(type => type.parser)
    .shift();

  if (!parser) {
    throw new HttpResponseError(415, {
      title: 'Provided request body format was not recognised',
      type: 'UnsupportedMediaType'
    });
  }

  try {
    req.body = await new Promise<unknown>((resolve, reject) =>
      parser(req, {} as ServerResponse, (err?: Error) => {
        if (err) {
          return reject(err);
        }

        resolve(req.body);
      })
    );
  } catch (e) {
    throw new HttpResponseError(400, {
      title: 'Provided request body cannot be parsed',
      type: 'MalformedRequestBody',
      cause: process.env.NODE_ENV === 'production'
        ? undefined
        : (e instanceof Error ? e.stack : e)
    });
  }

  try {
    return await schema.parseAsync(req.body);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpResponseError(400, {
        title: 'Provided request body contains schema violations',
        type: 'ValidationError',
        cause: e.issues.map(issue => ({
          location: issue.path,
          code: issue.message.toLowerCase() === 'required' ? 'required' : issue.code,
          message: issue.message
        }))
      });
    }

    throw e;
  }
}

export function getRequestBodyText(req: Request): Promise<string> {
  return validateRequestBody(
    req,
    z.preprocess(v => (v && typeof v === 'object' && !Object.keys(v).length) ? '' : v, z.string()),
    {parsers: ['text']}
  );
}

export function getRequestBodyRaw(req: Request): Promise<Buffer> {
  return validateRequestBody(
    req,
    z.preprocess(
      v => (v && typeof v === 'object' && !Object.keys(v).length) ? Buffer.from('') : v,
      z.instanceof(Buffer)
    ),
    {parsers: ['raw']}
  );
}

export async function validateRequestQuery<TSchema extends z.Schema>(
  req: Request,
  schema: TSchema
): Promise<z.TypeOf<TSchema>> {
  const query = parseQueryParams(req.query);
  try {
    return await schema.parseAsync(query);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpResponseError(400, {
        title: 'Provided request query parameters contain schema violations',
        type: 'ValidationError',
        cause: e.issues.map(issue => ({
          location: issue.path,
          code: issue.message.toLowerCase() === 'required' ? 'required' : issue.code,
          message: issue.message
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
