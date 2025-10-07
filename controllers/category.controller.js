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

/**
 * Controller: updateCategoryController
 * ------------------------------------
 * Updates an existing category by its ID with new name or image data.
 */
export async function updateCategoryController(req, res) {
  try {
    const { categoryId, name, image } = req.body;

    // Validate required field
    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
        error: true,
        success: false,
      });
    }

    // Perform update operation
    const update = await CategoryModel.updateOne(
      { _id: categoryId },
      { name, image }
    );

    // If no category was modified (not found or same data)
    if (update.modifiedCount === 0) {
      return res.status(404).json({
        message: "Category not found or no changes made",
        error: true,
        success: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "Category updated successfully",
      data: update,
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
