import express from 'express';
import pool from './database.js';
import recipeRoutes from './routes/recipe_routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', recipeRoutes);

const PORT = 5000;

app.post('/recipes/:id/rate', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { rating } = req.body;

    console.log(`Received rating: ${rating} for recipe ${recipeId}`);

    if (!rating) {
      return res.status(400).json({ error: "Rating missing" });
    }

    await pool.query(
      'INSERT INTO ratings (recipe_id, rating) VALUES ($1, $2)',
      [recipeId, rating]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving rating:', err);
    res.status(500).json({ error: "Server error" });
  }
});

/*app.get('/recipes/:id/rate', async (req, res) => {
  try {
    const recipeId = req.params.id;

    await pool.query(
      'select rating from ratings where recipe_id = :recipeId',
      [recipeId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving rating:', err);
    res.status(500).json({ error: "Server error" });
  }
});
*/
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




