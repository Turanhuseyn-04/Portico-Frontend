"use strict";

const root = document.getElementById("results");
const assetRoot = root.dataset.assetRoot || "assets/";
const homePage = root.dataset.home || "index.html";
const propertyPage = root.dataset.property || "property.html";

const stays = [
  { id: "marble", name: "The Marble Court", city: "Lisbon", country: "Portugal", area: "Chiado", type: "Suite", property: "Hotel", score: 9.4, reviews: 186, price: 242, maxGuests: 3, cancel: true, scarce: true, amenities: ["Courtyard", "Breakfast", "River walk"], image: "lisbon.jpg", order: 0 },
  { id: "screens", name: "House of Paper Screens", city: "Kyoto", country: "Japan", area: "Gion", type: "Room", property: "Hotel", score: 9.1, reviews: 143, price: 198, maxGuests: 2, cancel: true, scarce: false, amenities: ["Cedar bath", "Garden", "Work desk"], image: "kyoto.jpg", order: 1 },
  { id: "atelier", name: "The North Atelier", city: "Copenhagen", country: "Denmark", area: "Nørrebro", type: "Studio", property: "Apartment", score: 8.8, reviews: 97, price: 176, maxGuests: 2, cancel: true, scarce: false, amenities: ["Work desk", "Courtyard", "Bike"], image: "copenhagen.jpg", order: 2 },
  { id: "riad", name: "Riad of Small Doors", city: "Marrakech", country: "Morocco", area: "Medina", type: "House", property: "Villa", score: 9.6, reviews: 221, price: 164, maxGuests: 5, cancel: true, scarce: false, amenities: ["Whole house", "Roof terrace", "Breakfast"], image: "marrakech.jpg", order: 3 },
  { id: "orchard", name: "Cliff Orchard", city: "Amalfi", country: "Italy", area: "Above the port", type: "Suite", property: "Resort", score: 9.3, reviews: 118, price: 310, maxGuests: 3, cancel: true, scarce: true, amenities: ["Sea view", "Breakfast", "Terrace"], image: "amalfi.jpg", order: 4 },
  { id: "patio", name: "Casa del Patio", city: "Oaxaca", country: "Mexico", area: "Centro", type: "Room", property: "Hotel", score: 8.9, reviews: 76, price: 132, maxGuests: 3, cancel: false, scarce: false, amenities: ["Patio", "Fan", "Walk to market"], image: "oaxaca.jpg", order: 5 },
  { id: "greenhouse", name: "Greenhouse No. 4", city: "Porto", country: "Portugal", area: "Cedofeita", type: "Studio", property: "Apartment", score: 9.0, reviews: 64, price: 154, maxGuests: 2, cancel: true, scarce: false, amenities: ["Kitchenette", "Courtyard", "Work desk"], image: "porto.jpg", order: 6 },
  { id: "gallery", name: "The Long Gallery", city: "Edinburgh", country: "Scotland", area: "Old Town", type: "House", property: "Villa", score: 9.2, reviews: 159, price: 208, maxGuests: 4, cancel: true, scarce: false, amenities: ["Whole house", "Fireplace", "Old Town"], image: "edinburgh.jpg", order: 7 }
];

const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const heartSvg = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const saved = new Set();
const params = new URLSearchParams(window.location.search);
const propertyNames = { Hotel: "Hotels", Apartment: "Apartments", Resort: "Resorts", Villa: "Villas" };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function money(amount) {
  return moneyFmt.format(amount);
}

