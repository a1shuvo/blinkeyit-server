import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";
import SubCategoryModel from "../models/subCategory.model.js";

/**
 * Controller: addCategoryController
 * ---------------------------------
 * Adds a new category by validating input, checking duplicates,
 * saving the category, and returning a structured response.
 */
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
    const categories = await CategoryModel.find().sort({ createdAt: -1 });

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
    const { _id, name, image } = req.body;

    // Validate required field
    if (!_id) {
      return res.status(400).json({
        message: "Category ID is required",
        error: true,
        success: false,
      });
    }

    // Perform update operation
    const update = await CategoryModel.updateOne({ _id }, { name, image });

    // If no category was modified (not found or no change)
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

/**
 * Controller: deleteCategoryController
 * ------------------------------------
 * Deletes a category by its ID only if it is not linked to any subcategory or product.
 */
export async function deleteCategoryController(req, res) {
  try {
    const { _id } = req.body;

    // Validate required field
    if (!_id) {
      return res.status(400).json({
        message: "Category ID is required",
        error: true,
        success: false,
      });
    }

    // Check if the category is used in subcategories
    const checkSubCategory = await SubCategoryModel.find({
      category: { $in: [_id] },
    }).countDocuments();

    // Check if the category is used in products
    const checkProduct = await ProductModel.find({
      category: { $in: [_id] },
    }).countDocuments();

    // Prevent deletion if category is already linked
    if (checkSubCategory > 0 || checkProduct > 0) {
      return res.status(400).json({
        message: "Category is already used. Cannot delete.",
        error: true,
        success: false,
      });
    }

    // Perform the delete operation
    const deletedCategory = await CategoryModel.deleteOne({ _id });

    // Handle case where no document was deleted
    if (deletedCategory.deletedCount === 0) {
      return res.status(404).json({
        message: "Category not found or already deleted",
        error: true,
        success: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "Category deleted successfully",
      data: deletedCategory,
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
