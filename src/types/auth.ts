import { Request } from "express";

export interface AuthUser {
  userId: string;
  role: string;
}




export interface AuthRequest extends Request {
  user?: AuthUser;

  file?: Express.Multer.File;

  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}


