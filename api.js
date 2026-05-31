// =========================================
//  FitPulse — Fitbit API Wrapper
// =========================================

const FITBIT_API = 'https://api.fitbit.com';

async function fitbitFetch(endpoint) {
  const token = getAccessToken();
  const resp = await fetch(`${FITBIT_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (resp.status === 401) {
    disconnect();
    throw new Error('Session expired. Please reconnect.');
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.errors?.[0]?.message || `API error ${resp.status}`);
  }

  return resp.json();
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function nDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ---- Fetch Functions ----

async function fetchProfile() {
  return fitbitFetch('/1/user/-/profile.json');
}

async function fetchTodayActivity() {
  return fitbitFetch(`/1/user/-/activities/date/${todayStr()}.json`);
}

async function fetchWeeklySteps() {
  return fitbitFetch(`/1/user/-/activities/steps/date/${nDaysAgo(6)}/${todayStr()}.json`);
}

async function fetchWeeklyCalories() {
  return fitbitFetch(`/1/user/-/activities/calories/date/${nDaysAgo(6)}/${todayStr()}.json`);
}

async function fetchHeartRate() {
  return fitbitFetch(`/1/user/-/activities/heart/date/${todayStr()}/1d.json`);
}

async function fetchSleep() {
  return fitbitFetch(`/1.2/user/-/sleep/date/${todayStr()}.json`);
}

async function fetchWeight() {
  return fitbitFetch(`/1/user/-/body/log/weight/date/${todayStr()}.json`);
}

async function fetchBodyFat() {
  return fitbitFetch(`/1/user/-/body/log/fat/date/${todayStr()}.json`);
}

async function fetchSpO2() {
  // Daily summary
  return fitbitFetch(`/1/user/-/spo2/date/${todayStr()}.json`).catch(() => null);
}

async function fetchBreathingRate() {
  return fitbitFetch(`/1/user/-/br/date/${todayStr()}.json`).catch(() => null);
}

async function fetchSkinTemp() {
  return fitbitFetch(`/1/user/-/temp/skin/date/${todayStr()}.json`).catch(() => null);
}

async function fetchHRV() {
  return fitbitFetch(`/1/user/-/hrv/date/${todayStr()}.json`).catch(() => null);
}

// ---- Aggregate loader ----

async function fetchAllData() {
  const [
    profile, activity, weekSteps, weekCals,
    heartRate, sleep, weight, bodyFat,
    spo2, breathing, skinTemp, hrv
  ] = await Promise.allSettled([
    fetchProfile(),
    fetchTodayActivity(),
    fetchWeeklySteps(),
    fetchWeeklyCalories(),
    fetchHeartRate(),
    fetchSleep(),
    fetchWeight(),
    fetchBodyFat(),
    fetchSpO2(),
    fetchBreathingRate(),
    fetchSkinTemp(),
    fetchHRV()
  ]);

  const get = r => r.status === 'fulfilled' ? r.value : null;

  return {
    profile: get(profile),
    activity: get(activity),
    weekSteps: get(weekSteps),
    weekCals: get(weekCals),
    heartRate: get(heartRate),
    sleep: get(sleep),
    weight: get(weight),
    bodyFat: get(bodyFat),
    spo2: get(spo2),
    breathing: get(breathing),
    skinTemp: get(skinTemp),
    hrv: get(hrv)
  };
}
