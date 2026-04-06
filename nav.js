// DreamFlix — shared nav + mobile bar injected into every page

const NAV_HTML = `
<nav class="df-nav" id="df-nav">
    <div style="display:flex;align-items:center;gap:28px;flex:1">
        <a href="index.html" class="df-logo"><img src="img/Logo dreamflix.png" alt="DreamFlix"></a>
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
    <div class="nav-right">
        <i class="fas fa-bell"></i>
        <div class="nav-avatar"></div>
    </div>
</nav>`;

const SIDEBAR_HTML = `
<aside class="df-sidebar">
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
        <a href="#" class="sidebar-link" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Log Out</a>
    </div>
</aside>`;

const MOBILE_BAR_HTML = `
<div class="df-mobile-bar">
    <a href="index.html" class="mobile-tab"><i class="fas fa-home"></i><span>Home</span></a>
    <a href="series.html" class="mobile-tab"><i class="fas fa-tv"></i><span>Series</span></a>
    <a href="movies.html" class="mobile-tab"><i class="fas fa-film"></i><span>Movies</span></a>
    <a href="mylist.html" class="mobile-tab"><i class="fas fa-bookmark"></i><span>My List</span></a>
    <a href="settings.html" class="mobile-tab"><i class="fas fa-user"></i><span>Profile</span></a>
</div>`;

// Inject into page
document.getElementById('nav-placeholder')?.insertAdjacentHTML('afterend', NAV_HTML);
document.getElementById('sidebar-placeholder')?.insertAdjacentHTML('afterend', SIDEBAR_HTML);
document.body.insertAdjacentHTML('beforeend', MOBILE_BAR_HTML);

// Log out
document.addEventListener('click', e => {
    if (e.target.closest('#logout-btn')) {
        e.preventDefault();
        if (confirm('Se déconnecter de DreamFlix ?')) location.href = 'index.html';
    }
});
