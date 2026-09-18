const { pool } = require("../config/db");

const getVerificationHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const result = await pool.query(`
      SELECT
        vh.id,
        vh.certificate_id,
        vh.result,
        vh.status,
        vh.verified_at,

        c.certificate_id AS certificate_code,
        c.student_name,
        c.student_email,
        c.course,
        c.organization,
        c.issuer,
        c.issue_date,
        c.expiry_date,
        c.hash

      FROM verification_history vh

      LEFT JOIN certificates c
        ON c.id = vh.certificate_id

      ORDER BY vh.verified_at DESC
    `);

    const history = result.rows.map((item) => ({
      id: item.id,

      certificate_db_id:
        item.certificate_id,

      certificate_id:
        item.certificate_code,

      student_name:
        item.student_name,

      student_email:
        item.student_email,

      course:
        item.course,

      organization:
        item.organization,

      issuer:
        item.issuer,

      issue_date:
        item.issue_date,

      expiry_date:
        item.expiry_date,

      hash:
        item.hash,

      result:
        item.result,

      status:
        item.status,

      verified_at:
        item.verified_at,
    }));

    const total = history.length;

    const valid = history.filter(
      (item) =>
        String(item.result || "").toLowerCase() ===
        "valid"
    ).length;

    const invalid = history.filter(
      (item) =>
        String(item.result || "").toLowerCase() ===
        "invalid"
    ).length;

    const revoked = history.filter(
      (item) =>
        String(item.result || "").toLowerCase() ===
        "revoked"
    ).length;

    const expired = history.filter(
      (item) =>
        String(item.result || "").toLowerCase() ===
        "expired"
    ).length;

    return res.json({
      success: true,

      history,

      stats: {
        total,
        valid,
        invalid,
        revoked,
        expired,
      },
    });

  } catch (error) {
    console.error(
      "Get verification history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load verification history.",
      error: error.message,
    });
  }
};

module.exports = {
  getVerificationHistory,
};