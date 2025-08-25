// scripts/check-env.js - FIXED Environment Checker Script
const fs = require("fs");
const path = require("path");

// Load environment variables from multiple sources
function loadEnvFiles() {
  const envFiles = [".env.local", ".env", ".env.production"];
  const envVars = {};

  envFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");

        lines.forEach((line) => {
          line = line.trim();
          if (line && !line.startsWith("#")) {
            const [key, ...values] = line.split("=");
            if (key && values.length > 0) {
              const value = values.join("=").replace(/^["']|["']$/g, ""); // Remove quotes
              envVars[key.trim()] = value.trim();
            }
          }
        });

        console.log(`✅ Loaded ${file}`);
      } catch (error) {
        console.log(`❌ Error reading ${file}: ${error.message}`);
      }
    }
  });

  // Merge with process.env (process.env takes precedence)
  return { ...envVars, ...process.env };
}

console.log("🔍 Environment Variables Checker");
console.log("================================");

// Load environment variables
const allEnvVars = loadEnvFiles();

// Required environment variables
const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

// Optional but recommended
const optionalEnvVars = ["NODE_ENV"];

function checkEnvVar(varName, envVars, required = true) {
  const value = envVars[varName];
  const status = value ? "✅" : required ? "❌" : "⚠️";
  const display = value
    ? varName.includes("SECRET") || varName.includes("URI")
      ? `${value.substring(0, 10)}...`
      : value
    : "Not set";

  console.log(`${status} ${varName}: ${display}`);
  return !!value;
}

console.log("\n📋 Required Environment Variables:");
let allRequired = true;
requiredEnvVars.forEach((varName) => {
  if (!checkEnvVar(varName, allEnvVars, true)) {
    allRequired = false;
  }
});

console.log("\n📋 Optional Environment Variables:");
optionalEnvVars.forEach((varName) => {
  checkEnvVar(varName, allEnvVars, false);
});

// Check for .env files
console.log("\n📁 Environment Files:");
const envFiles = [".env.local", ".env", ".env.production"];
envFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(
    `${exists ? "✅" : "❌"} ${file}: ${exists ? "Found" : "Not found"}`
  );
});

// Check directories
console.log("\n📂 Directory Structure:");
const requiredDirs = [
  "public",
  "public/uploads",
  "src/app/api",
  "src/models",
  "src/lib",
];

requiredDirs.forEach((dir) => {
  const exists = fs.existsSync(path.join(process.cwd(), dir));
  console.log(
    `${exists ? "✅" : "❌"} ${dir}: ${exists ? "Exists" : "Missing"}`
  );

  if (dir === "public/uploads" && exists) {
    try {
      const stats = fs.statSync(path.join(process.cwd(), dir));
      console.log(`    📊 Permissions: ${stats.mode.toString(8)}`);
    } catch (error) {
      console.log(`    ❌ Cannot read permissions: ${error.message}`);
    }
  }
});

// Check package.json dependencies
console.log("\n📦 Key Dependencies:");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const keyDeps = ["next", "react", "mongoose", "next-auth", "tailwindcss"];

  keyDeps.forEach((dep) => {
    const version =
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    console.log(`${version ? "✅" : "❌"} ${dep}: ${version || "Not found"}`);
  });
} catch (error) {
  console.log("❌ Cannot read package.json");
}

// MongoDB URI validation
console.log("\n🗄️ MongoDB URI Analysis:");
const mongoUri = allEnvVars.MONGODB_URI;
if (mongoUri) {
  try {
    const url = new URL(mongoUri);
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Host: ${url.hostname}`);
    console.log(`✅ Database: ${url.pathname.substring(1) || "Not specified"}`);

    if (url.searchParams.has("retryWrites")) {
      console.log(`✅ Retry Writes: ${url.searchParams.get("retryWrites")}`);
    }

    if (url.searchParams.has("w")) {
      console.log(`✅ Write Concern: ${url.searchParams.get("w")}`);
    }
  } catch (error) {
    console.log(`❌ Invalid MongoDB URI format: ${error.message}`);
  }
} else {
  console.log("❌ MongoDB URI not set");
}

// NextAuth configuration check
console.log("\n🔐 NextAuth Configuration:");
const nextAuthSecret = allEnvVars.NEXTAUTH_SECRET;
const nextAuthUrl = allEnvVars.NEXTAUTH_URL;

if (nextAuthSecret) {
  console.log(
    `✅ NEXTAUTH_SECRET: ${nextAuthSecret.substring(0, 10)}... (${
      nextAuthSecret.length
    } characters)`
  );
  if (nextAuthSecret.length < 32) {
    console.log(
      `⚠️  Warning: NEXTAUTH_SECRET should be at least 32 characters long`
    );
  }
} else {
  console.log("❌ NEXTAUTH_SECRET not set");
}

if (nextAuthUrl) {
  try {
    const url = new URL(nextAuthUrl);
    console.log(`✅ NEXTAUTH_URL: ${url.origin}`);
  } catch (error) {
    console.log(`❌ Invalid NEXTAUTH_URL format: ${error.message}`);
  }
} else {
  console.log("❌ NEXTAUTH_URL not set");
}

// Test MongoDB connection
console.log("\n🔌 MongoDB Connection Test:");
if (mongoUri) {
  console.log("✅ MongoDB URI is properly formatted");
  console.log("ℹ️  To test connection, run: npm run test:db");
} else {
  console.log("❌ Cannot test connection - MongoDB URI not set");
}

// Summary
console.log("\n📊 Summary:");
console.log(
  `Environment Status: ${allRequired ? "✅ Ready" : "❌ Issues found"}`
);
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Working Directory: ${process.cwd()}`);

if (!allRequired) {
  console.log(
    "\n❌ Issues detected! Please check the missing environment variables above."
  );
  console.log("💡 Make sure your .env files contain all required variables:");
  requiredEnvVars.forEach((varName) => {
    if (!allEnvVars[varName]) {
      console.log(`   - ${varName}=your_${varName.toLowerCase()}_value`);
    }
  });
  process.exit(1);
} else {
  console.log("\n✅ Environment looks good!");
  console.log("🚀 Ready to run the application!");
  process.exit(0);
}
