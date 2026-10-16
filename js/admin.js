"use strict";

const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const STORE = "portico-reservations";
const ACCOUNT_KEY = "portico-account";
const SAVED_KEY = "portico:saved";

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
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function parseKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDay(key) {
  return key ? dateFmt.format(parseKey(key)) : "";
}

function money(amount) {
  return moneyFmt.format(Number(amount) || 0);
}

function imageSrc(image, assetRoot) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
}

function withPath(base, value) {
  if (!base) return "";
  if (base.includes("?")) return `${base}${encodeURIComponent(value)}`;
  return `${base.replace(/\/$/, "")}/${encodeURIComponent(value)}`;
}

function cancelHref(base, reference) {
  if (!base) return "";
  if (base.includes("?")) return `${base}${encodeURIComponent(reference)}`;
  return `${base.replace(/\/$/, "")}/${encodeURIComponent(reference)}/cancel`;
}

function nights(trip) {
  return Math.round((parseKey(trip.checkOut) - parseKey(trip.checkIn)) / 86400000);
}

function due(trip) {
  return trip.cancelled && trip.refund ? 0 : Number(trip.total) || 0;
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

function statusOf(trip) {
  if (trip.cancelled) return "Cancelled";
  const now = today();
  if (now < parseKey(trip.checkIn)) return "Upcoming";
  if (now < parseKey(trip.checkOut)) return "In house";
  return "Past";
}

function cancellationText(trip) {
  if (!trip.refundable) return "Non-refundable";
  return `Refundable until ${dateFmt.format(deadline(trip))}`;
}

function refundText(trip) {
  if (!trip.cancelled) return "";
  return trip.refund ? "The total was returned." : "The total stays due.";
}

function readSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || "{}");
  } catch {
    return {};
  }
}

function allTrips() {
  return Object.values({ ...samples, ...readSaved() }).sort((a, b) => String(a.checkIn).localeCompare(String(b.checkIn)));
}

function readAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
  } catch {
    return null;
  }
}

function readSavedStays() {
  try {
    const ids = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function properties() {
  return typeof MOCK_PROPERTIES === "undefined" ? [] : MOCK_PROPERTIES;
}

function policyFor(type) {
  return (typeof MOCK_POLICIES === "undefined" ? {} : MOCK_POLICIES)[type] || {};
}

function lowestRate(property) {
  const prices = (property.rooms || []).map((room) => room.price).filter((price) => price != null);
  return prices.length ? Math.min(...prices) : 0;
}

function bindMenu() {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  if (!navToggle) return;
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav a")) {
      nav.classList.remove("is-open");
      header.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
  });
}

