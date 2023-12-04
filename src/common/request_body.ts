import express, {NextFunction, Request, Response} from 'express';
import z, {ZodError, ZodIssue} from 'zod';

type RequestWithBody<T> = Request & {
  parsedBody: T;
};

const jsonMiddleware = express.json();

export function bindJsonBody(schema: z.Schema) {
  return [
    jsonMiddleware,
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

export function getRequestBody<T>(req: Request) {
  return (req as RequestWithBody<T>).parsedBody;
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
