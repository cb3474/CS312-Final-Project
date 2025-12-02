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
    res.render("index", { recipes: result.rows, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving recipes');
  }
};

// Recipe details page
export const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get logged in user (if any)
    const currentUser = req.session?.user || null;

    // 1️⃣ Get recipe details
    const recipeRes = await pool.query(
      `SELECT r.*, u.username AS author
       FROM recipes r
       JOIN users u ON r.created_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (!recipeRes.rows.length) {
      return res.status(404).send("Recipe not found");
    }

    // 2️⃣ Get ingredients
    const ingredientsRes = await pool.query(
      `SELECT i.name
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = $1`,
      [id]
    );

    // 3️⃣ Get tags
    const tagsRes = await pool.query(
      `SELECT t.name
       FROM tags t
       JOIN recipe_tags rt ON t.id = rt.tag_id
       WHERE rt.recipe_id = $1`,
      [id]
    );

    // 4️⃣ Check if bookmarked by this user
    const bookmarkRes = currentUser
      ? await pool.query(
          "SELECT 1 FROM bookmarks WHERE user_id=$1 AND recipe_id=$2",
          [currentUser.id, id]
        )
      : { rows: [] };

    const isBookmarked = bookmarkRes.rows.length > 0;

    // 5️⃣ Render the page
    res.render("recipe", {
      recipe: {
        ...recipeRes.rows[0],
        isBookmarked
      },
      ingredients: ingredientsRes.rows,
      tags: tagsRes.rows,
      user: currentUser
    });

  } catch (err) {
    console.error("❌ Error in getRecipeById:", err);
    res.status(500).send("Error retrieving recipe details");
  }
};


export const addBookmark = async (req, res) => {

  try {
   

   if (!req.session.user) return res.status(401).send("You must be logged in."); 
    
    const userId = req.session.user.id;  
    const recipeId = req.params.id;

    await pool.query(
      "INSERT INTO bookmarks (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
      [userId, recipeId]
    );

    res.redirect(`/recipe/${recipeId}`);
  } catch (err) {
    console.error("❌ Bookmark Error:", err);
    res.status(500).send("Error bookmarking recipe");
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const recipeId = req.params.id;

    await pool.query(
      "DELETE FROM bookmarks WHERE user_id = $1 AND recipe_id = $2;",
      [userId, recipeId]
    );

    res.redirect(`/recipe/${recipeId}`);
  } catch (err) {
    console.error("❌ Remove Bookmark Error:", err);
    res.status(500).send("Error removing bookmark");
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Get user info
    const userRes = await pool.query(
      "SELECT id, username, bio, created_at FROM users WHERE username=$1",
      [username]
    );
    if (!userRes.rows.length) return res.status(404).send("User not found");

    const userId = userRes.rows[0].id;

    // Get recipes uploaded
    const recipesRes = await pool.query(
      "SELECT * FROM recipes WHERE created_by=$1 ORDER BY created_at DESC",
      [userId]
    );

    // Get saved bookmarks
    const savesRes = await pool.query(
      `SELECT r.* FROM recipes r
       JOIN bookmarks b ON r.id = b.recipe_id
       WHERE b.user_id = $1`,
      [userId]
    );

    res.render("profile", {
      profile: userRes.rows[0],
      recipes: recipesRes.rows,
      savedRecipes: savesRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
};
