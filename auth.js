// ============================================================
// DreamFlix — Auth System (Google Identity Services)
// Client ID: 452977917704-rodjcu8c5kh9f37rt2oam93necl14emo.apps.googleusercontent.com
// ============================================================

const GOOGLE_CLIENT_ID = '452977917704-rodjcu8c5kh9f37rt2oam93necl14emo.apps.googleusercontent.com';
const SESSION_KEY = 'df_user';

// --- Decode a Google JWT (id_token) without a library ---
function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

// --- Save user session to localStorage ---
function saveSession(payload) {
    const user = {
        name:    payload.name,
        email:   payload.email,
        picture: payload.picture,
        sub:     payload.sub,
        exp:     payload.exp,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
}

// --- Get current user (or null) ---
function getUser() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const user = JSON.parse(raw);
        // Check token expiry
        if (user.exp && Date.now() / 1000 > user.exp) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return user;
    } catch {
        return null;
    }
}

// --- Log out ---
function logOut() {
    google?.accounts?.id?.disableAutoSelect();
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

// --- Guard: redirect to login if not authenticated ---
// Call this at the top of any protected page
function requireAuth() {
    if (!getUser()) {
        window.location.href = 'login.html';
    }
}

// --- Auto-redirect if already logged in (for login page) ---
function redirectIfLoggedIn(destination = 'index.html') {
    if (getUser()) {
        window.location.href = destination;
    }
}

// --- Initialize Google Sign-In ---
function initGoogleAuth({ onSuccess, onError } = {}) {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
            const payload = parseJwt(response.credential);
            if (!payload) {
                onError?.('Invalid token');
                return;
            }
            const user = saveSession(payload);
            onSuccess?.(user);
        },
        auto_select: false,
        cancel_on_tap_outside: false,
    });
}

// --- Render the official Google button into a container element ---
function renderGoogleButton(containerId, theme = 'outline') {
    google.accounts.id.renderButton(document.getElementById(containerId), {
        type: 'standard',
        size: 'large',
        theme: theme,       // 'outline' | 'filled_blue' | 'filled_black'
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 300,
    });
}

// ============================================================
// Window-level shortcuts
// ============================================================
window.DFAuth = { getUser, logOut, requireAuth, redirectIfLoggedIn, initGoogleAuth, renderGoogleButton };
