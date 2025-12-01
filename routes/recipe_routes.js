import express from 'express';
import pool from '../database.js';
import { getRecipes, getRecipeById, createRecipe } from '../Control/recipe_control.js';
import { addComment } from '../Control/recipe_control.js';


const router = express.Router();

router.get('/', getRecipes);
router.get('/recipe/:id', getRecipeById);
router.get('/recipes/new', (req, res) => {
  res.render('newRecipe');
});

router.post('/recipes', createRecipe);

router.post('/recipe/:recipeId/comment', addComment);

router.get('/search', async (req, res) => {
  const { q } = req.query;

  try {
    const result = await pool.query(
      `SELECT r.id, r.title, r.cuisine, r.meal_type, r.difficulty, u.username AS author
       FROM recipes r
       JOIN users u ON r.created_by = u.id
       WHERE r.title ILIKE $1 OR r.cuisine ILIKE $1 OR r.meal_type ILIKE $1
       ORDER BY r.created_at DESC`,
      [`%${q}%`]
    );

    res.render('index', { recipes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error searching recipes');
  }
});

router.get("/recipes/new", (req, res) => {
  res.render("newRecipe");
});


export default router;