function reservationRow(trip, urls, assetRoot) {
  const guest = [trip.name, trip.email].filter(Boolean).join(" · ") || "No guest name on this record";
  const party = [`${trip.adults || 0} adults`, trip.children ? `${trip.children} children` : "", `${trip.rooms || 1} room${trip.rooms === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
  const refund = refundText(trip);
  return `<article class="trip-row">
    <img src="${escapeHtml(imageSrc(trip.image, assetRoot))}" alt="" width="320" height="220">
    <div>
      <p class="stay-type"><a href="${escapeHtml(withPath(urls.guest, trip.reference))}">${escapeHtml(trip.reference)}</a></p>
      <h2><a href="${escapeHtml(withPath(urls.detail, trip.reference))}">${escapeHtml(trip.propertyName)}</a></h2>
      <p class="where-line">${escapeHtml(trip.roomName || "Room")} · ${escapeHtml(trip.city || "")}</p>
      <p class="where-line">${escapeHtml(formatDay(trip.checkIn))} – ${escapeHtml(formatDay(trip.checkOut))} · ${nights(trip)} nights</p>
      <p class="where-line">${escapeHtml(party)}</p>
      <p class="where-line">${escapeHtml(guest)}</p>
      <p class="where-line">${escapeHtml(money(trip.nightly))} a night · ${escapeHtml(cancellationText(trip))}</p>
      <p class="where-line">${escapeHtml(statusOf(trip))}${refund ? ` · ${escapeHtml(refund)}` : ""}</p>
    </div>
    <p class="trip-total">${escapeHtml(money(due(trip)))}</p>
  </article>`;
}

function renderPanel() {
  const root = document.getElementById("admin");
  const assetRoot = root.dataset.assetRoot || "assets/";
  const urls = {
    guest: root.dataset.guest || "reservation.html?ref=",
    detail: root.dataset.detail || "admin-reservation.html?ref=",
    stay: root.dataset.stay || "admin-stay.html?id="
  };
  const query = document.getElementById("adminQuery");
  const city = document.getElementById("adminCity");
  const status = document.getElementById("adminStatus");
  const type = document.getElementById("adminType");

  const cities = [...new Set(allTrips().map((trip) => trip.city).filter(Boolean))].sort();
  city.innerHTML = `<option value="">All cities</option>${cities.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}`;

  function draw() {
    const trips = allTrips();
    const text = query.value.trim().toLowerCase();
    const filtered = trips.filter((trip) => {
      const haystack = `${trip.reference} ${trip.email || ""} ${trip.propertyName}`.toLowerCase();
      if (text && !haystack.includes(text)) return false;
      if (city.value && trip.city !== city.value) return false;
      if (status.value && statusOf(trip) !== status.value) return false;
      return true;
    });
    const cancelled = trips.filter((trip) => trip.cancelled).length;
    const owed = trips.reduce((sum, trip) => sum + due(trip), 0);
    document.getElementById("adminCounts").innerHTML = [
      ["Stays", properties().length],
      ["Reservations", trips.length],
      ["Cancelled", cancelled],
      ["Still due", money(owed)]
    ].map(([label, value]) => `<div class="admin-count"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");

    const upcoming = filtered.filter((trip) => statusOf(trip) === "Upcoming");
    document.getElementById("adminNext").innerHTML = upcoming.length
      ? `<div class="trip-list">${upcoming.map((trip) => reservationRow(trip, urls, assetRoot)).join("")}</div>`
      : `<div class="empty"><h3>No upcoming arrivals</h3><p>Reservations that check in next appear here.</p></div>`;

    document.getElementById("adminReservations").innerHTML = filtered.length
      ? `<div class="trip-list">${filtered.map((trip) => reservationRow(trip, urls, assetRoot)).join("")}</div>`
      : `<div class="empty"><h3>No reservations match</h3><p>PT-656069 is the sample. A booking made in this browser is added beside it.</p></div>`;

    const stayText = text;
    const stays = properties().filter((property) => {
      if (type.value && property.type !== type.value) return false;
      if (stayText && !property.name.toLowerCase().includes(stayText)) return false;
      return true;
    });
    document.getElementById("adminStays").innerHTML = stays.length
      ? `<div class="trip-list">${stays.map((property) => stayRow(property, urls, assetRoot)).join("")}</div>`
      : `<div class="empty"><h3>No stays match</h3><p>The catalog is the eight houses already on the site.</p></div>`;

    const account = readAccount();
    const savedIds = readSavedStays();
    const saved = properties().filter((property) => savedIds.has(property.id));
    const savedHtml = saved.length
      ? `<ul class="admin-saved">${saved.map((property) => `<li><a href="${escapeHtml(withPath(urls.stay, property.id))}">${escapeHtml(property.name)}</a></li>`).join("")}</ul>`
      : `<p>No saved stays in this browser.</p>`;
    document.getElementById("adminAccount").innerHTML = account && account.email
      ? `<dl class="trip-facts"><div><dt>Name</dt><dd>${escapeHtml(account.name || "—")}</dd></div><div><dt>Email</dt><dd>${escapeHtml(account.email)}</dd></div></dl>${savedHtml}`
      : `<div class="empty"><h3>No account in this browser</h3><p>Create an account on the register page. The password is not kept.</p></div>`;
  }

  query.addEventListener("input", draw);
  city.addEventListener("change", draw);
  status.addEventListener("change", draw);
  type.addEventListener("change", draw);
  draw();
}

function stayRow(property, urls, assetRoot) {
  const address = property.address || {};
  const photo = property.gallery && property.gallery[0] && property.gallery[0].src;
  const where = [address.area, address.city].filter(Boolean).join(" · ");
  return `<a class="trip-row" href="${escapeHtml(withPath(urls.stay, property.id))}">
    <img src="${escapeHtml(imageSrc(photo, assetRoot))}" alt="" width="320" height="220">
    <div>
      <p class="stay-type">${escapeHtml(property.type || "Stay")}${property.stars ? ` · ${escapeHtml(property.stars)} stars` : ""}</p>
      <h2>${escapeHtml(property.name)}</h2>
      <p class="where-line">${escapeHtml(where)}</p>
      <p class="where-line">${escapeHtml(property.score)} · ${escapeHtml(property.reviewCount)} reviews</p>
    </div>
    <p class="trip-total">${escapeHtml(money(lowestRate(property)))}</p>
  </a>`;
}

