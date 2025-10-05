/**
 * Controller: addCategoryController
 * ---------------------------------
 * Adds a new category by validating input, checking duplicates,
 * saving the category, and returning a structured response.
 */
import CategoryModel from "../models/category.model.js";

export async function addCategoryController(req, res) {
  try {
    // Destructure input safely
    const { name, image } = req.body || {};

    // Validate required fields
    if (!name || !image) {
      return res.status(400).json({
        message: "Provide both name and image for the category",
        error: true,
        success: false,
      });
    }

    // Check if category already exists
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({
        message: "Category with this name already exists",
        error: true,
        success: false,
      });
    }

    // Create new category
    const newCategory = new CategoryModel({ name, image });

    // Save category to database
    const savedCategory = await newCategory.save();

    // Return success response
    return res.status(201).json({
      message: "Category created successfully",
      data: savedCategory,
      error: false,
      success: true,
    });
  } catch (error) {
    // Handle unexpected server errors
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

/**
 * Controller: getCategoryController
 * ---------------------------------
 * Fetches all categories from the database and returns them in the response.
 */
export async function getCategoryController(req, res) {
  try {
    // Fetch all categories from the database
    const categories = await CategoryModel.find();

    // Return success response
    return res.json({
      data: categories,
      error: false,
      success: true,
    });
  } catch (error) {
    // Handle unexpected server errors
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
