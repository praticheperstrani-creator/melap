// ---- City coordinates for real distance calculation ----
const CITY_COORDS = {
  Milan: { lat: 45.4642, lon: 9.1900 },
  Turin: { lat: 45.0703, lon: 7.6869 },
  Bologna: { lat: 44.4949, lon: 11.3426 },
  Rome: { lat: 41.9028, lon: 12.4964 },
  Florence: { lat: 43.7696, lon: 11.2558 },
  Barcelona: { lat: 41.3851, lon: 2.1734 },
  Lisbon: { lat: 38.7223, lon: -9.1393 },
  Madrid: { lat: 40.4168, lon: -3.7038 }
};

function toRad(value) { return (value * Math.PI) / 180; }

function calculateDistance(fromCity, toCity) {
  const a = CITY_COORDS[fromCity];
  const b = CITY_COORDS[toCity];
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return Math.round(R * c * 10) / 10;
}

// ---- Multicultural profile data ----
const PROFILES = [
  { name: 'Luca', age: 27, gender: 'Man', city: 'Milan', category: 'fitness', interests: ['Fitness', 'Morning walks', 'Brunch'] },
  { name: 'Aarav', age: 31, gender: 'Man', city: 'Rome', category: 'food', interests: ['Food', 'Cafe hopping', 'Weekends'] },
  { name: 'Simran', age: 25, gender: 'Woman', city: 'Florence', category: 'music', interests: ['Music', 'Live gigs', 'Night outings'] },
  { name: 'Marco', age: 29, gender: 'Man', city: 'Turin', category: 'nature', interests: ['Nature', 'Hikes', 'Photography'] },
  { name: 'Harleen', age: 26, gender: 'Woman', city: 'Bologna', category: 'night', interests: ['Night outs', 'Movies', 'Cocktails'] },
  { name: 'Daniel', age: 30, gender: 'Man', city: 'Milan', category: 'fitness', interests: ['Fitness', 'Football', 'Aperitivo'] },
  { name: 'Navneet', age: 28, gender: 'Woman', city: 'Rome', category: 'food', interests: ['Food', 'Street markets', 'Wine nights'] },
  { name: 'Gurpreet', age: 32, gender: 'Woman', city: 'Barcelona', category: 'nature', interests: ['Nature', 'Treks', 'Relax'] },
  { name: 'Oliver', age: 27, gender: 'Man', city: 'Milan', category: 'music', interests: ['Coffee', 'Live music', 'City walks'] },
  { name: 'Jaskirat', age: 24, gender: 'Woman', city: 'Barcelona', category: 'night', interests: ['Beach', 'Sunset', 'Travel'] }
];

// ---- App state ----
const state = {
  city: 'Milan',
  filter: 'all',
  isPremium: false,
  userGender: null,
  plan: null, // 'men-monthly' | 'men-yearly' | 'women-free'
  subscriptionCancelled: false,
  token: localStorage.getItem('melapSessionToken')
};

async function apiRequest(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

const PLAN_LABELS = {
  'men-monthly': 'Premium monthly – €4.99/month',
  'men-yearly': 'Premium yearly – €29.99/year',
  'women-free': 'Premium – free for 1 year'
};

let currentLanguage = 'en';

const ITALIAN_PROFILE_TEXT = {
  'Morning walks': 'Passeggiate mattutine',
  'Food': 'Cibo',
  'Cafe hopping': 'Tour dei caffè',
  'Weekends': 'Fine settimana',
  'Music': 'Musica',
  'Live gigs': 'Concerti dal vivo',
  'Night outings': 'Uscite serali',
  'Nature': 'Natura',
  'Hikes': 'Escursioni',
  'Photography': 'Fotografia',
  'Night outs': 'Serate',
  'Movies': 'Cinema',
  'Cocktails': 'Cocktail',
  'Football': 'Calcio',
  'Street markets': 'Mercati di strada',
  'Wine nights': 'Serate vino',
  'Treks': 'Trekking',
  'Relax': 'Relax',
  'Coffee': 'Caffè',
  'Live music': 'Musica dal vivo',
  'City walks': 'Passeggiate in città',
  'Beach': 'Spiaggia',
  'Sunset': 'Tramonto',
  'Travel': 'Viaggi'
};

const PROFILE_TEXT = {
  it: ITALIAN_PROFILE_TEXT,
  hi: { Fitness: 'फिटनेस', Brunch: 'ब्रंच', Aperitivo: 'एपेरिटिवो', 'Morning walks': 'सुबह की सैर', Food: 'खाना', 'Cafe hopping': 'कैफे घूमना', Weekends: 'सप्ताहांत', Music: 'संगीत', 'Live gigs': 'लाइव संगीत', 'Night outings': 'रात की सैर', Nature: 'प्रकृति', Hikes: 'पैदल यात्रा', Photography: 'फोटोग्राफी', 'Night outs': 'रात की सैर', Movies: 'फिल्में', Cocktails: 'कॉकटेल', Football: 'फुटबॉल', 'Street markets': 'स्ट्रीट मार्केट', 'Wine nights': 'वाइन नाइट्स', Treks: 'ट्रेकिंग', Relax: 'आराम', Coffee: 'कॉफी', 'Live music': 'लाइव संगीत', 'City walks': 'शहर की सैर', Beach: 'समुद्र तट', Sunset: 'सूर्यास्त', Travel: 'यात्रा' },
  pa: { Fitness: 'ਫਿਟਨਸ', Brunch: 'ਬ੍ਰੰਚ', Aperitivo: 'ਏਪੇਰਿਤੀਵੋ', 'Morning walks': 'ਸਵੇਰ ਦੀ ਸੈਰ', Food: 'ਖਾਣਾ', 'Cafe hopping': 'ਕੈਫੇ ਘੁੰਮਣਾ', Weekends: 'ਵੀਕਐਂਡ', Music: 'ਸੰਗੀਤ', 'Live gigs': 'ਲਾਈਵ ਸੰਗੀਤ', 'Night outings': 'ਰਾਤ ਦੀ ਸੈਰ', Nature: 'ਕੁਦਰਤ', Hikes: 'ਹਾਈਕਿੰਗ', Photography: 'ਫੋਟੋਗ੍ਰਾਫੀ', 'Night outs': 'ਰਾਤ ਦੀਆਂ ਸੈਰਾਂ', Movies: 'ਫਿਲਮਾਂ', Cocktails: 'ਕਾਕਟੇਲ', Football: 'ਫੁਟਬਾਲ', 'Street markets': 'ਸਟ੍ਰੀਟ ਮਾਰਕੀਟਾਂ', 'Wine nights': 'ਵਾਈਨ ਨਾਈਟਸ', Treks: 'ਟ੍ਰੈਕਿੰਗ', Relax: 'ਆਰਾਮ', Coffee: 'ਕੌਫੀ', 'Live music': 'ਲਾਈਵ ਸੰਗੀਤ', 'City walks': 'ਸ਼ਹਿਰ ਦੀ ਸੈਰ', Beach: 'ਸਮੁੰਦਰੀ ਤਟ', Sunset: 'ਸੂਰਜ ਡੁੱਬਣਾ', Travel: 'ਯਾਤਰਾ' }
};

function renderProfiles() {
  const grid = document.getElementById('profiles');
  const gate = document.getElementById('premiumGate');
  if (!grid) return;
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const visibleGender = state.userGender === 'Man'
    ? 'Woman'
    : state.userGender === 'Woman'
      ? 'Man'
      : null;
  const filtered = PROFILES.filter((profile) =>
    (state.filter === 'all' || profile.category === state.filter) &&
    (!visibleGender || profile.gender === visibleGender)
  );

  grid.innerHTML = filtered.map((profile) => {
    const distance = calculateDistance(state.city, profile.city);
    const lockedClass = state.isPremium ? '' : 'locked';
    return `
      <article class="profile-card ${lockedClass}">
        <div class="profile-head">
          <div class="profile-id">
            <div class="avatar">${profile.name[0]}</div>
            <h3>${profile.name}, ${profile.age}</h3>
          </div>
          <span class="badge">${t.profileNearby}</span>
        </div>
        <p>📍 ${profile.city} • ${distance.toFixed(1)} km</p>
        <div class="interests">${profile.interests.map((interest) => `<span>${PROFILE_TEXT[currentLanguage]?.[interest] || interest}</span>`).join('')}</div>
        <button class="btn btn-primary connect-btn" type="button" ${state.isPremium ? '' : 'disabled'}>${t.connect}</button>
      </article>
    `;
  }).join('');

  if (gate) gate.classList.toggle('hidden', state.isPremium);
  bindConnectButtons();
}

function bindConnectButtons() {
  document.querySelectorAll('.connect-btn').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      if (!state.isPremium) return;
      const card = button.closest('.profile-card');
      const name = card.querySelector('h3').textContent;
      sendConnectionRequest(name, button);
    });
  });
}

