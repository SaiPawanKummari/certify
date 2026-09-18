const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
*/

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";

/*
|--------------------------------------------------------------------------
| Get Verification Statistics
|--------------------------------------------------------------------------
*/

async function getCertificateStatistics(
  certificateDbId
) {
  const result = await pool.query(
    `
      SELECT
        result,
        status,
        verified_at
      FROM verification_history
      WHERE certificate_id = $1
      ORDER BY verified_at ASC
    `,
    [certificateDbId]
  );

  const history = result.rows;

  const totalAttempts =
    history.length;

  const successfulAttempts =
    history.filter(
      (item) =>
        String(item.result || "")
          .toLowerCase() === "valid"
    ).length;

  const failedAttempts =
    history.filter((item) => {
      const result =
        String(item.result || "")
          .toLowerCase();

      const status =
        String(item.status || "")
          .toLowerCase();

      return (
        result === "invalid" ||
        status === "invalid"
      );
    }).length;

  const revokedAttempts =
    history.filter((item) => {
      const result =
        String(item.result || "")
          .toLowerCase();

      const status =
        String(item.status || "")
          .toLowerCase();

      return (
        result === "revoked" ||
        status === "revoked"
      );
    }).length;

  /*
  |--------------------------------------------------------------------------
  | Recent Attempts - Last 10 Minutes
  |--------------------------------------------------------------------------
  */

  const now = Date.now();

  const recentAttempts =
    history.filter((item) => {
      if (!item.verified_at) {
        return false;
      }

      const timestamp =
        new Date(
          item.verified_at
        ).getTime();

      if (
        Number.isNaN(timestamp)
      ) {
        return false;
      }

      return (
        now - timestamp <=
        10 * 60 * 1000
      );
    }).length;

  /*
  |--------------------------------------------------------------------------
  | Unique Days
  |--------------------------------------------------------------------------
  */

  const uniqueDays =
    new Set(
      history
        .filter(
          (item) =>
            item.verified_at
        )
        .map((item) =>
          new Date(
            item.verified_at
          )
            .toISOString()
            .substring(0, 10)
        )
    ).size;

  /*
  |--------------------------------------------------------------------------
  | Average Verification Interval
  |--------------------------------------------------------------------------
  */

  const timestamps =
    history
      .map((item) => {
        if (!item.verified_at) {
          return null;
        }

        const timestamp =
          new Date(
            item.verified_at
          ).getTime();

        return Number.isNaN(
          timestamp
        )
          ? null
          : timestamp;
      })
      .filter(
        (timestamp) =>
          timestamp !== null
      )
      .sort(
        (a, b) => a - b
      );

  let averageIntervalSeconds = 0;

  if (timestamps.length >= 2) {
    const intervals = [];

    for (
      let i = 1;
      i < timestamps.length;
      i++
    ) {
      intervals.push(
        (timestamps[i] -
          timestamps[i - 1]) /
          1000
      );
    }

    if (intervals.length > 0) {
      averageIntervalSeconds =
        intervals.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        intervals.length;
    }
  }

  return {
    total_attempts:
      totalAttempts,

    successful_attempts:
      successfulAttempts,

    failed_attempts:
      failedAttempts,

    revoked_attempts:
      revokedAttempts,

    recent_attempts:
      recentAttempts,

    unique_days:
      uniqueDays,

    average_interval_seconds:
      Number(
        averageIntervalSeconds.toFixed(
          2
        )
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Call AI Service
|--------------------------------------------------------------------------
*/

async function callAI(
  statistics
) {
  const response =
    await fetch(
      `${AI_SERVICE_URL}/analyze`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          statistics
        ),
      }
    );

  if (!response.ok) {
    throw new Error(
      `AI service returned HTTP ${response.status}`
    );
  }

  return await response.json();
}

/*
|--------------------------------------------------------------------------
| Analyze Certificate
|--------------------------------------------------------------------------
*/

async function analyzeCertificate(
  certificate
) {
  try {
    const statistics =
      await getCertificateStatistics(
        certificate.id
      );

    const ai =
      await callAI(
        statistics
      );

    return {
      certificateId:
        certificate.certificate_id,

      studentName:
        certificate.student_name,

      course:
        certificate.course,

      status:
        certificate.status,

      riskScore:
        ai.risk_score,

      riskLevel:
        ai.risk_level,

      isAnomaly:
        ai.is_anomaly,

      mlAnomalyScore:
        ai.ml_anomaly_score,

      anomalies:
        Array.isArray(
          ai.anomalies
        )
          ? ai.anomalies
          : [],

      summary:
        ai.summary,

      model:
        ai.model ||
        "Isolation Forest",

      statistics,
    };

  } catch (error) {
    console.error(
      `AI analysis failed for ${certificate.certificate_id}:`,
      error.message
    );

    return {
      certificateId:
        certificate.certificate_id,

      studentName:
        certificate.student_name,

      course:
        certificate.course,

      status:
        certificate.status,

      riskScore:
        null,

      riskLevel:
        "UNAVAILABLE",

      isAnomaly:
        false,

      mlAnomalyScore:
        null,

      anomalies: [],

      summary:
        "AI fraud analysis is temporarily unavailable.",

      model:
        "Isolation Forest",

      statistics:
        null,
    };
  }
}

/*
|--------------------------------------------------------------------------
| AI Security Dashboard
|--------------------------------------------------------------------------
*/

const getAISecurityDashboard =
  async (req, res) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Admin Check
      |--------------------------------------------------------------------------
      */

      if (
        !req.user ||
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Get Certificates
      |--------------------------------------------------------------------------
      */

      const result =
        await pool.query(`
          SELECT
            id,
            certificate_id,
            student_name,
            course,
            organization,
            issuer,
            status,
            issue_date,
            expiry_date,
            created_at
          FROM certificates
          ORDER BY created_at DESC
        `);

      const certificates =
        result.rows;

      /*
      |--------------------------------------------------------------------------
      | Run AI
      |--------------------------------------------------------------------------
      */

      const analyses =
        await Promise.all(
          certificates.map(
            (certificate) =>
              analyzeCertificate(
                certificate
              )
          )
        );

      /*
      |--------------------------------------------------------------------------
      | Statistics
      |--------------------------------------------------------------------------
      */

      const analyzed =
        analyses.filter(
          (item) =>
            item.riskScore !== null
        );

      const highRisk =
        analyzed.filter(
          (item) =>
            item.riskLevel ===
            "HIGH"
        ).length;

      const mediumRisk =
        analyzed.filter(
          (item) =>
            item.riskLevel ===
            "MEDIUM"
        ).length;

      const lowRisk =
        analyzed.filter(
          (item) =>
            item.riskLevel ===
            "LOW"
        ).length;

      const anomalies =
        analyzed.filter(
          (item) =>
            item.isAnomaly === true
        ).length;

      const totalVerificationAttempts =
        analyzed.reduce(
          (sum, item) =>
            sum +
            Number(
              item.statistics
                ?.total_attempts ||
                0
            ),
          0
        );

      const failedVerificationAttempts =
        analyzed.reduce(
          (sum, item) =>
            sum +
            Number(
              item.statistics
                ?.failed_attempts ||
                0
            ),
          0
        );

      const revokedVerificationAttempts =
        analyzed.reduce(
          (sum, item) =>
            sum +
            Number(
              item.statistics
                ?.revoked_attempts ||
                0
            ),
          0
        );

      const riskScores =
        analyzed
          .map((item) =>
            Number(
              item.riskScore
            )
          )
          .filter(
            (score) =>
              Number.isFinite(
                score
              )
          );

      const averageRiskScore =
        riskScores.length > 0
          ? Number(
              (
                riskScores.reduce(
                  (sum, score) =>
                    sum + score,
                  0
                ) /
                riskScores.length
              ).toFixed(2)
            )
          : 0;

      /*
      |--------------------------------------------------------------------------
      | Highest Risk First
      |--------------------------------------------------------------------------
      */

      analyses.sort(
        (a, b) =>
          Number(
            b.riskScore || 0
          ) -
          Number(
            a.riskScore || 0
          )
      );

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.json({
        success: true,

        model:
          analyzed[0]?.model ||
          "Isolation Forest",

        aiService:
          analyzed.some(
            (item) =>
              item.riskScore !== null
          ),

        stats: {
          totalCertificates:
            certificates.length,

          analyzedCertificates:
            analyzed.length,

          highRisk,

          mediumRisk,

          lowRisk,

          anomalies,

          totalVerificationAttempts,

          failedVerificationAttempts,

          revokedVerificationAttempts,

          averageRiskScore,
        },

        analyses,
      });

    } catch (error) {
      console.error(
        "AI Security Dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load AI security dashboard.",

        error:
          error.message,
      });
    }
  };

module.exports = {
  getAISecurityDashboard,
};