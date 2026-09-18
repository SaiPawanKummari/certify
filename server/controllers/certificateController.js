const crypto = require("crypto");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";

/* ============================================================
   GENERAL HELPERS
============================================================ */

const safeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeNullable = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text === "" ? null : text;
};

const normalizeDateForHash = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return safeText(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fitFontSize = (
  text,
  maxLength,
  large,
  medium,
  small
) => {
  const length = safeText(text).length;

  if (length > maxLength) {
    return small;
  }

  if (length > maxLength * 0.72) {
    return medium;
  }

  return large;
};

/* ============================================================
   CANONICAL OBJECT SORTING

   IMPORTANT SHA-256 FIX

   PostgreSQL JSONB may reorder object keys.

   Example:

   Original:
   {
     certificateId: "...",
     studentName: "...",
     course: "..."
   }

   PostgreSQL JSONB may return:
   {
     course: "...",
     certificateId: "...",
     studentName: "..."
   }

   Both objects contain the same data, but JSON.stringify()
   produces different strings.

   Therefore SHA-256 could incorrectly fail.

   This function recursively sorts object keys so CREATE,
   VERIFY and PDF always hash the same canonical JSON.
============================================================ */

const sortObjectKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] =
          sortObjectKeys(value[key]);

        return result;
      }, {});
  }

  return value;
};

/* ============================================================
   CERTIFICATE HASH DATA

   THIS OBJECT IS THE SOURCE OF TRUTH.

   The exact object is saved in certificates.hash_data.
============================================================ */

const buildCertificateHashData = ({
  certificateId,
  studentName,
  studentEmail,
  course,
  duration,
  certificateType,
  organization,
  issuer,
  issueDate,
  expiryDate,
  description,
  gradeScore,
  skillsAchievements,
  template,
}) => {
  return {
    certificateId: safeText(
      certificateId
    ),

    studentName: safeText(
      studentName
    ),

    studentEmail: safeText(
      studentEmail
    ).toLowerCase(),

    course: safeText(course),

    duration:
      normalizeNullable(duration),

    certificateType:
      safeText(certificateType),

    organization:
      safeText(organization),

    issuer:
      safeText(issuer),

    issueDate:
      normalizeDateForHash(issueDate),

    expiryDate:
      normalizeDateForHash(expiryDate),

    description:
      normalizeNullable(description),

    gradeScore:
      normalizeNullable(gradeScore),

    skillsAchievements:
      normalizeNullable(
        skillsAchievements
      ),

    template:
      safeText(template) ||
      "Academic",
  };
};

/* ============================================================
   GENERATE SHA-256 HASH

   IMPORTANT:
   Always canonicalize the object before hashing.

   This fixes JSONB key-order mismatch.
============================================================ */

const generateCertificateHash = (
  hashData
) => {
  const canonicalData =
    sortObjectKeys(hashData);

  const canonicalJson =
    JSON.stringify(canonicalData);

  return crypto
    .createHash("sha256")
    .update(
      canonicalJson,
      "utf8"
    )
    .digest("hex");
};

const generateCertificateId = () => {
  const year =
    new Date().getFullYear();

  const random =
    crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

  return `CERT-${year}-${random}`;
};

/* ============================================================
   GET HASH DATA

   New certificates:
   use certificates.hash_data

   Old certificates:
   reconstruct the data from certificate columns.
============================================================ */

const getCertificateHashData = (
  certificate
) => {
  if (
    certificate.hash_data &&
    typeof certificate.hash_data ===
      "object"
  ) {
    return certificate.hash_data;
  }

  return buildCertificateHashData({
    certificateId:
      certificate.certificate_id,

    studentName:
      certificate.student_name,

    studentEmail:
      certificate.student_email,

    course:
      certificate.course,

    duration:
      certificate.duration,

    certificateType:
      certificate.certificate_type,

    organization:
      certificate.organization,

    issuer:
      certificate.issuer,

    issueDate:
      certificate.issue_date,

    expiryDate:
      certificate.expiry_date,

    description:
      certificate.description,

    gradeScore:
      certificate.grade_score,

    skillsAchievements:
      certificate.skills_achievements,

    template:
      certificate.template,
  });
};

/* ============================================================
   AI FRAUD ANALYSIS
============================================================ */

const analyzeVerificationWithAI =
  async (certificateDbId) => {
    try {
      const historyResult =
        await pool.query(
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

      const history =
        historyResult.rows;

      const totalAttempts =
        history.length;

      const successfulAttempts =
        history.filter(
          (item) =>
            item.result === "Valid"
        ).length;

      const failedAttempts =
        history.filter(
          (item) =>
            item.result === "Invalid" ||
            item.status === "invalid"
        ).length;

      const revokedAttempts =
        history.filter(
          (item) =>
            item.result === "Revoked" ||
            item.status === "revoked"
        ).length;

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
                .slice(0, 10)
            )
        ).size;

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
            (value) =>
              value !== null
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

        if (intervals.length) {
          averageIntervalSeconds =
            intervals.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            intervals.length;
        }
      }

      const aiResponse =
        await fetch(
          `${AI_SERVICE_URL}/analyze`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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
            }),
          }
        );

      if (!aiResponse.ok) {
        throw new Error(
          `AI service returned HTTP ${aiResponse.status}`
        );
      }

      const ai =
        await aiResponse.json();

      return {
        available: true,

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
          ai.model,

        statistics: {
          totalAttempts,
          successfulAttempts,
          failedAttempts,
          revokedAttempts,
          recentAttempts,
          uniqueDays,

          averageIntervalSeconds:
            Number(
              averageIntervalSeconds.toFixed(
                2
              )
            ),
        },
      };
    } catch (error) {
      console.error(
        "AI fraud analysis error:",
        error.message
      );

      return {
        available: false,

        riskScore: null,

        riskLevel:
          "UNAVAILABLE",

        isAnomaly: false,

        mlAnomalyScore: null,

        anomalies: [],

        summary:
          "AI fraud analysis is temporarily unavailable.",

        model:
          "Isolation Forest",

        statistics: null,
      };
    }
  };

