import { Router } from "express"
import {
  createForm,
  readForm,
  readForms,
  submitForm,
} from "../controllers/excelForms"
import multer from "multer"
import multerMinIOStorage from "multer-minio-storage"
import { minioClient, S3_BUCKET } from "../s3"

var upload = multer({
  storage: multerMinIOStorage({
    minioClient: minioClient,
    bucket: S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, file.originalname)
    },
  }),
})

const router = Router()

router.route("/").post(upload.single("form"), createForm).get(readForms)

router.route("/:_id").post(submitForm).get(readForm)

export default router
