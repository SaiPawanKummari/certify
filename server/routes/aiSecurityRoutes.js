const express = require("express");

const {
  getAISecurityDashboard,
} = require("../controllers/aiSecurityController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AI Security Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  protect,
  getAISecurityDashboard
);

module.exports = router;