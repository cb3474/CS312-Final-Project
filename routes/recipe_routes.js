import express from "express";
import { createRecipe } from "../Control/recipe_control.js";



import {
  getRecipes,
  getRecipeById,
  addBookmark,
  removeBookmark,
  newRecipeForm   // you still need to define this controller
} from "../Control/recipe_control.js";

const router = express.Router();

// Home page — list all recipes
router.get("/", getRecipes);

router.post("/recipes", createRecipe);

// Add recipe form page
router.get("/recipes/new", newRecipeForm);

// Recipe details
router.get("/recipe/:id", getRecipeById);

// Add bookmark
router.post("/add/:id", addBookmark);

// Remove bookmark
router.post("/remove/:id", removeBookmark);

export default router;
