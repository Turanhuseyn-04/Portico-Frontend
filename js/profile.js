"use strict";

const root = document.getElementById("account");
const ACCOUNT_KEY = "portico-account";
const tripsPage = root.dataset.trips || "trips.html";
const savedPage = root.dataset.saved || "saved.html";
const signInPage = root.dataset.signin || "signin.html";
const registerPage = root.dataset.register || "register.html";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function readAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
  } catch {
    return null;
  }
}

function render() {
  const account = readAccount();
  const title = document.getElementById("accountTitle");
  const meta = document.getElementById("accountMeta");
  const body = document.getElementById("accountBody");
  if (!account || !account.email) {
    title.textContent = "Your account";
    meta.textContent = "Sign in to see the name and email kept in this browser.";
    body.innerHTML = `<div class="empty">
      <h3>No account in this browser</h3>
      <p>Create an account, or sign in with the email you registered.</p>
      <a class="change-search" href="${escapeHtml(registerPage)}">Create an account</a>
      <a class="change-search" href="${escapeHtml(signInPage)}">Sign in</a>
    </div>`;
    return;
  }
  document.title = `${account.name || "Your account"} — Portico`;
  title.textContent = account.name || "Your account";
  meta.textContent = "The name and email for this browser.";
  body.innerHTML = `<div class="account-panel">
    <dl class="trip-facts">
      <div><dt>Name</dt><dd>${escapeHtml(account.name || "—")}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(account.email)}</dd></div>
    </dl>
    <div class="account-links">
      <a class="change-search" href="${escapeHtml(tripsPage)}">Your trips</a>
      <a class="change-search" href="${escapeHtml(savedPage)}">Saved stays</a>
    </div>
    <p class="preview-note">Preview only. The password is not stored. Portico.Api will keep the account later.</p>
  </div>`;
}

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}
document.addEventListener("click", (event) => {
  if (event.target.closest(".nav a") && nav && navToggle) {
    nav.classList.remove("is-open");
    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
});

render();
