const express = require("express");

const {
  createCertificate,
  getMyCertificates,
  getIssuerCertificates,
  verifyCertificate,
  generateCertificatePDF,
  revokeCertificate,
  getAdminCertificates,
} = require("../controllers/certificateController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Create Certificate
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  createCertificate
);

/*
|--------------------------------------------------------------------------
| Student Certificates
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  protect,
  getMyCertificates
);

/*
|--------------------------------------------------------------------------
| Issuer Certificates
|--------------------------------------------------------------------------
*/

router.get(
  "/issuer",
  protect,
  getIssuerCertificates
);

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/admin",
  protect,
  getAdminCertificates
);

/*
|--------------------------------------------------------------------------
| Public Verification
|--------------------------------------------------------------------------
*/

router.get(
  "/verify/:certificateId",
  verifyCertificate
);

/*
|--------------------------------------------------------------------------
| Revoke Certificate
|--------------------------------------------------------------------------
*/

router.patch(
  "/:certificateId/revoke",
  protect,
  revokeCertificate
);

/*
|--------------------------------------------------------------------------
| Certificate PDF
|--------------------------------------------------------------------------
*/

router.get(
  "/:certificateId/pdf",
  generateCertificatePDF
);

module.exports = router;