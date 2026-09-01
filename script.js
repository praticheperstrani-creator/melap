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
  { name: 'Luca', age: 27, city: 'Milan', category: 'fitness', interests: ['Fitness', 'Morning walks', 'Brunch'] },
  { name: 'Aarav', age: 31, city: 'Rome', category: 'food', interests: ['Food', 'Cafe hopping', 'Weekends'] },
  { name: 'Simran', age: 25, city: 'Florence', category: 'music', interests: ['Music', 'Live gigs', 'Night outings'] },
  { name: 'Marco', age: 29, city: 'Turin', category: 'nature', interests: ['Nature', 'Hikes', 'Photography'] },
  { name: 'Harleen', age: 26, city: 'Bologna', category: 'night', interests: ['Night outs', 'Movies', 'Cocktails'] },
  { name: 'Daniel', age: 30, city: 'Milan', category: 'fitness', interests: ['Fitness', 'Football', 'Aperitivo'] },
  { name: 'Navneet', age: 28, city: 'Rome', category: 'food', interests: ['Food', 'Street markets', 'Wine nights'] },
  { name: 'Gurpreet', age: 32, city: 'Barcelona', category: 'nature', interests: ['Nature', 'Treks', 'Relax'] },
  { name: 'Oliver', age: 27, city: 'Milan', category: 'music', interests: ['Coffee', 'Live music', 'City walks'] },
  { name: 'Jaskirat', age: 24, city: 'Barcelona', category: 'night', interests: ['Beach', 'Sunset', 'Travel'] }
];

// ---- App state ----
const state = {
  city: 'Milan',
  filter: 'all',
  isPremium: false,
  userGender: null,
  plan: null, // 'men-monthly' | 'men-yearly' | 'women-free'
  subscriptionCancelled: false
};

const PLAN_LABELS = {
  'men-monthly': 'Premium monthly – €4.99/month',
  'men-yearly': 'Premium yearly – €29.99/year',
  'women-free': 'Premium – free for 1 year'
};

function renderProfiles() {
  const grid = document.getElementById('profiles');
  const gate = document.getElementById('premiumGate');
  if (!grid) return;

  const filtered = PROFILES.filter((p) => state.filter === 'all' || p.category === state.filter);

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
          <span class="badge">Nearby</span>
        </div>
        <p>📍 ${profile.city} • ${distance.toFixed(1)} km</p>
        <div class="interests">${profile.interests.map((i) => `<span>${i}</span>`).join('')}</div>
        <button class="btn btn-primary connect-btn" type="button" ${state.isPremium ? '' : 'disabled'}>Connect</button>
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

document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', () => {
  if (!state.plan || state.subscriptionCancelled) return;
  state.subscriptionCancelled = true;
  setPremiumStatus('Your subscription will be cancelled starting next month. You keep Premium access until then.');
  renderSubscriptionManager();
});

document.querySelectorAll('[data-upgrade]').forEach((button) => {
  button.addEventListener('click', () => {
    const plan = button.dataset.upgrade;
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
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
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

function openModal(modal) { modal?.classList.remove('hidden'); }
function closeModal(modal) { modal?.classList.add('hidden'); }

document.querySelectorAll('[data-signup-open]').forEach((btn) => btn.addEventListener('click', () => openModal(signupModal)));
document.querySelectorAll('[data-login-open]').forEach((btn) => btn.addEventListener('click', () => openModal(loginModal)));
document.querySelectorAll('[data-close-signup]').forEach((el) => el.addEventListener('click', () => closeModal(signupModal)));
document.querySelectorAll('[data-close-login]').forEach((el) => el.addEventListener('click', () => closeModal(loginModal)));
document.querySelectorAll('[data-open-privacy]').forEach((el) => el.addEventListener('click', (event) => {
  event.preventDefault();
  openModal(privacyModal);
}));
document.querySelectorAll('[data-close-privacy]').forEach((el) => el.addEventListener('click', () => closeModal(privacyModal)));
signupModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(signupModal));
loginModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(loginModal));
privacyModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(privacyModal));

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (event) => {
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
    if (status) status.textContent = `Welcome ${fullName}! Your profile is ready to be created.`;
    applyGenderPremiumRule(gender);
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
let currentOtp = null;
const sendOtpBtn = document.getElementById('sendOtpBtn');
const loginForm = document.getElementById('loginForm');

if (sendOtpBtn) {
  sendOtpBtn.addEventListener('click', () => {
    const email = loginForm.querySelector('input[name="loginEmail"]').value.trim();
    const status = loginForm.querySelector('.login-status');
    if (!email) {
      if (status) status.textContent = 'Please enter your email first.';
      return;
    }
    currentOtp = String(Math.floor(100000 + Math.random() * 900000));
    if (status) status.textContent = `OTP sent to ${email}. Code: ${currentOtp}`;
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = loginForm.querySelector('input[name="loginEmail"]').value.trim();
    const code = loginForm.querySelector('input[name="otpCode"]').value.trim();
    const status = loginForm.querySelector('.login-status');
    if (currentOtp && code === currentOtp) {
      if (status) status.textContent = `Access granted. Welcome back, ${email}.`;
    } else {
      if (status) status.textContent = 'Invalid code. Please try again.';
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
    loginEyebrow: 'Welcome back', loginTitle: 'Log in with OTP', loginSend: 'Send OTP', loginVerify: 'Verify & access', loginEmail: 'Email', loginOtp: 'One-time password'
  },
  it: {
    navDiscover: 'Scopri', navEvents: 'Eventi', navCommunity: 'Community', navPricing: 'Prezzi',
    login: 'Accedi', signup: 'Iscriviti',
    signupEyebrow: 'Unisciti a Melāp', signupTitle: 'Crea il tuo profilo', signupName: 'Nome completo', signupEmail: 'Email', signupCity: 'Città', signupGender: 'Genere', signupSubmit: 'Iscriviti ora',
    loginEyebrow: 'Bentornato', loginTitle: 'Accedi con OTP', loginSend: 'Invia OTP', loginVerify: 'Verifica e accedi', loginEmail: 'Email', loginOtp: 'Password monouso'
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

function applyLanguage(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const navLinks = document.querySelectorAll('.nav-links a');
  if (navLinks[0]) navLinks[0].textContent = t.navDiscover;
  if (navLinks[1]) navLinks[1].textContent = t.navEvents;
  if (navLinks[2]) navLinks[2].textContent = t.navCommunity;
  if (navLinks[3]) navLinks[3].textContent = t.navPricing;

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
}

const languageSelect = document.querySelector('.language-select');
if (languageSelect) {
  languageSelect.addEventListener('change', () => applyLanguage(languageSelect.value));
  applyLanguage(languageSelect.value);
}

// ---- Initial render ----
renderProfiles();
