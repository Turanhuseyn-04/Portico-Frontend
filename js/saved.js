"use strict";

const root = document.getElementById("saved");
const assetRoot = root.dataset.assetRoot || "assets/";
const propertyPage = root.dataset.property || "property.html";
const SAVED_KEY = "portico:saved";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const stays = [
  { id: "marble", name: "The Marble Court", city: "Lisbon", country: "Portugal", area: "Chiado", image: "lisbon.jpg", price: 242 },
  { id: "screens", name: "House of Paper Screens", city: "Kyoto", country: "Japan", area: "Gion", image: "kyoto.jpg", price: 198 },
  { id: "atelier", name: "The North Atelier", city: "Copenhagen", country: "Denmark", area: "Nørrebro", image: "copenhagen.jpg", price: 176 },
  { id: "riad", name: "Riad of Small Doors", city: "Marrakech", country: "Morocco", area: "Medina", image: "marrakech.jpg", price: 164 },
  { id: "orchard", name: "Cliff Orchard", city: "Amalfi", country: "Italy", area: "Above the port", image: "amalfi.jpg", price: 310 },
  { id: "patio", name: "Casa del Patio", city: "Oaxaca", country: "Mexico", area: "Centro", image: "oaxaca.jpg", price: 132 },
  { id: "greenhouse", name: "Greenhouse No. 4", city: "Porto", country: "Portugal", area: "Cedofeita", image: "porto.jpg", price: 154 },
  { id: "gallery", name: "The Long Gallery", city: "Edinburgh", country: "Scotland", area: "Old Town", image: "edinburgh.jpg", price: 208 }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function imageSrc(image) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
}

function readSaved() {
  try {
    const ids = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function row(stay) {
  const where = [stay.area, stay.city, stay.country].filter(Boolean).join(" · ");
  return `<a class="trip-row" href="${escapeHtml(propertyPage)}?id=${encodeURIComponent(stay.id)}">
    <img src="${escapeHtml(imageSrc(stay.image))}" alt="" width="320" height="220">
    <div>
      <p class="stay-type">Saved</p>
      <h2>${escapeHtml(stay.name)}</h2>
      <p class="where-line">${escapeHtml(where)}</p>
    </div>
    <p class="trip-total">${escapeHtml(moneyFmt.format(stay.price))}</p>
  </a>`;
}

function render() {
  const ids = readSaved();
  const list = stays.filter((stay) => ids.has(stay.id));
  const meta = document.getElementById("savedMeta");
  const body = document.getElementById("savedList");
  meta.textContent = list.length === 1 ? "1 saved stay" : `${list.length} saved stays`;
  if (!list.length) {
    body.innerHTML = `<div class="empty"><h3>No saved stays</h3><p>Use the heart on a property page. The stay stays in this browser.</p></div>`;
    return;
  }
  body.innerHTML = `<div class="trip-list">${list.map(row).join("")}</div>`;
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

render();
