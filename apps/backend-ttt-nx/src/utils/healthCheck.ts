import { Request, Response } from 'express';

export const statusCheck = (_: Request, res: Response) => {
  res.send("ok")
}

