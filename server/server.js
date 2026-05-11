import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import fs from "fs";
import path from "path";
import User from "./models/UserModel.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// FIX: needed for ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// ENV VARIABLES (SAFE)
// =========================
const CLIENT_URL = process.env.CLIENT_URL;
const BASE_URL = process.env.BASE_URL;

// =========================
// TRUST PROXY (IMPORTANT FOR AUTH0)
// =========================
app.set("trust proxy", 1);

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
// TEST ROUTE
// =========================
app.get("/test", (req, res) => {
  res.json({ status: "Backend is working 🚀" });
});

// =========================
// USER CREATION
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
// HOME ROUTE
// =========================
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    await ensureUserInDB(req.oidc.user);
    return res.redirect(`${CLIENT_URL}/dashboard`);
  }

  res.send("Logged out");
});

// =========================
// FIXED ROUTE LOADER (SAFE + RELIABLE)
// =========================
const loadRoutes = async () => {
  const routesDir = path.join(__dirname, "routes");

  if (!fs.existsSync(routesDir)) {
    console.log("❌ Routes folder not found");
    return;
  }

  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    try {
      const routePath = path.join(routesDir, file);
      const route = await import(routePath);

      if (route.default) {
        app.use("/api/v1", route.default);
        console.log(`✅ Route loaded: ${file}`);
      } else {
        console.log(`⚠️ No default export in: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Failed loading route ${file}:`, err.message);
    }
  }
};

// =========================
// START SERVER (ORDER FIXED)
// =========================
const startServer = async () => {
  try {
    await connect();
    console.log("✅ MongoDB connected");

    await loadRoutes();
    console.log("✅ All routes loaded");

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