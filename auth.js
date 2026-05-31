// =========================================
//  FitPulse — Fitbit OAuth 2.0 PKCE Auth
// =========================================

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';

// Scopes we need
const SCOPES = [
  'activity', 'heartrate', 'sleep', 'weight',
  'profile', 'nutrition', 'oxygen_saturation',
  'temperature', 'respiratory_rate'
].join(' ');

// ---- PKCE Helpers ----

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const hash = await sha256(verifier);
  return base64urlencode(hash);
}

// ---- OAuth Flow ----

async function startOAuth() {
  const clientId = document.getElementById('clientId').value.trim();
  if (!clientId) {
    document.getElementById('clientId').style.borderColor = '#E24B4A';
    document.getElementById('clientId').focus();
    return;
  }
  document.getElementById('clientId').style.borderColor = '';

  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);
  const state = generateRandomString(16);

  // Persist for callback
  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('fitbit_client_id', clientId);

  const redirectUri = getRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    scope: SCOPES,
    state: state,
    redirect_uri: redirectUri
  });

  window.location.href = `${FITBIT_AUTH_URL}?${params}`;
}

function getRedirectUri() {
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  return base + 'callback.html';
}

// ---- Callback Handler ----

async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  const savedState = sessionStorage.getItem('oauth_state');
  const verifier = sessionStorage.getItem('pkce_verifier');
  const clientId = sessionStorage.getItem('fitbit_client_id');

  if (error) {
    showCallbackError(`Fitbit returned an error: ${error}. Please try again.`);
    return;
  }

  if (!code || !verifier || !clientId) {
    showCallbackError('Missing authorization data. Please start the login process again.');
    return;
  }

  if (state !== savedState) {
    showCallbackError('Security state mismatch. Please try logging in again.');
    return;
  }

  try {
    const redirectUri = getRedirectUri();

    const resp = await fetch(FITBIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        code_verifier: verifier,
        redirect_uri: redirectUri
      })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.errors?.[0]?.message || `Token exchange failed (${resp.status})`);
    }

    const data = await resp.json();

    // Store tokens
    sessionStorage.setItem('fitbit_access_token', data.access_token);
    if (data.refresh_token) sessionStorage.setItem('fitbit_refresh_token', data.refresh_token);
    sessionStorage.setItem('fitbit_user_id', data.user_id);
    sessionStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));

    // Clean up PKCE
    sessionStorage.removeItem('pkce_verifier');
    sessionStorage.removeItem('oauth_state');

    // Redirect to dashboard
    window.location.href = 'dashboard.html';

  } catch (err) {
    showCallbackError(err.message || 'Failed to exchange authorization code. Please try again.');
  }
}

function showCallbackError(msg) {
  const spinner = document.getElementById('spinner');
  const title = document.getElementById('cbTitle');
  const sub = document.getElementById('cbSub');
  const errBox = document.getElementById('cbError');
  const errMsg = document.getElementById('cbErrorMsg');
  const back = document.getElementById('cbBack');

  if (spinner) spinner.style.display = 'none';
  if (title) title.textContent = 'Connection failed';
  if (sub) sub.style.display = 'none';
  if (errBox) errBox.style.display = 'block';
  if (errMsg) errMsg.textContent = msg;
  if (back) back.style.display = 'inline-block';
}

// ---- Token Management ----

function getAccessToken() {
  return sessionStorage.getItem('fitbit_access_token');
}

function isLoggedIn() {
  const token = getAccessToken();
  const expiry = sessionStorage.getItem('token_expiry');
  if (!token) return false;
  if (expiry && Date.now() > parseInt(expiry)) return false;
  return true;
}

function disconnect() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// ---- Guard on dashboard ----
if (window.location.pathname.endsWith('dashboard.html')) {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

// ---- Theme toggle ----
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.body.classList.add(saved);
  }
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (btn && icon) {
    const isDark = document.body.classList.contains('dark') ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    btn.onclick = () => {
      const nowDark = document.body.classList.toggle('dark');
      document.body.classList.toggle('light', !nowDark);
      icon.className = nowDark ? 'fas fa-sun' : 'fas fa-moon';
      localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    };
  }
}

document.addEventListener('DOMContentLoaded', initTheme);
