"use strict";

const root = document.getElementById("trips");
const assetRoot = root.dataset.assetRoot || "assets/";
const reservationPage = root.dataset.reservation || "reservation.html?ref=";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const STORE = "portico-reservations";

// Stand-in list. Portico.Api will return the signed-in guest's reservations.
const samples = {
  "PT-656069": {
    reference: "PT-656069",
    propertyId: "marble",
    propertyName: "The Marble Court",
    city: "Lisbon",
    country: "Portugal",
    area: "Chiado",
    image: "lisbon.jpg",
    roomName: "Deluxe Courtyard Suite",
    checkIn: "2026-11-12",
    checkOut: "2026-11-15",
    total: 1026
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

function imageSrc(image) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
}

function tripHref(reference) {
  return `${reservationPage}${encodeURIComponent(reference)}`;
}

function readSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || "{}");
  } catch {
    return {};
  }
}

function allTrips() {
  const merged = { ...samples, ...readSaved() };
  return Object.values(merged).sort((a, b) => String(a.checkIn).localeCompare(String(b.checkIn)));
}

function row(trip) {
  const where = [trip.area, trip.city, trip.country].filter(Boolean).join(" · ");
  return `<a class="trip-row" href="${escapeHtml(tripHref(trip.reference))}">
    <img src="${escapeHtml(imageSrc(trip.image))}" alt="" width="320" height="220">
    <div>
      <p class="stay-type">${escapeHtml(trip.reference)}</p>
      <h2>${escapeHtml(trip.propertyName)}</h2>
      <p class="where-line">${escapeHtml(formatDay(trip.checkIn))} – ${escapeHtml(formatDay(trip.checkOut))}</p>
      ${trip.cancelled ? `<p class="where-line">Cancelled</p>` : ""}
      ${where ? `<p class="where-line">${escapeHtml(where)}</p>` : ""}
    </div>
    <p class="trip-total">${escapeHtml(money(trip.cancelled && trip.refund ? 0 : trip.total))}</p>
  </a>`;
}

function render() {
  const trips = allTrips();
  const meta = document.getElementById("tripsMeta");
  const list = document.getElementById("tripList");
  meta.textContent = trips.length === 1 ? "1 stay" : `${trips.length} stays`;
  if (!trips.length) {
    list.innerHTML = `<div class="empty"><h3>No trips yet</h3><p>A reservation made in this browser is listed here after you confirm it.</p></div>`;
    return;
  }
  list.innerHTML = `<div class="trip-list">${trips.map(row).join("")}</div>`;
}

render();

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
