"use strict";

const $ = (id) => document.getElementById(id);
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const LIMITS = { adults: [1, 8], children: [0, 6], rooms: [1, 4] };
const MAX_NIGHTS = 30;
const REVIEW_PAGE = 4;
const SAVED_KEY = "portico:saved";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const TYPE_COPY = {
  Hotel: { noun: "hotel", unit: "room", units: "rooms", options: "rooms", choose: "Choose your room" },
  Resort: { noun: "resort", unit: "room", units: "rooms", options: "rooms", choose: "Choose your room" },
  Apartment: { noun: "apartment", unit: "apartment", units: "apartments", options: "apartments", choose: "Choose your apartment" },
  Villa: { noun: "villa", unit: "house", units: "houses", options: "rates", choose: "Choose your rate" }
};

const AMENITIES = {
  wifi: ["Free WiFi", '<path d="M3 9a14 14 0 0 1 18 0M6 12.5a9 9 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19.2" r="0.9" fill="currentColor"/>'],
  breakfast: ["Breakfast", '<path d="M4 10h13v3a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v3.5M12 3.5v3.5"/>'],
  ac: ["Air conditioning", '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>'],
  terrace: ["Terrace", '<path d="M3 12a9 9 0 0 1 18 0zM12 12v8M8 20h8"/>'],
  bar: ["Bar", '<path d="M5 4h14l-7 8zM12 12v8M8 20h8"/>'],
  desk: ["24-hour front desk", '<path d="M4 18h16M6 18a6 6 0 0 1 12 0M12 9V7M10 7h4"/>'],
  elevator: ["Lift", '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9.5l3-3 3 3M9 14.5l3 3 3-3"/>'],
  nonsmoking: ["Non-smoking rooms", '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8M7 13h6M15 13h2"/>'],
  garden: ["Garden", '<path d="M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zM12 13c4 0 6-3 6-7-4 0-6 3-6 7zM6 21h12"/>'],
  bath: ["Bathtub", '<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>'],
  kitchen: ["Kitchen", '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M8 6h.01M11 6h.01M9 13h6v4H9z"/>'],
  workspace: ["Workspace", '<rect x="3" y="5" width="18" height="11" rx="1.5"/><path d="M8 20h8M12 16v4"/>'],
  washer: ["Washing machine", '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M8 6.5h.01M11 6.5h3"/>'],
  bike: ["Bicycles", '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l2 7M14 6h2"/>'],
  pool: ["Outdoor pool", '<path d="M3 18c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M8 15V5.5a2 2 0 0 1 4 0M16 15V5.5a2 2 0 0 0-4 0M8 9h8M8 12.5h8"/>'],
  spa: ["Spa", '<path d="M12 20c-5 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-3 7-8 7zM12 17c-2-3-2-7 0-11 2 4 2 8 0 11z"/>'],
  restaurant: ["Restaurant", '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 4-3 7h3v11"/>'],
  view: ["Sea view", '<path d="M3 16c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M3 20c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><circle cx="12" cy="8" r="3"/>'],
  parking: ["Parking", '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V7h3a3 3 0 0 1 0 6h-3"/>'],
  shuttle: ["Airport shuttle", '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M3 11h18"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>'],
  family: ["Family friendly", '<circle cx="8" cy="7" r="2.5"/><circle cx="16.5" cy="9" r="2"/><path d="M3.5 20a4.5 4.5 0 0 1 9 0M13 20a3.5 3.5 0 0 1 7 0"/>'],
  fireplace: ["Fireplace", '<path d="M3 4h18v3H3zM5 7v13h14V7M12 19c-2 0-3-1.3-3-3 0-2 3-3.5 3-6 1.5 1.5 3 3.5 3 6 0 1.7-1 3-3 3z"/>'],
  pin: ["Location", '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>'],
  home: ["Whole place", '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6"/>'],
  grid: ["Photos", '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>'],
  check: ["Included", '<path d="M5 12.5l4.5 4.5L19 7.5"/>'],
  guest: ["Guests", '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>']
};

const params = new URLSearchParams(window.location.search);

const state = {
  id: params.get("id") || "marble",
  property: null,
  checkIn: null,
  checkOut: null,
  hover: null,
  viewMonth: startOfMonth(new Date()),
  adults: 2,
  children: 0,
  rooms: 1,
  roomId: params.get("room") || null,
  offers: null,
  offersStatus: "idle",
  filters: { available: true, fits: true, refundable: false, breakfast: false },
  dateError: "",
  bookError: "",
  active: null,
  reviewFilter: "all",
  reviewSort: "recent",
  reviewLimit: REVIEW_PAGE,
  photos: [],
  photoIndex: 0,
  amenitiesOpen: false
};

const header = $("header");
const nav = $("nav");
const propertyEl = $("property");
const pageState = $("pageState");
const bookCard = $("bookCard");
const datesField = $("datesField");
const checkInBtn = $("checkInBtn");
const checkOutBtn = $("checkOutBtn");
const guestBtn = $("guestBtn");
const calPopover = $("calPopover");
const guestPopover = $("guestPopover");
const roomList = $("roomList");
const subnav = $("subnav");
const mobileBar = $("mobileBar");
const lightbox = $("lightbox");
const reserveModal = $("reserveModal");
const reserveForm = $("reserveForm");
const authModal = $("authModal");
const authForm = $("authForm");

let offersToken = 0;
let lastFocus = null;
let toastTimer = 0;
let authMode = "signin";
let cardInView = true;
let scrollFrame = 0;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function money(amount) {
  return moneyFmt.format(amount);
}

function count(value, one, many) {
  return `${value} ${value === 1 ? one : many}`;
}

