// ============================================================
// DreamFlix — Auth & Supabase System
// ============================================================

const SESSION_KEY = 'df_user';
const ADMIN_EMAIL = 'the.furtive.guys@gmail.com';

// Supabase Configuration (Public Anon Key provided for Client Use)
const SUPABASE_URL = "https://pcmaxibgvpatazpxuqkd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbWF4aWJndnBhdGF6cHh1cWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTA1MzAsImV4cCI6MjA5MDEyNjUzMH0.-hqsL58wE8DT6S7biILN_R88BXaQCY_8i9AwsLVHG6c";

// Obfuscated Admin Secret (Base64 mtq1njm5nq==)
const ADMIN_CHECK = "MTQ1NjM5NQ=="; 

// Initialize Supabase Client
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Decode a Google JWT (id_token) ---
function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch { return null; }
}

// --- Save user session & Synchronize with Supabase ---
async function saveSession(payload) {
    const user = {
        name:    payload.name,
        email:   payload.email,
        picture: payload.picture,
        sub:     payload.sub,
        exp:     payload.exp,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    try {
        await _supabase.from('profiles').upsert({
            id: payload.sub,
            email: payload.email,
            full_name: payload.name,
            avatar_url: payload.picture,
            last_seen: new Date().toISOString()
        });
    } catch (e) { console.error('Supabase Sync failed:', e); }

    return user;
}

// --- Get current user ---
function getUser() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const user = JSON.parse(raw);
        if (user.exp && Date.now() / 1000 > user.exp) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return user;
    } catch { return null; }
}

// --- Admin Checks (Email or persistent unlock flag) ---
function isAdmin() {
    const user = getUser();
    const isUnlocked = localStorage.getItem('df_admin_unlocked') === 'true';
    return (user && user.email === ADMIN_EMAIL) || isUnlocked;
}

function requireAdmin() {
    if (!isAdmin()) {
        window.location.href = 'index.html';
    }
}

// --- Unlock Admin via Code ---
function tryUnlockAdmin(code) {
    if (btoa(code) === ADMIN_CHECK) {
        localStorage.setItem('df_admin_unlocked', 'true');
        return true;
    }
    return false;
}

// --- Heartbeat: Keep user online status updated ---
async function startHeartbeat() {
    const user = getUser();
    if (!user) return;
    setInterval(async () => {
        await _supabase.from('profiles').update({ 
            last_seen: new Date().toISOString() 
        }).eq('email', user.email);
    }, 120000);
}

// --- Log out ---
function logOut() {
    google?.accounts?.id?.disableAutoSelect();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('df_admin_unlocked');
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!getUser()) {
        window.location.href = 'login.html';
    } else { startHeartbeat(); }
}

function redirectIfLoggedIn(destination = 'index.html') {
    if (getUser()) { window.location.href = destination; }
}

function initGoogleAuth({ onSuccess, onError } = {}) {
    google.accounts.id.initialize({
        client_id: '452977917704-rodjcu8c5kh9f37rt2oam93necl14emo.apps.googleusercontent.com',
        callback: async (response) => {
            const payload = parseJwt(response.credential);
            if (!payload) { onError?.('Invalid token'); return; }
            const user = await saveSession(payload);
            onSuccess?.(user);
        },
        auto_select: false,
    });
}

function renderGoogleButton(containerId, theme = 'outline') {
    const el = document.getElementById(containerId);
    if (el) {
        google.accounts.id.renderButton(el, {
            type: 'standard', size: 'large', theme: theme,
            text: 'continue_with', shape: 'pill', width: 300
        });
    }
}

window.DFAuth = { getUser, isAdmin, tryUnlockAdmin, requireAdmin, logOut, requireAuth, redirectIfLoggedIn, initGoogleAuth, renderGoogleButton, _supabase };
