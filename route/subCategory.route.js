import { Router } from "express";
import { addSubCategoryController } from "../controllers/subCategory.controller.js";
import auth from "../middleware/auth.js";

const subCategoryRouter = Router();

subCategoryRouter.post("/create", auth, addSubCategoryController);

export default subCategoryRouter;