function icon(name, size = 22) {
  const path = (AMENITIES[name] || AMENITIES.check)[1];
  return `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function dayTime(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function toKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDay(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function readDay(key) {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const date = parseDay(key);
  return toKey(date) === key ? date : null;
}

function isPast(date) {
  const now = new Date();
  return dayTime(date) < Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function nightCount(start, end) {
  return Math.round((dayTime(end) - dayTime(start)) / 86400000);
}

function formatPretty(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatShort(date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatScore(score) {
  return score === 10 ? "10" : score.toFixed(1);
}

function scoreLabel(score) {
  if (score >= 9) return "Wonderful";
  if (score >= 8) return "Excellent";
  return "Good";
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function copy() {
  return TYPE_COPY[state.property && state.property.type] || TYPE_COPY.Hotel;
}

function hasDates() {
  return Boolean(state.checkIn && state.checkOut);
}

function stayNights() {
  return hasDates() ? nightCount(state.checkIn, state.checkOut) : 0;
}

function people() {
  return state.adults + state.children;
}

function guestLabel() {
  const parts = [count(state.adults, "adult", "adults")];
  if (state.children) parts.push(count(state.children, "child", "children"));
  parts.push(count(state.rooms, copy().unit, copy().units));
  return parts.join(" · ");
}

function minPrice() {
  return Math.min(...state.property.rooms.map((room) => room.price));
}

function minNights() {
  return (state.property && state.property.policies.minNights) || 1;
}

function selectedRoom() {
  return state.property ? state.property.rooms.find((room) => room.id === state.roomId) || null : null;
}

function readQuery() {
  const number = (key, [min, max], fallback) => {
    const value = Number.parseInt(params.get(key), 10);
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  };
  state.adults = number("adults", LIMITS.adults, 2);
  state.children = number("children", LIMITS.children, 0);
  state.rooms = number("rooms", LIMITS.rooms, 1);
  const inKey = params.get("checkIn");
  const outKey = params.get("checkOut");
  if (!inKey && !outKey) return;
  const checkIn = readDay(inKey);
  const checkOut = readDay(outKey);
  if (!checkIn || !checkOut) state.dateError = "The dates in the link could not be read. Choose new dates.";
  else if (isPast(checkIn)) state.dateError = "The check-in date in the link has passed. Choose new dates.";
  else if (dayTime(checkOut) <= dayTime(checkIn)) state.dateError = "Check-out must be after check-in. Choose new dates.";
  else if (nightCount(checkIn, checkOut) > MAX_NIGHTS) state.dateError = `Stays can be up to ${MAX_NIGHTS} nights. Choose new dates.`;
  else {
    state.checkIn = checkIn;
    state.checkOut = checkOut;
    state.viewMonth = startOfMonth(checkIn);
  }
}

function checkMinNights() {
  if (!hasDates() || stayNights() >= minNights()) return;
  state.dateError = `${state.property.name} has a minimum stay of ${minNights()} nights. Choose new dates.`;
  state.checkIn = null;
  state.checkOut = null;
}

function syncUrl() {
  const next = new URLSearchParams({ id: state.id });
  if (hasDates()) {
    next.set("checkIn", toKey(state.checkIn));
    next.set("checkOut", toKey(state.checkOut));
  }
  next.set("adults", String(state.adults));
  if (state.children) next.set("children", String(state.children));
  next.set("rooms", String(state.rooms));
  if (state.roomId) next.set("room", state.roomId);
  if (params.get("mock")) next.set("mock", params.get("mock"));
  window.history.replaceState(null, "", `${window.location.pathname}?${next}${window.location.hash}`);
}

function loadSaved() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("is-on");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("is-on"), 3600);
}

function shake(el) {
  el.classList.remove("is-shake");
  window.requestAnimationFrame(() => el.classList.add("is-shake"));
}

function inView(el) {
  const box = el.getBoundingClientRect();
  return box.bottom > header.offsetHeight && box.top < window.innerHeight;
}

/* ---------- Page load ---------- */

async function loadProperty() {
  propertyEl.hidden = false;
  pageState.hidden = true;
  propertyEl.classList.add("is-loading");
  propertyEl.setAttribute("aria-busy", "true");
  try {
    state.property = await PorticoApi.getProperty(state.id);
  } catch (error) {
    showPageError(error);
    return;
  }
  if (!selectedRoom()) state.roomId = null;
  checkMinNights();
  renderProperty();
  propertyEl.classList.remove("is-loading");
  propertyEl.setAttribute("aria-busy", "false");
  syncUrl();
  if (hasDates()) loadOffers();
  revealSections();
  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
}

function showPageError(error) {
  const notFound = error && error.code === "not-found";
  propertyEl.hidden = true;
  mobileBar.hidden = true;
  pageState.hidden = false;
  document.title = `${notFound ? "Stay not found" : "Stay did not load"} — Portico`;
  pageState.innerHTML = `<div class="state-card">
    <p class="kicker">${notFound ? "Not on the list" : "Something went wrong"}</p>
    <h1>${notFound ? "We could not find that stay" : "This stay did not load"}</h1>
    <p>${notFound ? "The link may be old, or the stay has left the list." : "Check your connection and try again. Nothing was booked."}</p>
    <div class="state-actions">
      ${notFound ? "" : '<button class="btn-ink" type="button" data-retry>Try again</button>'}
      <a class="btn-outline" href="index.html#list">Back to all stays</a>
    </div>
  </div>`;
}

async function loadOffers() {
  const token = ++offersToken;
  state.offersStatus = "loading";
  state.offers = null;
  renderRooms();
  renderBooking();
  try {
    const offers = await PorticoApi.getAvailability(state.id, toKey(state.checkIn), toKey(state.checkOut));
    if (token !== offersToken) return;
    state.offers = new Map(offers.map((offer) => [offer.roomId, offer]));
    state.offersStatus = "ready";
  } catch {
    if (token !== offersToken) return;
    state.offersStatus = "error";
  }
  renderRooms();
  renderBooking();
}

/* ---------- Rendering ---------- */

function renderProperty() {
  const p = state.property;
  document.title = `${p.name}, ${p.address.city} — Portico`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", `${p.summary} ${p.type} in ${p.address.area}, ${p.address.city}. From ${money(minPrice())} a night.`);
  renderHead();
  renderGallery();
  renderAbout();
  renderAmenities();
  renderReviews();
  renderLocation();
  renderRules();
  renderFaq();
  renderGuests();
  updateDateLabels();
  renderRooms();
  renderBooking();
}

function renderHead() {
  const p = state.property;
  const a = p.address;
  $("crumbs").innerHTML = `<a href="index.html">Stays</a><span>${escapeHtml(a.country)}</span><span>${escapeHtml(a.city)}</span><span aria-current="page">${escapeHtml(p.name)}</span>`;
  const stars = p.stars ? `<span class="stars" role="img" aria-label="${p.stars}-star ${copy().noun}">${"★".repeat(p.stars)}</span>` : "";
  $("pType").innerHTML = `<span class="type-pill">${escapeHtml(p.type)}</span>${stars}`;
  $("pName").textContent = p.name;
  $("pAddress").innerHTML = `${icon("pin", 16)}<span>${escapeHtml(a.street)}, ${escapeHtml(a.area)}, ${escapeHtml(a.postcode)} ${escapeHtml(a.city)}, ${escapeHtml(a.country)}</span><a href="#location">Show on map</a>`;
  const score = $("pScore");
  score.hidden = false;
  score.setAttribute("aria-label", `Rated ${formatScore(p.score)} out of 10, ${scoreLabel(p.score)}, from ${p.reviewCount} reviews`);
  score.innerHTML = `<span class="p-score-copy"><strong>${scoreLabel(p.score)}</strong><span>${p.reviewCount} reviews</span></span><span class="score">${formatScore(p.score)}</span>`;
  paintSaved();
}

function paintSaved() {
  const saved = loadSaved().has(state.id);
  const button = $("saveBtn");
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", saved ? "Remove from saved stays" : "Save this stay");
}

function renderGallery() {
  const photos = state.property.gallery;
  const total = photos.length;
  const tiles = photos.slice(0, 5).map((photo, index) => {
    const more = index === 4 && total > 5 ? `<span class="g-more">+${total - 5} photos</span>` : "";
    const loading = index ? 'loading="lazy"' : 'fetchpriority="high"';
    return `<button class="g-tile${index === 0 ? " g-main" : ""}" type="button" data-photo="${index}" aria-label="Open photo ${index + 1} of ${total}: ${escapeHtml(photo.alt)}">
      <img src="${photo.src}" alt="" width="1200" height="800" ${loading}>${more}
    </button>`;
  }).join("");
  $("gallery").innerHTML = `<div class="gallery-grid count-${Math.min(total, 5)}">${tiles}</div>
    <button class="g-all" type="button" data-photo="0">${icon("grid", 16)}Show all ${total} photos</button>`;
}

function renderAbout() {
  const p = state.property;
  $("aboutKicker").textContent = `${p.type} in ${p.address.city}`;
  $("aboutTitle").textContent = `About this ${copy().noun}`;
  $("aboutBody").innerHTML = `<div class="about-copy">
      <p class="about-lead">${escapeHtml(p.summary)}</p>
      ${p.description.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
    </div>
    <div class="highlights">
      <h3>Property highlights</h3>
      <ul>${p.highlights.map((item) => `<li>${icon(item.icon)}<div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></div></li>`).join("")}</ul>
      <a class="btn-ink" href="#rooms">See availability</a>
    </div>`;
}

function renderAmenities() {
  const p = state.property;
  const total = p.amenityGroups.reduce((sum, group) => sum + group.items.length, 0);
  const collapsible = p.amenityGroups.length > 4;
  const groups = p.amenityGroups.map((group) => `<div class="amenity-group">
      <h3>${escapeHtml(group.name)}</h3>
      <ul>${group.items.map((item) => `<li>${icon("check", 16)}${escapeHtml(item)}</li>`).join("")}</ul>
    </div>`).join("");
  $("amenitiesBody").innerHTML = `<ul class="popular">${p.popular.filter((key) => AMENITIES[key]).map((key) => `<li>${icon(key)}<span>${AMENITIES[key][0]}</span></li>`).join("")}</ul>
    <div class="amenity-groups${collapsible && !state.amenitiesOpen ? " is-collapsed" : ""}" id="amenityGroups">${groups}</div>
    ${collapsible ? `<button class="text-link" type="button" id="amenityToggle" aria-controls="amenityGroups" aria-expanded="${state.amenitiesOpen}">${state.amenitiesOpen ? "Show fewer facilities" : `Show all ${total} facilities`}</button>` : ""}`;
}

function roomStatus(room) {
  const fits = room.sleeps * state.rooms >= people();
  if (!hasDates()) return { kind: "nodates", fits, bookable: false };
  if (state.offersStatus !== "ready") return { kind: state.offersStatus, fits, bookable: false };
  const offer = state.offers.get(room.id);
  if (!offer || offer.left === 0) return { kind: "soldout", fits, bookable: false, soldOutOn: offer && offer.soldOutOn };
  if (offer.left < state.rooms) return { kind: "short", fits, bookable: false, left: offer.left };
  return { kind: "available", fits, bookable: true, left: offer.left, total: offer.nightly * offer.nights * state.rooms };
}

function cancelCopy(room) {
  if (!room.refundable) return { text: "Non-refundable. You pay the full amount if you cancel.", locked: true };
  if (!hasDates()) return { text: "Free cancellation until 3 days before check-in.", locked: false };
  const until = addDays(state.checkIn, -3);
  if (isPast(until)) return { text: "Free cancellation has closed for these dates.", locked: true };
  return { text: `Free cancellation until ${formatPretty(until)}.`, locked: false };
}

function roomRows() {
  const rows = state.property.rooms.map((room) => ({ room, status: roomStatus(room) }));
  const checked = hasDates() && state.offersStatus === "ready";
  const shown = rows.filter(({ room, status }) => {
    if (state.filters.fits && !status.fits) return false;
    if (state.filters.refundable && !room.refundable) return false;
    if (state.filters.breakfast && !room.breakfast) return false;
    if (state.filters.available && checked && !status.bookable) return false;
    return true;
  });
  return { rows, shown };
}

function roomCard({ room, status }) {
  const c = copy();
  const selected = room.id === state.roomId;
  const policy = cancelCopy(room);
  const nights = stayNights();
  const notes = [];
  let price;
  if (status.kind === "available") {
    price = `<span class="from">${count(nights, "night", "nights")}, ${count(people(), "guest", "guests")}</span>
      <strong>${money(status.total)}</strong>
      <span class="per">${money(room.price)} × ${nights} × ${count(state.rooms, c.unit, c.units)}</span>`;
    if (status.left <= 2) notes.push(`<p class="scarce">Only ${status.left} left for your dates</p>`);
  } else {
    price = `<span class="from">per night</span><strong>${money(room.price)}</strong><span class="per">${status.kind === "nodates" ? "Add dates for a total" : "&nbsp;"}</span>`;
  }
  if (status.kind === "soldout") notes.push(`<p class="unfit">Sold out${status.soldOutOn ? ` on ${formatPretty(parseDay(status.soldOutOn))}` : ""}. Try moving your dates.</p>`);
  if (status.kind === "short") notes.push(`<p class="unfit">Only ${status.left} left for these dates. You asked for ${state.rooms}.</p>`);
  if (!status.fits) notes.push(`<p class="unfit">Sleeps ${room.sleeps} per ${c.unit}, too few for ${count(people(), "guest", "guests")}. Add a ${c.unit} in Guests or choose a larger one.</p>`);
  const blocked = status.kind === "soldout" || status.kind === "short" || !status.fits;
  const label = selected ? "Selected" : blocked ? "Unavailable" : "Select";
  return `<article class="room-card${selected ? " is-selected" : ""}${blocked ? " is-off" : ""}" data-room="${room.id}">
    <button class="room-photo" type="button" data-room-photo="${room.id}" aria-label="View photo of ${escapeHtml(room.name)}">
      <img src="${room.image}" alt="" width="800" height="600" loading="lazy">
    </button>
    <div class="room-body">
      <h3>${escapeHtml(room.name)}</h3>
      <p class="room-facts"><span>${room.size} m²</span><span>${escapeHtml(room.beds)}</span><span>${icon("guest", 14)}Sleeps ${room.sleeps}</span></p>
      <ul class="room-features">${room.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <p class="cancel${policy.locked ? " is-locked" : ""}">${escapeHtml(policy.text)}</p>
      <p class="room-meal${room.breakfast ? " is-on" : ""}">${room.breakfast ? "Breakfast included" : "Breakfast not included"}</p>
      ${notes.join("")}
    </div>
    <div class="room-side">
      <div class="stay-price">${price}</div>
      <button class="room-select" type="button" data-select="${room.id}" aria-pressed="${selected}" ${blocked && !selected ? "disabled" : ""} aria-label="${label} ${escapeHtml(room.name)}">${selected ? icon("check", 16) : ""}${label}</button>
    </div>
  </article>`;
}

function roomSkeleton() {
  return `<div class="room-card is-skeleton" aria-hidden="true">
    <span class="skel room-photo"></span>
    <div class="room-body"><span class="skel" style="width: 55%; height: 26px"></span><span class="skel" style="width: 70%"></span><span class="skel" style="width: 40%"></span></div>
    <div class="room-side"><span class="skel" style="width: 110px; height: 34px"></span><span class="skel" style="width: 120px; height: 44px"></span></div>
  </div>`;
}

function renderFilters() {
  const options = [
    ["available", "Available for my dates", hasDates()],
    ["fits", `Fits ${count(people(), "guest", "guests")}`, true],
    ["refundable", "Free cancellation", state.property.rooms.some((room) => room.refundable)],
    ["breakfast", "Breakfast included", state.property.rooms.some((room) => room.breakfast)]
  ];
  $("roomFilters").innerHTML = options.filter(([, , show]) => show).map(([key, label]) =>
    `<button class="filter-chip" type="button" data-filter="${key}" aria-pressed="${state.filters[key]}">${state.filters[key] ? icon("check", 14) : ""}${label}</button>`
  ).join("");
}

function renderRoomsMeta() {
  const meta = $("roomsMeta");
  if (!hasDates()) {
    meta.innerHTML = `Prices are per night. <button class="text-link" type="button" data-open-dates>Add your dates</button> to check availability and see the stay total.`;
  } else if (state.offersStatus === "loading") {
    meta.textContent = `Checking availability for ${formatShort(state.checkIn)} – ${formatShort(state.checkOut)}…`;
  } else {
    meta.innerHTML = `${formatShort(state.checkIn)} – ${formatShort(state.checkOut)} · ${count(stayNights(), "night", "nights")} · ${escapeHtml(guestLabel())} · <button class="text-link" type="button" data-open-dates>Change</button>`;
  }
}

function renderRooms() {
  if (!state.property) return;
  const c = copy();
  $("roomsTitle").textContent = c.choose;
  renderRoomsMeta();
  renderFilters();
  if (state.offersStatus === "loading") {
    roomList.setAttribute("aria-busy", "true");
    roomList.innerHTML = state.property.rooms.slice(0, 3).map(roomSkeleton).join("");
    return;
  }
  roomList.setAttribute("aria-busy", "false");
  if (state.offersStatus === "error") {
    roomList.innerHTML = `<div class="empty">
      <h3>Availability did not load</h3>
      <p>We could not check these dates. Nothing was booked.</p>
      <button class="btn-ink" type="button" data-retry-offers>Try again</button>
    </div>`;
    return;
  }
  const { rows, shown } = roomRows();
  if (!shown.length) {
    const allTaken = hasDates() && rows.every(({ status }) => !status.bookable && status.fits);
    const reason = allTaken
      ? `Every ${c.unit} is taken on at least one of these nights. Try moving your dates.`
      : `None of the ${c.options} match your filters and group of ${count(people(), "guest", "guests")}.`;
    roomList.innerHTML = `<div class="empty">
      <h3>No ${c.options} match</h3>
      <p>${reason}</p>
      <div class="empty-actions">
        ${allTaken ? '<button class="btn-ink" type="button" data-open-dates>Change dates</button>' : '<button class="btn-ink" type="button" data-clear-filters>Clear filters</button>'}
      </div>
    </div>`;
    return;
  }
  const hidden = rows.length - shown.length;
  roomList.innerHTML = shown.map(roomCard).join("") + (hidden
    ? `<p class="rooms-hidden">${count(hidden, c.options.replace(/s$/, ""), c.options)} hidden by your filters. <button class="text-link" type="button" data-clear-filters>Show all</button></p>`
    : "");
}

function selectionProblem(room, status) {
  if (!room) return "";
  const c = copy();
  if (!status.fits) return `${room.name} sleeps ${room.sleeps} per ${c.unit}. Add a ${c.unit} or choose a larger one for ${count(people(), "guest", "guests")}.`;
  if (status.kind === "soldout") return `${room.name} is sold out${status.soldOutOn ? ` on ${formatPretty(parseDay(status.soldOutOn))}` : " for these dates"}. Choose another ${c.unit} or move your dates.`;
  if (status.kind === "short") return `Only ${status.left} left at this rate for these dates. Lower the number of ${c.units} or choose another.`;
  return "";
}

function renderBooking() {
  if (!state.property) return;
  const c = copy();
  const room = selectedRoom();
  const status = room ? roomStatus(room) : null;
  const nights = stayNights();
  const total = status && status.bookable ? status.total : 0;

  $("bookPrice").innerHTML = room
    ? `<strong>${money(room.price)}</strong><span>per night · ${escapeHtml(room.name)}</span>`
    : `<span>from</span><strong>${money(minPrice())}</strong><span>per night</span>`;

  const error = state.bookError || state.dateError || selectionProblem(room, status || {});
  $("bookError").textContent = error;

  $("bookRoom").innerHTML = room
    ? `<img src="${room.image}" alt="" width="120" height="90"><div><strong>${escapeHtml(room.name)}</strong><span>${escapeHtml(room.beds)} · sleeps ${room.sleeps}</span></div><a class="text-link" href="#rooms">Change</a>`
    : `<p class="book-hint">No ${c.unit} chosen yet. <a class="text-link" href="#rooms">Choose one below</a></p>`;

  let bill;
  if (!hasDates()) {
    bill = `<p class="formula">Add dates to see the total for your stay.</p>`;
  } else if (state.offersStatus === "loading") {
    bill = `<p class="formula">Checking availability…</p>`;
  } else if (room && status.bookable) {
    const policy = cancelCopy(room);
    bill = `<div class="bill">
      <div><span>Nightly rate</span><span>${money(room.price)}</span></div>
      <div><span>Nights</span><span>${nights}</span></div>
      <div><span>${c.units.charAt(0).toUpperCase()}${c.units.slice(1)}</span><span>${state.rooms}</span></div>
      <div class="total"><span>Stay total</span><span>${money(total)}</span></div>
      <p class="formula">${money(room.price)} × ${nights} × ${state.rooms} · Includes taxes and charges</p>
    </div>
    <p class="cancel${policy.locked ? " is-locked" : ""}">${escapeHtml(policy.text)}</p>`;
  } else {
    bill = `<div class="bill"><div><span>${count(nights, "night", "nights")}</span><span>${formatShort(state.checkIn)} – ${formatShort(state.checkOut)}</span></div></div>
      <p class="formula">${room ? "This choice cannot be booked for these dates." : `Choose a ${c.unit} to see the stay total.`}</p>`;
  }
  $("bookBill").innerHTML = bill;
  $("reserveBtn").textContent = total ? `Reserve for ${money(total)}` : "Reserve";
  $("bookNote").textContent = total ? "You will not be charged yet." : `The total is nightly rate × nights × ${c.units}.`;

  $("mobileTotal").textContent = total ? money(total) : room ? money(room.price) : `from ${money(minPrice())}`;
  $("mobileMeta").textContent = total ? `${count(nights, "night", "nights")} · ${room.name}` : room ? `per night · ${room.name}` : "per night";
  mobileBar.hidden = false;
  paintMobileBar();
}

function paintMobileBar() {
  mobileBar.classList.toggle("is-on", Boolean(state.property) && !cardInView);
}

function renderReviews() {
  const p = state.property;
  const travellers = [...new Set(p.reviews.map((review) => review.traveller))];
  const bars = Object.entries(p.scores).map(([name, value]) => `<div class="bar">
      <span class="bar-label">${escapeHtml(name)}</span>
      <span class="bar-track" aria-hidden="true"><span style="width: ${value * 10}%"></span></span>
      <span class="bar-value">${formatScore(value)}</span>
    </div>`).join("");
  $("reviewsBody").innerHTML = `<div class="review-top">
      <div class="review-summary">
        <span class="score score-lg">${formatScore(p.score)}</span>
        <div><strong>${scoreLabel(p.score)}</strong><span>${p.reviewCount} verified reviews</span></div>
      </div>
      <div class="bars">${bars}</div>
    </div>
    <div class="review-controls">
      <label class="sort">Travellers
        <select id="reviewFilter">
          <option value="all">All travellers (${p.reviews.length})</option>
          ${travellers.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)} (${p.reviews.filter((review) => review.traveller === type).length})</option>`).join("")}
        </select>
      </label>
      <label class="sort">Sort
        <select id="reviewSort">
          <option value="recent">Most recent</option>
          <option value="high">Highest scores</option>
          <option value="low">Lowest scores</option>
        </select>
      </label>
    </div>
    <div class="review-list" id="reviewList" aria-live="polite"></div>
    <div class="review-more" id="reviewMore"></div>`;
  renderReviewList();
}

function renderReviewList() {
  const p = state.property;
  const list = p.reviews.filter((review) => state.reviewFilter === "all" || review.traveller === state.reviewFilter);
  if (state.reviewSort === "high") list.sort((a, b) => b.score - a.score);
  else if (state.reviewSort === "low") list.sort((a, b) => a.score - b.score);
  else list.sort((a, b) => b.date.localeCompare(a.date));
  const visible = list.slice(0, state.reviewLimit);
  if (!visible.length) {
    $("reviewList").innerHTML = `<div class="empty"><h3>No reviews from this group yet</h3><p>Try another traveller type.</p></div>`;
    $("reviewMore").innerHTML = "";
    return;
  }
  $("reviewList").innerHTML = visible.map((review) => {
    const room = p.rooms.find((item) => item.id === review.roomId);
    const initials = review.author.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const stayed = parseDay(review.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return `<article class="review">
      <header>
        <span class="avatar" aria-hidden="true">${escapeHtml(initials)}</span>
        <div><strong>${escapeHtml(review.author)}</strong><span>${escapeHtml(review.country)} · ${escapeHtml(review.traveller)}</span></div>
        <span class="score" aria-label="Scored ${formatScore(review.score)}">${formatScore(review.score)}</span>
      </header>
      <h3>${escapeHtml(review.title)}</h3>
      <p class="review-liked"><span class="sr-only">Liked: </span>${escapeHtml(review.liked)}</p>
      ${review.disliked ? `<p class="review-disliked"><span class="sr-only">Disliked: </span>${escapeHtml(review.disliked)}</p>` : ""}
      <p class="review-meta">${room ? `${escapeHtml(room.name)} · ` : ""}${count(review.nights, "night", "nights")} · Stayed in ${stayed}</p>
    </article>`;
  }).join("");
  const left = list.length - visible.length;
  $("reviewMore").innerHTML = left
    ? `<button class="btn-outline" type="button" data-more-reviews>Show ${count(Math.min(left, REVIEW_PAGE), "more review", "more reviews")}</button>`
    : `<p class="fine-print">Showing ${count(list.length, "recent review", "recent reviews")} of ${p.reviewCount}.</p>`;
}

function renderLocation() {
  const p = state.property;
  const { lat, lng } = p.location;
  const a = p.address;
  const bbox = [lng - 0.01, lat - 0.006, lng + 0.01, lat + 0.006].map((value) => value.toFixed(5)).join(",");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  $("locationBody").innerHTML = `<div class="location-grid">
      <div class="map-card">
        <iframe title="Map showing ${escapeHtml(p.name)}" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer"></iframe>
      </div>
      <div class="location-info">
        <p class="loc-address">${icon("pin")}<span><strong>${escapeHtml(a.area)}, ${escapeHtml(a.city)}</strong>${escapeHtml(a.street)}, ${escapeHtml(a.postcode)} ${escapeHtml(a.city)}, ${escapeHtml(a.country)}</span></p>
        <div class="rating"><span class="score">${formatScore(p.scores.Location)}</span><div><strong>Location: ${scoreLabel(p.scores.Location).toLowerCase()}</strong><span>Rated by guests who stayed</span></div></div>
        <a class="text-link" href="${mapLink}" target="_blank" rel="noopener">Open a larger map</a>
      </div>
    </div>
    <div class="nearby">${p.nearby.map((group) => `<div>
        <h3>${escapeHtml(group.group)}</h3>
        <ul>${group.items.map(([name, distance]) => `<li><span>${escapeHtml(name)}</span><span>${escapeHtml(distance)}</span></li>`).join("")}</ul>
      </div>`).join("")}</div>
    <p class="fine-print">Distances are in straight lines. Walking routes may be longer.</p>`;
}

function cancellationRule() {
  const rooms = state.property.rooms;
  if (rooms.every((room) => room.refundable)) return "Free cancellation until 3 days before check-in. After that, the first night is charged.";
  if (rooms.some((room) => room.refundable)) return "Free cancellation until 3 days before check-in on rates marked free cancellation. Non-refundable rates are charged in full if you cancel.";
  return "Every rate here is non-refundable. You pay the full amount if you cancel.";
}

function renderRules() {
  const pol = state.property.policies;
  const rows = [
    ["Check-in", pol.checkIn],
    ["Check-out", pol.checkOut],
    ["Cancellation", cancellationRule()],
    ["Minimum stay", count(pol.minNights, "night", "nights")],
    ["Children and beds", pol.children],
    ["Age", pol.age],
    ["Pets", pol.pets],
    ["Quiet hours", pol.quiet],
    ["Payment", pol.payment]
  ];
  $("rulesBody").innerHTML = `<dl class="rules">${rows.map(([term, text]) => `<div><dt>${term}</dt><dd>${escapeHtml(text)}</dd></div>`).join("")}</dl>`;
}

function renderFaq() {
  const p = state.property;
  const pol = p.policies;
  const withBreakfast = p.rooms.filter((room) => room.breakfast).map((room) => room.name);
  const around = p.nearby.find((group) => group.group === "Getting around");
  const far = around && around.items[around.items.length - 1];
  const faqs = [
    [`What time is check-in at ${p.name}?`, `Check-in is ${lowerFirst(pol.checkIn)}. Check-out is ${lowerFirst(pol.checkOut)}.`],
    ["Is breakfast included?", withBreakfast.length ? `Breakfast is included with ${withBreakfast.join(", ")}.` : "Breakfast is not included in any rate."],
    ["Can I cancel for free?", cancellationRule()],
    far ? [`How far is ${far[0]}?`, `${far[0]} is ${far[1]} from ${p.name}.`] : null,
    ["Are pets allowed?", pol.pets],
    ["How is the total calculated?", `The total is the nightly rate × the number of nights × the number of ${copy().units}. The total you see before you reserve is the total you pay at the property.`]
  ].filter(Boolean);
  $("faqBody").innerHTML = faqs.map(([question, answer]) => `<details class="faq-item"><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("");
}

/* ---------- Dates and guests ---------- */

function updateDateLabels() {
  const set = (el, date) => {
    el.textContent = date ? formatShort(date) : "Add date";
    el.classList.toggle("is-empty", !date);
  };
  set($("checkInValue"), state.checkIn);
  set($("checkOutValue"), state.checkOut);
}

function renderGuests() {
  const c = copy();
  $("adultsCount").textContent = String(state.adults);
  $("childrenCount").textContent = String(state.children);
  $("roomsCount").textContent = String(state.rooms);
  $("unitStepLabel").textContent = c.units.charAt(0).toUpperCase() + c.units.slice(1);
  $("guestValue").textContent = guestLabel();
  guestPopover.querySelector('[data-step="rooms"][data-dir="-1"]').setAttribute("aria-label", `Remove a ${c.unit}`);
  guestPopover.querySelector('[data-step="rooms"][data-dir="1"]').setAttribute("aria-label", `Add a ${c.unit}`);
  guestPopover.querySelector(".guest-note").textContent = `The stay total is nightly rate × nights × ${c.units}.`;
  guestPopover.querySelectorAll("[data-step]").forEach((button) => {
    const [min, max] = LIMITS[button.dataset.step];
    const value = state[button.dataset.step];
    button.disabled = Number(button.dataset.dir) < 0 ? value <= min : value >= max;
  });
}

function monthIndex(date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function canShift(dir) {
  const min = monthIndex(startOfMonth(new Date()));
  const next = monthIndex(state.viewMonth) + dir;
  return next >= min && next <= min + 18;
}

function navButton(dir) {
  const label = dir < 0 ? "Previous month" : "Next month";
  return `<button class="cal-nav" type="button" data-nav="${dir}" aria-label="${label}" ${canShift(dir) ? "" : "disabled"}>${dir < 0 ? "←" : "→"}</button>`;
}

function daysMarkup(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const pad = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(new Date());
  let html = DOW.map((name) => `<span class="dow">${name}</span>`).join("");
  for (let i = 0; i < pad; i += 1) html += '<span class="day-pad"></span>';
  for (let day = 1; day <= days; day += 1) {
    const current = new Date(year, month, day);
    const key = toKey(current);
    const past = isPast(current);
    const aria = current.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    html += `<button class="day${key === todayKey ? " is-today" : ""}${past ? " is-past" : ""}" type="button" data-day="${key}" ${past ? "disabled" : ""} aria-label="${aria}">${day}</button>`;
  }
  return `<div class="cal-grid">${html}</div>`;
}

function monthMarkup(date, which) {
  const label = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const prev = which === "prev" || which === "both" ? navButton(-1) : '<span class="cal-nav"></span>';
  const next = which === "next" || which === "both" ? navButton(1) : '<span class="cal-nav"></span>';
  return `<div class="cal-month"><div class="cal-head">${prev}<h3>${label}</h3>${next}</div>${daysMarkup(date)}</div>`;
}

function calHelp() {
  if (state.dateError) return state.dateError;
  if (state.checkIn && !state.checkOut) return "Now choose a check-out date.";
  if (hasDates()) return `${count(stayNights(), "night", "nights")} selected. Pick a day to start again.`;
  return "Select a check-in date.";
}

function renderCalendar() {
  const wide = window.matchMedia("(min-width: 801px)").matches;
  const first = monthMarkup(state.viewMonth, wide ? "prev" : "both");
  const second = wide ? monthMarkup(addMonths(state.viewMonth, 1), "next") : "";
  const rule = minNights() > 1 ? `Minimum stay ${minNights()} nights · up to ${MAX_NIGHTS}` : `Stays of 1 to ${MAX_NIGHTS} nights`;
  calPopover.innerHTML = `<div class="cal-wrap">
    <p class="cal-help${state.dateError ? " is-error" : ""}" role="status">${escapeHtml(calHelp())}</p>
    <div class="cal">${first}${second}</div>
    <div class="cal-foot"><span>${rule}</span><button class="text-link" type="button" data-clear-dates ${state.checkIn ? "" : "disabled"}>Clear dates</button></div>
  </div>`;
  paintRange();
}

function paintRange() {
  const start = state.checkIn ? dayTime(state.checkIn) : null;
  const end = state.checkOut ? dayTime(state.checkOut) : null;
  const preview = !state.checkOut && state.hover && start && dayTime(state.hover) > start ? dayTime(state.hover) : null;
  const rangeEnd = end || preview;
  calPopover.querySelectorAll("[data-day]").forEach((button) => {
    const time = dayTime(parseDay(button.dataset.day));
    button.classList.toggle("is-start", start !== null && time === start);
    button.classList.toggle("is-end", (end !== null && time === end) || (preview !== null && time === preview));
    button.classList.toggle("in-range", start !== null && rangeEnd !== null && time > start && time < rangeEnd);
  });
}

function selectDay(date) {
  if (isPast(date)) return;
  const time = dayTime(date);
  state.bookError = "";
  if (!state.checkIn || state.checkOut || time <= dayTime(state.checkIn)) {
    state.checkIn = date;
    state.checkOut = null;
    state.dateError = "";
    datesChanged(false);
    renderCalendar();
    return;
  }
  const nights = nightCount(state.checkIn, date);
  if (nights > MAX_NIGHTS) {
    state.dateError = `Stays can be up to ${MAX_NIGHTS} nights. Choose a check-out on or before ${formatPretty(addDays(state.checkIn, MAX_NIGHTS))}.`;
  } else if (nights < minNights()) {
    state.dateError = `${state.property.name} has a minimum stay of ${minNights()} nights. Choose a check-out on or after ${formatPretty(addDays(state.checkIn, minNights()))}.`;
  } else {
    state.checkOut = date;
    state.dateError = "";
    closePopovers();
    datesChanged(true);
    return;
  }
  renderCalendar();
  shake(calPopover.querySelector(".cal-help"));
  renderBooking();
}

function clearDates() {
  state.checkIn = null;
  state.checkOut = null;
  state.dateError = "";
  datesChanged(false);
  renderCalendar();
}

function datesChanged(complete) {
  offersToken += 1;
  state.offers = null;
  state.offersStatus = "idle";
  updateDateLabels();
  syncUrl();
  if (complete) {
    loadOffers();
    return;
  }
  renderRooms();
  renderBooking();
}

function guestsChanged() {
  state.bookError = "";
  renderGuests();
  renderRooms();
  renderBooking();
  syncUrl();
}

function placePopover(popover, anchor) {
  if (window.matchMedia("(max-width: 800px)").matches) return;
  const card = bookCard.getBoundingClientRect();
  const box = anchor.getBoundingClientRect();
  const width = popover.offsetWidth;
  const maxLeft = window.innerWidth - 16 - card.left - width;
  const minLeft = 16 - card.left;
  const left = Math.max(minLeft, Math.min(box.left - card.left, maxLeft));
  popover.style.left = `${left}px`;
  popover.style.top = `${box.bottom - card.top + 8}px`;
}

function setExpanded() {
  checkInBtn.setAttribute("aria-expanded", String(state.active === "cal"));
  checkOutBtn.setAttribute("aria-expanded", String(state.active === "cal"));
  guestBtn.setAttribute("aria-expanded", String(state.active === "guests"));
}

function closePopovers() {
  calPopover.hidden = true;
  guestPopover.hidden = true;
  state.active = null;
  state.hover = null;
  setExpanded();
}

function openPopover(name) {
  closePopovers();
  state.active = name;
  const popover = name === "cal" ? calPopover : guestPopover;
  if (name === "cal") {
    if (state.checkIn) state.viewMonth = startOfMonth(state.checkIn);
    renderCalendar();
  } else {
    renderGuests();
  }
  popover.hidden = false;
  placePopover(popover, name === "cal" ? datesField : guestBtn);
  setExpanded();
}

function openDates() {
  if (!inView(bookCard)) bookCard.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => openPopover("cal"), inView(bookCard) ? 0 : 360);
}

/* ---------- Rooms and booking ---------- */

function selectRoom(id) {
  state.roomId = state.roomId === id ? null : id;
  state.bookError = "";
  renderRooms();
  renderBooking();
  syncUrl();
  const room = selectedRoom();
  if (room && !inView(bookCard)) {
    toast(hasDates() ? `${room.name} selected. Reserve when you are ready.` : `${room.name} selected. Add your dates to see the total.`);
  }
}

function reserveProblem(message, focusDates) {
  state.bookError = message;
  renderBooking();
  shake($("bookError"));
  if (!inView(bookCard)) toast(message);
  if (focusDates) openDates();
}

function tryReserve() {
  closePopovers();
  const c = copy();
  if (!hasDates()) {
    reserveProblem("Add your check-in and check-out dates first.", true);
    shake(datesField);
    return;
  }
  if (state.offersStatus === "loading") {
    reserveProblem("Still checking availability. One moment.");
    return;
  }
  if (state.offersStatus === "error") {
    reserveProblem("Availability did not load. Try again in the list below.");
    return;
  }
  const room = selectedRoom();
  if (!room) {
    reserveProblem(`Choose a ${c.unit} to reserve.`);
    $("rooms").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const problem = selectionProblem(room, roomStatus(room));
  if (problem) {
    reserveProblem(problem);
    return;
  }
  state.bookError = "";
  renderBooking();
  openReserve();
}

function bookingSummary(room, status) {
  const c = copy();
  const policy = cancelCopy(room);
  return `<div class="summary-head">
      <img src="${room.image}" alt="" width="120" height="90">
      <div><strong>${escapeHtml(state.property.name)}</strong><span>${escapeHtml(room.name)}</span></div>
    </div>
    <dl class="summary-list">
      <div><dt>Check-in</dt><dd>${formatShort(state.checkIn)}, ${escapeHtml(lowerFirst(state.property.policies.checkIn))}</dd></div>
      <div><dt>Check-out</dt><dd>${formatShort(state.checkOut)}, ${escapeHtml(lowerFirst(state.property.policies.checkOut))}</dd></div>
      <div><dt>Guests</dt><dd>${escapeHtml(guestLabel())}</dd></div>
    </dl>
    <div class="bill">
      <div class="total"><span>Stay total</span><span>${money(status.total)}</span></div>
      <p class="formula">${money(room.price)} × ${count(stayNights(), "night", "nights")} × ${count(state.rooms, c.unit, c.units)}</p>
    </div>
    <p class="cancel${policy.locked ? " is-locked" : ""}">${escapeHtml(policy.text)}</p>`;
}

function openReserve() {
  const room = selectedRoom();
  $("reserveSummary").innerHTML = bookingSummary(room, roomStatus(room));
  $("reserveStep").hidden = false;
  $("reserveDone").hidden = true;
  reserveForm.reset();
  setFieldError("name", "");
  setFieldError("email", "");
  $("reserveError").textContent = "";
  openDialog(reserveModal);
  reserveForm.elements.name.focus();
}

function setFieldError(name, message) {
  const input = reserveForm.elements[name];
  const target = $(name === "name" ? "reserveNameError" : "reserveEmailError");
  target.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function validateReserve() {
  const name = reserveForm.elements.name;
  const email = reserveForm.elements.email;
  const nameOk = name.value.trim().length >= 2;
  const emailOk = email.value.trim() !== "" && email.validity.valid;
  setFieldError("name", nameOk ? "" : "Enter the name of the main guest.");
  setFieldError("email", emailOk ? "" : "Enter a valid email address for the confirmation.");
  if (!nameOk) name.focus();
  else if (!emailOk) email.focus();
  return nameOk && emailOk;
}

async function submitReserve(event) {
  event.preventDefault();
  $("reserveError").textContent = "";
  if (!validateReserve()) return;
  const room = selectedRoom();
  const submit = $("reserveSubmit");
  const fields = reserveForm.elements;
  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");
  submit.textContent = "Confirming…";
  try {
    const result = await PorticoApi.createReservation({
      propertyId: state.id,
      roomId: room.id,
      checkIn: toKey(state.checkIn),
      checkOut: toKey(state.checkOut),
      adults: state.adults,
      children: state.children,
      rooms: state.rooms,
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      requests: fields.requests.value.trim()
    });
    const done = $("reserveDone");
    done.innerHTML = `<p class="kicker">Reservation preview</p>
      <h2>You are on the list</h2>
      <p class="done-ref">Reference <strong>${escapeHtml(result.reference)}</strong></p>
      ${bookingSummary(room, roomStatus(room))}
      <p class="preview-note">A confirmation would go to ${escapeHtml(fields.email.value.trim())}. Nothing was charged. Payments arrive with the API.</p>
      <button class="search-btn auth-submit" type="button" data-close="reserve">Done</button>`;
    $("reserveStep").hidden = true;
    done.hidden = false;
    done.focus();
  } catch (error) {
    if (error && error.code === "unavailable") {
      $("reserveError").textContent = `${error.message} Choose another ${copy().unit} or change your dates.`;
      loadOffers();
    } else {
      $("reserveError").textContent = "The reservation did not go through. Nothing was charged. Try again.";
    }
  } finally {
    submit.disabled = false;
    submit.removeAttribute("aria-busy");
    submit.textContent = "Confirm reservation";
  }
}

/* ---------- Lightbox ---------- */

function openLightbox(photos, index) {
  state.photos = photos;
  $("lbThumbs").innerHTML = photos.length > 1
    ? photos.map((photo, i) => `<button type="button" data-thumb="${i}" aria-label="Show photo ${i + 1}: ${escapeHtml(photo.alt)}"><img src="${photo.src}" alt="" loading="lazy" width="160" height="110"></button>`).join("")
    : "";
  openDialog(lightbox);
  showPhoto(index);
  lightbox.querySelector(".lb-close").focus();
}

function showPhoto(index) {
  const total = state.photos.length;
  state.photoIndex = (index + total) % total;
  const photo = state.photos[state.photoIndex];
  const image = $("lbImage");
  image.classList.remove("is-in");
  image.src = photo.src;
  image.alt = photo.alt;
  window.requestAnimationFrame(() => image.classList.add("is-in"));
  $("lbCaption").textContent = photo.alt;
  $("lbCount").textContent = `${state.photoIndex + 1} / ${total}`;
  $("lbPrev").hidden = total < 2;
  $("lbNext").hidden = total < 2;
  $("lbThumbs").querySelectorAll("[data-thumb]").forEach((thumb) => {
    const on = Number(thumb.dataset.thumb) === state.photoIndex;
    thumb.classList.toggle("is-on", on);
    if (on) {
      thumb.setAttribute("aria-current", "true");
      thumb.scrollIntoView({ block: "nearest", inline: "center" });
    } else {
      thumb.removeAttribute("aria-current");
    }
  });
  [1, -1].forEach((step) => {
    const next = state.photos[(state.photoIndex + step + total) % total];
    if (next) new Image().src = next.src;
  });
}

/* ---------- Dialogs ---------- */

function openDialog(el) {
  lastFocus = document.activeElement;
  el.hidden = false;
  document.body.classList.add("no-scroll");
}

function closeDialog(el) {
  if (el.hidden) return;
  el.hidden = true;
  if (lightbox.hidden && reserveModal.hidden && authModal.hidden) document.body.classList.remove("no-scroll");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

function openDialogEl() {
  return [lightbox, reserveModal, authModal].find((el) => !el.hidden) || null;
}

function trapFocus(event, container) {
  const nodes = [...container.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.offsetParent !== null && !el.hidden);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openAuth(mode) {
  authMode = mode;
  const register = mode === "register";
  $("authDone").hidden = true;
  authForm.hidden = false;
  $("authTitle").textContent = register ? "Create an account" : "Sign in";
  $("authLede").textContent = register
    ? "Guests book stays. Admins run the houses. This preview stores nothing."
    : "Use the same door you will use when the API is connected.";
  $("authNameWrap").hidden = !register;
  $("authSwitch").textContent = register ? "Already on the list? Sign in" : "New here? Create an account";
  $("authSubmit").textContent = register ? "Create account" : "Sign in";
  authForm.reset();
  openDialog(authModal);
  (register ? $("authName") : authForm.elements.email).focus();
}

function closeMenu() {
  nav.classList.remove("is-open");
  header.classList.remove("menu-open");
  $("navToggle").setAttribute("aria-expanded", "false");
  $("navToggle").setAttribute("aria-label", "Open menu");
}

/* ---------- Scroll effects ---------- */

function paintSubnav() {
  const offset = header.offsetHeight + subnav.offsetHeight + 32;
  let current = null;
  subnav.querySelectorAll("a").forEach((link) => {
    const section = document.getElementById(link.hash.slice(1));
    if (section && section.getBoundingClientRect().top - offset <= 0) current = link;
  });
  subnav.querySelectorAll("a").forEach((link) => {
    if (link === current) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
  subnav.classList.toggle("is-stuck", subnav.getBoundingClientRect().top <= header.offsetHeight + 1);
}

function revealSections() {
  const sections = document.querySelectorAll(".p-section");
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  sections.forEach((section) => {
    if (inView(section)) return;
    section.classList.add("reveal");
    observer.observe(section);
  });
}

new IntersectionObserver((entries) => {
  cardInView = entries.some((entry) => entry.isIntersecting);
  paintMobileBar();
}).observe(bookCard);

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    paintSubnav();
  });
}, { passive: true });

window.addEventListener("resize", () => {
  if (state.active === "cal") renderCalendar();
  if (state.active) placePopover(state.active === "cal" ? calPopover : guestPopover, state.active === "cal" ? datesField : guestBtn);
});

/* ---------- Events ---------- */

checkInBtn.addEventListener("click", () => (state.active === "cal" ? closePopovers() : openPopover("cal")));
checkOutBtn.addEventListener("click", () => (state.active === "cal" ? closePopovers() : openPopover("cal")));
guestBtn.addEventListener("click", () => (state.active === "guests" ? closePopovers() : openPopover("guests")));

calPopover.addEventListener("click", (event) => {
  const navEl = event.target.closest("[data-nav]");
  if (navEl && !navEl.disabled) {
    state.viewMonth = addMonths(state.viewMonth, Number(navEl.dataset.nav));
    renderCalendar();
    return;
  }
  if (event.target.closest("[data-clear-dates]")) {
    clearDates();
    return;
  }
  const day = event.target.closest("[data-day]");
  if (day && !day.disabled) selectDay(parseDay(day.dataset.day));
});

calPopover.addEventListener("pointerover", (event) => {
  const day = event.target.closest("[data-day]");
  if (!day || day.disabled) return;
  const next = parseDay(day.dataset.day);
  if (state.hover && dayTime(state.hover) === dayTime(next)) return;
  state.hover = next;
  paintRange();
});

calPopover.addEventListener("pointerleave", () => {
  state.hover = null;
  paintRange();
});

guestPopover.addEventListener("click", (event) => {
  const step = event.target.closest("[data-step]");
  if (step && !step.disabled) {
    const key = step.dataset.step;
    const [min, max] = LIMITS[key];
    state[key] = Math.min(max, Math.max(min, state[key] + Number(step.dataset.dir)));
    guestsChanged();
    return;
  }
  if (event.target.closest("[data-close-guests]")) {
    closePopovers();
    guestBtn.focus();
  }
});

$("reserveBtn").addEventListener("click", tryReserve);
$("mobileReserve").addEventListener("click", tryReserve);

$("saveBtn").addEventListener("click", () => {
  const saved = loadSaved();
  if (saved.has(state.id)) saved.delete(state.id);
  else saved.add(state.id);
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
  } catch {
    /* storage can be blocked; the button still reflects this visit */
  }
  paintSaved();
  const button = $("saveBtn");
  button.classList.remove("is-pop");
  window.requestAnimationFrame(() => button.classList.add("is-pop"));
  toast(saved.has(state.id) ? `${state.property.name} saved.` : `${state.property.name} removed from saved stays.`);
});

$("shareBtn").addEventListener("click", async () => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: document.title, url });
    } catch {
      /* the share sheet was dismissed */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied. Your dates and guests are in it.");
  } catch {
    toast("Copy the address bar to share this stay.");
  }
});

$("gallery").addEventListener("click", (event) => {
  const tile = event.target.closest("[data-photo]");
  if (tile && state.property) openLightbox(state.property.gallery, Number(tile.dataset.photo));
});

$("roomFilters").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-filter]");
  if (!chip) return;
  state.filters[chip.dataset.filter] = !state.filters[chip.dataset.filter];
  renderRooms();
});

roomList.addEventListener("click", (event) => {
  const select = event.target.closest("[data-select]");
  if (select && !select.disabled) {
    selectRoom(select.dataset.select);
    return;
  }
  const photo = event.target.closest("[data-room-photo]");
  if (photo) {
    const room = state.property.rooms.find((item) => item.id === photo.dataset.roomPhoto);
    openLightbox([{ src: room.image, alt: room.name }], 0);
    return;
  }
  if (event.target.closest("[data-retry-offers]")) loadOffers();
});

$("amenitiesBody").addEventListener("click", (event) => {
  if (!event.target.closest("#amenityToggle")) return;
  state.amenitiesOpen = !state.amenitiesOpen;
  renderAmenities();
  $("amenityToggle").focus();
});

$("reviewsBody").addEventListener("change", (event) => {
  if (event.target.id === "reviewFilter") state.reviewFilter = event.target.value;
  else if (event.target.id === "reviewSort") state.reviewSort = event.target.value;
  else return;
  state.reviewLimit = REVIEW_PAGE;
  renderReviewList();
});

$("reviewsBody").addEventListener("click", (event) => {
  if (!event.target.closest("[data-more-reviews]")) return;
  const before = state.reviewLimit;
  state.reviewLimit += REVIEW_PAGE;
  renderReviewList();
  const next = $("reviewList").children[before];
  if (next) next.setAttribute("tabindex", "-1");
  if (next) next.focus({ preventScroll: true });
});

pageState.addEventListener("click", (event) => {
  if (event.target.closest("[data-retry]")) loadProperty();
});

lightbox.addEventListener("click", (event) => {
  if (event.target.closest("[data-close='lightbox']") || event.target === lightbox) {
    closeDialog(lightbox);
    return;
  }
  if (event.target.closest("#lbPrev")) showPhoto(state.photoIndex - 1);
  else if (event.target.closest("#lbNext")) showPhoto(state.photoIndex + 1);
  const thumb = event.target.closest("[data-thumb]");
  if (thumb) showPhoto(Number(thumb.dataset.thumb));
});

let swipeX = null;
$("lbStage").addEventListener("pointerdown", (event) => { swipeX = event.clientX; });
$("lbStage").addEventListener("pointerup", (event) => {
  if (swipeX === null || state.photos.length < 2) return;
  const delta = event.clientX - swipeX;
  swipeX = null;
  if (Math.abs(delta) > 48) showPhoto(state.photoIndex + (delta < 0 ? 1 : -1));
});

reserveModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close='reserve']")) closeDialog(reserveModal);
});

reserveForm.addEventListener("submit", submitReserve);
reserveForm.addEventListener("input", (event) => {
  if (event.target.getAttribute("aria-invalid") === "true") setFieldError(event.target.name, "");
});

authModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close='modal']")) closeDialog(authModal);
});

$("authSwitch").addEventListener("click", () => openAuth(authMode === "register" ? "signin" : "register"));

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = authForm.elements.email.value.trim();
  authForm.hidden = true;
  $("authDone").hidden = false;
  $("authDone").textContent = authMode === "register"
    ? `Account preview for ${email}. Nothing was saved. Registration arrives with the API.`
    : `Signed-in preview for ${email}. Nothing was saved. Sign-in arrives with the API.`;
});

$("navToggle").addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  header.classList.toggle("menu-open", open);
  $("navToggle").setAttribute("aria-expanded", String(open));
  $("navToggle").setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

document.addEventListener("click", (event) => {
  const auth = event.target.closest("[data-auth]");
  if (auth) {
    closeMenu();
    openAuth(auth.dataset.auth);
    return;
  }
  if (event.target.closest("[data-open-dates]")) {
    openDates();
    return;
  }
  if (event.target.closest("[data-clear-filters]")) {
    state.filters = { available: false, fits: false, refundable: false, breakfast: false };
    renderRooms();
    return;
  }
  if (event.target.closest(".nav a")) closeMenu();
  if (!event.target.closest("#bookCard")) closePopovers();
});

document.addEventListener("keydown", (event) => {
  const dialog = openDialogEl();
  if (dialog === lightbox && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    showPhoto(state.photoIndex + (event.key === "ArrowRight" ? 1 : -1));
    return;
  }
  if (event.key === "Tab" && dialog) {
    trapFocus(event, dialog);
    return;
  }
  if (event.key !== "Escape") return;
  if (dialog) closeDialog(dialog);
  else if (state.active) {
    const anchor = state.active === "cal" ? checkInBtn : guestBtn;
    closePopovers();
    anchor.focus();
  } else if (nav.classList.contains("is-open")) closeMenu();
});

document.addEventListener("error", (event) => {
  if (event.target && event.target.tagName === "IMG") event.target.classList.add("is-broken");
}, true);

readQuery();
updateDateLabels();
loadProperty();
paintSubnav();
