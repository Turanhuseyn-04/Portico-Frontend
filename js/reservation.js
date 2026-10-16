"use strict";

const root = document.getElementById("reservation");
const assetRoot = root.dataset.assetRoot || "assets/";
const propertyPage = root.dataset.property || "property.html";
const selfPage = root.dataset.self || "reservation.html?ref=";
const tripsPage = root.dataset.trips || "trips.html";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const STORE = "portico-reservations";

// Stand-in record. Portico.Api will return the reservation for this reference.
const samples = {
  "PT-656069": {
    reference: "PT-656069",
    propertyId: "marble",
    propertyName: "The Marble Court",
    city: "Lisbon",
    country: "Portugal",
    area: "Chiado",
    image: "lisbon.jpg",
    roomId: "suite",
    roomName: "Deluxe Courtyard Suite",
    checkIn: "2026-11-12",
    checkOut: "2026-11-15",
    refundable: true,
    nightly: 342,
    total: 1026,
    rooms: 1,
    adults: 2,
    children: 0
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function parseKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDay(key) {
  return dateFmt.format(parseKey(key));
}

function money(amount) {
  return moneyFmt.format(amount);
}

function nightCount(checkIn, checkOut) {
  return Math.round((parseKey(checkOut) - parseKey(checkIn)) / 86400000);
}

function imageSrc(image) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
}

function propertyHref(trip) {
  const params = new URLSearchParams({ id: trip.propertyId });
  if (trip.checkIn) params.set("checkIn", trip.checkIn);
  if (trip.checkOut) params.set("checkOut", trip.checkOut);
  if (trip.adults) params.set("adults", String(trip.adults));
  if (trip.rooms) params.set("rooms", String(trip.rooms));
  return `${propertyPage}${propertyPage.includes("?") ? "&" : "?"}${params}`;
}

function sampleHref() {
  return `${selfPage}PT-656069`;
}

// A reservation made in this browser is kept until the tab closes.
function readSaved(reference) {
  try {
    const all = JSON.parse(sessionStorage.getItem(STORE) || "{}");
    return all[reference] || null;
  } catch {
    return null;
  }
}

function findReservation(reference) {
  if (!reference) return null;
  return readSaved(reference) || samples[reference] || null;
}

function cancellation(trip) {
  if (!trip.refundable) return { text: "Non-refundable", locked: true };
  const day = parseKey(trip.checkIn);
  day.setDate(day.getDate() - 3);
  return { text: dateFmt.format(day), locked: false };
}

function renderMissing(reference) {
  document.getElementById("reservationTitle").textContent = reference ? reference : "Reservation";
  document.getElementById("reservationMeta").textContent = reference
    ? "This reference is not on this browser."
    : "A confirmation email opens one reservation by its reference.";
  document.getElementById("reservationBody").innerHTML = `<div class="empty">
    <h3>${reference ? "No reservation for this reference" : "Open a reference"}</h3>
    <p>The confirmation for PT-656069 is the sample this preview can open.</p>
    <a class="change-search" href="${escapeHtml(sampleHref())}">Open PT-656069</a>
  </div>`;
}

function renderTrip(trip) {
  const nights = nightCount(trip.checkIn, trip.checkOut);
  const cancel = cancellation(trip);
  const where = [trip.area, trip.city, trip.country].filter(Boolean).join(" · ");
  document.title = `${trip.reference} — Portico`;
  document.getElementById("reservationTitle").textContent = trip.reference;
  document.getElementById("reservationMeta").textContent = trip.propertyName;
  document.getElementById("reservationBody").innerHTML = `<article class="trip">
    <img src="${escapeHtml(imageSrc(trip.image))}" alt="${escapeHtml(trip.propertyName)}${trip.city ? ` in ${escapeHtml(trip.city)}` : ""}" width="800" height="600">
    <div>
      <p class="stay-type">${escapeHtml(trip.roomName)}</p>
      <h2>${escapeHtml(trip.propertyName)}</h2>
      <p class="where-line">${escapeHtml(where)}</p>
      <dl class="trip-facts">
        <div><dt>Room</dt><dd>${escapeHtml(trip.roomName)}</dd></div>
        <div><dt>Check-in</dt><dd>${escapeHtml(formatDay(trip.checkIn))}</dd></div>
        <div><dt>Check-out</dt><dd>${escapeHtml(formatDay(trip.checkOut))}</dd></div>
        <div><dt>Cancellation</dt><dd class="${cancel.locked ? "is-locked" : ""}">${escapeHtml(cancel.text)}</dd></div>
        <div><dt>Total</dt><dd>${escapeHtml(money(trip.total))}</dd></div>
      </dl>
      <p class="formula">${escapeHtml(money(trip.nightly))} × ${nights} night${nights === 1 ? "" : "s"} × ${trip.rooms} room${trip.rooms === 1 ? "" : "s"}</p>
      <a class="change-search trip-open" href="${escapeHtml(propertyHref(trip))}">View the property</a>
      <a class="change-search trip-open" href="${escapeHtml(tripsPage)}">Your trips</a>
    </div>
  </article>`;
}

const reference = (root.dataset.reference || new URLSearchParams(window.location.search).get("ref") || "").trim();
const trip = findReservation(reference);
if (trip) renderTrip(trip);
else renderMissing(reference);

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
