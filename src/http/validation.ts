import express, {RequestHandler} from 'express';
import z from 'zod';

type InferredType<T extends z.ZodRawShape> = z.TypeOf<z.ZodObject<T>>;

export type RequestValidators<
  TParamsShape extends z.ZodRawShape,
  TQueryShape extends z.ZodRawShape,
  TBodyShape extends z.ZodRawShape
> = {
  params?: TParamsShape,
  query?: TQueryShape,
  body?: TBodyShape
};

const jsonMiddleware = express.json();

export function validate<
  TParamsShape extends z.ZodRawShape,
  TQueryShape extends z.ZodRawShape,
  TBodyShape extends z.ZodRawShape
>(
  validators: RequestValidators<TParamsShape, TQueryShape, TBodyShape>
): RequestHandler<InferredType<TParamsShape>, unknown, InferredType<TBodyShape>, InferredType<TQueryShape>> {
  return (req, res, next) => {
    if (validators.params) {
      const result = z.object(validators.params).safeParse(req.params);
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
    }

    if (validators.query) {
      const result = z.object(validators.query).safeParse(req.query);
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
    }

    if (validators.body) {
      jsonMiddleware(req, res, (err?: Error) => {
        if (err) {
          return res.status(400).json({
            title: 'Provided request body cannot be parsed',
            type: 'MalformedRequestBody',
            cause: process.env.NODE_ENV === 'production' ? undefined : err.stack
          });
        }

        const result = z.object(validators.body!).safeParse(req.body);
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
    } else {
      next();
    }
  };
}
