export const loginPage = (req, res) => {
  res.render("login");
};

export const login = (req, res) => {
  const { username, password } = req.body;

  const user = global.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).send("Invalid username or password");
  }

  global.currentUser = user;

  console.log("Logged in as:", global.currentUser);

  res.redirect("/");
};

export const logout = (req, res) => {
  global.currentUser = null;
  res.redirect("/");
};