/* ============================================================
   CREATE CERTIFICATE
============================================================ */

const createCertificate =
  async (req, res) => {
    try {
      const issuerId =
        req.user.id;

      /* ------------------------------------------------------
         GET ISSUER
      ------------------------------------------------------ */

      const issuerResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM users
          WHERE id = $1
          `,
          [issuerId]
        );

      if (
        !issuerResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Issuer account not found",
        });
      }

      const issuer =
        issuerResult.rows[0];

      if (
        issuer.role !== "issuer" &&
        issuer.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only issuers and admins can issue certificates",
        });
      }

      if (
        issuer.status !== "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Issuer account is inactive",
        });
      }

      /* ------------------------------------------------------
         FORM DATA
      ------------------------------------------------------ */

      const {
        studentName,
        studentEmail,
        course,
        duration,
        certificateType,
        organization,
        issueDate,
        expiryDate,
        description,
        gradeScore,
        skillsAchievements,
        template,
      } = req.body;

      if (
        !studentName ||
        !studentEmail ||
        !course ||
        !certificateType ||
        !organization ||
        !issueDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Student name, email, course, certificate type, organization and issue date are required",
        });
      }

      const normalizedEmail =
        safeText(
          studentEmail
        ).toLowerCase();

      /* ------------------------------------------------------
         FIND STUDENT
      ------------------------------------------------------ */

      const studentResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM users
          WHERE LOWER(email) =
                LOWER($1)
          `,
          [normalizedEmail]
        );

      if (
        !studentResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "No student account exists with this email",
        });
      }

      const student =
        studentResult.rows[0];

      if (
        student.role !== "student"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The selected email does not belong to a student",
        });
      }

      if (
        student.status !== "active"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The student's account is inactive",
        });
      }

      /* ------------------------------------------------------
         GENERATE CERTIFICATE ID
      ------------------------------------------------------ */

      const certificateId =
        generateCertificateId();

      /* ------------------------------------------------------
         BUILD EXACT HASH DATA
      ------------------------------------------------------ */

      const hashData =
        buildCertificateHashData({
          certificateId,

          studentName:
            safeText(studentName),

          studentEmail:
            normalizedEmail,

          course:
            safeText(course),

          duration:
            normalizeNullable(
              duration
            ),

          certificateType:
            safeText(
              certificateType
            ),

          organization:
            safeText(
              organization
            ),

          /* DYNAMIC ISSUER */

          issuer:
            safeText(
              issuer.name
            ),

          issueDate,

          expiryDate,

          description:
            normalizeNullable(
              description
            ),

          gradeScore:
            normalizeNullable(
              gradeScore
            ),

          skillsAchievements:
            normalizeNullable(
              skillsAchievements
            ),

          template:
            safeText(template) ||
            "Academic",
        });

      /* ------------------------------------------------------
         GENERATE CANONICAL SHA-256
      ------------------------------------------------------ */

      const hash =
        generateCertificateHash(
          hashData
        );

      /* ------------------------------------------------------
         QR CODE
      ------------------------------------------------------ */

      const verificationUrl =
        `http://localhost:5173/verify/${certificateId}`;

      const qrCode =
        await QRCode.toDataURL(
          verificationUrl,
          {
            errorCorrectionLevel:
              "H",

            margin: 2,

            width: 500,
          }
        );

      /* ------------------------------------------------------
         SAVE CERTIFICATE
      ------------------------------------------------------ */

      const result =
        await pool.query(
          `
          INSERT INTO certificates (
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date,
            expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            hash,
            qr_code,
            template,
            hash_data
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,
            $9,$10,$11,$12,$13,'valid',
            $14,$15,$16,$17
          )
          RETURNING
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date,
            expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            hash,
            qr_code,
            template,
            hash_data,
            created_at
          `,
          [
            hashData.certificateId,
            hashData.studentName,
            hashData.studentEmail,
            hashData.course,
            hashData.duration,
            hashData.certificateType,
            hashData.organization,
            hashData.issuer,
            hashData.issueDate,
            hashData.expiryDate,
            hashData.description,
            hashData.gradeScore,
            hashData.skillsAchievements,
            hash,
            qrCode,
            hashData.template,
            JSON.stringify(hashData),
          ]
        );

      /* ------------------------------------------------------
         ACTIVITY LOG
      ------------------------------------------------------ */

      await pool.query(
        `
        INSERT INTO activity_logs (
          user_id,
          action,
          target
        )
        VALUES ($1,$2,$3)
        `,
        [
          issuerId,
          "Certificate Issued",
          certificateId,
        ]
      );

      return res.status(201).json({
        success: true,

        message:
          "Certificate issued successfully",

        certificate:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create certificate error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to issue certificate",

        error:
          error.message,
      });
    }
  };

/* ============================================================
   STUDENT CERTIFICATES
============================================================ */

