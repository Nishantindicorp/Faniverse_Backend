const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/login", authController.login);
router.get("/verify", authMiddleware.authenticate, authController.verifyToken);
router.put(
  "/update/:id",
  authMiddleware.authenticate,
  authController.updateUser
);
router.get(
  "/verify/:id",
  authMiddleware.authenticate,
  authController.getUserById
);

module.exports = router;
