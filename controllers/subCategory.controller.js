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

/**
 * Controller: getSubCategoryController
 * ---------------------------------
 * Fetches all sub categories from the database and returns them in the response.
 */
export async function getSubCategoryController(req, res) {
  try {
    // Fetch all sub categories from the database
    const data = await SubCategoryModel.find()
      .sort({ createdAt: -1 })
      .populate("category");

    // Return success response
    return res.json({
      message: "Sub category data",
      data: data,
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
 * Controller: updateSubCategoryController
 * ---------------------------------------
 * Updates an existing sub-category by its ID with new name, image, or category.
 */
export async function updateSubCategoryController(req, res) {
  try {
    const { _id, name, image, category } = req.body;

    // Validate required field
    if (!_id) {
      return res.status(400).json({
        message: "Sub-category ID is required",
        error: true,
        success: false,
      });
    }

    // Perform update operation
    const update = await SubCategoryModel.updateOne(
      { _id },
      { name, image, category }
    );

    // If no sub-category was modified (not found or no change)
    if (update.modifiedCount === 0) {
      return res.status(404).json({
        message: "Sub-category not found or no changes made",
        error: true,
        success: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "Sub-category updated successfully",
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

/**
 * Controller: deleteSubCategoryController
 * ---------------------------------------
 * Deletes a subcategory by its ID. Validates input,
 * attempts deletion, and returns a structured response.
 */
export async function deleteSubCategoryController(req, res) {
  try {
    // Destructure input safely
    const { _id } = req.body || {};

    // Validate required field
    if (!_id) {
      return res.status(400).json({
        message: "Subcategory ID is required",
        error: true,
        success: false,
      });
    }

    // Attempt to delete subcategory
    const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(_id);

    // If no subcategory found
    if (!deletedSubCategory) {
      return res.status(404).json({
        message: "Subcategory not found",
        error: true,
        success: false,
      });
    }

    // Success response
    return res.json({
      message: "Subcategory deleted successfully",
      data: deletedSubCategory,
      success: true,
      error: false,
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