const getMyCertificates =
  async (req, res) => {
    try {
      const userResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM users
          WHERE id = $1
          `,
          [req.user.id]
        );

      if (
        !userResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const user =
        userResult.rows[0];

      if (
        user.role !== "student"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only students can access this endpoint",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date::date::text AS issue_date,
            expiry_date::date::text AS expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            template,
            created_at
          FROM certificates
          WHERE LOWER(student_email) =
                LOWER($1)
          ORDER BY created_at DESC
          `,
          [user.email]
        );

      const certificates =
        result.rows;

      const stats = {
        total:
          certificates.length,

        valid:
          certificates.filter(
            (c) =>
              c.status === "valid"
          ).length,

        revoked:
          certificates.filter(
            (c) =>
              c.status === "revoked"
          ).length,

        expired:
          certificates.filter(
            (c) =>
              c.status === "expired"
          ).length,

        invalid:
          certificates.filter(
            (c) =>
              c.status === "invalid"
          ).length,
      };

      return res.json({
        success: true,
        certificates,
        stats,
      });
    } catch (error) {
      console.error(
        "Get student certificates error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch certificates",
      });
    }
  };

/* ============================================================
   ISSUER CERTIFICATES
============================================================ */

const getIssuerCertificates =
  async (req, res) => {
    try {
      const userResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM users
          WHERE id = $1
          `,
          [req.user.id]
        );

      if (
        !userResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const user =
        userResult.rows[0];

      if (
        user.role !== "issuer" &&
        user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only issuers and admins can access this endpoint",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date::date::text AS issue_date,
            expiry_date::date::text AS expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            template,
            created_at
          FROM certificates
          WHERE issuer = $1
          ORDER BY created_at DESC
          `,
          [user.name]
        );

      const certificates =
        result.rows;

      const stats = {
        total:
          certificates.length,

        valid:
          certificates.filter(
            (c) =>
              c.status === "valid"
          ).length,

        revoked:
          certificates.filter(
            (c) =>
              c.status === "revoked"
          ).length,

        expired:
          certificates.filter(
            (c) =>
              c.status === "expired"
          ).length,

        invalid:
          certificates.filter(
            (c) =>
              c.status === "invalid"
          ).length,
      };

      return res.json({
        success: true,
        certificates,
        stats,
      });
    } catch (error) {
      console.error(
        "Get issuer certificates error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch issuer certificates",
      });
    }
  };

/* ============================================================
   VERIFY CERTIFICATE
============================================================ */

