// ============================================================
// DreamFlix — Auth & Supabase System
// ============================================================

const SESSION_KEY = 'df_user';
const ADMIN_EMAIL = 'the.furtive.guys@gmail.com';

// Initialize Supabase Client (from config.js)
const { createClient } = supabase;
const _supabase = createClient(window.DFConfig.SUPABASE_URL, window.DFConfig.SUPABASE_ANON_KEY);

// --- Decode a Google JWT (id_token) ---
function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
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

    // Sync Profile to Supabase (Profiles Table)
    try {
        const { error } = await _supabase.from('profiles').upsert({
            id: payload.sub, // Using Google sub as unique ID
            email: payload.email,
            full_name: payload.name,
            avatar_url: payload.picture,
            last_seen: new Date().toISOString()
        }, { onConflict: 'email' });
        
        if (error) console.error('Supabase Sync Error:', error);
    } catch (e) {
        console.error('Supabase Profile Sync failed:', e);
    }

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

// --- Admin Checks ---
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

// --- Heartbeat: Keep user online status updated ---
async function startHeartbeat() {
    const user = getUser();
    if (!user) return;
    
    // Update last_seen every 2 minutes
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
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!getUser()) {
        window.location.href = 'login.html';
    } else {
        startHeartbeat();
    }
}

function redirectIfLoggedIn(destination = 'index.html') {
    if (getUser()) {
        window.location.href = destination;
    }
}

function initGoogleAuth({ onSuccess, onError } = {}) {
    google.accounts.id.initialize({
        client_id: '452977917704-rodjcu8c5kh9f37rt2oam93necl14emo.apps.googleusercontent.com',
        callback: async (response) => {
            const payload = parseJwt(response.credential);
            if (!payload) {
                onError?.('Invalid token');
                return;
            }
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

window.DFAuth = { getUser, isAdmin, requireAdmin, logOut, requireAuth, redirectIfLoggedIn, initGoogleAuth, renderGoogleButton, _supabase };
