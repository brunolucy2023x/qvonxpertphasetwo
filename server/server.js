import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import connect from "./db/connect.js";
import User from "./models/UserModel.js";

// =========================
// SUPABASE
// =========================
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// =========================
// PATH FIX
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// ENV
// =========================
const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:3000";

const BASE_URL =
  process.env.BASE_URL ||
  "http://localhost:5000";

// =========================
// SUPABASE INIT (FIXED)
// =========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================
// TRUST PROXY
// =========================
app.set("trust proxy", 1);

// =========================
// CORS (FIXED FOR YOUR ERROR)
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://qvonxpert.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.options("*", cors());

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// AUTH0 CONFIG
// =========================
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || process.env.SECRET,
  baseURL: BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID || process.env.CLIENT_ID,
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

app.use(auth(config));

// =========================
// SUPABASE SYNC USER
// =========================
const syncUserToSupabase = async (user) => {
  if (!user?.sub) return;

  const { error } = await supabase.from("users").upsert(
    [
      {
        auth0_id: user.sub,
        email: user.email,
        name: user.name,
        avatar: user.picture,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "auth0_id" }
  );

  if (error) {
    console.error("❌ Supabase user sync error:", error.message);
  }
};

// =========================
// USER CREATION
// =========================
const ensureUserInDB = async (user) => {
  if (!user?.sub) return;

  const existing = await User.findOne({
    auth0Id: user.sub,
  });

  if (!existing) {
    await User.create({
      auth0Id: user.sub,
      email: user.email,
      name: user.name,
      profilePicture: user.picture,
      role: "jobseeker",
    });

    console.log("✅ Mongo user created:", user.email);
  }

  await syncUserToSupabase(user);
};

// =========================
// TEST ROUTE
// =========================
app.get("/test", (req, res) => {
  res.json({
    status: "Backend working 🚀",
  });
});

// =========================
// HOME ROUTE
// =========================
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    await ensureUserInDB(req.oidc.user);

    return res.redirect(
      `${CLIENT_URL}/dashboard`
    );
  }

  res.send("Logged out");
});

// =========================
// ROUTE LOADER (SAFE)
// =========================
const loadRoutes = async () => {
  const routesDir = path.join(__dirname, "routes");

  if (!fs.existsSync(routesDir)) {
    console.log("❌ Routes folder missing");
    return;
  }

  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    try {
      const route = await import(
        path.join(routesDir, file)
      );

      if (route.default) {
        app.use("/api/v1", route.default);
        console.log(`✅ Loaded: ${file}`);
      }
    } catch (err) {
      console.error(
        `❌ Route error ${file}:`,
        err.message
      );
    }
  }
};

// =========================
// START SERVER
// =========================
const startServer = async () => {
  try {
    await connect();
    console.log("✅ MongoDB connected");

    await loadRoutes();
    console.log("✅ Routes loaded");

    const PORT =
      process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });
  } catch (err) {
    console.error(
      "❌ Server crash:",
      err.message
    );
    process.exit(1);
  }
};

startServer();