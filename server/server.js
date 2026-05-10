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
// SAFE ENV FALLBACKS
// =========================
const CLIENT_URL =
  process.env.CLIENT_URL || "https://qvonxpert.com";

const BASE_URL =
  process.env.BASE_URL || "https://qvonxpert.com";

// =========================
// Auth0 Configuration
// =========================
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,

  routes: {
    postLogoutRedirect: CLIENT_URL,
    callback: "/callback",
    logout: "/logout",
    login: "/login",
  },

  session: {
    absoluteDuration: 30 * 24 * 60 * 60 * 1000,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    },
  },
};

// =========================
// MIDDLEWARE
// =========================
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth(config));

// =========================
// ENSURE USER IN DB
// =========================
const ensureUserInDB = asyncHandler(async (user) => {
  if (!user?.sub) return;

  const existingUser = await User.findOne({ auth0Id: user.sub });

  if (!existingUser) {
    await User.create({
      auth0Id: user.sub,
      email: user.email,
      name: user.name,
      role: "jobseeker",
      profilePicture: user.picture,
    });

    console.log("✅ New user created:", user.email);
  }
});

// =========================
// ROUTES
// =========================
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    await ensureUserInDB(req.oidc.user);

    // ✅ FIXED REDIRECT
    return res.redirect(`${CLIENT_URL}/dashboard`);
  }

  return res.send("Logged out");
});

// =========================
// SAFE ROUTE LOADING
// =========================
const routesDir = path.resolve("./routes");

if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach((file) => {
    import(path.join(routesDir, file))
      .then((route) => {
        if (route.default) app.use("/api/v1", route.default);
      })
      .catch((err) => console.error("❌ Route error:", err));
  });
}

// =========================
// START SERVER
// =========================
const startServer = async () => {
  try {
    await connect();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();