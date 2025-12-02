import express from 'express';
import { getRecipes, getRecipeById } from '../Control/recipe_control.js';

const router = express.Router();

router.get('/', getRecipes);
router.get('/recipe/:id', getRecipeById);

export default router;

import { addBookmark, removeBookmark } from "../Control/recipe_control.js";

// POST /bookmark/add/:id
router.post("/add/:id", addBookmark);

// POST /bookmark/remove/:id
router.post("/remove/:id", removeBookmark);