const verifyCertificate =
  async (req, res) => {
    try {
      const certificateId =
        safeText(
          req.params.certificateId
        ).toUpperCase();

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          result: "Invalid",
          status: "invalid",
          integrityVerified:
            false,
          message:
            "Certificate ID is required",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date::date::text AS issue_date,
            expiry_date::date::text AS expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            hash,
            hash_data,
            template
          FROM certificates
          WHERE certificate_id = $1
          `,
          [certificateId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          result: "Not Found",
          status: "not_found",
          integrityVerified:
            false,
          message:
            "Certificate not found",
        });
      }

      const certificate =
        result.rows[0];

      /* ------------------------------------------------------
         GET STORED HASH DATA
      ------------------------------------------------------ */

      const hashData =
        getCertificateHashData(
          certificate
        );

      /* ------------------------------------------------------
         CANONICAL HASH CALCULATION
      ------------------------------------------------------ */

      const calculatedHash =
        generateCertificateHash(
          hashData
        );

      const storedHash =
        safeText(
          certificate.hash
        ).toLowerCase();

      const hashValid =
        Boolean(
          storedHash &&
          calculatedHash ===
            storedHash
        );

      let verificationStatus =
        certificate.status;

      const today =
        new Date()
          .toISOString()
          .slice(0, 10);

      const expiryDate =
        normalizeDateForHash(
          certificate.expiry_date
        );

      if (
        expiryDate &&
        expiryDate < today &&
        certificate.status ===
          "valid"
      ) {
        verificationStatus =
          "expired";
      }

      let verificationResult;

      if (!hashValid) {
        verificationResult =
          "Invalid";

        verificationStatus =
          "invalid";
      } else if (
        verificationStatus ===
        "revoked"
      ) {
        verificationResult =
          "Revoked";
      } else if (
        verificationStatus ===
        "expired"
      ) {
        verificationResult =
          "Expired";
      } else if (
        verificationStatus ===
        "valid"
      ) {
        verificationResult =
          "Valid";
      } else {
        verificationResult =
          "Invalid";
      }

      /* ------------------------------------------------------
         SAVE VERIFICATION HISTORY
      ------------------------------------------------------ */

      await pool.query(
        `
        INSERT INTO verification_history (
          certificate_id,
          result,
          status
        )
        VALUES ($1,$2,$3)
        `,
        [
          certificate.id,
          verificationResult,
          verificationStatus,
        ]
      );

      /* ------------------------------------------------------
         AI ANALYSIS
      ------------------------------------------------------ */

      const aiAnalysis =
        await analyzeVerificationWithAI(
          certificate.id
        );

      return res.json({
        success: true,

        result:
          verificationResult,

        status:
          verificationStatus,

        integrityVerified:
          hashValid,

        aiAnalysis,

        certificate: {
          certificateId:
            certificate.certificate_id,

          studentName:
            certificate.student_name,

          studentEmail:
            certificate.student_email,

          course:
            certificate.course,

          duration:
            certificate.duration,

          certificateType:
            certificate.certificate_type,

          organization:
            certificate.organization,

          issuer:
            certificate.issuer,

          issueDate:
            certificate.issue_date,

          expiryDate:
            certificate.expiry_date,

          description:
            certificate.description,

          gradeScore:
            certificate.grade_score,

          skillsAchievements:
            certificate.skills_achievements,

          template:
            certificate.template,
        },
      });
    } catch (error) {
      console.error(
        "Verify certificate error:",
        error
      );

      return res.status(500).json({
        success: false,
        result: "Invalid",
        status: "invalid",
        integrityVerified:
          false,
        message:
          "Certificate verification failed",
      });
    }
  };

/* ============================================================
   ADMIN CERTIFICATES
============================================================ */

const getAdminCertificates =
  async (req, res) => {
    try {
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

      const result =
        await pool.query(
          `
          SELECT
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date,
            expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            hash,
            qr_code,
            pdf_path,
            template,
            revoked_reason,
            revoked_date,
            revoked_by,
            created_at,
            updated_at
          FROM certificates
          ORDER BY created_at DESC
          `
        );

      const certificates =
        result.rows;

      const stats = {
        total:
          certificates.length,

        valid:
          certificates.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "valid"
          ).length,

        revoked:
          certificates.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "revoked"
          ).length,

        expired:
          certificates.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "expired"
          ).length,

        invalid:
          certificates.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "invalid"
          ).length,
      };

      return res.json({
        success: true,
        certificates,
        stats,
      });
    } catch (error) {
      console.error(
        "Admin certificate fetch error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load certificates",
      });
    }
  };

/* ============================================================
   PDF DRAWING HELPERS
============================================================ */

const drawLogo = (
  doc,
  x,
  y,
  organization
) => {
  const navy = "#102A56";
  const gold = "#C5962D";
  const gray = "#64748B";

  doc
    .save()
    .fillColor(navy)
    .moveTo(x, y)
    .lineTo(x + 30, y)
    .lineTo(
      x + 30,
      y + 27
    )
    .bezierCurveTo(
      x + 30,
      y + 37,
      x + 15,
      y + 45,
      x + 15,
      y + 45
    )
    .bezierCurveTo(
      x + 15,
      y + 45,
      x,
      y + 37,
      x,
      y + 27
    )
    .closePath()
    .fill()
    .restore();

  doc
    .save()
    .fillColor(gold)
    .circle(
      x + 15,
      y + 19,
      5
    )
    .fill()
    .restore();

  doc
    .fillColor(navy)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text(
      "CERTIFY",
      x + 43,
      y + 1
    );

  doc
    .fillColor(gray)
    .font("Helvetica")
    .fontSize(5.5)
    .text(
      "SECURE | VERIFY | EMPOWER",
      x + 44,
      y + 22
    );

  const org =
    safeText(organization) ||
    "Organization";

  doc
    .fillColor(navy)
    .font("Helvetica-Bold")
    .fontSize(
      fitFontSize(
        org,
        30,
        11,
        9,
        7
      )
    )
    .text(
      org.toUpperCase(),
      x + 185,
      y + 4,
      {
        width: 220,
      }
    );

  doc
    .fillColor(gray)
    .font("Helvetica")
    .fontSize(5.5)
    .text(
      "LEARN | BUILD | GROW",
      x + 186,
      y + 22
    );
};

const drawGradeBadge = (
  doc,
  x,
  y,
  grade
) => {
  const navy = "#102A56";
  const gold = "#C5962D";
  const pale = "#F4E2A7";

  doc
    .save()
    .fillColor(gold)
    .circle(x, y, 37)
    .fill()
    .restore();

  doc
    .save()
    .fillColor(pale)
    .circle(x, y, 31)
    .fill()
    .restore();

  doc
    .save()
    .fillColor(navy)
    .circle(x, y, 27)
    .fill()
    .restore();

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(6)
    .text(
      "GRADE",
      x - 23,
      y - 19,
      {
        width: 46,
        align: "center",
      }
    );

  const gradeText =
    safeText(grade) || "—";

  doc
    .fillColor(pale)
    .font("Helvetica-Bold")
    .fontSize(
      gradeText.length > 4
        ? 12
        : 21
    )
    .text(
      gradeText,
      x - 23,
      y - 3,
      {
        width: 46,
        align: "center",
      }
    );

  doc
    .fillColor(pale)
    .font("Helvetica-Bold")
    .fontSize(5)
    .text(
      "★ ★ ★",
      x - 23,
      y + 17,
      {
        width: 46,
        align: "center",
      }
    );
};

const drawSecuritySeal = (
  doc,
  x,
  y
) => {
  const navy = "#102A56";
  const gold = "#C5962D";
  const pale = "#F4E2A7";

  doc
    .save()
    .fillColor(gold)
    .circle(x, y, 36)
    .fill()
    .restore();

  doc
    .save()
    .fillColor(pale)
    .circle(x, y, 30)
    .fill()
    .restore();

  doc
    .save()
    .fillColor(navy)
    .circle(x, y, 24)
    .fill()
    .restore();

  doc
    .save()
    .fillColor(gold)
    .moveTo(
      x - 9,
      y - 10
    )
    .lineTo(
      x + 9,
      y - 10
    )
    .lineTo(
      x + 9,
      y + 4
    )
    .bezierCurveTo(
      x + 9,
      y + 12,
      x,
      y + 17,
      x,
      y + 17
    )
    .bezierCurveTo(
      x,
      y + 17,
      x - 9,
      y + 12,
      x - 9,
      y + 4
    )
    .closePath()
    .fill()
    .restore();

  doc
    .fillColor(navy)
    .font("Helvetica-Bold")
    .fontSize(4.8)
    .text(
      "CERTIFIED",
      x - 24,
      y - 24,
      {
        width: 48,
        align: "center",
      }
    );

  doc
    .fillColor(navy)
    .font("Helvetica-Bold")
    .fontSize(4.8)
    .text(
      "SECURE",
      x - 24,
      y + 22,
      {
        width: 48,
        align: "center",
      }
    );
};

const drawInfoCard = (
  doc,
  x,
  y,
  width,
  title,
  value
) => {
  const navy = "#102A56";
  const gray = "#64748B";

  doc
    .save()
    .fillColor("#F5F8FC")
    .roundedRect(
      x,
      y,
      width,
      45,
      7
    )
    .fill()
    .restore();

  doc
    .save()
    .lineWidth(0.7)
    .strokeColor("#D8E2EE")
    .roundedRect(
      x,
      y,
      width,
      45,
      7
    )
    .stroke()
    .restore();

  doc
    .fillColor(gray)
    .font("Helvetica-Bold")
    .fontSize(5.8)
    .text(
      title.toUpperCase(),
      x + 10,
      y + 8,
      {
        width:
          width - 20,
        characterSpacing: 0.7,
      }
    );

  doc
    .fillColor(navy)
    .font("Helvetica-Bold")
    .fontSize(
      fitFontSize(
        value,
        22,
        8.5,
        7.5,
        6.5
      )
    )
    .text(
      value || "—",
      x + 10,
      y + 23,
      {
        width:
          width - 20,
      }
    );
};

/* ============================================================
   GENERATE CERTIFICATE PDF
============================================================ */

const generateCertificatePDF =
  async (req, res) => {
    let responseFinished =
      false;

    try {
      const certificateId =
        safeText(
          req.params.certificateId
        ).toUpperCase();

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message:
            "Certificate ID is required",
        });
      }

      /* ------------------------------------------------------
         GET CERTIFICATE
      ------------------------------------------------------ */

      const result =
        await pool.query(
          `
          SELECT
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            duration,
            certificate_type,
            organization,
            issuer,
            issue_date,
            expiry_date,
            description,
            grade_score,
            skills_achievements,
            status,
            hash,
            hash_data,
            qr_code,
            template
          FROM certificates
          WHERE certificate_id = $1
          LIMIT 1
          `,
          [certificateId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate not found",
        });
      }

      const certificate =
        result.rows[0];

      /* ------------------------------------------------------
         SHA-256 INTEGRITY

         IMPORTANT:
         Uses the same canonical hashing function as
         certificate creation and verification.
      ------------------------------------------------------ */

      const hashData =
        getCertificateHashData(
          certificate
        );

      const calculatedHash =
        generateCertificateHash(
          hashData
        );

      const storedHash =
        safeText(
          certificate.hash
        ).toLowerCase();

      const integrityVerified =
        Boolean(
          storedHash &&
          calculatedHash ===
            storedHash
        );

      console.log(
        "=========================================="
      );

      console.log(
        "Certificate:",
        certificate.certificate_id
      );

      console.log(
        "Stored SHA-256:",
        storedHash
      );

      console.log(
        "Calculated SHA-256:",
        calculatedHash
      );

      console.log(
        "Integrity verified:",
        integrityVerified
      );

      console.log(
        "Hash data:",
        hashData
      );

      console.log(
        "=========================================="
      );

      /* ------------------------------------------------------
         QR CODE
      ------------------------------------------------------ */

      const verificationUrl =
        `http://localhost:5173/verify/${certificate.certificate_id}`;

      const qrDataUrl =
        await QRCode.toDataURL(
          verificationUrl,
          {
            errorCorrectionLevel:
              "H",

            margin: 1,

            width: 500,
          }
        );

      const qrBuffer =
        Buffer.from(
          qrDataUrl.split(",")[1],
          "base64"
        );

      /* ------------------------------------------------------
         PDF DOCUMENT
      ------------------------------------------------------ */

      const doc =
        new PDFDocument({
          size: "A4",

          layout: "landscape",

          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },

          info: {
            Title:
              `Certificate - ${certificate.certificate_id}`,

            Author:
              certificate.organization ||
              "Certify",

            Subject:
              certificate.certificate_type ||
              "Digital Certificate",
          },
        });

      const chunks = [];

      /* ------------------------------------------------------
         PDF ERROR HANDLING
      ------------------------------------------------------ */

      doc.on("error", (error) => {
        console.error(
          "PDFKit error:",
          error
        );

        if (
          !responseFinished &&
          !res.headersSent
        ) {
          responseFinished = true;

          return res.status(500).json({
            success: false,

            message:
              "Failed to generate certificate PDF",

            error:
              error.message,
          });
        }
      });

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        if (responseFinished) {
          return;
        }

        responseFinished = true;

        const pdf =
          Buffer.concat(chunks);

        const filename =
          certificate.certificate_id.replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );

        res.status(200);

        res.setHeader(
          "Content-Type",
          "application/pdf"
        );

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.pdf"`
        );

        res.setHeader(
          "Content-Length",
          pdf.length
        );

        res.end(pdf);
      });

      /* ------------------------------------------------------
         PAGE
      ------------------------------------------------------ */

      const W =
        doc.page.width;

      const H =
        doc.page.height;

      const navy = "#102A56";
      const darkNavy =
        "#071A38";
      const gold = "#C5962D";
      const paleGold =
        "#EEDB9A";
      const gray =
        "#64748B";
      const lightBlue =
        "#F4F8FC";
      const borderBlue =
        "#D6E1ED";

      /* ------------------------------------------------------
         BACKGROUND
      ------------------------------------------------------ */

      doc
        .rect(
          0,
          0,
          W,
          H
        )
        .fill("#FFFFFF");

      /* ------------------------------------------------------
         OUTER BORDER
      ------------------------------------------------------ */

      doc
        .save()
        .lineWidth(3)
        .strokeColor(navy)
        .rect(
          17,
          17,
          W - 34,
          H - 34
        )
        .stroke()
        .restore();

      /* ------------------------------------------------------
         INNER BORDER
      ------------------------------------------------------ */

      doc
        .save()
        .lineWidth(1)
        .strokeColor(gold)
        .rect(
          27,
          27,
          W - 54,
          H - 54
        )
        .stroke()
        .restore();

      /* ------------------------------------------------------
         TOP LEFT CORNER
      ------------------------------------------------------ */

      doc
        .save()
        .fillColor(darkNavy)
        .moveTo(0, 0)
        .lineTo(145, 0)
        .lineTo(0, 145)
        .closePath()
        .fill()
        .restore();

      doc
        .save()
        .fillColor(gold)
        .moveTo(0, 0)
        .lineTo(112, 0)
        .lineTo(0, 112)
        .closePath()
        .fill()
        .restore();

      doc
        .save()
        .lineWidth(2)
        .strokeColor(paleGold)
        .moveTo(0, 125)
        .lineTo(125, 0)
        .stroke()
        .restore();

      /* ------------------------------------------------------
         BOTTOM RIGHT CORNER
      ------------------------------------------------------ */

      doc
        .save()
        .fillColor(darkNavy)
        .moveTo(W, H)
        .lineTo(W - 145, H)
        .lineTo(W, H - 145)
        .closePath()
        .fill()
        .restore();

      doc
        .save()
        .fillColor(gold)
        .moveTo(W, H)
        .lineTo(W - 112, H)
        .lineTo(W, H - 112)
        .closePath()
        .fill()
        .restore();

      doc
        .save()
        .lineWidth(2)
        .strokeColor(paleGold)
        .moveTo(W, H - 125)
        .lineTo(W - 125, H)
        .stroke()
        .restore();

      /* ------------------------------------------------------
         WATERMARK
      ------------------------------------------------------ */

      doc
        .save()
        .opacity(0.045)
        .lineWidth(10)
        .strokeColor(navy)
        .circle(
          W / 2,
          300,
          105
        )
        .stroke()
        .lineWidth(3)
        .circle(
          W / 2,
          300,
          82
        )
        .stroke()
        .restore();

      /* ------------------------------------------------------
         HEADER
      ------------------------------------------------------ */

      drawLogo(
        doc,
        78,
        48,
        certificate.organization
      );

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .text(
          "EMPOWERING",
          W - 205,
          48,
          {
            width: 95,
            characterSpacing: 1.5,
          }
        );

      doc.text(
        "TOMORROW'S",
        W - 205,
        61,
        {
          width: 100,
          characterSpacing: 1.5,
        }
      );

      doc.text(
        "LEADERS",
        W - 205,
        74,
        {
          width: 95,
          characterSpacing: 1.5,
        }
      );

      doc
        .save()
        .strokeColor(gold)
        .lineWidth(1)
        .moveTo(
          W - 205,
          91
        )
        .lineTo(
          W - 165,
          91
        )
        .stroke()
        .restore();

      /* ------------------------------------------------------
         MAIN TITLE
      ------------------------------------------------------ */

      doc
        .fillColor(darkNavy)
        .font("Times-Bold")
        .fontSize(43)
        .text(
          "CERTIFICATE",
          190,
          98,
          {
            width: 460,
            align: "center",
          }
        );

      doc
        .fillColor(gold)
        .font("Times-Bold")
        .fontSize(14)
        .text(
          "OF ACHIEVEMENT",
          250,
          146,
          {
            width: 340,
            align: "center",
            characterSpacing: 1.6,
          }
        );

      /* ------------------------------------------------------
         TITLE LINES
      ------------------------------------------------------ */

      doc
        .save()
        .strokeColor(gold)
        .lineWidth(1.2)
        .moveTo(245, 158)
        .lineTo(285, 158)
        .moveTo(
          W - 285,
          158
        )
        .lineTo(
          W - 245,
          158
        )
        .stroke()
        .restore();

      /* ------------------------------------------------------
         DYNAMIC CERTIFICATE TYPE
      ------------------------------------------------------ */

      const certificateType =
        safeText(
          certificate.certificate_type
        ) ||
        "Certificate";

      const ribbonW = 215;
      const ribbonH = 28;

      const ribbonX =
        W / 2 -
        ribbonW / 2;

      const ribbonY = 169;

      doc
        .save()
        .fillColor(gold)
        .moveTo(
          ribbonX,
          ribbonY
        )
        .lineTo(
          ribbonX - 14,
          ribbonY + 14
        )
        .lineTo(
          ribbonX,
          ribbonY + ribbonH
        )
        .lineTo(
          ribbonX + ribbonW,
          ribbonY + ribbonH
        )
        .lineTo(
          ribbonX + ribbonW + 14,
          ribbonY + 14
        )
        .lineTo(
          ribbonX + ribbonW,
          ribbonY
        )
        .closePath()
        .fill()
        .restore();

      doc
        .fillColor(darkNavy)
        .font("Helvetica-Bold")
        .fontSize(
          fitFontSize(
            certificateType,
            20,
            9.5,
            8,
            6.5
          )
        )
        .text(
          certificateType.toUpperCase(),
          ribbonX,
          ribbonY + 8,
          {
            width: ribbonW,
            align: "center",
            characterSpacing: 0.7,
          }
        );

      /* ------------------------------------------------------
         PRESENTED TO
      ------------------------------------------------------ */

      doc
        .fillColor(navy)
        .font("Helvetica")
        .fontSize(7)
        .text(
          "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
          205,
          211,
          {
            width: 430,
            align: "center",
            characterSpacing: 1.6,
          }
        );

      /* ------------------------------------------------------
         STUDENT NAME
      ------------------------------------------------------ */

      const studentName =
        safeText(
          certificate.student_name
        ) ||
        "Student Name";

      doc
        .fillColor(darkNavy)
        .font("Times-Italic")
        .fontSize(
          fitFontSize(
            studentName,
            30,
            30,
            25,
            20
          )
        )
        .text(
          studentName,
          170,
          228,
          {
            width: 500,
            align: "center",
          }
        );

      /* ------------------------------------------------------
         NAME LINE
      ------------------------------------------------------ */

      doc
        .save()
        .strokeColor(gold)
        .lineWidth(1)
        .moveTo(
          295,
          270
        )
        .lineTo(
          W - 295,
          270
        )
        .stroke()
        .restore();

      doc
        .save()
        .fillColor(gold)
        .moveTo(
          W / 2,
          264
        )
        .lineTo(
          W / 2 + 6,
          270
        )
        .lineTo(
          W / 2,
          276
        )
        .lineTo(
          W / 2 - 6,
          270
        )
        .closePath()
        .fill()
        .restore();

      /* ------------------------------------------------------
         COURSE INTRO
      ------------------------------------------------------ */

      doc
        .fillColor(darkNavy)
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          "for successfully completing",
          255,
          286,
          {
            width: 335,
            align: "center",
          }
        );

      /* ------------------------------------------------------
         COURSE
      ------------------------------------------------------ */

      const course =
        safeText(
          certificate.course
        ) ||
        "Course / Program";

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(
          fitFontSize(
            course,
            38,
            19,
            16,
            12
          )
        )
        .text(
          course,
          165,
          301,
          {
            width: 510,
            align: "center",
          }
        );

      /* ------------------------------------------------------
         DESCRIPTION
      ------------------------------------------------------ */

      const description =
        safeText(
          certificate.description
        ) ||
        "We recognize your dedication, hard work, and commitment to learning and growth.";

      doc
        .fillColor(darkNavy)
        .font("Helvetica")
        .fontSize(8)
        .text(
          description,
          235,
          332,
          {
            width: 375,
            align: "center",
            lineGap: 1.5,
            height: 30,
          }
        );

      /* ------------------------------------------------------
         GRADE
      ------------------------------------------------------ */

      if (
        safeText(
          certificate.grade_score
        )
      ) {
        drawGradeBadge(
          doc,
          W - 98,
          282,
          certificate.grade_score
        );
      }

      /* ------------------------------------------------------
         INFORMATION CARDS
      ------------------------------------------------------ */

      const cardsY = 369;

      drawInfoCard(
        doc,
        235,
        cardsY,
        125,
        "Duration",
        safeText(
          certificate.duration
        )
      );

      drawInfoCard(
        doc,
        370,
        cardsY,
        130,
        "Issued On",
        formatDate(
          certificate.issue_date
        )
      );

      drawInfoCard(
        doc,
        510,
        cardsY,
        150,
        "Issued By",
        safeText(
          certificate.issuer
        )
      );

      /* ------------------------------------------------------
         EXPIRY
      ------------------------------------------------------ */

      if (
        certificate.expiry_date
      ) {
        doc
          .fillColor(gray)
          .font("Helvetica")
          .fontSize(5.5)
          .text(
            `Valid until ${formatDate(
              certificate.expiry_date
            )}`,
            510,
            cardsY + 51,
            {
              width: 150,
              align: "center",
            }
          );
      }

      /* ------------------------------------------------------
         CERTIFICATE ID
      ------------------------------------------------------ */

      const idX = 58;
      const idY = 454;
      const idW = 235;
      const idH = 55;

      doc
        .save()
        .fillColor(lightBlue)
        .roundedRect(
          idX,
          idY,
          idW,
          idH,
          8
        )
        .fill()
        .restore();

      doc
        .save()
        .lineWidth(0.8)
        .strokeColor(borderBlue)
        .roundedRect(
          idX,
          idY,
          idW,
          idH,
          8
        )
        .stroke()
        .restore();

      doc
        .fillColor(gray)
        .font("Helvetica-Bold")
        .fontSize(6.2)
        .text(
          "CERTIFICATE ID",
          idX + 14,
          idY + 10,
          {
            width: 150,
            characterSpacing: 0.9,
          }
        );

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(
          fitFontSize(
            certificate.certificate_id,
            23,
            9,
            8,
            7
          )
        )
        .text(
          certificate.certificate_id,
          idX + 14,
          idY + 28,
          {
            width:
              idW - 28,
          }
        );

      /* ------------------------------------------------------
         SECURITY SEAL
      ------------------------------------------------------ */

      drawSecuritySeal(
        doc,
        410,
        481
      );

      doc
        .fillColor(gray)
        .font("Helvetica-Bold")
        .fontSize(5)
        .text(
          "DIGITAL CERTIFICATE",
          365,
          523,
          {
            width: 90,
            align: "center",
            characterSpacing: 0.7,
          }
        );

      /* ------------------------------------------------------
         DYNAMIC ISSUER SIGNATURE
      ------------------------------------------------------ */

      const issuerName =
        safeText(
          certificate.issuer
        ) ||
        "Authorized Issuer";

      const signatureX = 490;
      const signatureY = 451;
      const signatureW = 175;

      doc
        .fillColor(navy)
        .font("Times-Italic")
        .fontSize(
          fitFontSize(
            issuerName,
            18,
            18,
            15,
            12
          )
        )
        .text(
          issuerName,
          signatureX,
          signatureY,
          {
            width:
              signatureW,
            align: "center",
          }
        );

      doc
        .save()
        .strokeColor(gold)
        .lineWidth(1)
        .moveTo(
          signatureX + 8,
          signatureY + 31
        )
        .lineTo(
          signatureX +
            signatureW -
            8,
          signatureY + 31
        )
        .stroke()
        .restore();

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(
          fitFontSize(
            issuerName,
            25,
            8.5,
            7.5,
            6.5
          )
        )
        .text(
          issuerName,
          signatureX,
          signatureY + 37,
          {
            width:
              signatureW,
            align: "center",
          }
        );

      doc
        .fillColor(gray)
        .font("Helvetica")
        .fontSize(5.5)
        .text(
          "AUTHORIZED ISSUER",
          signatureX,
          signatureY + 51,
          {
            width:
              signatureW,
            align: "center",
            characterSpacing: 1,
          }
        );

      /* ------------------------------------------------------
         QR PANEL
      ------------------------------------------------------ */

      const qrX =
        W - 143;

      const qrY = 390;

      const qrW = 108;

      const qrH = 137;

      doc
        .save()
        .fillColor("#FFFFFF")
        .roundedRect(
          qrX,
          qrY,
          qrW,
          qrH,
          8
        )
        .fill()
        .restore();

      doc
        .save()
        .lineWidth(0.8)
        .strokeColor(borderBlue)
        .roundedRect(
          qrX,
          qrY,
          qrW,
          qrH,
          8
        )
        .stroke()
        .restore();

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(6)
        .text(
          "SCAN TO VERIFY",
          qrX + 8,
          qrY + 9,
          {
            width:
              qrW - 16,
            align: "center",
            characterSpacing: 0.8,
          }
        );

      doc.image(
        qrBuffer,
        qrX + 16,
        qrY + 25,
        {
          width: 76,
          height: 76,
        }
      );

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(5.5)
        .text(
          "VERIFY ONLINE",
          qrX + 8,
          qrY + 105,
          {
            width:
              qrW - 16,
            align: "center",
          }
        );

      doc
        .fillColor(gray)
        .font("Helvetica")
        .fontSize(4.5)
        .text(
          certificate.certificate_id,
          qrX + 5,
          qrY + 119,
          {
            width:
              qrW - 10,
            align: "center",
          }
        );

      /* ------------------------------------------------------
         FOOTER
      ------------------------------------------------------ */

      doc
        .fillColor(navy)
        .font("Helvetica-Bold")
        .fontSize(5.2)
        .text(
          "CERTIFY | SECURE | VERIFY | EMPOWER",
          58,
          H - 30,
          {
            width: 300,
            characterSpacing: 0.7,
          }
        );

      /* ------------------------------------------------------
         SHA-256 RESULT
      ------------------------------------------------------ */

      doc
        .fillColor(
          integrityVerified
            ? "#166534"
            : "#991B1B"
        )
        .font("Helvetica-Bold")
        .fontSize(5.2)
        .text(
          integrityVerified
            ? "SHA-256 INTEGRITY VERIFIED"
            : "SHA-256 INTEGRITY CHECK FAILED",
          W - 315,
          H - 30,
          {
            width: 255,
            align: "right",
            characterSpacing: 0.35,
          }
        );

      /* ------------------------------------------------------
         FINISH PDF
      ------------------------------------------------------ */

      doc.end();

    } catch (error) {
      console.error(
        "Certificate PDF generation error:",
        error
      );

      if (
        !responseFinished &&
        !res.headersSent
      ) {
        responseFinished = true;

        return res.status(500).json({
          success: false,

          message:
            "Failed to generate certificate PDF",

          error:
            error.message,
        });
      }
    }
  };