function renderReservation() {
  const root = document.getElementById("adminReservation");
  const reference = (root.dataset.reference || new URLSearchParams(window.location.search).get("ref") || "").trim();
  const trip = allTrips().find((item) => item.reference === reference);
  const title = document.getElementById("adminReservationTitle");
  const body = document.getElementById("adminReservationBody");
  if (!trip) {
    title.textContent = reference || "Reservation";
    body.innerHTML = `<div class="empty"><h3>No reservation for this reference</h3><p>The sample reference is PT-656069.</p><a class="change-search" href="${escapeHtml(root.dataset.admin || "admin.html")}">Back to admin</a></div>`;
    return;
  }
  document.title = `${trip.reference} — Admin — Portico`;
  title.textContent = trip.reference;
  const refund = refundText(trip);
  body.innerHTML = `<div class="account-panel">
    <dl class="trip-facts">
      <div><dt>Guest</dt><dd>${escapeHtml(trip.name || "—")}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(trip.email || "—")}</dd></div>
      <div><dt>Property</dt><dd>${escapeHtml(trip.propertyName)}</dd></div>
      <div><dt>Room</dt><dd>${escapeHtml(trip.roomName || "—")}</dd></div>
      <div><dt>City</dt><dd>${escapeHtml([trip.area, trip.city, trip.country].filter(Boolean).join(" · "))}</dd></div>
      <div><dt>Dates</dt><dd>${escapeHtml(formatDay(trip.checkIn))} – ${escapeHtml(formatDay(trip.checkOut))}</dd></div>
      <div><dt>Nights</dt><dd>${nights(trip)}</dd></div>
      <div><dt>Party</dt><dd>${escapeHtml(`${trip.adults || 0} adults${trip.children ? `, ${trip.children} children` : ""}, ${trip.rooms || 1} room${trip.rooms === 1 ? "" : "s"}`)}</dd></div>
      <div><dt>Nightly rate</dt><dd>${escapeHtml(money(trip.nightly))}</dd></div>
      <div><dt>Total</dt><dd>${escapeHtml(money(due(trip)))}</dd></div>
      <div><dt>Cancellation</dt><dd>${escapeHtml(cancellationText(trip))}</dd></div>
      <div><dt>Status</dt><dd>${escapeHtml(statusOf(trip))}</dd></div>
    </dl>
    ${refund ? `<p>${escapeHtml(refund)}</p>` : ""}
    <div class="account-links">
      <a class="change-search" href="${escapeHtml(withPath(root.dataset.guest || "reservation.html?ref=", trip.reference))}">Guest page</a>
      <a class="change-search" href="${escapeHtml(cancelHref(root.dataset.cancel || "cancel.html?ref=", trip.reference))}">Cancel page</a>
      <a class="change-search" href="${escapeHtml(root.dataset.admin || "admin.html")}">Back to admin</a>
    </div>
  </div>`;
}

function renderStay() {
  const root = document.getElementById("adminStay");
  const id = (root.dataset.stayId || new URLSearchParams(window.location.search).get("id") || "").trim();
  const property = properties().find((item) => item.id === id);
  const title = document.getElementById("adminStayTitle");
  const body = document.getElementById("adminStayBody");
  const assetRoot = root.dataset.assetRoot || "assets/";
  if (!property) {
    title.textContent = "Stay";
    body.innerHTML = `<div class="empty"><h3>That stay is not in the catalog</h3><a class="change-search" href="${escapeHtml(root.dataset.admin || "admin.html")}">Back to admin</a></div>`;
    return;
  }
  const address = property.address || {};
  const policy = policyFor(property.type);
  document.title = `${property.name} — Admin — Portico`;
  title.textContent = property.name;
  const rooms = (property.rooms || []).map((room) => `<li>
    <strong>${escapeHtml(room.name)}</strong>
    <span>Sleeps ${escapeHtml(room.sleeps)} · ${escapeHtml(room.beds)} · ${escapeHtml(room.size)} m²</span>
    <span>${escapeHtml(money(room.price))} · ${room.breakfast ? "Breakfast included" : "Room only"} · ${room.refundable ? "Refundable" : "Non-refundable"} · ${escapeHtml(room.inventory)} for sale</span>
  </li>`).join("");
  body.innerHTML = `<p class="where-line">${escapeHtml(property.type || "")}${property.stars ? ` · ${escapeHtml(property.stars)} stars` : ""} · ${escapeHtml(property.score)} from ${escapeHtml(property.reviewCount)} reviews</p>
    <p>${escapeHtml(property.summary || "")}</p>
    <dl class="trip-facts">
      <div><dt>Address</dt><dd>${escapeHtml([address.street, address.postcode, address.area, address.city, address.country].filter(Boolean).join(", "))}</dd></div>
      <div><dt>Check-in</dt><dd>${escapeHtml(policy.checkIn || "—")}</dd></div>
      <div><dt>Check-out</dt><dd>${escapeHtml(policy.checkOut || "—")}</dd></div>
      <div><dt>Minimum stay</dt><dd>${escapeHtml(policy.minNights || 1)} night${policy.minNights === 1 ? "" : "s"}</dd></div>
    </dl>
    <h2>Rooms</h2>
    <ul class="admin-rooms">${rooms}</ul>
    <div class="account-links">
      <a class="change-search" href="${escapeHtml(withPath(root.dataset.property || "property.html?id=", property.id))}">Public page</a>
      <a class="change-search" href="${escapeHtml(root.dataset.admin || "admin.html")}">Back to admin</a>
    </div>
    <p class="preview-note">Read only. Portico.Api will save edits later.</p>`;
}

bindMenu();
if (document.getElementById("admin")) renderPanel();
if (document.getElementById("adminReservation")) renderReservation();
if (document.getElementById("adminStay")) renderStay();
