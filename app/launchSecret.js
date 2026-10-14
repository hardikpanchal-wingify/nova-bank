require('./loadEnv');

const WINGIFY_LAUNCH_SECRET = String(process.env.WINGIFY_LAUNCH_SECRET || '').trim();

module.exports = { WINGIFY_LAUNCH_SECRET };