// ---- Filters ----
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    renderProfiles();
  });
});

const citySelect = document.getElementById('citySelect');
if (citySelect) {
  citySelect.addEventListener('change', () => {
    state.city = citySelect.value;
    renderProfiles();
  });
}

const findNearMeBtn = document.getElementById('findNearMeBtn');
if (findNearMeBtn) {
  findNearMeBtn.addEventListener('click', () => {
    renderProfiles();
  });
}

// ---- Premium / pricing logic ----
// Rule: registration is free for everyone.
// Viewing nearby friends requires Premium.
// Men: €4.99/month or €29.99/year. Women: free for 1 year.
function setPremiumStatus(message) {
  const status = document.getElementById('premiumStatus');
  if (status) status.textContent = message;
}

function renderSubscriptionManager() {
  const manager = document.getElementById('subscriptionManager');
  const planLabel = document.getElementById('subscriptionPlanLabel');
  const cancelNotice = document.getElementById('subscriptionCancelNotice');
  const cancelBtn = document.getElementById('cancelSubscriptionBtn');
  if (!manager) return;

  manager.classList.toggle('hidden', !state.isPremium || !state.plan);
  if (planLabel) planLabel.textContent = state.plan ? `Current plan: ${PLAN_LABELS[state.plan]}` : '';

  if (cancelNotice) {
    cancelNotice.classList.toggle('hidden', !state.subscriptionCancelled);
    cancelNotice.textContent = 'Subscription cancelled. You keep access until the end of this billing period, then it will not renew next month.';
  }

  if (cancelBtn) {
    const isFreePlan = state.plan === 'women-free';
    cancelBtn.disabled = state.subscriptionCancelled || !state.plan;
    cancelBtn.textContent = state.subscriptionCancelled
      ? 'Cancellation scheduled'
      : isFreePlan
        ? 'Cancel free Premium from next month'
        : 'Cancel subscription from next month';
  }
}

document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', async () => {
  if (!state.plan || state.subscriptionCancelled) return;
  try {
    await apiRequest('/api/subscriptions/cancel', { method: 'POST' });
    state.subscriptionCancelled = true;
    setPremiumStatus('Your subscription will be cancelled starting next month. You keep Premium access until then.');
    renderSubscriptionManager();
  } catch (error) {
    setPremiumStatus(error.message);
  }
});

let selectedCheckoutPlan = null;

function activatePremiumPlan(plan) {
  state.plan = plan;
  state.subscriptionCancelled = false;
  if (plan === 'men-monthly') {
    state.userGender = 'Man';
    state.isPremium = true;
    setPremiumStatus('Premium activated for men: €4.99/month. You can now see nearby friends.');
  } else if (plan === 'men-yearly') {
    state.userGender = 'Man';
    state.isPremium = true;
    setPremiumStatus('Premium activated for men: €29.99/year. You can now see nearby friends.');
  } else if (plan === 'women-free') {
    state.userGender = 'Woman';
    state.isPremium = true;
    setPremiumStatus('Premium activated for women: free for 1 year. You can now see nearby friends.');
  }
  renderProfiles();
  renderSubscriptionManager();
}

document.querySelectorAll('[data-upgrade]').forEach((button) => {
  button.addEventListener('click', () => {
    const plan = button.dataset.upgrade;
    if (plan === 'women-free') {
      activatePremiumPlan(plan);
      document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    selectedCheckoutPlan = plan;
    const checkoutSummary = document.getElementById('checkoutPlanSummary');
    if (checkoutSummary) checkoutSummary.textContent = plan === 'men-monthly'
      ? 'Premium monthly: €4.99/month, charged automatically each month.'
      : 'Premium yearly: €29.99/year, charged automatically each year.';
    openModal(checkoutModal);
  });
});

document.querySelectorAll('[data-open-pricing]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  });
});

// When signup completes, auto-apply the gender-based premium rule.
function applyGenderPremiumRule(gender) {
  state.userGender = gender;
  if (gender === 'Woman') {
    state.isPremium = true;
    state.plan = 'women-free';
    state.subscriptionCancelled = false;
    setPremiumStatus('Welcome! As a woman, your first year of Premium is free — you can see nearby friends right away.');
  } else if (gender === 'Man') {
    state.isPremium = false;
    state.plan = null;
    state.subscriptionCancelled = false;
    setPremiumStatus('Registration complete. To see nearby friends, activate Premium: €4.99/month or €29.99/year.');
  }
  renderProfiles();
  renderSubscriptionManager();
}

// ---- Signup modal ----
const signupModal = document.getElementById('signupModal');
const loginModal = document.getElementById('loginModal');
const privacyModal = document.getElementById('privacyModal');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');

function openModal(modal) { modal?.classList.remove('hidden'); }
function closeModal(modal) { modal?.classList.add('hidden'); }

document.querySelectorAll('[data-signup-open]').forEach((btn) => btn.addEventListener('click', () => openModal(signupModal)));
document.querySelectorAll('[data-login-open]').forEach((btn) => btn.addEventListener('click', () => openModal(loginModal)));
document.querySelectorAll('[data-close-signup]').forEach((el) => el.addEventListener('click', () => closeModal(signupModal)));
document.querySelectorAll('[data-close-login]').forEach((el) => el.addEventListener('click', () => closeModal(loginModal)));
document.querySelectorAll('[data-close-checkout]').forEach((el) => el.addEventListener('click', () => closeModal(checkoutModal)));
document.querySelectorAll('[data-open-privacy]').forEach((el) => el.addEventListener('click', (event) => {
  event.preventDefault();
  openModal(privacyModal);
}));
document.querySelectorAll('[data-close-privacy]').forEach((el) => el.addEventListener('click', () => closeModal(privacyModal)));
signupModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(signupModal));
loginModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(loginModal));
privacyModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(privacyModal));
checkoutModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(checkoutModal));

if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedCheckoutPlan) return;
    const status = document.getElementById('checkoutStatus');
    try {
      const result = await apiRequest('/api/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedCheckoutPlan })
      });
      if (status) status.textContent = 'Redirecting to secure Stripe checkout...';
      window.location.href = result.url;
    } catch (error) {
      if (status) status.textContent = error.message === 'Authentication required.'
        ? 'Log in with OTP before activating Premium.'
        : error.message;
    }
  });
}

// ---- Resume Stripe Checkout after redirect back from Stripe ----
async function confirmStripeCheckoutFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const checkoutResult = params.get('checkout');
  const sessionId = params.get('session_id');
  if (checkoutResult !== 'success' || !sessionId || !state.token) return;

  try {
    const result = await apiRequest('/api/checkout/confirm', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
    activatePremiumPlan(result.plan);
    setPremiumStatus('Payment confirmed with Stripe. Premium is now active.');
  } catch (error) {
    setPremiumStatus(error.message);
  } finally {
    params.delete('checkout');
    params.delete('session_id');
    const cleanQuery = params.toString();
    window.history.replaceState({}, document.title, window.location.pathname + (cleanQuery ? `?${cleanQuery}` : ''));
  }
}

