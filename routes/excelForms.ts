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
} from "../controllers/excelForms";
import { uploadMiddleware } from "../s3";

const router = new Hono();

router.post("/", uploadMiddleware, createForm);
router.get("/", readForms);

router.post("/:_id", submitForm);
router.get("/:_id", readForm);
router.patch("/:_id", updateForm);
router.delete("/:_id", deleteForm);
router.get("/:_id/file", getFormFile);
router.patch("/:_id/file", uploadMiddleware, updateFile);

export default router;