/* ============================================================
   REVOKE CERTIFICATE
============================================================ */

const revokeCertificate =
  async (req, res) => {
    try {
      const certificateId =
        safeText(
          req.params.certificateId
        ).toUpperCase();

      const reason =
        safeText(
          req.body.reason
        );

      const userId =
        req.user.id;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message:
            "Certificate ID is required",
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message:
            "Revocation reason is required",
        });
      }

      const userResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM users
          WHERE id = $1
          `,
          [userId]
        );

      if (
        !userResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const user =
        userResult.rows[0];

      if (
        user.role !== "issuer" &&
        user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only issuers and admins can revoke certificates",
        });
      }

      if (
        user.status !== "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive",
        });
      }

      const certificateResult =
        await pool.query(
          `
          SELECT
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            issuer,
            status
          FROM certificates
          WHERE certificate_id = $1
          `,
          [certificateId]
        );

      if (
        !certificateResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate not found",
        });
      }

      const certificate =
        certificateResult.rows[0];

      if (
        certificate.status ===
        "revoked"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This certificate has already been revoked",
        });
      }

      if (
        user.role === "issuer" &&
        certificate.issuer !==
          user.name
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only revoke certificates issued by you",
        });
      }

      const updateResult =
        await pool.query(
          `
          UPDATE certificates
          SET
            status = 'revoked',
            revoked_reason = $1,
            revoked_date = NOW(),
            revoked_by = $2,
            updated_at = NOW()
          WHERE id = $3
          RETURNING
            id,
            certificate_id,
            student_name,
            student_email,
            course,
            issuer,
            status,
            revoked_reason,
            revoked_date,
            revoked_by,
            updated_at
          `,
          [
            reason,
            userId,
            certificate.id,
          ]
        );

      await pool.query(
        `
        INSERT INTO activity_logs (
          user_id,
          action,
          target
        )
        VALUES ($1,$2,$3)
        `,
        [
          userId,
          "Certificate Revoked",
          certificate.certificate_id,
        ]
      );

      return res.json({
        success: true,

        message:
          "Certificate revoked successfully",

        certificate:
          updateResult.rows[0],
      });
    } catch (error) {
      console.error(
        "Revoke certificate error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to revoke certificate",
      });
    }
  };

/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  createCertificate,
  getMyCertificates,
  getIssuerCertificates,
  verifyCertificate,
  generateCertificatePDF,
  revokeCertificate,
  getAdminCertificates,
};