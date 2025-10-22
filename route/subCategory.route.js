import { Router } from "express";
import {
  addSubCategoryController,
  getSubCategoryController,
  updateSubCategoryController,
} from "../controllers/subCategory.controller.js";
import auth from "../middleware/auth.js";

const subCategoryRouter = Router();

subCategoryRouter.post("/create", auth, addSubCategoryController);
subCategoryRouter.post("/get", getSubCategoryController);
subCategoryRouter.put("/update", auth, updateSubCategoryController);

export default subCategoryRouter;
