import express, {RequestHandler} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import z from 'zod';

const jsonMiddleware = express.json();

export function validateBody<TSchema extends z.Schema>(
  schema: TSchema
): RequestHandler<ParamsDictionary, unknown, z.TypeOf<TSchema>, unknown> {
  return (req, res, next) => {
    jsonMiddleware(req, res, (err?: Error) => {
      if (err) {
        return res.status(400).json({
          title: 'Provided request body cannot be parsed',
          type: 'MalformedRequestBody',
          cause: process.env.NODE_ENV === 'production' ? undefined : (err.stack)
        });
      }

      const result = schema.safeParse(req.body);
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

export function validateQueryParams<TSchema extends z.Schema>(
  schema: TSchema
): RequestHandler<ParamsDictionary, unknown, unknown, z.TypeOf<TSchema>> {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
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

    next();
  };
}
