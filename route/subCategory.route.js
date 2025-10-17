import { Router } from "express";
import {
  addSubCategoryController,
  getSubCategoryController,
} from "../controllers/subCategory.controller.js";
import auth from "../middleware/auth.js";

const subCategoryRouter = Router();

subCategoryRouter.post("/create", auth, addSubCategoryController);
subCategoryRouter.post("/get", getSubCategoryController);

export default subCategoryRouter;
