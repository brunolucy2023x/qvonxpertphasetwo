import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import fs from "fs";
import path from "path";
import User from "./models/UserModel.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const CLIENT_URL = process.env.CLIENT_URL || "https://qvonxpert.com";
const BASE_URL = process.env.BASE_URL || "https://qvonxpert.com";

// =========================
// AUTH0 CONFIG
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
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth(config));

// =========================
// DB USER CHECK
// =========================
const ensureUserInDB = async (user) => {
  if (!user?.sub) return;

  const existing = await User.findOne({ auth0Id: user.sub });

  if (!existing) {
    await User.create({
      auth0Id: user.sub,
      email: user.email,
      name: user.name,
      profilePicture: user.picture,
      role: "jobseeker",
    });

    console.log("✅ User created:", user.email);
  }
};

// =========================
// TEST ROUTE
// =========================
app.get("/test", (req, res) => {
  res.json({ status: "Backend working 🚀" });
});

// =========================
// HOME
// =========================
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    await ensureUserInDB(req.oidc.user);
    return res.redirect(`${CLIENT_URL}/dashboard`);
  }

  res.send("Logged out");
});

// =========================
// SAFE ROUTE LOADER (FIXED)
// =========================
const loadRoutes = async () => {
  const routesDir = path.resolve("./routes");

  if (!fs.existsSync(routesDir)) {
    console.log("❌ Routes folder not found");
    return;
  }

  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    try {
      const route = await import(path.join(routesDir, file));

      if (route.default) {
        app.use("/api/v1", route.default);
        console.log("✅ Loaded route:", file);
      }
    } catch (err) {
      console.error("❌ Failed loading route:", file, err.message);
    }
  }
};

// =========================
// START SERVER (FIXED ORDER)
// =========================
const startServer = async () => {
  try {
    await connect();
    console.log("✅ MongoDB connected");

    await loadRoutes();
    console.log("✅ Routes loaded");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server error:", error.message);
    process.exit(1);
  }
};

startServer();