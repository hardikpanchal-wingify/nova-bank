const { init } = require('wingify-fme-node-sdk');

// TEMPORARY: send all SDK traffic to the VWO test host. Remove to restore edge.wingify.net.
const WINGIFY_PROXY_URL = 'https://vwotestapp43.dev.visualwebsiteoptimizer.com';

const clientCache = {};

function cacheKey(accountId, sdkKey) {
  return `${accountId}:${sdkKey}`;
}

async function getWingifyClient(accountId, sdkKey) {
  if (!accountId) throw new Error('Wingify account id is required');
  if (!sdkKey) throw new Error('Wingify SDK key is required');

  const key = cacheKey(accountId, sdkKey);
  if (clientCache[key]) return clientCache[key];

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.log(`[Wingify] accountId: ${accountId}, sdkKey: ${String(sdkKey).substring(0, 8)}...`);
  }

  const wingifyClient = await init({
    accountId: Number(accountId),
    sdkKey,
    logger: { level: process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'ERROR' : 'DEBUG' },
    pollInterval: process.env.VERCEL ? 0 : 10000,
    proxyUrl: WINGIFY_PROXY_URL,
  });

  clientCache[key] = wingifyClient;
  return wingifyClient;
}

function clearClientCache() {
  Object.keys(clientCache).forEach((k) => delete clientCache[k]);
}

module.exports = { getWingifyClient, clearClientCache };
