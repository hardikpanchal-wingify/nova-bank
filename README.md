# Nova Bank

A neobank demo that evaluates Wingify Feature Experimentation flags on the server and renders a React dashboard. One Express app serves both the API and the UI.

```
nova-bank/
  app/
    server.js         Express API + static UI
    wingifyClient.js  Wingify Feature Experimentation client
    src/              React dashboard
    index.html
```

## Quick start (one server)

```bash
npm install
npm run build
npm start
```

Open the sample app from Wingify with an **AES-256-GCM** payload in the hash:

`http://localhost:3001/#p=BASE64URL_PAYLOAD`

Wingify encrypts `{ "accountId", "prod", "staging", "dev" }` with the same secret as `app/launchSecret.js` (`WINGIFY_LAUNCH_SECRET`). Layout: `base64url(iv[12] || ciphertext || authTag[16])`. Key is `SHA-256(secret)`. This app decrypts on the server, then clears the URL.

Generate a launch URL:

```bash
node app/launchCrypto.js --accountId ID --prod PROD_KEY --staging STAGING_KEY --dev DEV_KEY --origin http://localhost:3001
```

If `p` is missing or invalid, the app shows: **Please access this app from Logged In FE Sample App workspace account.**

## Local development (hot reload)

```bash
npm install
npm run dev
```

This starts one process on port `3001` with the API and the React UI (Vite hot reload). Open [http://localhost:3001](http://localhost:3001).

| Script | What it does |
| --- | --- |
| `npm run dev` | One server on port 3001: API + UI with hot reload |
| `npm run build` | Build the UI into `app/dist` |
| `npm start` | One Node process: API + static UI |
| `npm test` | UI unit tests |

## API

### `GET /api/health`
Confirms the server is running.

### `GET /api/features`
Evaluates Wingify flags for a user.

Query params: `user_type` (`new` \| `standard` \| `premium`), `environment`, `user_id`.

### `POST /api/track`
Tracks a named business event in Wingify.

Valid event keys: `promo_clicked`, `loan_widget_interacted`, `loan_application_started`, `loan_application_completed`, `eligibility_threshold_met`.

### `POST /api/simulate`
Fires synthetic events across 20 users to populate Wingify metrics. Body: `{ "environment": "staging", "scenario": "high_engagement" }`.

### `POST /api/reset-cache`
Clears the in-memory Wingify client cache.

## Deploy on Vercel

Yes. The UI is a static Vite build (`app/dist`). The Express API (`/api/launch`, `/api/features`, `/api/track`, `/api/simulate`) runs as one serverless function (`api/index.js`).

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new), or from the project root run:

```bash
npx vercel
npx vercel --prod
```

2. Leave Root Directory as the repo root. `vercel.json` already sets the build command (`npm run build`) and output directory (`app/dist`).

3. Optional: in Vercel Project Settings → Environment Variables, set `WINGIFY_LAUNCH_SECRET` to the same value as Wingify (otherwise the default in `app/launchSecret.js` is used).

4. Open the app from Wingify with the **production origin**:

`https://YOUR_PROJECT.vercel.app/#p=BASE64URL_PAYLOAD`

Generate that URL with:

```bash
node app/launchCrypto.js --accountId ID --prod PROD_KEY --staging STAGING_KEY --dev DEV_KEY --origin https://YOUR_PROJECT.vercel.app
```

`POST /api/simulate` can take longer than the 10s Hobby limit. Use a Pro plan (this project sets `maxDuration` to 60s) or skip Simulate on Hobby.

The Node SDK is [`wingify-fme-node-sdk`](https://developers.wingify.com/v3/docs/fme-node).
