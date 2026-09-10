import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/S3.service.js";

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});


export const uploadEmployeeFiles = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const folder = "employees";
      cb(null, `${folder}/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
export const uploadTaskCommentFile = upload.single('file');