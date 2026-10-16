"use strict";

const root = document.getElementById("reserve");
const assetRoot = root.dataset.assetRoot || "assets/";
const reservationBase = root.dataset.reservation || "reservation.html?ref=";
const homePage = root.dataset.home || "index.html";
const propertyPage = root.dataset.property || "property.html";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const params = new URLSearchParams(window.location.search);
const STORE = "portico-reservations";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function parseKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function validKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return false;
  const date = parseKey(key);
  return date.getFullYear() > 2000;
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

function clamp(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function imageSrc(image) {
  if (!image) return "";
  if (/^(https?:|\/|assets\/)/.test(image)) return image;
  return `${assetRoot}${image}`;
}

function guestLabel(adults, children, rooms, unit, units) {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  parts.push(`${rooms} ${rooms === 1 ? unit : units}`);
  return parts.join(" · ");
}

function propertyHref(stay) {
  const next = new URLSearchParams({
    id: stay.id,
    room: stay.roomId,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: String(stay.adults),
    rooms: String(stay.rooms)
  });
  if (stay.children) next.set("children", String(stay.children));
  return `${propertyPage}${propertyPage.includes("?") ? "&" : "?"}${next}`;
}

function showMessage(title, text, linkHref, linkText) {
  document.getElementById("reserveTitle").textContent = title;
  document.getElementById("reserveMeta").textContent = text;
  document.getElementById("reserveBody").innerHTML = `<div class="empty">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    <a class="change-search" href="${escapeHtml(linkHref)}">${escapeHtml(linkText)}</a>
  </div>`;
}

function readStay() {
  const id = params.get("id") || "";
  const roomId = params.get("room") || "";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  if (!id || !roomId || !validKey(checkIn) || !validKey(checkOut) || nightCount(checkIn, checkOut) < 1) return null;
  return {
    id,
    roomId,
    checkIn,
    checkOut,
    adults: clamp(params.get("adults"), 1, 8, 2),
    children: clamp(params.get("children"), 0, 6, 0),
    rooms: clamp(params.get("rooms"), 1, 4, 1)
  };
}

function remember(reference, property, room, stay, total) {
  const address = property.address || {};
  const photo = (property.gallery && property.gallery[0] && property.gallery[0].src) || room.image;
  const trip = {
    reference,
    propertyId: property.id,
    propertyName: property.name,
    city: address.city || "",
    country: address.country || "",
    area: address.area || "",
    image: photo,
    roomId: room.id,
    roomName: room.name,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    refundable: Boolean(room.refundable),
    nightly: room.price,
    total,
    rooms: stay.rooms,
    adults: stay.adults,
    children: stay.children
  };
  const all = JSON.parse(sessionStorage.getItem(STORE) || "{}");
  all[reference] = trip;
  sessionStorage.setItem(STORE, JSON.stringify(all));
}

function summaryHtml(property, room, stay, total, nights) {
  const address = property.address || {};
  const where = [address.area, address.city, address.country].filter(Boolean).join(" · ");
  const unit = property.type === "Villa" ? "house" : property.type === "Apartment" ? "apartment" : "room";
  const units = property.type === "Villa" ? "houses" : property.type === "Apartment" ? "apartments" : "rooms";
  const cancelDay = parseKey(stay.checkIn);
  cancelDay.setDate(cancelDay.getDate() - 3);
  const cancel = room.refundable
    ? `Free cancellation until ${dateFmt.format(cancelDay)}.`
    : "Non-refundable. You pay the full amount if you cancel.";
  return `<div class="reserve-stay">
    <img src="${escapeHtml(imageSrc(room.image))}" alt="">
    <div>
      <p class="stay-type">${escapeHtml(room.name)}</p>
      <h2>${escapeHtml(property.name)}</h2>
      <p class="where-line">${escapeHtml(where)}</p>
    </div>
  </div>
  <dl class="trip-facts">
    <div><dt>Check-in</dt><dd>${escapeHtml(formatDay(stay.checkIn))}</dd></div>
    <div><dt>Check-out</dt><dd>${escapeHtml(formatDay(stay.checkOut))}</dd></div>
    <div><dt>Guests</dt><dd>${escapeHtml(guestLabel(stay.adults, stay.children, stay.rooms, unit, units))}</dd></div>
    <div><dt>Total</dt><dd>${escapeHtml(money(total))}</dd></div>
  </dl>
  <p class="formula">${escapeHtml(money(room.price))} × ${nights} night${nights === 1 ? "" : "s"} × ${stay.rooms} ${stay.rooms === 1 ? unit : units}</p>
  <p class="cancel${room.refundable ? "" : " is-locked"}">${escapeHtml(cancel)}</p>
  <a class="account-switch" href="${escapeHtml(propertyHref(stay))}">Change this stay</a>`;
}

function formHtml() {
  return `<form id="reserveForm" novalidate>
    <label class="stack">Full name
      <input name="name" type="text" required autocomplete="name">
      <span class="field-error" id="reserveNameError"></span>
    </label>
    <label class="stack">Email
      <input name="email" type="email" required autocomplete="email">
      <span class="field-error" id="reserveEmailError"></span>
    </label>
    <label class="stack"><span>Phone <em class="optional">optional</em></span>
      <input name="phone" type="tel" autocomplete="tel">
    </label>
    <label class="stack"><span>Requests for the property <em class="optional">optional</em></span>
      <textarea name="requests" rows="3" maxlength="400"></textarea>
    </label>
    <p class="account-error" id="reserveError" role="alert" hidden></p>
    <button class="search-btn auth-submit" id="reserveSubmit" type="submit">Confirm reservation</button>
    <p class="preview-note">Preview only. No payment is taken and nothing is charged.</p>
  </form>`;
}

function setFieldError(form, name, message) {
  const input = form.elements[name];
  const target = document.getElementById(name === "name" ? "reserveNameError" : "reserveEmailError");
  target.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

async function start() {
  const stay = readStay();
  if (!stay) {
    showMessage("Choose a stay first", "A reservation starts from a property, a room, and your dates.", homePage, "Back to search");
    return;
  }
  let property;
  try {
    property = await PorticoApi.getProperty(stay.id);
  } catch {
    showMessage("That stay is not on the list", "Open the property again and choose a room.", homePage, "Back to search");
    return;
  }
  const room = property.rooms.find((item) => item.id === stay.roomId);
  if (!room) {
    showMessage("That room is not on the list", "Open the property again and choose a room.", propertyHref(stay), "Back to the property");
    return;
  }
  const nights = nightCount(stay.checkIn, stay.checkOut);
  const total = room.price * nights * stay.rooms;
  document.getElementById("reserveTitle").textContent = "Confirm your stay";
  document.getElementById("reserveMeta").textContent = property.name;
  document.getElementById("reserveBody").innerHTML = `<div class="account-panel">
    ${summaryHtml(property, room, stay, total, nights)}
    ${formHtml()}
  </div>`;

  const form = document.getElementById("reserveForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = document.getElementById("reserveError");
    error.hidden = true;
    const nameOk = form.elements.name.value.trim().length >= 2;
    const emailOk = form.elements.email.value.trim() !== "" && form.elements.email.validity.valid;
    setFieldError(form, "name", nameOk ? "" : "Enter the name of the main guest.");
    setFieldError(form, "email", emailOk ? "" : "Enter a valid email address for the confirmation.");
    if (!nameOk) {
      form.elements.name.focus();
      return;
    }
    if (!emailOk) {
      form.elements.email.focus();
      return;
    }
    const submit = document.getElementById("reserveSubmit");
    submit.disabled = true;
    submit.textContent = "Confirming…";
    try {
      const offers = await PorticoApi.getAvailability(stay.id, stay.checkIn, stay.checkOut);
      const offer = offers.find((item) => item.roomId === stay.roomId);
      if (!offer || offer.left < stay.rooms) {
        error.hidden = false;
        error.textContent = "That room was just taken for these dates. Choose another room or change your dates.";
        return;
      }
      const result = await PorticoApi.createReservation({
        propertyId: stay.id,
        roomId: stay.roomId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        adults: stay.adults,
        children: stay.children,
        rooms: stay.rooms,
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        requests: form.elements.requests.value.trim()
      });
      remember(result.reference, property, room, stay, result.total || total);
      window.location.href = `${reservationBase}${encodeURIComponent(result.reference)}`;
    } catch (failure) {
      error.hidden = false;
      error.textContent = failure && failure.message
        ? failure.message
        : "The reservation did not go through. Nothing was charged.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Confirm reservation";
    }
  });
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
