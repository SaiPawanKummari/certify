const express = require("express");

const {
  getVerificationHistory,
} = require("../controllers/verificationHistoryController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Verification History
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getVerificationHistory
);

module.exports = router;