"use strict";

const stays = [
  {
    id: "marble",
    name: "The Marble Court",
    city: "Lisbon",
    country: "Portugal",
    area: "Chiado",
    type: "Suite",
    property: "Hotel",
    score: 9.4,
    reviews: 186,
    price: 242,
    maxGuests: 3,
    cancel: true,
    scarce: true,
    amenities: ["Courtyard", "Breakfast", "River walk"],
    blurb: "A stone suite behind a working portico, one street up from the river.",
    image: "assets/lisbon.jpg"
  },
  {
    id: "screens",
    name: "House of Paper Screens",
    city: "Kyoto",
    country: "Japan",
    area: "Gion",
    type: "Room",
    property: "Hotel",
    score: 9.1,
    reviews: 143,
    price: 198,
    maxGuests: 2,
    cancel: true,
    scarce: false,
    amenities: ["Cedar bath", "Garden", "Work desk"],
    blurb: "A small room with paper screens and a cedar bath down the hall.",
    image: "assets/kyoto.jpg"
  },
  {
    id: "atelier",
    name: "The North Atelier",
    city: "Copenhagen",
    country: "Denmark",
    area: "Nørrebro",
    type: "Studio",
    property: "Apartment",
    score: 8.8,
    reviews: 97,
    price: 176,
    maxGuests: 2,
    cancel: true,
    scarce: false,
    amenities: ["Work desk", "Courtyard", "Bike"],
    blurb: "A studio with a work table, a good lamp, and a quiet courtyard.",
    image: "assets/copenhagen.jpg"
  },
  {
    id: "riad",
    name: "Riad of Small Doors",
    city: "Marrakech",
    country: "Morocco",
    area: "Medina",
    type: "House",
    property: "Villa",
    score: 9.6,
    reviews: 221,
    price: 164,
    maxGuests: 5,
    cancel: true,
    scarce: false,
    amenities: ["Whole house", "Roof terrace", "Breakfast"],
    blurb: "A whole riad: four small doors, one orange tree, a roof for breakfast.",
    image: "assets/marrakech.jpg"
  },
  {
    id: "orchard",
    name: "Cliff Orchard",
    city: "Amalfi",
    country: "Italy",
    area: "Above the port",
    type: "Suite",
    property: "Resort",
    score: 9.3,
    reviews: 118,
    price: 310,
    maxGuests: 3,
    cancel: true,
    scarce: true,
    amenities: ["Sea view", "Breakfast", "Terrace"],
    blurb: "A lemon-scented suite on the cliff path, with the port below.",
    image: "assets/amalfi.jpg"
  },
  {
    id: "patio",
    name: "Casa del Patio",
    city: "Oaxaca",
    country: "Mexico",
    area: "Centro",
    type: "Room",
    property: "Hotel",
    score: 8.9,
    reviews: 76,
    price: 132,
    maxGuests: 3,
    cancel: false,
    scarce: false,
    amenities: ["Patio", "Fan", "Walk to market"],
    blurb: "A tiled room on a patio that stays cool after lunch.",
    image: "assets/oaxaca.jpg"
  },
  {
    id: "greenhouse",
    name: "Greenhouse No. 4",
    city: "Porto",
    country: "Portugal",
    area: "Cedofeita",
    type: "Studio",
    property: "Apartment",
    score: 9.0,
    reviews: 64,
    price: 154,
    maxGuests: 2,
    cancel: true,
    scarce: false,
    amenities: ["Kitchenette", "Courtyard", "Work desk"],
    blurb: "A glass-roofed studio two blocks from the bakery you will use.",
    image: "assets/porto.jpg"
  },
  {
    id: "gallery",
    name: "The Long Gallery",
    city: "Edinburgh",
    country: "Scotland",
    area: "Old Town",
    type: "House",
    property: "Villa",
    score: 9.2,
    reviews: 159,
    price: 208,
    maxGuests: 4,
    cancel: true,
    scarce: false,
    amenities: ["Whole house", "Fireplace", "Old Town"],
    blurb: "A long stone gallery of a house, with a fire and a steep stair.",
    image: "assets/edinburgh.jpg"
  }
];

stays.forEach((stay, index) => {
  stay.order = index;
});

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const heartSvg = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const state = {
  destination: "",
  checkIn: null,
  checkOut: null,
  hover: null,
  adults: 2,
  children: 0,
  rooms: 1,
  viewMonth: startOfMonth(new Date()),
  active: null,
  saved: new Set(),
  query: null,
  property: ""
};

