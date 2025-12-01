import express from "express";
import { signupPage, signup } from "../Control/signup_control.js";
import { loginPage, login, logout } from "../Control/login_control.js";

const router = express.Router();

router.get("/signup", signupPage);
router.post("/signup", signup);

router.get("/login", loginPage);
router.post("/login", login);

router.get("/logout", logout);

export default router;
