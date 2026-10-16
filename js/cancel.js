"use strict";

const root = document.getElementById("cancel");
const assetRoot = root.dataset.assetRoot || "assets/";
const reservationBase = root.dataset.reservation || "reservation.html?ref=";
const cancelBase = root.dataset.cancel || "cancel.html?ref=";
const tripsPage = root.dataset.trips || "trips.html";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
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

function reservationHref(reference) {
  return `${reservationBase}${encodeURIComponent(reference)}`;
}

function cancelHref(reference) {
  const base = cancelBase.replace(/\/$/, "");
  if (base.includes("?")) return `${base}${encodeURIComponent(reference)}`;
  return `${base}/${encodeURIComponent(reference)}/cancel`;
}

function deadline(trip) {
  const day = parseKey(trip.checkIn);
  day.setDate(day.getDate() - 3);
  return day;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function refundDue(trip) {
  return Boolean(trip.refundable) && today() <= deadline(trip);
}

function outcome(trip) {
  const total = money(trip.total);
  if (trip.cancelled) {
    return trip.refund
      ? `Cancelled. ${total} is released, so the total is now €0. This preview had taken no payment.`
      : `Cancelled. ${total} stays due.`;
  }
  if (!trip.refundable) {
    return `This stay is non-refundable. Cancelling keeps ${total} due.`;
  }
  const limit = dateFmt.format(deadline(trip));
  if (refundDue(trip)) {
    return `Free cancellation until ${limit}. Cancel by then and ${total} is released. This preview took no payment, so the total returns to €0.`;
  }
  return `Free cancellation closed on ${limit}. ${total} stays due.`;
}

function showMissing(reference) {
  document.getElementById("cancelTitle").textContent = reference || "Cancel a reservation";
  document.getElementById("cancelMeta").textContent = reference
    ? "This reference is not on this browser."
    : "A cancellation opens one reservation by its reference.";
  document.getElementById("cancelBody").innerHTML = `<div class="empty">
    <h3>${reference ? "No reservation for this reference" : "Open a reference"}</h3>
    <p>PT-656069 can be cancelled in this preview. Free cancellation runs until 9 November 2026.</p>
    <a class="change-search" href="${escapeHtml(cancelHref("PT-656069"))}">Open PT-656069</a>
  </div>`;
}

function stayHtml(trip) {
  const where = [trip.area, trip.city, trip.country].filter(Boolean).join(" · ");
  const limit = trip.refundable ? dateFmt.format(deadline(trip)) : "Non-refundable";
  const kept = trip.cancelled && trip.refund ? "€0" : money(trip.total);
  return `<div class="reserve-stay">
    <img src="${escapeHtml(imageSrc(trip.image))}" alt="">
    <div>
      <p class="stay-type">${escapeHtml(trip.reference)}</p>
      <h2>${escapeHtml(trip.propertyName)}</h2>
      <p class="where-line">${escapeHtml(where)}</p>
    </div>
  </div>
  <dl class="trip-facts">
    <div><dt>Room</dt><dd>${escapeHtml(trip.roomName)}</dd></div>
    <div><dt>Check-in</dt><dd>${escapeHtml(formatDay(trip.checkIn))}</dd></div>
    <div><dt>Deadline</dt><dd class="${trip.refundable ? "" : "is-locked"}">${escapeHtml(limit)}</dd></div>
    <div><dt>Total</dt><dd>${escapeHtml(kept)}</dd></div>
  </dl>
  <p>${escapeHtml(outcome(trip))}</p>`;
}

function render(trip) {
  document.title = `Cancel ${trip.reference} — Portico`;
  document.getElementById("cancelTitle").textContent = trip.cancelled ? "Reservation cancelled" : "Cancel this reservation";
  document.getElementById("cancelMeta").textContent = trip.propertyName;
  const action = trip.cancelled
    ? `<a class="change-search trip-open" href="${escapeHtml(reservationHref(trip.reference))}">Back to the reservation</a>
       <a class="account-switch" href="${escapeHtml(tripsPage)}">Your trips</a>`
    : `<form id="cancelForm">
         <button class="search-btn auth-submit" type="submit">Cancel this reservation</button>
         <p class="preview-note">Preview only. Nothing was charged.</p>
       </form>
       <a class="account-switch" href="${escapeHtml(reservationHref(trip.reference))}">Keep this reservation</a>`;
  document.getElementById("cancelBody").innerHTML = `<div class="account-panel">${stayHtml(trip)}${action}</div>`;
  const form = document.getElementById("cancelForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    render(await PorticoApi.cancelReservation(trip.reference));
  });
}

async function start() {
  const reference = (root.dataset.reference || new URLSearchParams(window.location.search).get("ref") || "").trim();
  const trip = await PorticoApi.getReservation(reference);
  if (trip) render(trip);
  else showMissing(reference);
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

start();