const $ = (id) => document.getElementById(id);
const header = $("header");
const nav = $("nav");
const searchForm = $("searchForm");
const whereInput = $("whereInput");
const whereField = $("whereField");
const wherePopover = $("wherePopover");
const datesField = $("datesField");
const checkInBtn = $("checkInBtn");
const checkOutBtn = $("checkOutBtn");
const calPopover = $("calPopover");
const guestField = $("guestField");
const guestBtn = $("guestBtn");
const guestPopover = $("guestPopover");
const formError = $("formError");
const listMeta = $("listMeta");
const stayList = $("stayList");
const trendTrack = $("trendTrack");
const drawer = $("drawer");
const authModal = $("authModal");
const authForm = $("authForm");
const authTitle = $("authTitle");
const authLede = $("authLede");
const authNameWrap = $("authNameWrap");
const authName = $("authName");
const authSwitch = $("authSwitch");
const authSubmit = $("authSubmit");
const authDone = $("authDone");

let lastFocus = null;
let toastTimer = 0;
let authMode = "signin";

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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function addDays(date, count) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
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

function scoreLabel(score) {
  if (score >= 9) return "Wonderful";
  if (score >= 8) return "Excellent";
  return "Good";
}

function guestLabel() {
  const parts = [`${state.adults} adult${state.adults === 1 ? "" : "s"}`];
  if (state.children) parts.push(`${state.children} child${state.children === 1 ? "" : "ren"}`);
  parts.push(`${state.rooms} room${state.rooms === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function fits(stay) {
  if (!state.query) return true;
  const people = state.query.adults + state.query.children;
  return people <= stay.maxGuests * state.query.rooms;
}

function matchesDest(stay, destination) {
  const query = destination.toLowerCase();
  return [stay.city, stay.country, stay.name, stay.area].some((value) => value.toLowerCase().includes(query));
}

function cancelCopy(stay) {
  if (!stay.cancel) return { text: "Non-refundable once booked.", locked: true };
  if (!state.query) return { text: "Free cancellation until 3 days before check-in.", locked: false };
  const until = addDays(state.query.checkIn, -3);
  if (isPast(until)) return { text: "Free cancellation has closed for these dates.", locked: true };
  return { text: `Free cancellation until ${formatPretty(until)}.`, locked: false };
}

function heartMarkup(stay) {
  const saved = state.saved.has(stay.id);
  const verb = saved ? "Remove" : "Save";
  return `<button class="heart" type="button" data-stay="${stay.id}" data-name="${escapeHtml(stay.name)}" aria-pressed="${saved}" aria-label="${verb} ${escapeHtml(stay.name)}">${heartSvg}</button>`;
}

function priceMarkup(stay) {
  if (!state.query) {
    return `<span class="from">from</span><strong>${money(stay.price)}</strong><span class="per">per night</span>`;
  }
  const nights = nightCount(state.query.checkIn, state.query.checkOut);
  const total = stay.price * nights * state.query.rooms;
  const guests = `${state.query.adults} adult${state.query.adults === 1 ? "" : "s"}`;
  const children = state.query.children ? `, ${state.query.children} child${state.query.children === 1 ? "" : "ren"}` : "";
  const rooms = `${state.query.rooms} room${state.query.rooms === 1 ? "" : "s"}`;
  return `<span class="from">${nights} night${nights === 1 ? "" : "s"}, ${guests}${children}</span><strong>${money(total)}</strong><span class="per">${money(stay.price)} × ${nights} × ${rooms}</span>`;
}

function stayCard(stay, index) {
  const ok = fits(stay);
  const policy = cancelCopy(stay);
  const delay = Math.min(index, 4) * 80;
  return `<article class="stay reveal${ok ? "" : " is-unfit"}" data-stay="${stay.id}" style="--in:${delay}ms" tabindex="0">
    <div class="stay-media">
      <img src="${stay.image}" alt="${escapeHtml(stay.name)} in ${escapeHtml(stay.city)}" width="800" height="600" loading="lazy">
      ${heartMarkup(stay)}
    </div>
    <div class="stay-body">
      <p class="stay-type">${escapeHtml(stay.property)} · ${escapeHtml(stay.type)} · sleeps ${stay.maxGuests}</p>
      <h3>${escapeHtml(stay.name)}</h3>
      <p class="where-line">${escapeHtml(stay.area)} · ${escapeHtml(stay.city)}, ${escapeHtml(stay.country)}</p>
      <p class="cancel${policy.locked ? " is-locked" : ""}">${escapeHtml(policy.text)}</p>
      ${stay.scarce ? '<p class="scarce">Only 1 room left at this rate</p>' : ""}
      <div class="pills">${stay.amenities.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>
      ${ok ? "" : `<p class="unfit">Sleeps ${stay.maxGuests} per room — too few for this search.</p>`}
    </div>
    <div class="stay-side">
      <div class="rating">
        <div>
          <strong>${scoreLabel(stay.score)}</strong>
          <span>${stay.reviews} reviews</span>
        </div>
        <span class="score">${stay.score.toFixed(1)}</span>
      </div>
      <div class="stay-price">${priceMarkup(stay)}</div>
    </div>
  </article>`;
}

const destinations = [
  { city: "Rome", image: "assets/rome.jpg" },
  { city: "Athens", image: "assets/athens.jpg" },
  { city: "Paris", image: "assets/paris.jpg" },
  { city: "Istanbul", image: "assets/istanbul.jpg" },
  { city: "Venice", image: "assets/venice.jpg" },
  { city: "Lisbon", image: "assets/lisbon-city.jpg" },
  { city: "Kyoto", image: "assets/kyoto-city.jpg" },
  { city: "Marrakech", image: "assets/marrakech-city.jpg" }
];

function destinationCard(place) {
  return `<article class="trend-card" data-city="${escapeHtml(place.city)}" tabindex="0" role="button" aria-label="Search stays in ${escapeHtml(place.city)}">
    <img src="${place.image}" alt="" width="800" height="1000">
    <div class="shade"></div>
    <div class="trend-meta">
      <h3>${escapeHtml(place.city)}</h3>
    </div>
  </article>`;
}

function filteredStays() {
  const destination = state.query ? state.query.destination : "";
  const list = stays.filter((stay) => {
    if (state.property && stay.property !== state.property) return false;
    if (destination && !matchesDest(stay, destination)) return false;
    return true;
  });
  const sort = $("sort").value;
  if (sort === "price") list.sort((a, b) => a.price - b.price);
  else if (sort === "rating") list.sort((a, b) => b.score - a.score);
  else list.sort((a, b) => a.order - b.order);
  return list;
}

function renderList() {
  const list = filteredStays();
  const unfit = state.query ? list.filter((stay) => !fits(stay)).length : 0;
  let text = `${list.length} of ${stays.length} houses`;
  if (state.property) text += ` · ${propertyLabel(state.property)}`;
  if (state.query && state.query.destination) text += ` · ${state.query.destination}`;
  if (state.query) {
    const nights = nightCount(state.query.checkIn, state.query.checkOut);
    text += ` · ${formatPretty(state.query.checkIn)} – ${formatPretty(state.query.checkOut)} · ${nights} night${nights === 1 ? "" : "s"}`;
    text += ` · ${guestLabelFrom(state.query)}`;
  } else if (!state.property) {
    text = `${stays.length} houses. Add dates to turn the nightly rate into a stay total.`;
  } else {
    text += ". Add dates to price the stay.";
  }
  if (unfit) text += ` ${unfit} ${unfit === 1 ? "house sleeps" : "houses sleep"} fewer guests than this search.`;
  listMeta.textContent = text;

  if (!list.length) {
    const place = state.query && state.query.destination ? ` in ${escapeHtml(state.query.destination)}` : "";
    stayList.innerHTML = `<div class="empty">
      <h3>Nothing on the list${place}.</h3>
      <p>Portico keeps eight houses. Clear the city or the property type.</p>
      <button class="btn-ink" type="button" data-reset>Clear the filter</button>
    </div>`;
    return;
  }
  stayList.innerHTML = list.map(stayCard).join("");
  watchReveals(stayList);
}

function propertyLabel(property) {
  return { Hotel: "Hotels", Apartment: "Apartments", Resort: "Resorts", Villa: "Villas" }[property] || property;
}

function guestLabelFrom(query) {
  const parts = [`${query.adults} adult${query.adults === 1 ? "" : "s"}`];
  if (query.children) parts.push(`${query.children} child${query.children === 1 ? "" : "ren"}`);
  parts.push(`${query.rooms} room${query.rooms === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function renderTrend() {
  trendTrack.innerHTML = destinations.map(destinationCard).join("");
  prepareTrendLoop();
  watchReveals(document);
}

function chooseCity(city) {
  whereInput.value = city;
  state.destination = city;
  formError.textContent = "";
  $("hero").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => openPopover("cal"), 480);
}

function updateDateLabels() {
  checkInBtn.textContent = state.checkIn ? formatPretty(state.checkIn) : "Add date";
  checkOutBtn.textContent = state.checkOut ? formatPretty(state.checkOut) : "Add date";
  checkInBtn.classList.toggle("is-empty", !state.checkIn);
  checkOutBtn.classList.toggle("is-empty", !state.checkOut);
}

function renderGuests() {
  $("adultsCount").textContent = String(state.adults);
  $("childrenCount").textContent = String(state.children);
  $("roomsCount").textContent = String(state.rooms);
  guestBtn.textContent = guestLabel();
  const limits = { adults: [1, 8], children: [0, 6], rooms: [1, 4] };
  guestPopover.querySelectorAll("[data-step]").forEach((button) => {
    const [min, max] = limits[button.dataset.step];
    const value = state[button.dataset.step];
    const dir = Number(button.dataset.dir);
    button.disabled = dir < 0 ? value <= min : value >= max;
  });
}

function monthIndex(date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function canShift(dir) {
  const now = new Date();
  const min = monthIndex(startOfMonth(now));
  const next = monthIndex(state.viewMonth) + dir;
  return next >= min && next <= min + 18;
}

function navButton(dir) {
  const label = dir < 0 ? "Previous month" : "Next month";
  const mark = dir < 0 ? "←" : "→";
  const disabled = canShift(dir) ? "" : "disabled";
  return `<button class="cal-nav" type="button" data-nav="${dir}" aria-label="${label}" ${disabled}>${mark}</button>`;
}

function daysMarkup(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const pad = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(new Date());
  let html = DOW.map((name) => `<span class="dow">${name}</span>`).join("");
  for (let i = 0; i < pad; i += 1) html += '<span class="day-pad"></span>';
  for (let day = 1; day <= count; day += 1) {
    const current = new Date(year, month, day);
    const key = toKey(current);
    const past = isPast(current);
    const today = key === todayKey ? " is-today" : "";
    const aria = current.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    html += `<button class="day${today}${past ? " is-past" : ""}" type="button" data-day="${key}" ${past ? "disabled" : ""} aria-label="${aria}">${day}</button>`;
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
  if (state.checkIn && !state.checkOut) return "Now choose a check-out date.";
  if (state.checkIn && state.checkOut) {
    const nights = nightCount(state.checkIn, state.checkOut);
    return `${nights} night${nights === 1 ? "" : "s"} selected. Pick a day to start again.`;
  }
  return "Select a check-in date.";
}

function renderCalendar() {
  const wide = window.matchMedia("(min-width: 801px)").matches;
  const first = monthMarkup(state.viewMonth, wide ? "prev" : "both");
  const second = wide ? monthMarkup(addMonths(state.viewMonth, 1), "next") : "";
  calPopover.innerHTML = `<div class="cal-wrap"><p class="cal-help">${calHelp()}</p><div class="cal">${first}${second}</div></div>`;
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
  if (!state.checkIn || state.checkOut) {
    state.checkIn = date;
    state.checkOut = null;
  } else if (time <= dayTime(state.checkIn)) {
    state.checkIn = date;
    state.checkOut = null;
  } else {
    state.checkOut = date;
  }
  state.hover = null;
  updateDateLabels();
  formError.textContent = "";
  if (state.checkOut) closePopovers();
  else renderCalendar();
}

function renderWhere() {
  const query = whereInput.value.trim().toLowerCase();
  const cities = new Map();
  stays.forEach((stay) => {
    if (!cities.has(stay.city)) cities.set(stay.city, { city: stay.city, country: stay.country, count: 0 });
    cities.get(stay.city).count += 1;
  });
  const options = [{ city: "Anywhere", country: "The full short list", count: stays.length }, ...cities.values()]
    .filter((item) => !query || item.city.toLowerCase().includes(query) || item.country.toLowerCase().includes(query));
  const items = options.map((item) => `<button class="where-item" type="button" data-city="${escapeHtml(item.city)}" role="option">
      <span class="pin" aria-hidden="true"></span>
      <span><strong>${escapeHtml(item.city)}</strong><em>${escapeHtml(item.country)} · ${item.count} house${item.count === 1 ? "" : "s"}</em></span>
    </button>`).join("");
  wherePopover.innerHTML = `<div class="where-box" role="listbox">${items || '<p class="where-empty">No city on the list matches that.</p>'}</div>`;
}

function placePopover(popover, anchor) {
  if (window.matchMedia("(max-width: 800px)").matches) return;
  popover.hidden = false;
  const formBox = searchForm.getBoundingClientRect();
  const anchorBox = anchor.getBoundingClientRect();
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  let left = anchorBox.left - formBox.left;
  left = Math.max(0, Math.min(left, searchForm.clientWidth - width));
  const spaceBelow = window.innerHeight - anchorBox.bottom;
  const top = spaceBelow < height + 16
    ? anchorBox.top - formBox.top - height - 10
    : anchorBox.bottom - formBox.top + 10;
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function setExpanded(expanded) {
  [whereInput, checkInBtn, checkOutBtn, guestBtn].forEach((control) => {
    const open = expanded && (
      (control === whereInput && state.active === "where") ||
      ((control === checkInBtn || control === checkOutBtn) && state.active === "cal") ||
      (control === guestBtn && state.active === "guests")
    );
    control.setAttribute("aria-expanded", String(open));
  });
}

function closePopovers() {
  wherePopover.hidden = true;
  calPopover.hidden = true;
  guestPopover.hidden = true;
  state.active = null;
  state.hover = null;
  setExpanded(false);
}

function openPopover(name) {
  closePopovers();
  state.active = name;
  const popover = name === "where" ? wherePopover : name === "cal" ? calPopover : guestPopover;
  const anchor = name === "where" ? whereField : name === "cal" ? datesField : guestField;
  if (name === "where") renderWhere();
  if (name === "cal") renderCalendar();
  if (name === "guests") renderGuests();
  popover.hidden = false;
  placePopover(popover, anchor);
  setExpanded(true);
}

function togglePopover(name) {
  if (state.active === name) closePopovers();
  else openPopover(name);
}

function runSearch() {
  formError.textContent = "";
  if (!state.checkIn || !state.checkOut) {
    formError.textContent = "Add a check-in and a check-out. The total needs both dates.";
    datesField.classList.remove("is-shake");
    window.requestAnimationFrame(() => datesField.classList.add("is-shake"));
    openPopover("cal");
    return;
  }
  const typed = whereInput.value.trim();
  state.destination = typed.toLowerCase() === "anywhere" ? "" : typed;
  state.query = {
    destination: state.destination,
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    adults: state.adults,
    children: state.children,
    rooms: state.rooms
  };
  closePopovers();
  renderList();
  $("list").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetFilters() {
  state.destination = "";
  state.property = "";
  whereInput.value = "";
  document.querySelectorAll(".property-card").forEach((card) => {
    card.classList.remove("is-on");
    card.setAttribute("aria-pressed", "false");
  });
  if (state.checkIn && state.checkOut) runSearch();
  else {
    state.query = null;
    renderList();
  }
}

function toggleSave(id) {
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
  const saved = state.saved.has(id);
  document.querySelectorAll(".heart").forEach((button) => {
    if (button.dataset.stay !== id) return;
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${button.dataset.name}`);
    button.classList.remove("is-pop");
    window.requestAnimationFrame(() => button.classList.add("is-pop"));
  });
}

function onCatalogClick(event) {
  const reset = event.target.closest("[data-reset]");
  if (reset) {
    resetFilters();
    return;
  }
  const heart = event.target.closest(".heart");
  if (heart) {
    toggleSave(heart.dataset.stay);
    return;
  }
  const card = event.target.closest("[data-stay]");
  if (!card || event.target.closest("button, a, select")) return;
  openDrawer(card.dataset.stay);
}

function onCatalogKey(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("button, a, input, select")) return;
  const card = event.target.closest("[data-stay]");
  if (!card) return;
  event.preventDefault();
  openDrawer(card.dataset.stay);
}

function openDrawer(id) {
  const stay = stays.find((item) => item.id === id);
  if (!stay) return;
  lastFocus = document.activeElement;
  drawer.dataset.stay = id;
  closePopovers();
  const policy = cancelCopy(stay);
  const ok = fits(stay);
  let bill;
  if (!state.query) {
    bill = `<div class="bill"><div><span>Nightly rate</span><span>${money(stay.price)}</span></div><p class="formula">Search with dates to multiply this into a stay total.</p></div>`;
  } else {
    const nights = nightCount(state.query.checkIn, state.query.checkOut);
    const total = stay.price * nights * state.query.rooms;
    bill = `<div class="bill">
      <div><span>Nightly rate</span><span>${money(stay.price)}</span></div>
      <div><span>Nights</span><span>${nights}</span></div>
      <div><span>Rooms</span><span>${state.query.rooms}</span></div>
      <div class="total"><span>Stay total</span><span>${money(total)}</span></div>
      <p class="formula">${money(stay.price)} × ${nights} × ${state.query.rooms}</p>
    </div>`;
  }
  $("drawerBody").innerHTML = `
    <img class="drawer-photo" src="${stay.image}" alt="${escapeHtml(stay.name)}">
    <div class="drawer-copy">
      <p class="stay-type">${escapeHtml(stay.property)} · ${escapeHtml(stay.type)} · sleeps ${stay.maxGuests}</p>
      <h2 id="drawerTitle">${escapeHtml(stay.name)}</h2>
      <p class="where-line">${escapeHtml(stay.area)} · ${escapeHtml(stay.city)}, ${escapeHtml(stay.country)}</p>
      <p class="blurb">${escapeHtml(stay.blurb)}</p>
      <div class="rating drawer-rating">
        <span class="score">${stay.score.toFixed(1)}</span>
        <div><strong>${scoreLabel(stay.score)}</strong><span>${stay.reviews} reviews</span></div>
      </div>
      ${bill}
      <p class="cancel${policy.locked ? " is-locked" : ""}">${escapeHtml(policy.text)}</p>
      <div class="pills">${stay.amenities.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>
      <button class="search-btn hold" type="button" data-hold ${ok ? "" : "disabled"}>${ok ? "Hold these dates" : "Too small for this group"}</button>
      <p class="preview-note">Preview only. This page does not hold a room yet.</p>
    </div>`;
  drawer.hidden = false;
  document.body.classList.add("no-scroll");
  drawer.querySelector(".icon-x").focus();
}

function closeDrawer() {
  drawer.hidden = true;
  drawer.dataset.stay = "";
  if (authModal.hidden) document.body.classList.remove("no-scroll");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

function holdMessage(stay) {
  if (!state.query) return `${stay.name} is ${money(stay.price)} a night. Add dates for a stay total. Nothing is held in this preview.`;
  const nights = nightCount(state.query.checkIn, state.query.checkOut);
  const total = stay.price * nights * state.query.rooms;
  return `Preview only. ${stay.name} would total ${money(total)} for ${nights} nights. Nothing is held yet.`;
}

function openAuth(mode) {
  authMode = mode;
  authDone.hidden = true;
  authForm.hidden = false;
  const register = mode === "register";
  authTitle.textContent = register ? "Create an account" : "Sign in";
  authLede.textContent = register
    ? "Guests book stays. Admins run the houses. This preview stores nothing."
    : "Use the same door you will use when the API is connected.";
  authNameWrap.hidden = !register;
  authSwitch.textContent = register ? "Already on the list? Sign in" : "New here? Create an account";
  authSubmit.textContent = register ? "Create account" : "Sign in";
  authForm.reset();
  authModal.hidden = false;
  document.body.classList.add("no-scroll");
  (register ? authName : authForm.elements.email).focus();
}

function closeModal() {
  authModal.hidden = true;
  if (drawer.hidden) document.body.classList.remove("no-scroll");
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("is-on");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("is-on"), 3600);
}

function closeMenu() {
  nav.classList.remove("is-open");
  header.classList.remove("menu-open");
  $("navToggle").setAttribute("aria-expanded", "false");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch();
});

whereInput.addEventListener("focus", () => openPopover("where"));
whereInput.addEventListener("input", () => {
  renderWhere();
  if (state.active !== "where") openPopover("where");
  else placePopover(wherePopover, whereField);
});

checkInBtn.addEventListener("click", () => togglePopover("cal"));
checkOutBtn.addEventListener("click", () => togglePopover("cal"));
guestBtn.addEventListener("click", () => togglePopover("guests"));

wherePopover.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest("[data-city]");
  if (!button) return;
  const city = button.dataset.city;
  whereInput.value = city;
  state.destination = city === "Anywhere" ? "" : city;
  closePopovers();
  openPopover("cal");
});

calPopover.addEventListener("click", (event) => {
  event.stopPropagation();
  const navButtonEl = event.target.closest("[data-nav]");
  if (navButtonEl && !navButtonEl.disabled) {
    state.viewMonth = addMonths(state.viewMonth, Number(navButtonEl.dataset.nav));
    renderCalendar();
    return;
  }
  const day = event.target.closest("[data-day]");
  if (!day || day.disabled) return;
  selectDay(parseDay(day.dataset.day));
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
  event.stopPropagation();
  const step = event.target.closest("[data-step]");
  if (step && !step.disabled) {
    const limits = { adults: [1, 8], children: [0, 6], rooms: [1, 4] };
    const key = step.dataset.step;
    const [min, max] = limits[key];
    state[key] = Math.min(max, Math.max(min, state[key] + Number(step.dataset.dir)));
    renderGuests();
    return;
  }
  if (event.target.closest("[data-close-guests]")) closePopovers();
});

$("chips").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-city]");
  if (!chip) return;
  event.stopPropagation();
  whereInput.value = chip.dataset.city;
  state.destination = chip.dataset.city;
  openPopover("cal");
});

stayList.addEventListener("click", onCatalogClick);
stayList.addEventListener("keydown", onCatalogKey);

trendTrack.addEventListener("click", (event) => {
  const card = event.target.closest("[data-city]");
  if (!card) return;
  chooseCity(card.dataset.city);
});

trendTrack.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-city]");
  if (!card || event.target !== card) return;
  event.preventDefault();
  chooseCity(card.dataset.city);
});

$("sort").addEventListener("change", renderList);

const trending = $("trending");
let trendTimer = 0;
let trendPaused = false;
let trendInView = false;
let trendIndex = 0;
let trendAnimating = false;

function trendStep() {
  const card = trendTrack.querySelector(".trend-card");
  if (!card) return 0;
  const styles = getComputedStyle(trendTrack);
  const gap = parseFloat(styles.columnGap || styles.gap) || 16;
  return Math.round(card.getBoundingClientRect().width + gap);
}

function realTrendCount() {
  return trendTrack.querySelectorAll(".trend-card:not([data-clone])").length;
}

function prepareTrendLoop() {
  trendTrack.querySelectorAll("[data-clone]").forEach((node) => node.remove());
  const cards = [...trendTrack.querySelectorAll(".trend-card")];
  const step = trendStep() || 296;
  const copies = Math.max(1, Math.ceil(trendTrack.parentElement.clientWidth / step));
  cards.slice(0, copies).forEach((card) => {
    const clone = card.cloneNode(true);
    clone.dataset.clone = "true";
    clone.removeAttribute("tabindex");
    clone.querySelectorAll("button").forEach((button) => { button.tabIndex = -1; });
    trendTrack.appendChild(clone);
  });
  trendIndex = 0;
  trendAnimating = false;
  setTrendShift(true);
}

function setTrendShift(instant) {
  const step = trendStep();
  trendTrack.classList.toggle("is-instant", instant);
  trendTrack.style.transform = `translate3d(${-trendIndex * step}px, 0, 0)`;
  if (!instant) return;
  trendTrack.getBoundingClientRect();
  trendTrack.classList.remove("is-instant");
}

function canSlideTrend() {
  const step = trendStep();
  return step > 0 && realTrendCount() * step > trendTrack.parentElement.clientWidth + 8;
}

function slideTrend(direction) {
  if (trendAnimating || !canSlideTrend()) return;
  const real = realTrendCount();
  trendAnimating = true;
  if (direction < 0 && trendIndex === 0) {
    trendIndex = real;
    setTrendShift(true);
    requestAnimationFrame(() => {
      trendIndex = real - 1;
      setTrendShift(false);
    });
    return;
  }
  trendIndex += direction > 0 ? 1 : -1;
  setTrendShift(false);
}

trendTrack.addEventListener("transitionend", (event) => {
  if (event.target !== trendTrack || event.propertyName !== "transform") return;
  trendAnimating = false;
  if (trendIndex >= realTrendCount()) {
    trendIndex = 0;
    setTrendShift(true);
  }
});

function tickTrend() {
  if (!trendInView || trendPaused || document.hidden) return;
  slideTrend(1);
}

trending.addEventListener("pointerenter", () => { trendPaused = true; });
trending.addEventListener("pointerleave", () => { trendPaused = false; });
trending.addEventListener("focusin", () => { trendPaused = true; });
trending.addEventListener("focusout", (event) => {
  if (!trending.contains(event.relatedTarget)) trendPaused = false;
});

$("trendNext").addEventListener("click", () => slideTrend(1));
$("trendPrev").addEventListener("click", () => slideTrend(-1));

new IntersectionObserver((entries) => {
  trendInView = entries.some((entry) => entry.isIntersecting);
}, { threshold: 0.35 }).observe(trending);

trendTimer = window.setInterval(tickTrend, 3600);

$("propertiesGrid").addEventListener("click", (event) => {
  const card = event.target.closest(".property-card");
  if (!card) return;
  state.property = state.property === card.dataset.property ? "" : card.dataset.property;
  document.querySelectorAll(".property-card").forEach((item) => {
    const on = item.dataset.property === state.property;
    item.classList.toggle("is-on", on);
    item.setAttribute("aria-pressed", String(on));
  });
  renderList();
  $("list").scrollIntoView({ behavior: "smooth", block: "start" });
});

drawer.addEventListener("click", (event) => {
  if (event.target.closest("[data-close='drawer']")) {
    closeDrawer();
    return;
  }
  const hold = event.target.closest("[data-hold]");
  if (!hold || hold.disabled) return;
  const stay = stays.find((item) => item.id === drawer.dataset.stay);
  if (stay) toast(holdMessage(stay));
});

header.addEventListener("click", (event) => {
  const auth = event.target.closest("[data-auth]");
  if (auth) openAuth(auth.dataset.auth);
  if (event.target.closest("a")) closeMenu();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let glideFrame = 0;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function markArrival(target) {
  if (reduceMotion.matches) return;
  target.classList.remove("is-arrived");
  void target.offsetWidth;
  target.classList.add("is-arrived");
  window.setTimeout(() => target.classList.remove("is-arrived"), 1400);
}

function glideTo(target) {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const start = window.scrollY;
  const end = Math.max(0, target.getBoundingClientRect().top + start - margin);
  const distance = end - start;
  cancelAnimationFrame(glideFrame);
  if (reduceMotion.matches || Math.abs(distance) < 2) {
    window.scrollTo({ top: end, behavior: "instant" });
    markArrival(target);
    return;
  }
  const duration = Math.min(1200, Math.max(600, Math.abs(distance) * 0.45));
  const began = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - began) / duration);
    window.scrollTo({ top: start + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) glideFrame = requestAnimationFrame(step);
    else markArrival(target);
  };
  glideFrame = requestAnimationFrame(step);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const id = link.getAttribute("href").slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  history.pushState(null, "", `#${id}`);
  glideTo(target);
});

["wheel", "touchstart", "keydown"].forEach((type) => {
  window.addEventListener(type, () => cancelAnimationFrame(glideFrame), { passive: true });
});

document.querySelector(".footer").addEventListener("click", (event) => {
  const auth = event.target.closest("[data-auth]");
  if (auth) openAuth(auth.dataset.auth);
});

$("navToggle").addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  header.classList.toggle("menu-open", open);
  $("navToggle").setAttribute("aria-expanded", String(open));
  $("navToggle").setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

authSwitch.addEventListener("click", () => openAuth(authMode === "register" ? "signin" : "register"));

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = authForm.elements.email.value.trim();
  authForm.hidden = true;
  authDone.hidden = false;
  authDone.textContent = authMode === "register"
    ? `Account preview for ${email}. Nothing was saved — registration arrives with the API.`
    : `Signed-in preview for ${email}. Nothing was saved — sign-in arrives with the API.`;
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-close='modal']")) {
    closeModal();
    return;
  }
  if (event.target.closest("#searchForm")) return;
  closePopovers();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!drawer.hidden) closeDrawer();
    else if (!authModal.hidden) closeModal();
    else if (nav.classList.contains("is-open")) closeMenu();
    else closePopovers();
    return;
  }
  if (event.key === "/" && !event.target.closest("input, textarea")) {
    event.preventDefault();
    whereInput.focus();
  }
});

const hero = $("hero");
const driftTargets = () => document.querySelectorAll(".trend-card img, .stay-media img, .video-band video, .property-card img");

const videoTrack = $("videoTrack");
const videoDots = [...$("videoDots").children];
const bandVideos = [...videoTrack.querySelectorAll("video")];
let videoIndex = 0;
let bandVisible = false;

function syncBandVideo() {
  bandVideos.forEach((video, index) => {
    if (bandVisible && index === videoIndex) video.play().catch(() => {});
    else video.pause();
  });
}

function showVideo(index) {
  videoIndex = index;
  videoTrack.style.transform = `translateX(-${index * 100}%)`;
  videoDots.forEach((dot, i) => {
    dot.classList.toggle("is-on", i === index);
    if (i === index) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
  syncBandVideo();
}

videoDots.forEach((dot, index) => dot.addEventListener("click", () => showVideo(index)));

new IntersectionObserver((entries) => {
  bandVisible = entries.some((entry) => entry.isIntersecting);
  syncBandVideo();
}, { threshold: 0.1 }).observe(videoTrack.parentElement);
let motionFrame = 0;

function markVisible() {
  const height = window.innerHeight;
  document.querySelectorAll(".reveal, .reveal-track").forEach((el) => {
    const box = el.getBoundingClientRect();
    if (box.top < height * 0.92 && box.bottom > 72) el.classList.add("is-in");
    else if (box.bottom < 0 || box.top > height) el.classList.remove("is-in");
  });
}

function paintDrift() {
  const height = window.innerHeight;
  if (hero) {
    const scrolled = Math.min(Math.max(-hero.getBoundingClientRect().top, 0), height);
    hero.style.setProperty("--drift", `${(scrolled * 0.35).toFixed(1)}px`);
  }
  driftTargets().forEach((el) => {
    const box = el.getBoundingClientRect();
    if (box.bottom < -80 || box.top > height + 80) return;
    const progress = (box.top + box.height / 2 - height / 2) / height;
    const shift = Math.max(-1, Math.min(1, progress)) * 36;
    el.style.setProperty("--py", `${shift.toFixed(1)}px`);
  });
}

function onScroll() {
  header.classList.toggle("is-solid", window.scrollY > 20);
  if (motionFrame) return;
  motionFrame = requestAnimationFrame(() => {
    motionFrame = 0;
    markVisible();
    paintDrift();
  });
}

window.addEventListener("scroll", onScroll, { passive: true });

window.addEventListener("resize", () => {
  prepareTrendLoop();
  if (!state.active) return;
  if (state.active === "cal") renderCalendar();
  const popover = state.active === "where" ? wherePopover : state.active === "cal" ? calPopover : guestPopover;
  const anchor = state.active === "where" ? whereField : state.active === "cal" ? datesField : guestField;
  placePopover(popover, anchor);
});

document.addEventListener("error", (event) => {
  if (event.target && event.target.tagName === "IMG") event.target.classList.add("is-broken");
}, true);

function watchReveals() {
  requestAnimationFrame(() => {
    markVisible();
    paintDrift();
  });
}

watchReveals();
onScroll();
renderGuests();
updateDateLabels();
renderTrend();
renderList();
