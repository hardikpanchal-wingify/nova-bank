const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');

const { getWingifyClient, clearClientCache, flushWingifyEvents } = require('./wingifyClient');
const { decryptLaunchPayload } = require('./launchCrypto');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const frontendDist = path.join(__dirname, 'dist');
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

function logDebug(...args) {
  if (!isProd) console.log(...args);
}

// ---------------------------------------------------------------------------
// HELPER: build Wingify user context from request params
// ---------------------------------------------------------------------------
function buildUserContext(userId, userType) {
  return {
    id: userId,
    customVariables: {
      user_type: userType,
    },
  };
}

function getWingifySession(req) {
  const accountId = req.get('x-wingify-account-id');
  const sdkKey = req.get('x-wingify-sdk-key');
  if (!accountId || !sdkKey) {
    const err = new Error('Please access this app from Logged In FE Sample App workspace account.');
    err.status = 401;
    throw err;
  }
  return { accountId, sdkKey };
}

function sendError(res, err) {
  const status = err.status || 500;
  return res.status(status).json({ error: err.message });
}

app.post('/api/launch', (req, res) => {
  const payload = req.body?.payload || req.body?.p;
  const config = decryptLaunchPayload(payload);
  if (!config) {
    return res.status(401).json({
      error: 'Please access this app from Logged In FE Sample App workspace account.',
    });
  }
  return res.json(config);
});

