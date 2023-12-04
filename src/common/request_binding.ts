import express, {NextFunction, Request, Response} from 'express';
import z, {ZodError, ZodIssue} from 'zod';

type RequestWithBody<T> = Request & {
  parsedBody: T;
};

type RequestWithQuery<T> = Request & {
  parsedQuery: T;
};

type RequestWithParams<T> = Request & {
  parsedParams: T;
};

export type BodyParsingMiddleware = 'json' | 'form';

export type BindBodyOptions = {
  middlewares: BodyParsingMiddleware[] | undefined
};

const jsonMiddleware = express.json();
const formMiddleware = express.urlencoded({extended: true});

export function getRequestBody<T>(req: Request) {
  return (req as RequestWithBody<T>).parsedBody;
}

export function getRequestQuery<T>(req: Request) {
  return (req as RequestWithQuery<T>).parsedQuery;
}

export function getRequestParams<T>(req: Request) {
  return (req as RequestWithParams<T>).parsedParams;
}

export function bindRequestBody(schema: z.Schema, opts?: BindBodyOptions) {
  let middlewareTypes = ['json'];
  if (opts && opts.middlewares) {
    middlewareTypes = opts.middlewares;
  }

  const middlewares = middlewareTypes.map(m => {
    if (m === 'json') {
      return jsonMiddleware;
    } else if (m === 'form') {
      return formMiddleware;
    }
  });

  return [
    ...middlewares,
    (err: Error, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }

      if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
          error: 'Request body parsing error'
        });
      }

      next(err);
    },
    (req: Request, res: Response, next: NextFunction) => {
      schema.parseAsync(req.body)
        .then(body => {
          (req as RequestWithBody<typeof body>).parsedBody = body;
          next();
        })
        .catch(e => {
          if (e instanceof ZodError) {
            res.status(400).json({
              error: 'Request validation error',
              violations: e.issues.map(issue => ({
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

export function bindRequestQuery(schema: z.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.parseAsync(req.query)
      .then(query => {
        (req as RequestWithQuery<typeof query>).parsedQuery = query;
        next();
      })
      .catch(e => {
        if (e instanceof ZodError) {
          res.status(400).json({
            error: 'Request validation error',
            violations: e.issues.map(issue => ({
              queryParam: joinPath(issue.path),
              code: mapIssueCode(issue)
            }))
          });
        } else {
          next(e);
        }
      });
  };
}

export function bindRequestParams(schema: z.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.parseAsync(req.params)
      .then(params => {
        (req as RequestWithParams<typeof params>).parsedParams = params;
        next();
      })
      .catch(e => {
        if (e instanceof ZodError) {
          res.status(400).json({
            error: 'Request validation error',
            violations: e.issues.map(issue => ({
              param: joinPath(issue.path),
              code: mapIssueCode(issue)
            }))
          });
        } else {
          next(e);
        }
      });
  };
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
