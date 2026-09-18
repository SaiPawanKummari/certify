const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| Get Activity Logs
|--------------------------------------------------------------------------
*/

const getActivityLogs = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Admin Only
    |--------------------------------------------------------------------------
    */

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Existing Platform Activity Logs
    |--------------------------------------------------------------------------
    */

    const activityResult = await pool.query(`
      SELECT
        al.*,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
      FROM activity_logs al
      LEFT JOIN users u
        ON u.id = al.user_id
      ORDER BY al.created_at DESC
    `);

    const activityLogs = activityResult.rows.map(
      (log) => ({
        ...log,

        source: "activity_logs",

        display_action:
          log.action ||
          "Platform Activity",

        display_details:
          log.details ||
          log.description ||
          "Platform activity",
      })
    );

    /*
    |--------------------------------------------------------------------------
    | Verification History
    |--------------------------------------------------------------------------
    |
    | Certificate verification is stored in verification_history.
    | We include it here so administrators can see verification
    | activity together with normal platform activity.
    |
    */

    let verificationLogs = [];

    try {
      const verificationResult =
        await pool.query(`
          SELECT
            vh.*,
            c.certificate_id,
            c.student_name,
            c.course,
            c.organization
          FROM verification_history vh
          LEFT JOIN certificates c
            ON c.id = vh.certificate_id
          ORDER BY vh.verified_at DESC
        `);

      verificationLogs =
        verificationResult.rows.map(
          (verification) => ({
            id:
              `verification-${verification.id}`,

            user_id: null,

            user_name:
              "Public Verifier",

            user_email: null,

            user_role:
              "public",

            action:
              "CERTIFICATE_VERIFIED",

            display_action:
              "Certificate Verified",

            details:
              `Certificate ${
                verification.certificate_id ||
                "Unknown"
              } — Result: ${
                verification.result ||
                verification.status ||
                "Unknown"
              }`,

            display_details:
              `Certificate ${
                verification.certificate_id ||
                "Unknown"
              }${
                verification.student_name
                  ? ` • ${verification.student_name}`
                  : ""
              }${
                verification.course
                  ? ` • ${verification.course}`
                  : ""
              }`,

            status:
              verification.status ||
              verification.result ||
              "unknown",

            result:
              verification.result ||
              null,

            certificate_id:
              verification.certificate_id ||
              null,

            verified_at:
              verification.verified_at ||
              null,

            created_at:
              verification.verified_at ||
              null,

            source:
              "verification_history",
          })
        );

    } catch (verificationError) {
      console.error(
        "Verification history fetch error:",
        verificationError.message
      );

      /*
       * Do not break Activity Logs if the
       * verification history query fails.
       */
      verificationLogs = [];
    }

    /*
    |--------------------------------------------------------------------------
    | Combine Both Sources
    |--------------------------------------------------------------------------
    */

    const logs = [
      ...activityLogs,
      ...verificationLogs,
    ].sort((a, b) => {

      const dateA =
        new Date(
          a.created_at ||
            a.verified_at ||
            0
        ).getTime();

      const dateB =
        new Date(
          b.created_at ||
            b.verified_at ||
            0
        ).getTime();

      return dateB - dateA;
    });

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const total = logs.length;

    const certificateIssued =
      logs.filter((log) => {
        const action =
          String(
            log.display_action ||
              log.action ||
              ""
          ).toLowerCase();

        return action.includes("issu");
      }).length;

    const certificateVerified =
      logs.filter((log) => {
        const action =
          String(
            log.display_action ||
              log.action ||
              ""
          ).toLowerCase();

        return (
          action.includes("verif") ||
          log.source ===
            "verification_history"
        );
      }).length;

    const certificateRevoked =
      logs.filter((log) => {
        const action =
          String(
            log.display_action ||
              log.action ||
              ""
          ).toLowerCase();

        return action.includes("revok");
      }).length;

    const userActions =
      logs.filter((log) => {
        const action =
          String(
            log.display_action ||
              log.action ||
              ""
          ).toLowerCase();

        return (
          action.includes("user") ||
          action.includes("account")
        );
      }).length;

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      logs,

      stats: {
        total,
        certificateIssued,
        certificateVerified,
        certificateRevoked,
        userActions,
      },
    });

  } catch (error) {

    console.error(
      "Get activity logs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load activity logs.",
      error: error.message,
    });
  }
};

module.exports = {
  getActivityLogs,
};