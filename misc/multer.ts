import { Request } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });