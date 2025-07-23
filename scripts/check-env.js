// scripts/check-env.js - Environment Checker Script
const fs = require("fs");
const path = require("path");

console.log("🔍 Environment Variables Checker");
console.log("================================");

// Required environment variables
const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

// Optional but recommended
const optionalEnvVars = ["NODE_ENV"];

function checkEnvVar(varName, required = true) {
  const value = process.env[varName];
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
  if (!checkEnvVar(varName, true)) {
    allRequired = false;
  }
});

console.log("\n📋 Optional Environment Variables:");
optionalEnvVars.forEach((varName) => {
  checkEnvVar(varName, false);
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
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  try {
    const url = new URL(mongoUri);
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Host: ${url.hostname}`);
    console.log(`✅ Database: ${url.pathname.substring(1) || "Not specified"}`);

    if (url.searchParams.has("retryWrites")) {
      console.log(`✅ Retry Writes: ${url.searchParams.get("retryWrites")}`);
    }
  } catch (error) {
    console.log(`❌ Invalid MongoDB URI format: ${error.message}`);
  }
} else {
  console.log("❌ MongoDB URI not set");
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
    "\n❌ Issues detected! Please fix the missing environment variables."
  );
  process.exit(1);
} else {
  console.log("\n✅ Environment looks good!");
  process.exit(0);
}
