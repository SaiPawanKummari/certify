const express = require("express");

const {
  getActivityLogs,
} = require("../controllers/activityLogController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get Activity Logs
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getActivityLogs
);

module.exports = router;