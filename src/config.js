const path = require("path");

const jsonConfig = path.join(__dirname, "config.json");

let config;

try {
  config = require(jsonConfig);
} catch (err) {
  console.error("❌ config.json not found or is invalid!", err.message);
  process.exit(1);
}

// Railway environment variable ব্যবহার করবে
if (process.env.TOKEN) {
  config.token = process.env.TOKEN;
}

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
  }

  switch (value) {
    case true:
    case "true":
      return true;
    default:
      return false;
  }
}

config.parseBoolean = parseBoolean;

module.exports = config;
