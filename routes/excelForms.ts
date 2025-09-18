import { Hono } from "hono";
import {
  createForm,
  readForm,
  readForms,
  submitForm,
  getFormFile,
  updateForm,
  updateFile,
  deleteForm,
  downloadFilledForm,
} from "../controllers/excelForms";
import { uploadMiddleware } from "../s3";

const router = new Hono();

router.post("/", uploadMiddleware, createForm);
router.get("/", readForms);

router.get("/:_id", readForm);
router.patch("/:_id", updateForm);
router.delete("/:_id", deleteForm);

router.get("/:_id/file", getFormFile);
router.patch("/:_id/file", uploadMiddleware, updateFile);

router.post("/:_id", submitForm); // Legacy, kept for backwards-compatibility
router.post("/:_id/send", submitForm); // Replaces POST /:_id

router.post("/:_id/file", downloadFilledForm); // Legacy, kept for backwards-compatibility
router.post("/:_id/fill", downloadFilledForm); // Replaces POST /:_id/file

export default router;
