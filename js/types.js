"use strict";

const root = document.getElementById("types");
const assetRoot = root.dataset.assetRoot || "assets/";
const searchPage = root.dataset.search || "search.html";

// Stand-in catalog. Portico.Api will return these types and apply the filter.
const types = [
  { id: "Hotel", name: "Hotels", image: "hotel.jpg", stays: 3 },
  { id: "Apartment", name: "Apartments", image: "apartment.jpg", stays: 2 },
  { id: "Resort", name: "Resorts", image: "resort.jpg", stays: 1 },
  { id: "Villa", name: "Villas", image: "villa.jpg", stays: 2 }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function searchHref(id) {
  const params = new URLSearchParams({ property: id });
  return `${searchPage}${searchPage.includes("?") ? "&" : "?"}${params}`;
}

// Temporary filter. Replace this with the Portico.Api property-type query.
function filterTypes(query, onlyStays) {
  const needle = query.trim().toLowerCase();
  return types.filter((type) => {
    if (onlyStays && type.stays < 1) return false;
    if (!needle) return true;
    return type.name.toLowerCase().includes(needle) || type.id.toLowerCase().includes(needle);
  });
}

function card(type) {
  const stayLabel = type.stays === 1 ? "1 stay" : `${type.stays} stays`;
  return `<a class="property-card" href="${escapeHtml(searchHref(type.id))}">
    <img src="${assetRoot}${type.image}" alt="">
    <strong>${escapeHtml(type.name)}</strong>
    <span class="type-count">${escapeHtml(stayLabel)}</span>
  </a>`;
}

function render() {
  const query = document.getElementById("typeFilter").value;
  const onlyStays = document.getElementById("typeStay").value === "stays";
  const found = filterTypes(query, onlyStays);
  const grid = document.getElementById("typeGrid");
  const meta = document.getElementById("typeMeta");
  meta.textContent = `${found.length} of ${types.length} property types`;
  if (!found.length) {
    grid.innerHTML = `<div class="empty"><h2>No property type matches</h2><p>Try Hotels, Apartments, Resorts, or Villas.</p></div>`;
    return;
  }
  grid.innerHTML = found.map(card).join("");
}

document.getElementById("typeFilter").addEventListener("input", render);
document.getElementById("typeStay").addEventListener("change", render);
render();

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
let authMode = "signin";

function closeMenu() {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  header.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

function openAuth(mode) {
  if (!authModal || !authForm) return;
  authMode = mode;
  const register = mode === "register";
  document.getElementById("authDone").hidden = true;
  authForm.hidden = false;
  document.getElementById("authTitle").textContent = register ? "Create an account" : "Sign in";
  document.getElementById("authLede").textContent = register
    ? "Guests book stays. Admins run the houses. This preview stores nothing."
    : "Use the same door you will use when the API is connected.";
  document.getElementById("authNameWrap").hidden = !register;
  document.getElementById("authSwitch").textContent = register ? "Already on the list? Sign in" : "New here? Create an account";
  document.getElementById("authSubmit").textContent = register ? "Create account" : "Sign in";
  authForm.reset();
  authModal.hidden = false;
  document.body.classList.add("no-scroll");
  (register ? document.getElementById("authName") : authForm.elements.email).focus();
}

function closeAuth() {
  if (!authModal) return;
  authModal.hidden = true;
  document.body.classList.remove("no-scroll");
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}

document.addEventListener("click", (event) => {
  const auth = event.target.closest("[data-auth]");
  if (auth) {
    closeMenu();
    openAuth(auth.dataset.auth);
    return;
  }
  if (event.target.closest(".nav a")) closeMenu();
  if (event.target.closest("[data-close='modal']")) closeAuth();
});

if (authForm) {
  document.getElementById("authSwitch").addEventListener("click", () => {
    openAuth(authMode === "register" ? "signin" : "register");
  });
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = authForm.elements.email.value.trim();
    authForm.hidden = true;
    const done = document.getElementById("authDone");
    done.hidden = false;
    done.textContent = authMode === "register"
      ? `Account preview for ${email}. Nothing was saved. Registration arrives with the API.`
      : `Signed-in preview for ${email}. Nothing was saved. Sign-in arrives with the API.`;
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && authModal && !authModal.hidden) closeAuth();
});
