// DreamFlix â€” shared nav + mobile bar injected into every page
// Requires: auth.js to be loaded BEFORE this file

const NAV_HTML = `
<nav class="df-nav" id="df-nav">
    <div style="display:flex;align-items:center;gap:28px;flex:1">
        <a href="index.html" class="df-logo"><img src="img/logo_dreamflix.png" alt="DreamFlix"></a>
        <ul class="nav-links-top">
            <li onclick="location.href='index.html'">Home</li>
            <li onclick="location.href='series.html'">Series</li>
            <li onclick="location.href='movies.html'">Movies</li>
            <li onclick="location.href='mylist.html'">My List</li>
        </ul>
    </div>
    <div class="nav-center">
        <i class="fas fa-search nav-search-icon"></i>
        <input type="text" class="nav-search" placeholder="Search series, movies...">
    </div>
    <div class="nav-right" style="display:flex;align-items:center;gap:18px">
        <i class="fas fa-bell" style="cursor:pointer"></i>
        <div id="nav-profile-area" style="display:flex;align-items:center;gap:10px;cursor:pointer;position:relative">
            <img id="nav-avatar" src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                 style="width:34px;height:34px;border-radius:8px;object-fit:cover;border:2px solid rgba(255,255,255,0.15)">
            <span id="nav-username" style="font-size:0.82rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>
            <i class="fas fa-caret-down" style="font-size:0.75rem;color:#808080"></i>
            <!-- Profile Dropdown -->
            <div id="nav-dropdown" style="
                display:none;position:absolute;top:calc(100% + 12px);right:0;
                background:rgba(10,10,10,0.97);border:1px solid rgba(255,255,255,0.1);
                border-radius:14px;min-width:190px;padding:8px 0;
                backdrop-filter:blur(20px);box-shadow:0 20px 50px rgba(0,0,0,0.8);z-index:5000;
            ">
                <div id="nav-dropdown-email" style="padding:12px 18px 8px;font-size:0.72rem;color:#808080;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:4px"></div>
                
                <!-- Admin Link -->
                <a href="admin.html" id="nav-admin-link" style="display:none;align-items:center;gap:12px;padding:11px 18px;color:var(--brand);font-size:0.85rem;text-decoration:none;font-weight:700;transition:0.15s" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">
                    <i class="fas fa-user-shield" style="width:16px;text-align:center"></i> Admin Panel
                </a>
                <div id="nav-admin-divider" style="display:none;border-top:1px solid rgba(255,255,255,0.08);margin:4px 0"></div>

                <a href="settings.html" style="display:flex;align-items:center;gap:12px;padding:11px 18px;color:rgba(255,255,255,0.75);font-size:0.85rem;text-decoration:none;transition:0.15s" onmouseenter="this.style.color='#fff'" onmouseleave="this.style.color='rgba(255,255,255,0.75)'">
                    <i class="fas fa-cog" style="width:16px;text-align:center"></i> Settings
                </a>
                <a href="mylist.html" style="display:flex;align-items:center;gap:12px;padding:11px 18px;color:rgba(255,255,255,0.75);font-size:0.85rem;text-decoration:none;transition:0.15s" onmouseenter="this.style.color='#fff'" onmouseleave="this.style.color='rgba(255,255,255,0.75)'">
                    <i class="fas fa-bookmark" style="width:16px;text-align:center"></i> My List
                </a>
                <div style="border-top:1px solid rgba(255,255,255,0.08);margin:4px 0"></div>
                <div id="nav-logout-btn" style="display:flex;align-items:center;gap:12px;padding:11px 18px;color:#E50914;font-size:0.85rem;cursor:pointer;transition:0.15s" onmouseenter="this.style.opacity='0.7'" onmouseleave="this.style.opacity='1'">
                    <i class="fas fa-sign-out-alt" style="width:16px;text-align:center"></i> Log Out
                </div>
            </div>
        </div>
    </div>
</nav>`;

const SIDEBAR_HTML = `
<aside class="df-sidebar">
    <div class="sidebar-group" id="sidebar-admin-group" style="display:none">
        <p class="sidebar-label">Administration</p>
        <a href="admin.html" class="sidebar-link" style="color:var(--brand);font-weight:700"><i class="fas fa-user-shield"></i> Admin Panel</a>
    </div>
    <div class="sidebar-group">
        <p class="sidebar-label">Menu</p>
        <a href="index.html" class="sidebar-link"><i class="fas fa-home"></i> Home</a>
        <a href="series.html" class="sidebar-link"><i class="fas fa-tv"></i> Series</a>
        <a href="movies.html" class="sidebar-link"><i class="fas fa-film"></i> Movies</a>
        <a href="popular.html" class="sidebar-link"><i class="fas fa-fire"></i> Popular</a>
        <a href="mylist.html" class="sidebar-link"><i class="fas fa-bookmark"></i> My List</a>
    </div>
    <div class="sidebar-group">
        <p class="sidebar-label">Show</p>
        <a href="friends.html" class="sidebar-link"><i class="fas fa-users"></i> Friends</a>
        <a href="teleparty.html" class="sidebar-link"><i class="fas fa-desktop"></i> Teleparty</a>
    </div>
    <div class="sidebar-group">
        <p class="sidebar-label">General</p>
        <a href="settings.html" class="sidebar-link"><i class="fas fa-cog"></i> Settings</a>
        <a href="#" class="sidebar-link" id="sidebar-logout"><i class="fas fa-sign-out-alt"></i> Log Out</a>
    </div>
</aside>`;

