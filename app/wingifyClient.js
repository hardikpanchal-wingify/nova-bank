const dns = require('dns');
const fs = require('fs');
const path = require('path');
const { init } = require('wingify-fme-node-sdk');

// Default: edge.wingify.net / collect.wingify.net
// Override all SDK traffic with:
//   WINGIFY_PROXY_URL=https://your-host.example.com
// Optional DNS pin if that host is not in public DNS:
//   WINGIFY_PROXY_IP=1.2.3.4

loadDotEnv();

const clientCache = {};
const dnsOverridesInstalled = new Set();

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

function normalizeProxyUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getProxyConfig() {
  const url = normalizeProxyUrl(process.env.WINGIFY_PROXY_URL);
  if (!url) return null;

  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new Error(`Invalid WINGIFY_PROXY_URL: ${process.env.WINGIFY_PROXY_URL}`);
  }

  const ip = (process.env.WINGIFY_PROXY_IP || '').trim();
  return { url, hostname, ip };
}

function installDnsOverride(hostname, ip) {
  if (!hostname || !ip || dnsOverridesInstalled.has(hostname)) return;
  dnsOverridesInstalled.add(hostname);

  const originalLookup = dns.lookup;
  dns.lookup = (name, options, callback) => {
    if (name !== hostname) return originalLookup(name, options, callback);
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const all = options && typeof options === 'object' && options.all;
    process.nextTick(() => {
      if (all) callback(null, [{ address: ip, family: 4 }]);
      else callback(null, ip, 4);
    });
  };

  if (dns.promises && typeof dns.promises.lookup === 'function') {
    const originalPromisesLookup = dns.promises.lookup.bind(dns.promises);
    dns.promises.lookup = async (name, options) => {
      if (name === hostname) return { address: ip, family: 4 };
      return originalPromisesLookup(name, options);
    };
  }
}

function cacheKey(accountId, sdkKey, proxyUrl) {
  return `${accountId}:${sdkKey}:${proxyUrl || 'edge'}`;
}

async function getWingifyClient(accountId, sdkKey) {
  if (!accountId) throw new Error('Wingify account id is required');
  if (!sdkKey) throw new Error('Wingify SDK key is required');

  const proxy = getProxyConfig();
  const key = cacheKey(accountId, sdkKey, proxy && proxy.url);
  if (clientCache[key]) return clientCache[key];

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.log(`[Wingify] accountId: ${accountId}, sdkKey: ${String(sdkKey).substring(0, 8)}...`);
  }
  if (proxy) {
    console.log(`[Wingify] proxyUrl: ${proxy.url}`);
    if (proxy.ip) installDnsOverride(proxy.hostname, proxy.ip);
  }

  const initOptions = {
    accountId: Number(accountId),
    sdkKey,
    logger: { level: process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'ERROR' : 'DEBUG' },
    pollInterval: process.env.VERCEL ? 0 : 10000,
    // Vercel freezes the isolate after the response; wait and send events now.
    shouldWaitForTrackingCalls: Boolean(process.env.VERCEL),
    isBatchingDisabled: Boolean(process.env.VERCEL),
  };
  if (proxy) initOptions.proxyUrl = proxy.url;

  const wingifyClient = await init(initOptions);
  clientCache[key] = wingifyClient;
  return wingifyClient;
}

async function flushWingifyEvents(wingifyClient) {
  if (!wingifyClient || typeof wingifyClient.flushEvents !== 'function') return;
  try {
    await wingifyClient.flushEvents();
  } catch (err) {
    console.error('[Wingify] flushEvents failed:', err.message);
  }
}

function clearClientCache() {
  Object.keys(clientCache).forEach((k) => delete clientCache[k]);
}

module.exports = { getWingifyClient, clearClientCache, flushWingifyEvents };
