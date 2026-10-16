"use strict";

const root = document.getElementById("saved");
const assetRoot = root.dataset.assetRoot || "assets/";
const propertyPage = root.dataset.property || "property.html";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

let stays = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function imageSrc(image) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
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

async function render() {
  const [properties, savedIds] = await Promise.all([PorticoApi.listProperties(), PorticoApi.listSaved()]);
  stays = properties.map((property) => property.card);
  const ids = new Set(savedIds);
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
