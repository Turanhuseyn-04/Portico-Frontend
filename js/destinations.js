"use strict";

const root = document.getElementById("destinations");
const assetRoot = root.dataset.assetRoot || "assets/";
const searchPage = root.dataset.search || "search.html";

// Stand-in catalog. Portico.Api will return this list and apply the filter.
const places = [
  { city: "Lisbon", country: "Portugal", image: "lisbon-city.jpg", stays: 1 },
  { city: "Amalfi", country: "Italy", image: "amalfi.jpg", stays: 1 },
  { city: "Marrakech", country: "Morocco", image: "marrakech-city.jpg", stays: 1 },
  { city: "Kyoto", country: "Japan", image: "kyoto-city.jpg", stays: 1 },
  { city: "Copenhagen", country: "Denmark", image: "copenhagen.jpg", stays: 1 },
  { city: "Oaxaca", country: "Mexico", image: "oaxaca.jpg", stays: 1 },
  { city: "Porto", country: "Portugal", image: "porto.jpg", stays: 1 },
  { city: "Edinburgh", country: "Scotland", image: "edinburgh.jpg", stays: 1 },
  { city: "Rome", country: "Italy", image: "rome.jpg", stays: 0 },
  { city: "Athens", country: "Greece", image: "athens.jpg", stays: 0 },
  { city: "Paris", country: "France", image: "paris.jpg", stays: 0 },
  { city: "Istanbul", country: "Turkey", image: "istanbul.jpg", stays: 0 },
  { city: "Venice", country: "Italy", image: "venice.jpg", stays: 0 }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function searchHref(city) {
  const params = new URLSearchParams({ destination: city });
  return `${searchPage}${searchPage.includes("?") ? "&" : "?"}${params}`;
}

// Temporary filter. Replace this with the Portico.Api destination query.
function filterPlaces(query, onlyStays) {
  const needle = query.trim().toLowerCase();
  return places.filter((place) => {
    if (onlyStays && place.stays < 1) return false;
    if (!needle) return true;
    return place.city.toLowerCase().includes(needle) || place.country.toLowerCase().includes(needle);
  });
}

function card(place) {
  const stayLabel = place.stays === 1 ? "1 stay" : place.stays ? `${place.stays} stays` : "No stay on the list yet";
  return `<a class="trend-card" href="${escapeHtml(searchHref(place.city))}">
    <img src="${assetRoot}${place.image}" alt="" width="800" height="1000">
    <div class="shade"></div>
    <div class="trend-meta">
      <h3>${escapeHtml(place.city)}</h3>
      <p>${escapeHtml(place.country)} · ${escapeHtml(stayLabel)}</p>
    </div>
  </a>`;
}

function render() {
  const query = document.getElementById("destinationFilter").value;
  const onlyStays = document.getElementById("destinationStay").value === "stays";
  const found = filterPlaces(query, onlyStays);
  const grid = document.getElementById("destinationGrid");
  const meta = document.getElementById("destinationMeta");
  meta.textContent = `${found.length} of ${places.length} destinations`;
  if (!found.length) {
    grid.innerHTML = `<div class="empty"><h2>No destination matches</h2><p>Try another city or country, or show every destination.</p></div>`;
    return;
  }
  grid.innerHTML = found.map(card).join("");
}

document.getElementById("destinationFilter").addEventListener("input", render);
document.getElementById("destinationStay").addEventListener("change", render);
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
