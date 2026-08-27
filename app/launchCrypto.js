const crypto = require("crypto");
const { WINGIFY_LAUNCH_SECRET } = require("./launchSecret");

function launchKey() {
  return crypto.createHash("sha256").update(String(WINGIFY_LAUNCH_SECRET), "utf8").digest();
}

function toConfig(data) {
  const accountId = Number(data.accountId ?? data.account_id);
  const prod = String(data.prod ?? data.production ?? "").trim();
  const staging = String(data.staging ?? data.stating ?? "").trim();
  const dev = String(data.dev ?? data.development ?? "").trim();
  if (!accountId || !prod || !staging || !dev) return null;
  return {
    accountId,
    projectId: 0,
    projectName: "Feature Experimentation",
    environments: [
      { id: "production", name: "Prod", token: prod },
      { id: "staging", name: "Staging", token: staging },
      { id: "development", name: "Dev", token: dev },
    ],
  };
}

function encryptLaunchPayload({ accountId, prod, staging, dev }) {
  const plaintext = JSON.stringify({ accountId: Number(accountId), prod, staging, dev });
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", launchKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64url");
}

function decryptLaunchPayload(payload) {
  if (!payload || typeof payload !== "string") return null;
  try {
    const buf = Buffer.from(payload, "base64url");
    if (buf.length < 29) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(buf.length - 16);
    const encrypted = buf.subarray(12, buf.length - 16);
    const decipher = crypto.createDecipheriv("aes-256-gcm", launchKey(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    return toConfig(JSON.parse(plaintext));
  } catch {
    return null;
  }
}

function launchUrl(origin, fields) {
  const base = String(origin || "http://localhost:3001").replace(/\/$/, "");
  return `${base}/#p=${encryptLaunchPayload(fields)}`;
}

module.exports = { encryptLaunchPayload, decryptLaunchPayload, launchUrl };

if (require.main === module) {
  const args = process.argv.slice(2);
  const get = (name) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : "";
  };
  const origin = get("origin") || "http://localhost:3001";
  const fields = {
    accountId: get("accountId"),
    prod: get("prod"),
    staging: get("staging"),
    dev: get("dev"),
  };
  if (!fields.accountId || !fields.prod || !fields.staging || !fields.dev) {
    console.error(
      "Usage: node app/launchCrypto.js --accountId ID --prod PROD_KEY --staging STAGING_KEY --dev DEV_KEY [--origin http://localhost:3001]"
    );
    process.exit(1);
  }
  console.log(launchUrl(origin, fields));
}