confirmStripeCheckoutFromUrl();

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(signupForm);
    const fullName = formData.get('fullName');
    const gender = formData.get('genderIdentity');
    const consentGiven = formData.get('privacyConsent');
    const status = signupForm.querySelector('.signup-status');
    if (!consentGiven) {
      if (status) status.textContent = 'You must accept the Privacy Policy and Terms to create your profile (GDPR requirement).';
      return;
    }
    try {
      const result = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email: formData.get('email'),
          city: formData.get('city'),
          gender,
          privacyConsent: true
        })
      });
      if (status) status.textContent = `Welcome ${result.user.fullName}! Your profile was created. Log in by email to continue.`;
      applyGenderPremiumRule(gender);
    } catch (error) {
      if (status) status.textContent = error.message;
    }
  });
}

// ---- GDPR cookie consent banner ----
const cookieBanner = document.getElementById('cookieConsentBanner');
const COOKIE_CONSENT_KEY = 'melapCookieConsent';

function showCookieBannerIfNeeded() {
  if (!cookieBanner) return;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) cookieBanner.classList.remove('hidden');
}

document.getElementById('cookieAcceptBtn')?.addEventListener('click', () => {
  localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
  cookieBanner?.classList.add('hidden');
});

document.getElementById('cookieRejectBtn')?.addEventListener('click', () => {
  localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected-non-essential');
  cookieBanner?.classList.add('hidden');
});

showCookieBannerIfNeeded();

// ---- Login / OTP flow ----
const sendOtpBtn = document.getElementById('sendOtpBtn');
const loginForm = document.getElementById('loginForm');

