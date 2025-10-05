import { Router } from "express";
import {
  addCategoryController,
  getCategoryController,
} from "../controllers/category.controller.js";
import auth from "../middleware/auth.js";

const categoryRouter = Router();

categoryRouter.post("/add-category", auth, addCategoryController);
categoryRouter.get("/get-category", getCategoryController);

export default categoryRouter;
