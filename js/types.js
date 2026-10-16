"use strict";

const root = document.getElementById("types");
const assetRoot = root.dataset.assetRoot || "assets/";
const propertyPage = root.dataset.property || "property.html";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const heartSvg = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const saved = new Set();
const typeNames = { Hotel: "Hotels", Apartment: "Apartments", Resort: "Resorts", Villa: "Villas" };

let stays = [];
let catalogReady = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function money(amount) {
  return moneyFmt.format(amount);
}

function scoreLabel(score) {
  if (score >= 9) return "Wonderful";
  if (score >= 8) return "Excellent";
  return "Good";
}

function stayHref(stay) {
  return `${propertyPage}?${new URLSearchParams({ id: stay.id })}`;
}

// Temporary filter. Replace this with the Portico.Api property-type query.
function filterStays(type, query) {
  const needle = query.trim().toLowerCase();
  return stays.filter((stay) => {
    if (type && stay.property !== type) return false;
    if (!needle) return true;
    return [stay.name, stay.city, stay.country, stay.area].some((value) => value.toLowerCase().includes(needle));
  });
}

function picture(image) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
}

function stayCard(stay) {
  const href = stayHref(stay);
  const savedNow = saved.has(stay.id);
  const policy = stay.cancel ? "Free cancellation until 3 days before check-in." : "Non-refundable once booked.";
  return `<article class="stay" data-href="${escapeHtml(href)}" tabindex="0">
    <div class="stay-media">
      <img src="${picture(stay.image)}" alt="${escapeHtml(stay.name)} in ${escapeHtml(stay.city)}" width="800" height="600" loading="lazy">
      <button class="heart" type="button" data-stay="${stay.id}" data-name="${escapeHtml(stay.name)}" aria-pressed="${savedNow}" aria-label="${savedNow ? "Remove" : "Save"} ${escapeHtml(stay.name)}">${heartSvg}</button>
    </div>
    <div class="stay-body">
      <p class="stay-type">${escapeHtml(stay.property)} · ${escapeHtml(stay.type)} · sleeps ${stay.maxGuests}</p>
      <h3><a href="${escapeHtml(href)}">${escapeHtml(stay.name)}</a></h3>
      <p class="where-line">${escapeHtml(stay.area)} · ${escapeHtml(stay.city)}, ${escapeHtml(stay.country)}</p>
      <p class="cancel${stay.cancel ? "" : " is-locked"}">${escapeHtml(policy)}</p>
      ${stay.scarce ? '<p class="scarce">Only 1 room left at this rate</p>' : ""}
      <div class="pills">${stay.amenities.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
    <div class="stay-side">
      <div class="rating">
        <div><strong>${scoreLabel(stay.score)}</strong><span>${stay.reviews} reviews</span></div>
        <span class="score">${stay.score.toFixed(1)}</span>
      </div>
      <div class="stay-price"><span class="from">from</span><strong>${money(stay.price)}</strong><span class="per">per night</span></div>
    </div>
  </article>`;
}

function render() {
  if (!catalogReady) return;
  const type = document.getElementById("typePick").value;
  const query = document.getElementById("typeFilter").value;
  const found = filterStays(type, query);
  const list = document.getElementById("stayList");
  const title = document.getElementById("typeTitle");
  const meta = document.getElementById("typeMeta");
  title.textContent = type ? typeNames[type] : "All property types";
  meta.textContent = `${found.length} of ${stays.length} stays`;
  if (!found.length) {
    list.innerHTML = `<div class="empty"><h2>No stay matches</h2><p>Try another type, or clear the city.</p></div>`;
    return;
  }
  list.innerHTML = found.map(stayCard).join("");
}

const initialType = new URLSearchParams(window.location.search).get("type") || "";
if (typeNames[initialType]) document.getElementById("typePick").value = initialType;
document.getElementById("typeFilter").addEventListener("input", render);
document.getElementById("typePick").addEventListener("change", render);
document.getElementById("stayList").addEventListener("click", (event) => {
  const heart = event.target.closest(".heart");
  if (heart) {
    event.preventDefault();
    event.stopPropagation();
    const id = heart.dataset.stay;
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    const on = saved.has(id);
    heart.setAttribute("aria-pressed", String(on));
    heart.setAttribute("aria-label", `${on ? "Remove" : "Save"} ${heart.dataset.name}`);
    return;
  }
  if (event.target.closest("a")) return;
  const card = event.target.closest("[data-href]");
  if (card) window.location.href = card.dataset.href;
});
document.getElementById("stayList").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("a, button")) return;
  const card = event.target.closest("[data-href]");
  if (!card) return;
  event.preventDefault();
  window.location.href = card.dataset.href;
});
PorticoApi.listProperties().then((properties) => {
  stays = properties.map((property) => property.card);
  catalogReady = true;
  render();
});

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