// ---------------------------------------------------------------------------
// GET /api/features
// Query params: user_type, environment, user_id
// Returns evaluated flag variables for nova_dashboard + loan_eligibility_algo
// ---------------------------------------------------------------------------
app.get('/api/features', async (req, res) => {
  const { user_type = 'standard', environment = 'staging', user_id = 'demo_user_001' } = req.query;

  logDebug(`[/api/features] user_type=${user_type}, env=${environment}, user_id=${user_id}`);

  try {
    const { accountId, sdkKey } = getWingifySession(req);
    const wingifyClient = await getWingifyClient(accountId, sdkKey);
    const userContext = buildUserContext(user_id, user_type);

    // --- Evaluate nova_dashboard flag ---
    const dashboardFlag = await wingifyClient.getFlag('nova_dashboard', userContext);
    logDebug('dashboard isEnabled:', dashboardFlag.isEnabled());
    const dashboardEnabled = dashboardFlag.isEnabled();

    const dashboard = {
      enabled: dashboardEnabled,
      widget_order: dashboardEnabled
        ? (dashboardFlag.getVariable('widget_order', 'balance,transactions,loans') || 'balance,transactions,loans').split(',')
        : ['balance', 'transactions', 'loans'],
      widget_style: dashboardEnabled ? dashboardFlag.getVariable('widget_style', 'list') : 'list',
      hero_copy: dashboardEnabled ? dashboardFlag.getVariable('hero_copy', 'Welcome back') : 'Welcome back',
      show_promo_banner: dashboardEnabled ? dashboardFlag.getVariable('show_promo_banner', false) : false,
      promo_copy: dashboardEnabled ? dashboardFlag.getVariable('promo_copy', '') : '',
    };

    // --- Evaluate loan_eligibility_algo flag ---
    const loanFlag = await wingifyClient.getFlag('loan_eligibility_algo', userContext);
    logDebug('loan isEnabled:', loanFlag.isEnabled());
    const loanEnabled = loanFlag.isEnabled();

    const maxLoanAmount = loanEnabled ? loanFlag.getVariable('max_loan_amount', 5000) : 5000;

    const loan = {
      enabled: loanEnabled,
      algo_variant: loanEnabled ? loanFlag.getVariable('algo_variant', 'conservative') : 'conservative',
      max_loan_amount: maxLoanAmount,
      rate_label: loanEnabled ? loanFlag.getVariable('rate_label', 'Introductory Rate') : 'Introductory Rate',
      risk_tier: loanEnabled ? loanFlag.getVariable('risk_tier', 'low') : 'low',
    };

    // --- Auto-track eligibility threshold metric (server-side business metric) ---
    if (loanEnabled && maxLoanAmount >= 20000) {
      try {
        await wingifyClient.trackEvent('eligibility_threshold_met', userContext);
        logDebug(`[Wingify Track] eligibility_threshold_met for user=${user_id}, amount=${maxLoanAmount}`);
      } catch (trackErr) {
        console.error('[Wingify Track] Failed to track eligibility_threshold_met:', trackErr.message);
      }
    }

    await flushWingifyEvents(wingifyClient);
    return res.json({ dashboard, loan, meta: { user_id, user_type, environment } });

  } catch (err) {
    console.error('[/api/features] Error:', err.message);
    return sendError(res, err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/track
// Body: { event_key, user_id, user_type, environment }
// Tracks a named event in Wingify server-side
// ---------------------------------------------------------------------------
app.post('/api/track', async (req, res) => {
  const { event_key, user_id = 'demo_user_001', user_type = 'standard', environment = 'staging' } = req.body;

  const VALID_EVENTS = [
    'promo_clicked',
    'loan_widget_interacted',
    'eligibility_threshold_met',
    'loan_application_started',
    'loan_application_completed',
  ];

  if (!event_key || !VALID_EVENTS.includes(event_key)) {
    return res.status(400).json({ error: `Invalid event_key. Valid keys: ${VALID_EVENTS.join(', ')}` });
  }

  logDebug(`[/api/track] event=${event_key}, user_type=${user_type}, env=${environment}, user_id=${user_id}`);

  try {
    const { accountId, sdkKey } = getWingifySession(req);
    const wingifyClient = await getWingifyClient(accountId, sdkKey);
    const userContext = buildUserContext(user_id, user_type);

    await wingifyClient.trackEvent(event_key, userContext);
    await flushWingifyEvents(wingifyClient);

    return res.json({ success: true, event: event_key, user_id, environment });

  } catch (err) {
    console.error('[/api/track] Error:', err.message);
    return sendError(res, err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/simulate
// Body: { environment, scenario }
// Fires synthetic events for demo purposes — populates Wingify metrics dashboard
// ---------------------------------------------------------------------------
app.post('/api/simulate', async (req, res) => {
  const { environment = 'staging', scenario = 'high_engagement' } = req.body;

  logDebug(`[/api/simulate] scenario=${scenario}, env=${environment}`);

  const segments = ['new', 'standard', 'premium'];

  // Define what events each scenario fires per user
  const scenarios = {
    high_engagement: {
      new: ['loan_widget_interacted', 'loan_application_started'],
      standard: ['loan_widget_interacted', 'eligibility_threshold_met', 'loan_application_started'],
      premium: ['promo_clicked', 'loan_widget_interacted', 'loan_application_started', 'loan_application_completed'],
    },
    low_engagement: {
      new: ['promo_clicked'],
      standard: ['loan_widget_interacted','eligibility_threshold_met'],
      premium: ['promo_clicked', 'loan_widget_interacted','loan_application_started'],
    },
  };

  const eventMap = scenarios[scenario] || scenarios.high_engagement;

  try {
    const { accountId, sdkKey } = getWingifySession(req);
    const wingifyClient = await getWingifyClient(accountId, sdkKey);
    const results = [];
    const runId = Date.now();

    // Simulate 20 users — distribute across segments
    for (let i = 1; i <= 20; i++) {
      const segmentIndex = (i - 1) % 3;
      const userType = segments[segmentIndex];
      const userId = `sim_user_${runId}_${String(i).padStart(3, '0')}`;
      const userContext = buildUserContext(userId, userType);
      const events = eventMap[userType] || [];

      // MUST bucket the user first before tracking events
      await wingifyClient.getFlag('nova_dashboard', userContext);
      await wingifyClient.getFlag('loan_eligibility_algo', userContext);
       
      for (const eventKey of events) {
        try {
          await wingifyClient.trackEvent(eventKey, userContext);
          results.push({ userId, userType, eventKey, status: 'ok' });
          logDebug(`[Simulate] Tracked ${eventKey} for ${userId} (${userType})`);
        } catch (e) {
          results.push({ userId, userType, eventKey, status: 'error', error: e.message });
        }
      }
    }

    await flushWingifyEvents(wingifyClient);
    return res.json({
      success: true,
      scenario,
      environment,
      total_users: 20,
      total_events: results.filter(r => r.status === 'ok').length,
      results,
    });

  } catch (err) {
    console.error('[/api/simulate] Error:', err.message);
    return sendError(res, err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/health
// Simple health check — confirms server + Wingify connectivity
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ----------------
// cache refresh - POST http://localhost:3001/api/reset-cache
// ---------------------
app.post('/api/reset-cache', (req, res) => {
  clearClientCache();
  res.json({ success: true, message: 'Wingify client cache cleared' });
});

async function attachFrontend(httpServer) {
  if (process.env.VERCEL) return;

  if (process.env.npm_lifecycle_event === 'dev') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      configFile: path.resolve(__dirname, 'vite.config.mts'),
      server: {
        middlewareMode: true,
        hmr: { server: httpServer, overlay: false },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    return;
  }

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }
}

module.exports = app;

if (!process.env.VERCEL) {
  const httpServer = http.createServer(app);
  attachFrontend(httpServer)
    .then(() => {
      httpServer.listen(PORT, () => {
        console.log(`\n🏦 Nova Bank running on http://localhost:${PORT}`);
        console.log(`   UI + API share this port`);
        console.log(`   Health check: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.error('Failed to start Nova Bank:', err);
      process.exit(1);
    });
}
