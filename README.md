# FitPulse 💚

A beautiful, open-source Fitbit health dashboard. Better UI than the default app, runs entirely in your browser — no server required.

![FitPulse Dashboard](https://via.placeholder.com/1200x600/1D9E75/ffffff?text=FitPulse+Dashboard)

## Features

- **Activity** — steps, calories, active minutes with weekly charts
- **Heart** — resting HR, heart rate zones, HRV
- **Sleep** — sleep stages visualization, score, REM breakdown
- **Vitals** — SpO2, breathing rate, skin temperature
- **Body** — weight, BMI, body fat %
- **100% private** — data flows directly from Fitbit to your browser, never to any server

---

## Deploy in 5 minutes

### Step 1 — Fork this repo

Click **Fork** at the top right of this page.

### Step 2 — Enable GitHub Pages

1. Go to your fork's **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. The site will deploy automatically on every push to `main`

Your URL will be: `https://YOUR_USERNAME.github.io/fitpulse/`

### Step 3 — Create a Fitbit Developer App

1. Go to [dev.fitbit.com/apps/new](https://dev.fitbit.com/apps/new)
2. Sign in with your Fitbit account
3. Fill in the form:
   - **Application Name:** FitPulse
   - **OAuth 2.0 Application Type:** Personal
   - **Callback URL:** `https://YOUR_USERNAME.github.io/fitpulse/callback.html`
   - **Default Access Type:** Read Only
4. Copy your **Client ID** (e.g. `23ABCD`)

### Step 4 — Connect

Visit your site, paste your Client ID, and click **Connect with Fitbit**.

---

## Local development

No build step needed — it's plain HTML/CSS/JS.

```bash
git clone https://github.com/YOUR_USERNAME/fitpulse.git
cd fitpulse

# Serve locally (Python)
python3 -m http.server 8080

# Or with Node
npx serve .
```

Then open `http://localhost:8080`.

**Note:** For local OAuth to work, add `http://localhost:8080/callback.html` as a callback URL in your Fitbit developer app settings.

---

## Privacy

- No backend, no database, no analytics
- Your Fitbit access token is stored only in `sessionStorage` — cleared when you close the tab or click disconnect
- Source code is fully open — audit it yourself

---

## Tech stack

- Vanilla HTML / CSS / JavaScript — no framework, no build tools
- [Chart.js](https://chartjs.org) for charts
- Fitbit Web API with OAuth 2.0 PKCE (no client secret needed)
- GitHub Pages for hosting (free)

---

## License

MIT — do whatever you want with it.