// --- SVG Filter for Liquid Glass Effect ---
const GLASS_SVG = `
<svg style="display: none">
    <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
            <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
    </filter>
</svg>`;

const MOBILE_BAR_HTML = `
<div class="df-mobile-bar">
    <div class="liquidGlass-wrapper">
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>
        <div class="liquidGlass-icons">
            <a href="index.html" class="mobile-tab"><i class="fas fa-home"></i><span>Home</span></a>
            <a href="series.html" class="mobile-tab"><i class="fas fa-tv"></i><span>Series</span></a>
            <a href="movies.html" class="mobile-tab"><i class="fas fa-film"></i><span>Movies</span></a>
            <a href="mylist.html" class="mobile-tab"><i class="fas fa-bookmark"></i><span>My List</span></a>
            <a href="settings.html" class="mobile-tab"><i class="fas fa-user"></i><span>Profile</span></a>
        </div>
    </div>
</div>`;

const GLOBAL_PLAYER_HTML = `
<!-- Global Video Player Modal -->
<div id="video-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;flex-direction:column;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(15px)">
    <div style="position:absolute;top:30px;right:40px;color:#fff;font-size:2rem;cursor:pointer;z-index:10" onclick="DFAuth.UI.closePlayer()"><i class="fas fa-times"></i></div>
    <video id="player-el" controls style="max-width:90%;max-height:80vh;border-radius:12px;box-shadow:0 30px 100px rgba(0,0,0,1)"></video>
    <h2 id="player-title" style="margin-top:25px;font-size:1.8rem;font-weight:900;text-align:center;letter-spacing:-1px"></h2>
</div>`;

// --- Guard: require auth before injecting nav ---
if (typeof DFAuth !== 'undefined') {
    DFAuth.requireAuth();
}

// Inject HTML
document.body.insertAdjacentHTML('afterbegin', GLASS_SVG);
document.getElementById('nav-placeholder')?.insertAdjacentHTML('afterend', NAV_HTML);
document.getElementById('sidebar-placeholder')?.insertAdjacentHTML('afterend', SIDEBAR_HTML);
document.body.insertAdjacentHTML('beforeend', MOBILE_BAR_HTML);
document.body.insertAdjacentHTML('beforeend', GLOBAL_PLAYER_HTML);

// --- Populate user info in navbar & Check Admin ---
(function populateUser() {
    if (typeof DFAuth === 'undefined') return;
    const user = DFAuth.getUser();
    if (!user) return;

    const avatar = document.getElementById('nav-avatar');
    const username = document.getElementById('nav-username');
    const emailEl = document.getElementById('nav-dropdown-email');

    if (avatar && user.picture) {
        avatar.src = user.picture;
        avatar.onerror = () => { avatar.src = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'; };
    }
    if (username) {
        username.textContent = user.name?.split(' ')[0] || 'User';
    }
    if (emailEl) {
        emailEl.textContent = user.email || '';
    }

    // --- Admin Link Logic ---
    if (DFAuth.isAdmin()) {
        const navLink = document.getElementById('nav-admin-link');
        const navDiv = document.getElementById('nav-admin-divider');
        const sideGrp = document.getElementById('sidebar-admin-group');
        if (navLink) navLink.style.display = 'flex';
        if (navDiv) navDiv.style.display = 'block';
        if (sideGrp) sideGrp.style.display = 'block';
    }

    })();

// --- Profile Dropdown Toggle ---
document.addEventListener('click', (e) => {
    const area = document.getElementById('nav-profile-area');
    const dropdown = document.getElementById('nav-dropdown');
    if (!area || !dropdown) return;

    if (area.contains(e.target)) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    } else {
        dropdown.style.display = 'none';
    }
});

// --- Logout Buttons ---
document.addEventListener('click', (e) => {
    if (e.target.closest('#nav-logout-btn') || e.target.closest('#sidebar-logout')) {
        e.preventDefault();
        if (confirm('Se dÃ©connecter de DreamFlix ?')) {
            DFAuth.logOut();
        }
    }
});

// --- Mobile Bar Active Page ---
const _page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.mobile-tab').forEach(tab => {
    const href = tab.getAttribute('href') || '';
    if (href === _page || ((_page === '' || _page === 'index.html') && href === 'index.html')) {
        tab.classList.add('active');
    }
});

// --- Sidebar Active Link ---
document.querySelectorAll('.sidebar-link:not(#sidebar-logout)').forEach(link => {
    if ((link.getAttribute('href') || '').includes(_page)) {
        link.classList.add('active');
    }
});

