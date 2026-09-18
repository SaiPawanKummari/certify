const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| Generate JWT
|--------------------------------------------------------------------------
*/

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password, role, status)
       VALUES
        ($1, $2, $3, 'student', 'active')
       RETURNING id, name, email, role, status, created_at`,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword,
      ]
    );

    const user = result.rows[0];

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        password,
        role,
        status
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token = generateToken(user);

    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL USERS
|--------------------------------------------------------------------------
*/

const getAllUsers = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Admin Authorization
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
    | Get Users
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
       FROM users
       ORDER BY created_at DESC`
    );

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const users = result.rows;

    const stats = {
      total: users.length,

      students: users.filter(
        (user) =>
          user.role === "student"
      ).length,

      issuers: users.filter(
        (user) =>
          user.role === "issuer"
      ).length,

      admins: users.filter(
        (user) =>
          user.role === "admin"
      ).length,

      active: users.filter(
        (user) =>
          user.status === "active"
      ).length,

      inactive: users.filter(
        (user) =>
          user.status !== "active"
      ).length,
    };

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      users,
      stats,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load users.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE USER STATUS
|--------------------------------------------------------------------------
*/

const updateUserStatus = async (
  req,
  res
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Admin Authorization
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

    const userId =
      Number(req.params.id);

    const { status } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate User ID
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Status
    |--------------------------------------------------------------------------
    */

    if (
      status !== "active" &&
      status !== "inactive"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be active or inactive.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Admin Self-Deactivation
    |--------------------------------------------------------------------------
    */

    if (
      Number(req.user.id) === userId &&
      status === "inactive"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own admin account.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check User Exists
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await pool.query(
        `SELECT
          id,
          name,
          email,
          role,
          status
         FROM users
         WHERE id = $1`,
        [userId]
      );

    if (
      existingUser.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `UPDATE users
       SET status = $1
       WHERE id = $2
       RETURNING
         id,
         name,
         email,
         role,
         status,
         created_at`,
      [status, userId]
    );

    const updatedUser =
      result.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "User activated successfully."
          : "User deactivated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user status.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  register,
  login,
  getAllUsers,
  updateUserStatus,
};