import express, {NextFunction, Request, Response} from 'express';
import z, {ZodError, ZodIssue} from 'zod';
import * as QueryString from 'querystring';

type RequestWithBody = Request & {
  parsedBody: unknown;
};

export function getRequestBody<T extends z.Schema>(req: Request, t: T): z.infer<T> {
  return (req as RequestWithBody).parsedBody;
}

export const BodyParsingMiddlewares = {
  json: express.json(),
  form: express.urlencoded({extended: true})
};

export type BodyParsingMiddleware = keyof typeof BodyParsingMiddlewares;

export type BindBodyOptions = {
  middlewares: BodyParsingMiddleware[] | undefined
};

export function bindRequestBody(schema: z.Schema, opts?: BindBodyOptions) {
  let middlewareTypes: BodyParsingMiddleware[] = ['json'];
  if (opts && opts.middlewares) {
    middlewareTypes = opts.middlewares;
  }

  const middlewares = middlewareTypes.map(m => BodyParsingMiddlewares[m]);

  return [
    ...middlewares,
    (err: Error, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }

      if ('body' in err) {
        return res.status(400).json({
          title: 'Provided request body cannot be parsed',
          type: 'MalformedRequestBody',
          cause: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
      }

      next(err);
    },
    (req: Request, res: Response, next: NextFunction) => {
      schema.parseAsync(req.body)
        .then(body => {
          (req as RequestWithBody).parsedBody = body;
          next();
        })
        .catch(e => {
          if (e instanceof ZodError) {
            res.status(400).json({
              title: 'Provided request body contains schema violations',
              type: 'ValidationError',
              cause: e.issues.map(issue => ({
                field: joinPath(issue.path),
                code: mapIssueCode(issue)
              }))
            });
          } else {
            next(e);
          }
        });
    }
  ];
}

type RequestWithQuery = Request & {
  parsedQuery: unknown;
};

export function getRequestQuery<T extends z.Schema>(req: Request, t: T): z.infer<T> {
  return (req as RequestWithQuery).parsedQuery;
}

export function bindRequestQuery(schema: z.Schema) {
  return [
    (req: Request, res: Response, next: NextFunction) => {
      req.query = parseStringRecord(req.query) as QueryString.ParsedUrlQuery;
      next();
    },
    (req: Request, res: Response, next: NextFunction) => {
      schema.parseAsync(req.query)
        .then(query => {
          (req as RequestWithQuery).parsedQuery = query;
          next();
        })
        .catch(e => {
          if (e instanceof ZodError) {
            res.status(400).json({
              title: 'Provided request query parameters contain schema violations',
              type: 'ValidationError',
              cause: e.issues.map(issue => ({
                param: joinPath(issue.path),
                code: mapIssueCode(issue)
              }))
            });
          } else {
            next(e);
          }
        });
    }
  ];
}

function parseStringRecord(target: unknown): unknown {
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
      return target.map(v => parseStringRecord(v));
    } else {
      const obj = target as Record<string, unknown>;
      Object.keys(obj)
        .forEach(key => obj[key] = parseStringRecord(obj[key]));
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