if (sendOtpBtn) {
  sendOtpBtn.addEventListener('click', async () => {
    const email = loginForm.querySelector('input[name="loginEmail"]').value.trim();
    const status = loginForm.querySelector('.login-status');
    if (!email) {
      if (status) status.textContent = 'Please enter your email first.';
      return;
    }
    try {
      const result = await apiRequest('/api/otp/request', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      const developmentHint = result.developmentCode ? ` Development code: ${result.developmentCode}` : '';
      if (status) status.textContent = `OTP sent to ${email}. It expires in ${result.expiresInMinutes} minutes.${developmentHint}`;
    } catch (error) {
      if (status) status.textContent = error.message;
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginForm.querySelector('input[name="loginEmail"]').value.trim();
    const code = loginForm.querySelector('input[name="otpCode"]').value.trim();
    const status = loginForm.querySelector('.login-status');
    try {
      const result = await apiRequest('/api/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });
      state.token = result.token;
      state.userGender = result.user.gender;
      state.isPremium = result.premium;
      localStorage.setItem('melapSessionToken', result.token);
      if (status) status.textContent = `Access granted. Welcome back, ${result.user.full_name}.`;
      renderProfiles();
      closeModal(loginModal);
    } catch (error) {
      if (status) status.textContent = error.message;
    }
  });
}

// ---- Connection requests (mutual confirmation before chat) ----
const requestsWrap = document.querySelector('.melap-requests');
const chatPanel = document.getElementById('melapChatPanel');
const chatLog = chatPanel?.querySelector('.melap-message-log');
const chatInput = chatPanel?.querySelector('input');
const chatSendBtn = chatPanel?.querySelector('.melap-send-btn');

function enableMessaging(name) {
  chatPanel.classList.add('visible');
  chatInput.disabled = false;
  chatInput.placeholder = `Message ${name}`;
  chatSendBtn.disabled = false;
  chatLog.innerHTML = `<div class="melap-message them">Mutual confirmation complete with ${name}. You can now message.</div>`;
}

function sendConnectionRequest(name, button) {
  if (button.dataset.requestSent === 'true') return;
  button.dataset.requestSent = 'true';
  button.textContent = 'Request sent';
  button.disabled = true;

  const existing = [...requestsWrap.querySelectorAll('.melap-request-row')].find((row) => row.dataset.user === name);
  if (existing) return;

  const row = document.createElement('div');
  row.className = 'melap-request-row';
  row.dataset.user = name;
  row.innerHTML = `
    <div class="melap-request-meta">
      <strong>${name}</strong>
      <span class="melap-request-status">Waiting for mutual confirmation</span>
    </div>
    <button type="button" class="melap-confirm-btn">Confirm</button>
  `;
  row.querySelector('.melap-confirm-btn').addEventListener('click', () => {
    row.querySelector('.melap-request-status').textContent = 'Mutual confirmation complete';
    const confirmBtn = row.querySelector('.melap-confirm-btn');
    confirmBtn.textContent = 'Confirmed';
    confirmBtn.disabled = true;
    enableMessaging(name);
  });
  requestsWrap.appendChild(row);
}

// ---- Phone number blocking filter (English, Italian, Hindi, Punjabi — script + Latin transliteration) ----
const NUMBER_WORDS = new Set([
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove',
  'shunya', 'ek', 'do', 'teen', 'chaar', 'char', 'panch', 'cheh', 'che', 'saat', 'sat', 'aath', 'ath', 'nau',
  'sunya', 'ik', 'tin', 'chhe'
]);

function normalizeMessage(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[,.;:!?()[\]{}#@%+\-_=/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsPhoneNumber(rawMessage) {
  const text = normalizeMessage(rawMessage);
  if (!text) return false;

  // Direct keyword hits in any supported language / script.
  const keywordPattern = /(tel|telefono|phone|फोन|मोबाइल|ਨੰਬਰ|number|numero|número|फ़ोन|ਮੋਬਾਈਲ|call me|callme|mobile)/i;
  if (keywordPattern.test(text)) return true;

  // Native scripts: Hindi and Punjabi digits/words.
  const nativeScriptPattern = /[०-९]|[੦-੯]|शून्य|एक|दो|तीन|चार|पाँच|छह|सात|आठ|नौ|ਸੂਨਯ|ਇੱਕ|ਦੋ|ਤਿੰਨ|ਚਾਰ|ਪੰਜ|ਛੇ|ਸੱਤ|ਅੱਠ|ਨੌ/;
  if (nativeScriptPattern.test(rawMessage || '')) return true;

  const digitsOnly = text.replace(/\D/g, '');
  if (digitsOnly.length >= 7) return true;

  const tokens = text.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (/\d/.test(token)) score += 1;
    if (NUMBER_WORDS.has(token)) score += 1;
  }
  return score >= 7;
}

if (chatSendBtn && chatInput) {
  chatSendBtn.addEventListener('click', () => {
    const value = chatInput.value.trim();
    if (!value) return;
    const notice = document.getElementById('melapPhoneRuleNotice');
    if (containsPhoneNumber(value)) {
      if (notice) notice.textContent = 'Message blocked: phone numbers are not allowed in Italian, Hindi, Punjabi, English or any supported language.';
      chatInput.value = '';
      return;
    }
    if (notice) notice.textContent = 'Phone numbers are not allowed in messages.';
    const msg = document.createElement('div');
    msg.className = 'melap-message me';
    msg.textContent = value;
    chatLog.appendChild(msg);
    chatInput.value = '';
  });

  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') chatSendBtn.click();
  });
}

// ---- Language translation ----
const TRANSLATIONS = {
  en: {
    navDiscover: 'Discover', navEvents: 'Events', navCommunity: 'Community', navPricing: 'Pricing',
    login: 'Login', signup: 'Sign up',
    signupEyebrow: 'Join Melāp', signupTitle: 'Create your profile', signupName: 'Full name', signupEmail: 'Email', signupCity: 'City', signupGender: 'Gender', signupSubmit: 'Join now',
    loginEyebrow: 'Welcome back', loginTitle: 'Log in with OTP', loginSend: 'Send OTP', loginVerify: 'Verify & access', loginEmail: 'Email', loginOtp: 'One-time password',
    heroEyebrow: 'Meet real people near you', heroTitle: 'Find new friends around you and make unforgettable memories together.', heroText: 'Join local meetups, spontaneous outings, and events around your city. Discover people with similar interests and enjoy easy, meaningful connections.', location: 'Your location', findNearMe: 'Find near me', howItWorks: 'How it works', activeUsers: 'active users', eventsMonth: 'events/month', rating: 'rating', visualBio: 'Love for morning walks & brunch', discoverEyebrow: 'Search by interest', discoverTitle: 'Meet people who match your vibe in your neighbourhood.', filterAll: 'All', filterFood: 'Food', filterMusic: 'Music', filterNature: 'Nature', filterNight: 'Night out', unlockTitle: 'Unlock nearby friends', unlockText: "Upgrade to Premium to see who's nearby and connect with them.", seePlans: 'See Premium plans', profileNearby: 'Nearby', connect: 'Connect', membership: 'Membership', pricingTitle: "Free to join. Premium unlocks who's nearby.", pricingNote: 'Registration is always free for everyone. To view and connect with people nearby, activate Premium.', everyone: 'Everyone', freeAccount: 'Free account', freeProfile: 'Create free profile', men: 'Men', premiumMen: 'Premium for men', yearly: 'or €29.99/year', women: 'Women', premiumWomen: 'Premium for women', freeYear: 'Free / 1 year', automatic: 'Automatically applied', seeNearby: "See who's nearby", sendRequests: 'Send connection requests', unlockChat: 'Unlock mutual-confirmation chat', monthlyButton: 'Get monthly - €4.99', yearlyButton: 'Get yearly - €29.99', freeYearButton: 'Activate free year', subscription: 'Your subscription', cancelSubscription: 'Cancel subscription from next month', cancellationScheduled: 'Cancellation scheduled', featured: 'Featured', eventsTitle: 'Weekend events and hangouts', eventOne: 'Morning Run & Chai', eventOneText: 'Join a quick run, stretch together, and enjoy chai with new friends nearby.', eventTwo: 'Street Food Walk', eventTwoText: 'Explore local food stalls, try Punjabi favourites, and meet people over snacks.', eventThree: 'Live Jam Night', eventThreeText: 'Meet music lovers, sing along, and enjoy an easygoing evening with your city crew.', people: 'people', communityTitle: 'We bring you people near you who share your energy and interests.', communityOne: 'Create your profile with your hobbies and availability.', communityTwo: 'Browse local events and send quick requests to join.', communityThree: 'Plan simple, natural meetups that feel safe and fun.', tryFree: 'Try for free', ctaTitle: 'Start meeting new people in your city today.', connectionRequests: 'Connection requests', chatTitle: 'Chat unlocked after mutual confirmation', chatWaiting: 'Both users must confirm before messaging is available.', chatPlaceholder: 'Message opens only after both confirm', send: 'Send', phoneNotice: 'Phone numbers are not allowed in messages.', privacyTitle: 'Privacy Policy & GDPR', privacyEyebrow: 'Your data, your rights', close: 'Close', cookieText: 'We use cookies and process personal data in line with the GDPR to run Melāp and improve your experience.', learnMore: 'Learn more', rejectCookies: 'Reject non-essential', acceptCookies: 'Accept all', footer: 'Connect with your local community.', checkoutEyebrow: 'Secure checkout', checkoutTitle: 'Complete your Premium subscription', paymentMethod: 'Payment method', billingEmail: 'Billing email', recurringConsent: 'I understand this subscription renews automatically until I cancel it. I can cancel renewal at any time from my subscription settings.', paySecurely: 'Pay securely'
  },
  it: {
    navDiscover: 'Scopri', navEvents: 'Eventi', navCommunity: 'Community', navPricing: 'Prezzi',
    login: 'Accedi', signup: 'Iscriviti',
    signupEyebrow: 'Unisciti a Melāp', signupTitle: 'Crea il tuo profilo', signupName: 'Nome completo', signupEmail: 'Email', signupCity: 'Città', signupGender: 'Genere', signupSubmit: 'Iscriviti ora',
    loginEyebrow: 'Bentornato', loginTitle: 'Accedi con OTP', loginSend: 'Invia OTP', loginVerify: 'Verifica e accedi', loginEmail: 'Email', loginOtp: 'Password monouso',
    heroEyebrow: 'Incontra persone vere vicino a te', heroTitle: 'Trova nuovi amici vicino a te e crea ricordi indimenticabili insieme.', heroText: 'Partecipa a incontri locali, uscite spontanee ed eventi nella tua città. Scopri persone con i tuoi stessi interessi e crea connessioni autentiche.', location: 'La tua posizione', findNearMe: 'Cerca vicino a me', howItWorks: 'Come funziona', activeUsers: 'utenti attivi', eventsMonth: 'eventi/mese', rating: 'valutazione', visualBio: 'Amo le passeggiate mattutine e il brunch', discoverEyebrow: 'Cerca per interesse', discoverTitle: 'Incontra persone nella tua zona che condividono le tue passioni.', filterAll: 'Tutti', filterFood: 'Cibo', filterMusic: 'Musica', filterNature: 'Natura', filterNight: 'Serate', unlockTitle: 'Sblocca gli amici nelle vicinanze', unlockText: 'Passa a Premium per vedere chi è vicino a te e metterti in contatto.', seePlans: 'Vedi i piani Premium', profileNearby: 'Vicino a te', connect: 'Connetti', membership: 'Abbonamento', pricingTitle: 'Iscrizione gratuita. Premium sblocca chi è vicino a te.', pricingNote: 'La registrazione è gratuita per tutti. Per vedere e contattare persone vicine, attiva Premium.', everyone: 'Tutti', freeAccount: 'Account gratuito', freeProfile: 'Crea profilo gratuito', men: 'Uomini', premiumMen: 'Premium per uomini', yearly: 'oppure €29,99/anno', women: 'Donne', premiumWomen: 'Premium per donne', freeYear: 'Gratis / 1 anno', automatic: 'Applicato automaticamente', seeNearby: 'Vedi chi è vicino a te', sendRequests: 'Invia richieste di connessione', unlockChat: 'Sblocca la chat dopo conferma reciproca', monthlyButton: 'Piano mensile - €4,99', yearlyButton: 'Piano annuale - €29,99', freeYearButton: 'Attiva un anno gratuito', subscription: 'Il tuo abbonamento', cancelSubscription: 'Annulla l’abbonamento dal mese successivo', cancellationScheduled: 'Annullamento programmato', featured: 'In evidenza', eventsTitle: 'Eventi e uscite del fine settimana', eventOne: 'Corsa mattutina e Chai', eventOneText: 'Partecipa a una corsa leggera, fai stretching e gusta un chai con nuovi amici vicini.', eventTwo: 'Passeggiata tra lo street food', eventTwoText: 'Scopri gli stand gastronomici locali, prova specialità punjabi e conosci nuove persone.', eventThree: 'Serata jam dal vivo', eventThreeText: 'Incontra amanti della musica, canta e passa una serata rilassata con la tua città.', people: 'persone', communityTitle: 'Ti avviciniamo a persone vicino a te che condividono la tua energia e i tuoi interessi.', communityOne: 'Crea il tuo profilo con hobby e disponibilità.', communityTwo: 'Sfoglia gli eventi locali e invia richieste rapide per partecipare.', communityThree: 'Organizza incontri semplici, naturali, sicuri e divertenti.', tryFree: 'Prova gratis', ctaTitle: 'Inizia oggi a conoscere nuove persone nella tua città.', connectionRequests: 'Richieste di connessione', chatTitle: 'Chat sbloccata dopo la conferma reciproca', chatWaiting: 'Entrambi gli utenti devono confermare prima di poter chattare.', chatPlaceholder: 'La chat si apre dopo entrambe le conferme', send: 'Invia', phoneNotice: 'I numeri di telefono non sono consentiti nei messaggi.', privacyTitle: 'Informativa sulla privacy e GDPR', privacyEyebrow: 'I tuoi dati, i tuoi diritti', close: 'Chiudi', cookieText: 'Utilizziamo cookie e trattiamo dati personali nel rispetto del GDPR per far funzionare Melāp e migliorare la tua esperienza.', learnMore: 'Scopri di più', rejectCookies: 'Rifiuta i non essenziali', acceptCookies: 'Accetta tutti', footer: 'Connettiti con la tua community locale.', checkoutEyebrow: 'Pagamento sicuro', checkoutTitle: 'Completa il tuo abbonamento Premium', paymentMethod: 'Metodo di pagamento', billingEmail: 'Email di fatturazione', recurringConsent: 'Comprendo che l’abbonamento si rinnova automaticamente fino all’annullamento. Posso annullare il rinnovo in qualsiasi momento dalle impostazioni dell’abbonamento.', paySecurely: 'Paga in sicurezza'
  },
  hi: {
    navDiscover: 'खोजें', navEvents: 'इवेंट', navCommunity: 'कम्युनिटी', navPricing: 'कीमत',
    login: 'लॉगिन', signup: 'साइन अप',
    signupEyebrow: 'Melāp से जुड़ें', signupTitle: 'अपनी प्रोफ़ाइल बनाएं', signupName: 'पूरा नाम', signupEmail: 'ईमेल', signupCity: 'शहर', signupGender: 'लिंग', signupSubmit: 'अभी साइन अप करें',
    loginEyebrow: 'फिर से स्वागत है', loginTitle: 'OTP से लॉगिन करें', loginSend: 'OTP भेजें', loginVerify: 'सत्यापित करें और प्रवेश करें', loginEmail: 'ईमेल', loginOtp: 'वन-टाइम पासवर्ड'
  },
  pa: {
    navDiscover: 'ਖੋਜੋ', navEvents: 'ਇਵੈਂਟ', navCommunity: 'ਕਮਿਊਨਿਟੀ', navPricing: 'ਕੀਮਤ',
    login: 'ਲੌਗਇਨ', signup: 'ਸਾਈਨ ਅਪ',
    signupEyebrow: 'Melāp ਨਾਲ ਜੁੜੋ', signupTitle: 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ', signupName: 'ਪੂਰਾ ਨਾਮ', signupEmail: 'ਈਮੇਲ', signupCity: 'ਸ਼ਹਿਰ', signupGender: 'ਲਿੰਗ', signupSubmit: 'ਹੁਣੇ ਸਾਈਨ ਅਪ ਕਰੋ',
    loginEyebrow: 'ਮੁੜ ਸਵਾਗਤ ਹੈ', loginTitle: 'OTP ਨਾਲ ਲੌਗਇਨ ਕਰੋ', loginSend: 'OTP ਭੇਜੋ', loginVerify: 'ਸਹੀ ਕਰੋ ਅਤੇ ਲੌਗਇਨ ਕਰੋ', loginEmail: 'ਈਮੇਲ', loginOtp: 'ਵਨ-ਟਾਈਮ ਪਾਸਵਰਡ'
  }
};

Object.assign(TRANSLATIONS.hi, {
  filterFitness: 'फिटनेस',
  heroEyebrow: 'अपने पास असली लोगों से मिलें', heroTitle: 'अपने आसपास नए दोस्त खोजें और साथ में यादगार पल बनाएं।', heroText: 'स्थानीय मीटअप, अचानक आउटिंग और अपने शहर के इवेंट में शामिल हों। समान रुचियों वाले लोगों को खोजें और सार्थक कनेक्शन बनाएं।', location: 'आपकी लोकेशन', findNearMe: 'मेरे पास खोजें', howItWorks: 'यह कैसे काम करता है', activeUsers: 'सक्रिय उपयोगकर्ता', eventsMonth: 'इवेंट/माह', rating: 'रेटिंग', visualBio: 'सुबह की सैर और ब्रंच पसंद है', discoverEyebrow: 'रुचि से खोजें', discoverTitle: 'अपने पड़ोस में अपनी पसंद के लोगों से मिलें।', filterAll: 'सभी', filterFood: 'खाना', filterMusic: 'संगीत', filterNature: 'प्रकृति', filterNight: 'रात बाहर', unlockTitle: 'पास के दोस्त अनलॉक करें', unlockText: 'पास के लोगों को देखने और जुड़ने के लिए प्रीमियम लें।', seePlans: 'प्रीमियम प्लान देखें', profileNearby: 'पास में', connect: 'जुड़ें', membership: 'सदस्यता', pricingTitle: 'सबके लिए मुफ्त रजिस्ट्रेशन। प्रीमियम से पास के लोग दिखेंगे।', pricingNote: 'रजिस्ट्रेशन सभी के लिए मुफ्त है। पास के लोगों को देखने और जुड़ने के लिए प्रीमियम सक्रिय करें।', everyone: 'सभी', freeAccount: 'मुफ्त अकाउंट', freeProfile: 'मुफ्त प्रोफ़ाइल बनाएं', men: 'पुरुष', premiumMen: 'पुरुषों के लिए प्रीमियम', yearly: 'या €29.99/वर्ष', women: 'महिलाएं', premiumWomen: 'महिलाओं के लिए प्रीमियम', freeYear: 'मुफ्त / 1 वर्ष', automatic: 'अपने आप लागू', seeNearby: 'पास के लोगों को देखें', sendRequests: 'कनेक्शन अनुरोध भेजें', unlockChat: 'आपसी पुष्टि के बाद चैट खोलें', monthlyButton: 'मासिक प्लान - €4.99', yearlyButton: 'वार्षिक प्लान - €29.99', freeYearButton: 'मुफ्त वर्ष सक्रिय करें', subscription: 'आपकी सदस्यता', cancelSubscription: 'अगले महीने से सदस्यता रद्द करें', cancellationScheduled: 'रद्दीकरण तय है', featured: 'खास', eventsTitle: 'सप्ताहांत के इवेंट और मिलना-जुलना', eventOne: 'सुबह की दौड़ और चाय', eventOneText: 'हल्की दौड़, स्ट्रेचिंग और पास के नए दोस्तों के साथ चाय का आनंद लें।', eventTwo: 'स्ट्रीट फूड वॉक', eventTwoText: 'स्थानीय फूड स्टॉल देखें, पंजाबी पसंदीदा चीजें आजमाएं और नए लोगों से मिलें।', eventThree: 'लाइव जैम नाइट', eventThreeText: 'संगीत प्रेमियों से मिलें और अपने शहर के लोगों के साथ शाम बिताएं।', people: 'लोग', communityTitle: 'हम आपको अपने आसपास उन लोगों से मिलाते हैं जिनकी रुचियां आपकी जैसी हैं।', communityOne: 'अपने शौक और उपलब्धता के साथ प्रोफ़ाइल बनाएं।', communityTwo: 'स्थानीय इवेंट देखें और जुड़ने का अनुरोध भेजें।', communityThree: 'सरल, सुरक्षित और मजेदार मुलाकातें तय करें।', tryFree: 'मुफ्त आज़माएं', ctaTitle: 'आज ही अपने शहर में नए लोगों से मिलना शुरू करें।', connectionRequests: 'कनेक्शन अनुरोध', chatTitle: 'आपसी पुष्टि के बाद चैट खुलती है', chatWaiting: 'चैट से पहले दोनों उपयोगकर्ताओं की पुष्टि जरूरी है।', chatPlaceholder: 'दोनों की पुष्टि के बाद संदेश लिखें', send: 'भेजें', phoneNotice: 'संदेशों में फोन नंबर की अनुमति नहीं है।', privacyTitle: 'गोपनीयता नीति और GDPR', privacyEyebrow: 'आपका डेटा, आपके अधिकार', close: 'बंद करें', cookieText: 'हम Melāp चलाने और अनुभव बेहतर करने के लिए GDPR के अनुसार कुकी और निजी डेटा का उपयोग करते हैं।', learnMore: 'और जानें', rejectCookies: 'गैर-जरूरी अस्वीकार करें', acceptCookies: 'सभी स्वीकार करें', footer: 'अपनी स्थानीय कम्युनिटी से जुड़ें।', checkoutEyebrow: 'सुरक्षित भुगतान', checkoutTitle: 'अपनी प्रीमियम सदस्यता पूरी करें', paymentMethod: 'भुगतान विधि', billingEmail: 'बिलिंग ईमेल', recurringConsent: 'मैं समझता/समझती हूं कि रद्द करने तक सदस्यता अपने आप नवीनीकृत होगी।', paySecurely: 'सुरक्षित भुगतान करें'
});

Object.assign(TRANSLATIONS.pa, {
  filterFitness: 'ਫਿਟਨਸ',
  heroEyebrow: 'ਆਪਣੇ ਨੇੜੇ ਅਸਲੀ ਲੋਕਾਂ ਨੂੰ ਮਿਲੋ', heroTitle: 'ਆਪਣੇ ਨੇੜੇ ਨਵੇਂ ਦੋਸਤ ਲੱਭੋ ਅਤੇ ਯਾਦਗਾਰ ਪਲ ਬਣਾਓ।', heroText: 'ਸਥਾਨਕ ਮੀਟਅਪ, ਅਚਾਨਕ ਘੁੰਮਣ-ਫਿਰਣ ਅਤੇ ਆਪਣੇ ਸ਼ਹਿਰ ਦੇ ਇਵੈਂਟਾਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।', location: 'ਤੁਹਾਡੀ ਸਥਿਤੀ', findNearMe: 'ਮੇਰੇ ਨੇੜੇ ਲੱਭੋ', howItWorks: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', activeUsers: 'ਸਰਗਰਮ ਯੂਜ਼ਰ', eventsMonth: 'ਇਵੈਂਟ/ਮਹੀਨਾ', rating: 'ਰੇਟਿੰਗ', visualBio: 'ਸਵੇਰ ਦੀ ਸੈਰ ਅਤੇ ਬ੍ਰੰਚ ਪਸੰਦ ਹੈ', discoverEyebrow: 'ਰੁਚੀ ਅਨੁਸਾਰ ਖੋਜੋ', discoverTitle: 'ਆਪਣੇ ਇਲਾਕੇ ਵਿੱਚ ਆਪਣੇ ਵਰਗੇ ਲੋਕਾਂ ਨੂੰ ਮਿਲੋ।', filterAll: 'ਸਾਰੇ', filterFood: 'ਖਾਣਾ', filterMusic: 'ਸੰਗੀਤ', filterNature: 'ਕੁਦਰਤ', filterNight: 'ਰਾਤ ਬਾਹਰ', unlockTitle: 'ਨੇੜੇ ਦੇ ਦੋਸਤ ਅਨਲੌਕ ਕਰੋ', unlockText: 'ਨੇੜੇ ਦੇ ਲੋਕ ਦੇਖਣ ਅਤੇ ਜੁੜਨ ਲਈ ਪ੍ਰੀਮੀਅਮ ਲਓ।', seePlans: 'ਪ੍ਰੀਮੀਅਮ ਪਲਾਨ ਵੇਖੋ', profileNearby: 'ਨੇੜੇ', connect: 'ਜੁੜੋ', membership: 'ਮੈਂਬਰਸ਼ਿਪ', pricingTitle: 'ਸਭ ਲਈ ਮੁਫ਼ਤ ਰਜਿਸਟ੍ਰੇਸ਼ਨ। ਪ੍ਰੀਮੀਅਮ ਨਾਲ ਨੇੜੇ ਦੇ ਲੋਕ ਵੇਖੋ।', pricingNote: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਭ ਲਈ ਮੁਫ਼ਤ ਹੈ। ਨੇੜੇ ਦੇ ਲੋਕਾਂ ਨੂੰ ਦੇਖਣ ਲਈ ਪ੍ਰੀਮੀਅਮ ਚਾਲੂ ਕਰੋ।', everyone: 'ਸਾਰੇ', freeAccount: 'ਮੁਫ਼ਤ ਅਕਾਊਂਟ', freeProfile: 'ਮੁਫ਼ਤ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ', men: 'ਮਰਦ', premiumMen: 'ਮਰਦਾਂ ਲਈ ਪ੍ਰੀਮੀਅਮ', yearly: 'ਜਾਂ €29.99/ਸਾਲ', women: 'ਔਰਤਾਂ', premiumWomen: 'ਔਰਤਾਂ ਲਈ ਪ੍ਰੀਮੀਅਮ', freeYear: 'ਮੁਫ਼ਤ / 1 ਸਾਲ', automatic: 'ਆਪੇ ਲਾਗੂ', seeNearby: 'ਨੇੜੇ ਦੇ ਲੋਕ ਵੇਖੋ', sendRequests: 'ਕਨੈਕਸ਼ਨ ਬੇਨਤੀ ਭੇਜੋ', unlockChat: 'ਦੋਹਰੀ ਪੁਸ਼ਟੀ ਤੋਂ ਬਾਅਦ ਚੈਟ ਖੋਲ੍ਹੋ', monthlyButton: 'ਮਹੀਨਾਵਾਰ ਪਲਾਨ - €4.99', yearlyButton: 'ਸਾਲਾਨਾ ਪਲਾਨ - €29.99', freeYearButton: 'ਮੁਫ਼ਤ ਸਾਲ ਚਾਲੂ ਕਰੋ', subscription: 'ਤੁਹਾਡੀ ਮੈਂਬਰਸ਼ਿਪ', cancelSubscription: 'ਅਗਲੇ ਮਹੀਨੇ ਤੋਂ ਮੈਂਬਰਸ਼ਿਪ ਰੱਦ ਕਰੋ', cancellationScheduled: 'ਰੱਦ ਕਰਨਾ ਤੈਅ ਹੈ', featured: 'ਖਾਸ', eventsTitle: 'ਵੀਕਐਂਡ ਇਵੈਂਟ ਅਤੇ ਮਿਲਣ-ਜੁਲਣ', eventOne: 'ਸਵੇਰ ਦੀ ਦੌੜ ਅਤੇ ਚਾਹ', eventOneText: 'ਹਲਕੀ ਦੌੜ ਅਤੇ ਨਵੇਂ ਦੋਸਤਾਂ ਨਾਲ ਚਾਹ ਦਾ ਆਨੰਦ ਲਓ।', eventTwo: 'ਸਟ੍ਰੀਟ ਫੂਡ ਵਾਕ', eventTwoText: 'ਸਥਾਨਕ ਫੂਡ ਸਟਾਲ ਵੇਖੋ ਅਤੇ ਨਵੇਂ ਲੋਕਾਂ ਨੂੰ ਮਿਲੋ।', eventThree: 'ਲਾਈਵ ਜੈਮ ਨਾਈਟ', eventThreeText: 'ਸੰਗੀਤ ਪ੍ਰੇਮੀਆਂ ਨੂੰ ਮਿਲੋ ਅਤੇ ਆਸਾਨ ਸ਼ਾਮ ਬਿਤਾਓ।', people: 'ਲੋਕ', communityTitle: 'ਅਸੀਂ ਤੁਹਾਨੂੰ ਨੇੜੇ ਦੇ ਉਹਨਾਂ ਲੋਕਾਂ ਨਾਲ ਮਿਲਾਉਂਦੇ ਹਾਂ ਜਿਨ੍ਹਾਂ ਦੀ ਰੁਚੀ ਤੁਹਾਡੇ ਵਰਗੀ ਹੈ।', communityOne: 'ਆਪਣੇ ਸ਼ੌਕ ਅਤੇ ਉਪਲਬਧਤਾ ਨਾਲ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ।', communityTwo: 'ਸਥਾਨਕ ਇਵੈਂਟ ਵੇਖੋ ਅਤੇ ਸ਼ਾਮਲ ਹੋਣ ਲਈ ਬੇਨਤੀ ਭੇਜੋ।', communityThree: 'ਸੁਰੱਖਿਅਤ ਅਤੇ ਮਜ਼ੇਦਾਰ ਮਿਲਣੀਆਂ ਯੋਜਨਾ ਬਣਾਓ।', tryFree: 'ਮੁਫ਼ਤ ਅਜ਼ਮਾਓ', ctaTitle: 'ਅੱਜ ਹੀ ਆਪਣੇ ਸ਼ਹਿਰ ਵਿੱਚ ਨਵੇਂ ਲੋਕਾਂ ਨੂੰ ਮਿਲੋ।', connectionRequests: 'ਕਨੈਕਸ਼ਨ ਬੇਨਤੀਆਂ', chatTitle: 'ਦੋਹਰੀ ਪੁਸ਼ਟੀ ਤੋਂ ਬਾਅਦ ਚੈਟ ਖੁੱਲ੍ਹਦੀ ਹੈ', chatWaiting: 'ਚੈਟ ਤੋਂ ਪਹਿਲਾਂ ਦੋਹਾਂ ਯੂਜ਼ਰਾਂ ਦੀ ਪੁਸ਼ਟੀ ਜ਼ਰੂਰੀ ਹੈ।', chatPlaceholder: 'ਦੋਹਾਂ ਦੀ ਪੁਸ਼ਟੀ ਤੋਂ ਬਾਅਦ ਸੁਨੇਹਾ ਲਿਖੋ', send: 'ਭੇਜੋ', phoneNotice: 'ਸੁਨੇਹਿਆਂ ਵਿੱਚ ਫੋਨ ਨੰਬਰ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਹੈ।', privacyTitle: 'ਪਰਾਈਵੇਸੀ ਨੀਤੀ ਅਤੇ GDPR', privacyEyebrow: 'ਤੁਹਾਡਾ ਡਾਟਾ, ਤੁਹਾਡੇ ਹੱਕ', close: 'ਬੰਦ ਕਰੋ', cookieText: 'ਅਸੀਂ Melāp ਚਲਾਉਣ ਅਤੇ ਅਨੁਭਵ ਸੁਧਾਰਨ ਲਈ GDPR ਅਨੁਸਾਰ ਕੁਕੀਜ਼ ਅਤੇ ਨਿੱਜੀ ਡਾਟਾ ਵਰਤਦੇ ਹਾਂ।', learnMore: 'ਹੋਰ ਜਾਣੋ', rejectCookies: 'ਗੈਰ-ਜ਼ਰੂਰੀ ਰੱਦ ਕਰੋ', acceptCookies: 'ਸਭ ਸਵੀਕਾਰ ਕਰੋ', footer: 'ਆਪਣੀ ਸਥਾਨਕ ਕਮਿਊਨਿਟੀ ਨਾਲ ਜੁੜੋ।', checkoutEyebrow: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ', checkoutTitle: 'ਆਪਣੀ ਪ੍ਰੀਮੀਅਮ ਮੈਂਬਰਸ਼ਿਪ ਪੂਰੀ ਕਰੋ', paymentMethod: 'ਭੁਗਤਾਨ ਵਿਧੀ', billingEmail: 'ਬਿਲਿੰਗ ਈਮੇਲ', recurringConsent: 'ਮੈਂ ਸਮਝਦਾ/ਸਮਝਦੀ ਹਾਂ ਕਿ ਰੱਦ ਕਰਨ ਤੱਕ ਮੈਂਬਰਸ਼ਿਪ ਆਪਣੇ ਆਪ ਨਵੀਂ ਹੋਵੇਗੀ।', paySecurely: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਕਰੋ'
});

function applyLanguage(lang) {
  currentLanguage = lang;
  const t = { ...TRANSLATIONS.en, ...(TRANSLATIONS[lang] || {}) };
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element && text) element.textContent = text;
  };

  const navLinks = document.querySelectorAll('.nav-links a');
  if (navLinks[0]) navLinks[0].textContent = t.navDiscover;
  if (navLinks[1]) navLinks[1].textContent = t.navEvents;
  if (navLinks[2]) navLinks[2].textContent = t.navCommunity;
  if (navLinks[3]) navLinks[3].textContent = t.navPricing;

  setText('.hero-copy > .eyebrow', t.heroEyebrow);
  setText('.hero-copy h1', t.heroTitle);
  setText('.hero-copy > p', t.heroText);
  setText('.city-picker-wrap label', t.location);
  setText('#findNearMeBtn', t.findNearMe);
  setText('#howItWorksBtn', t.howItWorks);
  const trustLabels = document.querySelectorAll('.trust-list span');
  if (trustLabels[0]) trustLabels[0].textContent = t.activeUsers;
  if (trustLabels[1]) trustLabels[1].textContent = t.eventsMonth;
  if (trustLabels[2]) trustLabels[2].textContent = t.rating;
  setText('.visual-info p', t.visualBio);
  setText('#discover .section-eyebrow', t.discoverEyebrow);
  setText('#discover .section-head h2', t.discoverTitle);
  const filters = document.querySelectorAll('.filter-btn');
  if (filters[0]) filters[0].textContent = t.filterAll;
  if (filters[2]) filters[2].textContent = t.filterFood;
  if (filters[3]) filters[3].textContent = t.filterMusic;
  if (filters[4]) filters[4].textContent = t.filterNature;
  if (filters[5]) filters[5].textContent = t.filterNight;
  setText('#premiumGateTitle', t.unlockTitle);
  setText('#premiumGateText', t.unlockText);
  setText('[data-open-pricing]', t.seePlans);

  setText('#pricing .section-eyebrow', t.membership);
  setText('#pricing .section-head h2', t.pricingTitle);
  setText('.pricing-note', t.pricingNote);
  const pricingCards = document.querySelectorAll('.pricing-card');
  if (pricingCards[0]) {
    setText('.pricing-card:nth-child(1) .pricing-tag', t.everyone);
    setText('.pricing-card:nth-child(1) h3', t.freeAccount);
    setText('.pricing-card:nth-child(1) .btn', t.freeProfile);
    const freeFeatures = pricingCards[0].querySelectorAll('li');
    const freeFeatureText = {
      it: ['Crea il tuo profilo', 'Sfoglia gli eventi', 'Unisciti alla community'],
      hi: ['अपनी प्रोफ़ाइल बनाएं', 'इवेंट देखें', 'कम्युनिटी से जुड़ें'],
      pa: ['ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ', 'ਇਵੈਂਟ ਵੇਖੋ', 'ਕਮਿਊਨਿਟੀ ਨਾਲ ਜੁੜੋ'],
      en: ['Create your profile', 'Browse events', 'Join the community']
    }[lang] || ['Create your profile', 'Browse events', 'Join the community'];
    freeFeatures.forEach((item, index) => { item.textContent = freeFeatureText[index]; });
  }
  if (pricingCards[1]) {
    setText('.pricing-card:nth-child(2) .pricing-tag', t.men);
    setText('.pricing-card:nth-child(2) h3', t.premiumMen);
    setText('.pricing-card:nth-child(2) .price-alt', t.yearly);
    const monthlyUnit = pricingCards[1].querySelector('.price span');
    if (monthlyUnit) monthlyUnit.textContent = ({ it: '/mese', hi: '/माह', pa: '/ਮਹੀਨਾ', en: '/month' }[lang] || '/month');
    setText('[data-upgrade="men-monthly"]', t.monthlyButton);
    setText('[data-upgrade="men-yearly"]', t.yearlyButton);
  }
  if (pricingCards[2]) {
    setText('.pricing-card:nth-child(3) .pricing-tag', t.women);
    setText('.pricing-card:nth-child(3) h3', t.premiumWomen);
    setText('.pricing-card:nth-child(3) .price-alt', t.automatic);
    const freeUnit = pricingCards[2].querySelector('.price span');
    if (freeUnit) freeUnit.textContent = ({ it: '/ 1 anno', hi: '/ 1 वर्ष', pa: '/ 1 ਸਾਲ', en: '/ 1 year' }[lang] || '/ 1 year');
    setText('[data-upgrade="women-free"]', t.freeYearButton);
    const freePrice = pricingCards[2].querySelector('.price');
    if (freePrice) freePrice.childNodes[0].textContent = ({ it: 'Gratis', hi: 'मुफ्त', pa: 'ਮੁਫ਼ਤ', en: 'Free' }[lang] || 'Free');
  }
  document.querySelectorAll('.pricing-card:nth-child(n+2) li').forEach((item, index) => {
    item.textContent = [t.seeNearby, t.sendRequests, t.unlockChat][index % 3];
  });
  setText('#subscriptionManager h3', t.subscription);
  if (!state.subscriptionCancelled) setText('#cancelSubscriptionBtn', t.cancelSubscription);

  setText('#events .section-eyebrow', t.featured);
  setText('#events .section-head h2', t.eventsTitle);
  const eventCards = document.querySelectorAll('.event-card');
  if (eventCards[0]) { setText('.event-card:nth-child(1) h3', t.eventOne); setText('.event-card:nth-child(1) p', t.eventOneText); }
  if (eventCards[1]) { setText('.event-card:nth-child(2) .event-tag', t.filterFood); setText('.event-card:nth-child(2) h3', t.eventTwo); setText('.event-card:nth-child(2) p', t.eventTwoText); }
  if (eventCards[2]) { setText('.event-card:nth-child(3) .event-tag', t.filterMusic); setText('.event-card:nth-child(3) h3', t.eventThree); setText('.event-card:nth-child(3) p', t.eventThreeText); }
  document.querySelectorAll('.event-meta span:nth-child(2)').forEach((item, index) => {
    item.textContent = `${[20, 16, 24][index]} ${t.people}`;
  });
  const eventTimes = document.querySelectorAll('.event-meta span:nth-child(1)');
  const eventTimesByLanguage = {
    it: ['Sabato, 9:30', 'Domenica, 18:00', 'Venerdì, 20:30'],
    hi: ['शनिवार, 9:30', 'रविवार, 18:00', 'शुक्रवार, 20:30'],
    pa: ['ਸ਼ਨੀਵਾਰ, 9:30', 'ਐਤਵਾਰ, 18:00', 'ਸ਼ੁੱਕਰਵਾਰ, 20:30'],
    en: ['Saturday, 9:30', 'Sunday, 18:00', 'Friday, 20:30']
  };
  eventTimes.forEach((item, index) => { item.textContent = (eventTimesByLanguage[lang] || eventTimesByLanguage.en)[index]; });

  setText('#community .section-eyebrow', t.howItWorks);
  setText('#community h2', t.communityTitle);
  const communityItems = document.querySelectorAll('#community li');
  if (communityItems[0]) communityItems[0].textContent = t.communityOne;
  if (communityItems[1]) communityItems[1].textContent = t.communityTwo;
  if (communityItems[2]) communityItems[2].textContent = t.communityThree;
  setText('.cta .section-eyebrow', t.tryFree);
  setText('.cta h2', t.ctaTitle);
  setText('.cta [data-signup-open]', t.signupTitle);

  const navButtons = document.querySelectorAll('.nav-actions .btn');
  if (navButtons[0]) navButtons[0].textContent = t.login;
  if (navButtons[1]) navButtons[1].textContent = t.signup;

  const signupEyebrow = signupModal?.querySelector('.eyebrow');
  if (signupEyebrow) signupEyebrow.textContent = t.signupEyebrow;
  const signupTitleEl = document.getElementById('signupTitle');
  if (signupTitleEl) signupTitleEl.textContent = t.signupTitle;
  const signupSubmitBtn = signupForm?.querySelector('button[type="submit"]');
  if (signupSubmitBtn) signupSubmitBtn.textContent = t.signupSubmit;

  const signupLabels = signupForm?.querySelectorAll('label') || [];
  const labelKeys = ['signupName', 'signupEmail', 'signupCity', 'signupGender'];
  signupLabels.forEach((label, i) => {
    const key = labelKeys[i];
    if (!key) return;
    const input = label.querySelector('input, select');
    label.childNodes[0].textContent = t[key] + ' ';
    if (input) label.appendChild(input);
  });
  const privacyConsent = signupForm?.querySelector('.consent-check span');
  if (privacyConsent) privacyConsent.innerHTML = lang === 'it'
    ? 'Ho almeno 18 anni e accetto l’<a href="#" data-open-privacy>Informativa sulla privacy</a> e i Termini di servizio, e acconsento al trattamento dei miei dati personali ai sensi del GDPR.'
    : 'I am 18+ and I accept the <a href="#" data-open-privacy>Privacy Policy</a> and Terms of Service, and consent to processing of my personal data under the GDPR.';

  const loginEyebrow = loginModal?.querySelector('.eyebrow');
  if (loginEyebrow) loginEyebrow.textContent = t.loginEyebrow;
  const loginTitleEl = document.getElementById('loginTitle');
  if (loginTitleEl) loginTitleEl.textContent = t.loginTitle;
  if (sendOtpBtn) sendOtpBtn.textContent = t.loginSend;
  const loginSubmitBtn = loginForm?.querySelector('button[type="submit"]');
  if (loginSubmitBtn) loginSubmitBtn.textContent = t.loginVerify;

  const loginLabels = loginForm?.querySelectorAll('label') || [];
  const loginLabelKeys = ['loginEmail', 'loginOtp'];
  loginLabels.forEach((label, i) => {
    const key = loginLabelKeys[i];
    if (!key) return;
    const input = label.querySelector('input, select');
    label.childNodes[0].textContent = t[key] + ' ';
    if (input) label.appendChild(input);
  });

  setText('#melapConnectionBox > h3', t.connectionRequests);
  setText('.melap-chat-header', t.chatTitle);
  setText('.melap-message.them', t.chatWaiting);
  if (chatInput && chatInput.disabled) chatInput.placeholder = t.chatPlaceholder;
  setText('.melap-send-btn', t.send);
  setText('#melapPhoneRuleNotice', t.phoneNotice);

  setText('#privacyModal .eyebrow', t.privacyEyebrow);
  setText('#privacyTitle', t.privacyTitle);
  setText('#privacyModal [data-close-privacy]', t.close);
  setText('#checkoutModal .eyebrow', t.checkoutEyebrow);
  setText('#checkoutTitle', t.checkoutTitle);
  const checkoutMethodLabel = document.querySelector('#checkoutForm label:nth-child(1)');
  const checkoutEmailLabel = document.querySelector('#checkoutForm label:nth-child(2)');
  if (checkoutMethodLabel) checkoutMethodLabel.childNodes[0].textContent = `${t.paymentMethod} `;
  if (checkoutEmailLabel) checkoutEmailLabel.childNodes[0].textContent = `${t.billingEmail} `;
  const paymentMethods = document.querySelectorAll('#checkoutForm select[name="paymentMethod"] option');
  if (lang === 'it' && paymentMethods.length === 4) {
    paymentMethods[0].textContent = 'Carta di credito o debito';
    paymentMethods[1].textContent = 'Apple Pay';
    paymentMethods[2].textContent = 'Google Pay';
    paymentMethods[3].textContent = 'Addebito diretto SEPA';
  }
  setText('#checkoutSubmitBtn', t.paySecurely);
  const checkoutConsent = document.querySelector('#checkoutForm .consent-check span');
  if (checkoutConsent) checkoutConsent.textContent = t.recurringConsent;
  const cookieText = document.querySelector('#cookieConsentBanner p');
  if (cookieText) cookieText.innerHTML = `${t.cookieText} <a href="#" data-open-privacy>${t.learnMore}</a>.`;
  setText('#cookieRejectBtn', t.rejectCookies);
  setText('#cookieAcceptBtn', t.acceptCookies);
  const privacyBody = document.querySelector('.privacy-body');
  if (lang === 'it' && privacyBody) {
    privacyBody.innerHTML = '<p>Melāp tratta i tuoi dati personali (nome, email, città e genere) nel rispetto del Regolamento generale sulla protezione dei dati dell’Unione europea (GDPR).</p><ul><li>Utilizziamo i dati solo per gestire il tuo profilo, gli abbinamenti e gli eventi.</li><li>Puoi richiedere accesso, correzione o cancellazione dei tuoi dati in qualsiasi momento.</li><li>Puoi revocare il consenso e chiudere l’account quando vuoi.</li><li>Non vendiamo i tuoi dati personali a terzi.</li><li>I dati sono conservati in modo sicuro e solo per il tempo necessario.</li></ul><p>Per qualsiasi richiesta, contatta il nostro team privacy a <a href="mailto:privacy@melap.app">privacy@melap.app</a>.</p>';
  }
  const footer = document.querySelector('.site-footer p');
  if (footer) footer.innerHTML = `&copy; 2026 Melāp. ${t.footer} <a href="#" data-open-privacy>${t.privacyTitle}</a>`;
  document.querySelectorAll('[data-open-privacy]').forEach((element) => element.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(privacyModal);
  }));
  renderProfiles();
}

const languageSelect = document.querySelector('.language-select');
if (languageSelect) {
  languageSelect.addEventListener('change', () => applyLanguage(languageSelect.value));
  applyLanguage(languageSelect.value);
}

// ---- Initial render ----
renderProfiles();
