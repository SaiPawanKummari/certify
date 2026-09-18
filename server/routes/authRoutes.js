const express = require("express");

const {
  register,
  login,
  getAllUsers,
  updateUserStatus,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Authentication
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

/*
|--------------------------------------------------------------------------
| Admin - User Management
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  protect,
  getAllUsers
);

router.patch(
  "/users/:id/status",
  protect,
  updateUserStatus
);

module.exports = router;