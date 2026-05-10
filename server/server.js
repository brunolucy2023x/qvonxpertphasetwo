import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";
import User from "./models/UserModel.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// =========================
// Auth0 Configuration
// =========================
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  routes: {
    postLogoutRedirect: process.env.CLIENT_URL,
    callback: "/callback",
    logout: "/logout",
    login: "/login",
  },
  session: {
    absoluteDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      ...(isProduction && { domain: process.env.DOMAIN_NAME }),
    },
  },
};

// =========================
// Middleware
// =========================
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth(config));

// =========================
// Ensure user exists in DB
// =========================
const ensureUserInDB = asyncHandler(async (user) => {
  if (!user || !user.sub) return;

  const existingUser = await User.findOne({ auth0Id: user.sub });

  if (!existingUser) {
    const newUser = new User({
      auth0Id: user.sub,
      email: user.email,
      name: user.name,
      role: "jobseeker",
      profilePicture: user.picture,
    });

    await newUser.save();
    console.log("✅ User added to DB:", user.email);
  } else {
    console.log("ℹ️ User already exists in DB:", existingUser.email);
  }
});

// =========================
// Routes
// =========================
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    await ensureUserInDB(req.oidc.user);
    return res.redirect(process.env.CLIENT_URL);
  }
  return res.send("Logged out");
});

// Dynamic route imports
const routesDir = path.resolve("./routes");
fs.readdirSync(routesDir).forEach((file) => {
  import(path.join(routesDir, file))
    .then((route) => {
      if (route.default) app.use("/api/v1", route.default);
    })
    .catch((err) => console.error("❌ Error importing route:", err));
});

// =========================
// Start Server
// =========================
const startServer = async () => {
  try {
    await connect();
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();