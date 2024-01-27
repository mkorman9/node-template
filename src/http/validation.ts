import express, {RequestHandler} from 'express';
import z from 'zod';

type TPlaceholder = Record<string, any>;  // eslint-disable-line @typescript-eslint/no-explicit-any

const jsonMiddleware = express.json();

export function validateBody<TShape extends z.ZodRawShape>(
  shape: TShape
): RequestHandler<TPlaceholder, unknown, z.TypeOf<z.ZodObject<TShape>>, TPlaceholder> {
  return (req, res, next) => {
    jsonMiddleware(req, res, (err?: Error) => {
      if (err) {
        return res.status(400).json({
          title: 'Provided request body cannot be parsed',
          type: 'MalformedRequestBody',
          cause: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
      }

      const result = z.object(shape).safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          title: 'Provided request body contains schema violations',
          type: 'ValidationError',
          cause: result.error.issues.map(issue => ({
            location: issue.path,
            code: issue.message.toLowerCase() === 'required' ? 'required' : issue.code,
            message: issue.message
          }))
        });
      }

      next();
    });
  };
}

export function validateParams<TShape extends z.ZodRawShape>(
  shape: TShape
): RequestHandler<z.TypeOf<z.ZodObject<TShape>>, unknown, TPlaceholder, TPlaceholder> {
  return (req, res, next) => {
    const result = z.object(shape).safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        title: 'Provided request path parameters contain schema violations',
        type: 'ValidationError',
        cause: result.error.issues.map(issue => ({
          location: issue.path,
          code: issue.message.toLowerCase() === 'required' ? 'required' : issue.code,
          message: issue.message
        }))
      });
    }

    req.params = result.data;
    next();
  };
}

export function validateQuery<TShape extends z.ZodRawShape>(
  shape: TShape
): RequestHandler<TPlaceholder, unknown, TPlaceholder, z.TypeOf<z.ZodObject<TShape>>> {
  return (req, res, next) => {
    const result = z.object(shape).safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        title: 'Provided request query parameters contain schema violations',
        type: 'ValidationError',
        cause: result.error.issues.map(issue => ({
          location: issue.path,
          code: issue.message.toLowerCase() === 'required' ? 'required' : issue.code,
          message: issue.message
        }))
      });
    }

    req.query = result.data;
    next();
  };
}
