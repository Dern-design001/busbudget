// ============================================================
// auth.js — Google OAuth authentication (replaces PIN)
// ============================================================

let currentUser = null;

// ── Check login status on app load ────────────────────────
async function initAuth() {
  try {
    const res = await fetch('/auth/me', { credentials: 'include' });
    if (res.ok) {
      currentUser = await res.json();
      showApp();
    } else {
      showLoginScreen();
    }
  } catch (err) {
    console.error('Auth check failed:', err);
    showLoginScreen();
  }
}

// ── Show the main app (hide login screen) ─────────────────
function showApp() {
  document.getElementById('auth-gate').style.display = 'none';
  // Update user info in sidebar
  const nameEl   = document.getElementById('user-name');
  const emailEl  = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl)   nameEl.textContent   = currentUser.name  || 'User';
  if (emailEl)  emailEl.textContent  = currentUser.email || '';
  if (avatarEl && currentUser.avatar) {
    avatarEl.src = currentUser.avatar;
    avatarEl.classList.remove('hidden');
    document.getElementById('user-avatar-placeholder')?.classList.add('hidden');
  }
}

// ── Show the login screen (not logged in) ─────────────────
function showLoginScreen() {
  document.getElementById('auth-gate').style.display = '';
}

// ── Logout ────────────────────────────────────────────────
function logout() {
  closeSidebar();
  window.location.href = '/auth/logout';
}
