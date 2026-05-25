import multer, { StorageEngine } from "multer";
import fs from "fs";

const uploadPath = "./uploads/";

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`;

    cb(null, fileName);
  },
});

export const upload = multer({
  storage,
});