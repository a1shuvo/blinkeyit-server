import SubCategoryModel from "../models/subCategory.model.js";

/**
 * Controller: addSubCategoryController
 * ------------------------------------
 * Adds a new subcategory by validating input, creating a document,
 * saving it to the database, and returning a structured response.
 */
export async function addSubCategoryController(req, res) {
  try {
    // Destructure input safely
    const { name, image, category } = req.body || {};

    // Validate required fields
    if (!name || !image || !category?.[0]) {
      return res.status(400).json({
        message: "Provide name, image, and category",
        error: true,
        success: false,
      });
    }

    // Create new subcategory
    const newSubCategory = new SubCategoryModel({ name, image, category });

    // Save subcategory to database
    const savedSubCategory = await newSubCategory.save();

    // Return success response
    return res.status(201).json({
      message: "Subcategory created successfully",
      data: savedSubCategory,
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