function parseKey(key) {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function dayTime(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function toKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function nightCount(start, end) {
  return Math.round((dayTime(end) - dayTime(start)) / 86400000);
}

function formatPretty(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function scoreLabel(score) {
  if (score >= 9) return "Wonderful";
  if (score >= 8) return "Excellent";
  return "Good";
}

const destination = (params.get("destination") || "").trim();
const property = propertyNames[params.get("property")] ? params.get("property") : "";
const checkIn = parseKey(params.get("checkIn"));
const checkOut = parseKey(params.get("checkOut"));
const dated = Boolean(checkIn && checkOut && dayTime(checkOut) > dayTime(checkIn));
const askedGuests = params.has("adults") || params.has("children") || params.has("rooms") || dated;
const adults = askedGuests ? clampInt(params.get("adults"), 1, 8, 2) : null;
const children = askedGuests ? clampInt(params.get("children"), 0, 6, 0) : 0;
const rooms = askedGuests ? clampInt(params.get("rooms"), 1, 4, 1) : null;
const hasSearch = Boolean(destination || property || dated);

function guestLabel() {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  parts.push(`${rooms} room${rooms === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function matchesDest(stay) {
  const query = destination.toLowerCase();
  return [stay.city, stay.country, stay.name, stay.area].some((value) => value.toLowerCase().includes(query));
}

function fits(stay) {
  if (!dated) return true;
  return adults + children <= stay.maxGuests * rooms;
}

function cancelCopy(stay) {
  if (!stay.cancel) return { text: "Non-refundable once booked.", locked: true };
  if (!dated) return { text: "Free cancellation until 3 days before check-in.", locked: false };
  const until = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() - 3);
  const today = new Date();
  const closed = dayTime(until) < Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (closed) return { text: "Free cancellation has closed for these dates.", locked: true };
  return { text: `Free cancellation until ${formatPretty(until)}.`, locked: false };
}

function priceMarkup(stay) {
  if (!dated) return `<span class="from">from</span><strong>${money(stay.price)}</strong><span class="per">per night</span>`;
  const nights = nightCount(checkIn, checkOut);
  const total = stay.price * nights * rooms;
  const guests = `${adults} adult${adults === 1 ? "" : "s"}`;
  const childCopy = children ? `, ${children} child${children === 1 ? "" : "ren"}` : "";
  const roomCopy = `${rooms} room${rooms === 1 ? "" : "s"}`;
  return `<span class="from">${nights} night${nights === 1 ? "" : "s"}, ${guests}${childCopy}</span><strong>${money(total)}</strong><span class="per">${money(stay.price)} × ${nights} × ${roomCopy}</span>`;
}

function homeHref() {
  const next = new URLSearchParams();
  if (destination) next.set("destination", destination);
  if (dated) {
    next.set("checkIn", toKey(checkIn));
    next.set("checkOut", toKey(checkOut));
  }
  if (adults !== null) next.set("adults", String(adults));
  if (children) next.set("children", String(children));
  if (rooms !== null) next.set("rooms", String(rooms));
  if (property) next.set("property", property);
  const qs = next.toString();
  return qs ? `${homePage}${homePage.includes("?") ? "&" : "?"}${qs}` : homePage;
}

function propertyHref(stay) {
  const next = new URLSearchParams({ id: stay.id });
  if (dated) {
    next.set("checkIn", toKey(checkIn));
    next.set("checkOut", toKey(checkOut));
    next.set("adults", String(adults));
    if (children) next.set("children", String(children));
    next.set("rooms", String(rooms));
  }
  return `${propertyPage}?${next}`;
}

function stayCard(stay) {
  const ok = fits(stay);
  const policy = cancelCopy(stay);
  const href = propertyHref(stay);
  const savedNow = saved.has(stay.id);
  return `<article class="stay${ok ? "" : " is-unfit"}" data-stay="${stay.id}" data-href="${escapeHtml(href)}" tabindex="0">
    <div class="stay-media">
      <img src="${assetRoot}${stay.image}" alt="${escapeHtml(stay.name)} in ${escapeHtml(stay.city)}" width="800" height="600" loading="lazy">
      <button class="heart" type="button" data-stay="${stay.id}" data-name="${escapeHtml(stay.name)}" aria-pressed="${savedNow}" aria-label="${savedNow ? "Remove" : "Save"} ${escapeHtml(stay.name)}">${heartSvg}</button>
    </div>
    <div class="stay-body">
      <p class="stay-type">${escapeHtml(stay.property)} · ${escapeHtml(stay.type)} · sleeps ${stay.maxGuests}</p>
      <h3><a href="${escapeHtml(href)}">${escapeHtml(stay.name)}</a></h3>
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

function filteredStays() {
  const list = stays.filter((stay) => {
    if (property && stay.property !== property) return false;
    if (destination && !matchesDest(stay)) return false;
    return true;
  });
  const sort = document.getElementById("sort").value;
  if (sort === "price") list.sort((a, b) => a.price - b.price);
  else if (sort === "rating") list.sort((a, b) => b.score - a.score);
  else list.sort((a, b) => a.order - b.order);
  return list;
}

function render() {
  const title = document.getElementById("resultsTitle");
  const meta = document.getElementById("resultsMeta");
  const facts = document.getElementById("resultsFacts");
  const list = document.getElementById("stayList");
  const change = document.getElementById("changeSearch");
  const sort = document.getElementById("sort").closest(".sort");
  change.href = homeHref();

  const chips = [];
  if (destination) chips.push(destination);
  else if (hasSearch) chips.push("Any city");
  if (property) chips.push(propertyNames[property]);
  if (dated) {
    const nights = nightCount(checkIn, checkOut);
    chips.push(`${formatPretty(checkIn)} – ${formatPretty(checkOut)} · ${nights} night${nights === 1 ? "" : "s"}`);
  }
  if (adults !== null) chips.push(guestLabel());
  facts.innerHTML = chips.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  if (!hasSearch) {
    title.textContent = "Search results";
    meta.textContent = "Choose a city, dates, and guests. The stays that match will be listed here.";
    change.textContent = "Start a search";
    sort.hidden = true;
    list.innerHTML = "";
    return;
  }

  change.textContent = "Change search";
  sort.hidden = false;
  const found = filteredStays();
  const place = destination ? ` in ${destination}` : "";
  const kind = property ? propertyNames[property] : "Stays";
  title.textContent = destination ? `${kind} in ${destination}` : kind;
  const unfit = dated ? found.filter((stay) => !fits(stay)).length : 0;
  let text = `${found.length} of ${stays.length} houses${place}`;
  if (dated) {
    const nights = nightCount(checkIn, checkOut);
    text += ` · ${nights} night${nights === 1 ? "" : "s"} · ${guestLabel()}`;
  } else {
    text += ". Add dates to turn the nightly rate into a stay total.";
  }
  if (unfit) text += ` ${unfit} ${unfit === 1 ? "house sleeps" : "houses sleep"} fewer guests than this search.`;
  meta.textContent = text;

  if (!found.length) {
    list.innerHTML = `<div class="empty">
      <h3>Nothing on the list${escapeHtml(place)}</h3>
      <p>This preview keeps eight houses. Change the city or the property type.</p>
      <a class="change-search" href="${escapeHtml(homeHref())}">Change search</a>
    </div>`;
    return;
  }
  list.innerHTML = found.map(stayCard).join("");
}

document.getElementById("sort").addEventListener("change", render);
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
