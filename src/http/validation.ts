import express, {Request} from 'express';
import z, {ZodError} from 'zod';
import {ServerResponse} from 'http';
import {HTTPResponseError} from './app_template';

const jsonParser = express.json();

export async function validateRequestBody<TSchema extends z.Schema>(
  req: Request,
  schema: TSchema
): Promise<z.TypeOf<TSchema>> {
  try {
    await new Promise<unknown>((resolve, reject) =>
      jsonParser(req, {} as ServerResponse, (err?: Error) => {
        if (err) {
          return reject(err);
        }

        resolve(req.body);
      })
    );
  } catch (e) {
    throw new HTTPResponseError(400, {
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
      throw new HTTPResponseError(400, {
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

export async function validateRequestQuery<TSchema extends z.Schema>(
  req: Request,
  schema: TSchema
): Promise<z.TypeOf<TSchema>> {
  try {
    return await schema.parseAsync(req.query);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HTTPResponseError(400, {
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
