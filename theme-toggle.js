/**
 * Theme Toggle — Shared by all portfolio pages
 * Manages dark/light theme via data-theme on <html>
 * Persists choice in localStorage, respects OS preference on first visit
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'portfolio-theme';

  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    // Add transition class for smooth color shift
    document.documentElement.classList.add('theme-transition');
    setTheme(next);

    setTimeout(function() {
      document.documentElement.classList.remove('theme-transition');
    }, 450);

    // Dispatch event for WebGL canvas or other JS listeners
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  }

  // Ensure theme is set immediately on script execution
  if (!document.documentElement.getAttribute('data-theme')) {
    setTheme(getInitialTheme());
  }

  function bindToggles() {
    var toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function(btn) {
      // Remove existing listeners by cloning or adding clean click listener
      btn.removeEventListener('click', handleToggleClick);
      btn.addEventListener('click', handleToggleClick);
    });
  }

  function handleToggleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  }

  // Bind toggles robustly regardless of document ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggles);
  } else {
    bindToggles();
  }

  // Fallback re-bind after load
  window.addEventListener('load', bindToggles);

  // Listen for OS preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    });
  }
})();
