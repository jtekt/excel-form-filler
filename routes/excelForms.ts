import { Router } from "express"
import {
  createForm,
  readForm,
  readForms,
  submitForm,
  getFormFile,
  updateForm,
  deleteForm,
} from "../controllers/excelForms"
import multer from "multer"
import multerMinIOStorage from "multer-minio-storage"
import { minioClient, S3_BUCKET } from "../s3"

var upload = multer({
  storage: multerMinIOStorage({
    minioClient: minioClient,
    bucket: S3_BUCKET,
    key(req, file, cb) {
      cb(null, decodeURIComponent(file.originalname))
    },
  }),
})

const router = Router()

router.route("/").post(upload.single("form"), createForm).get(readForms)

router
  .route("/:_id")
  .post(submitForm)
  .get(readForm)
  .patch(updateForm)
  .delete(deleteForm);
router
  .route("/:_id/file")
  .get(getFormFile)
  .patch(upload.single("form"), updateForm);

export default router
