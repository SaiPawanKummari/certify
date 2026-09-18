const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const verificationHistoryRoutes = require("./routes/verificationHistoryRoutes");
const aiSecurityRoutes = require("./routes/aiSecurityRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Explicit Preflight Support
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Certificates
app.use(
  "/api/certificates",
  certificateRoutes
);

// Activity Logs
app.use(
  "/api/activity-logs",
  activityLogRoutes
);

// Verification History
app.use(
  "/api/verification-history",
  verificationHistoryRoutes
);

// AI Security
app.use(
  "/api/ai-security",
  aiSecurityRoutes
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Certify API is running",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error(
    "Server error:",
    err
  );

  res.status(500).json({
    success: false,
    message:
      "Internal server error.",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Certify server running on http://localhost:${PORT}`
    );
  }
);