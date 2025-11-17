import pool from '../database.js';

// Home page: show all recipes
export const getRecipes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.title, r.cuisine, r.meal_type, r.difficulty, r.cooking_time, u.username AS author
      FROM recipes r
      JOIN users u ON r.created_by = u.id
      ORDER BY r.created_at DESC
    `);

    // Render the 'index.ejs' template and pass recipes
    res.render('index', { recipes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving recipes');
  }
};

// Recipe details page
export const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const recipeRes = await pool.query(
      'SELECT r.*, u.username AS author FROM recipes r JOIN users u ON r.created_by = u.id WHERE r.id=$1',
      [id]
    );

    if (!recipeRes.rows.length) return res.status(404).send('Recipe not found');

    const ingredientsRes = await pool.query(
      'SELECT i.name FROM ingredients i JOIN recipe_ingredients ri ON i.id = ri.ingredient_id WHERE ri.recipe_id=$1',
      [id]
    );

    const tagsRes = await pool.query(
      'SELECT t.name FROM tags t JOIN recipe_tags rt ON t.id = rt.tag_id WHERE rt.recipe_id=$1',
      [id]
    );

    res.render('recipe', {
  recipe: recipeRes.rows[0],
  ingredients: ingredientsRes.rows,
  tags: tagsRes.rows,
});

  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving recipe details');
  }
};


export const createRecipe = async (req, res) => {
  const { title, cuisine, meal_type, difficulty, cooking_time } = req.body;

  // TEMP: hard-code created_by until login system exists
  const created_by = 1; // change this once you have authentication

  try {
    const result = await pool.query(
      `INSERT INTO recipes (title, cuisine, meal_type, difficulty, cooking_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [title, cuisine, meal_type, difficulty, cooking_time, created_by]
    );

    const newId = result.rows[0].id;

    res.redirect(`/recipe/${newId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating recipe");
  }
};

