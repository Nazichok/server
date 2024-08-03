import { Request, Response } from 'express';

export const allAccess = (_req: Request, res: Response): void => {
  res.status(200).send('Public Content.');
};
