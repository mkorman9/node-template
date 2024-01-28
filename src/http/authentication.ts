import {RequestHandler} from 'express';

export type AuthLocals<T> = {
  auth: T;
  [key: string]: unknown;
};

export function authenticateToken<TParams, TQuery, TBody, TAuth>(
  handler: (token: string) => Promise<TAuth>
): RequestHandler<TParams, unknown, TBody, TQuery, AuthLocals<TAuth>> {
  return (req, res, next) => {
    const authorizationHeader = req.header('Authorization') || '';
    const bearer = 'bearer ';
    if (authorizationHeader.substring(0, bearer.length).toLowerCase() != bearer) {
      return res.status(401).json({
        title: 'Resource requires providing authorization data',
        type: 'MissingAuthorization'
      });
    }

    const token = authorizationHeader.substring(bearer.length).trim();

    handler(token)
      .then(auth => {
        res.locals.auth = auth;
        next();
      })
      .catch(() => {
        res.status(403).json({
          title: 'Provided authorization data is invalid',
          type: 'AccessDenied'
        });
      });
  };
}
