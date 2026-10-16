"use strict";

const root = document.getElementById("payment");
const assetRoot = root.dataset.assetRoot || "assets/";
const reservationBase = root.dataset.reservation || "reservation.html?ref=";
const reservePage = root.dataset.reserve || "reserve.html";
const homePage = root.dataset.home || "index.html";
const propertyPage = root.dataset.property || "property.html";
const moneyFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const params = new URLSearchParams(window.location.search);
const CHECKOUT = "portico-checkout";

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

function stayQuery(stay) {
  const next = new URLSearchParams({
    id: stay.id,
    room: stay.roomId,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: String(stay.adults),
    rooms: String(stay.rooms)
  });
  if (stay.children) next.set("children", String(stay.children));
  return next;
}

function pageHref(base, stay) {
  return `${base}${base.includes("?") ? "&" : "?"}${stayQuery(stay)}`;
}

function readCheckout(stay) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CHECKOUT) || "null");
    if (!saved || saved.id !== stay.id || saved.roomId !== stay.roomId) return null;
    if (saved.checkIn !== stay.checkIn || saved.checkOut !== stay.checkOut) return null;
    if (!saved.name || !saved.email) return null;
    return saved;
  } catch {
    return null;
  }
}

function showMessage(title, text, linkHref, linkText) {
  document.getElementById("paymentTitle").textContent = title;
  document.getElementById("paymentMeta").textContent = text;
  document.getElementById("paymentBody").innerHTML = `<div class="empty">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    <a class="change-search" href="${escapeHtml(linkHref)}">${escapeHtml(linkText)}</a>
  </div>`;
}

function digits(value) {
  return String(value).replace(/\D/g, "");
}

function formatCard(value) {
  return digits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value) {
  const clean = digits(value).slice(0, 4);
  if (clean.length <= 2) return clean;
  return `${clean.slice(0, 2)}/${clean.slice(2)}`;
}

function bindFormat(input, format) {
  input.addEventListener("input", () => {
    const before = digits(input.value.slice(0, input.selectionStart)).length;
    const next = format(input.value);
    if (next === input.value) return;
    input.value = next;
    let pos = 0;
    let seen = 0;
    while (pos < input.value.length && seen < before) {
      if (/\d/.test(input.value[pos])) seen += 1;
      pos += 1;
    }
    input.setSelectionRange(pos, pos);
  });
}

function luhn(number) {
  let sum = 0;
  let alt = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let n = Number(number[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function expiryParts(value) {
  const clean = digits(value);
  if (clean.length < 4) return null;
  const month = Number(clean.slice(0, 2));
  const year = 2000 + Number(clean.slice(2, 4));
  if (month < 1 || month > 12) return null;
  return { month, year };
}

function expiryOpen(parts) {
  const now = new Date();
  const current = now.getFullYear() * 12 + now.getMonth();
  return parts.year * 12 + (parts.month - 1) >= current;
}

function setFieldError(form, name, message) {
  const input = form.elements[name];
  const target = form.querySelector(`[data-error="${name}"]`);
  target.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function summaryHtml(property, room, stay, guest, total, nights) {
  const address = property.address || {};
  const where = [address.area, address.city, address.country].filter(Boolean).join(" · ");
  const unit = property.type === "Villa" ? "house" : property.type === "Apartment" ? "apartment" : "room";
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
    <div><dt>Guest</dt><dd>${escapeHtml(guest.name)}</dd></div>
    <div><dt>Total</dt><dd>${escapeHtml(money(total))}</dd></div>
  </dl>
  <p class="formula">${escapeHtml(money(room.price))} × ${nights} night${nights === 1 ? "" : "s"} × ${stay.rooms} ${stay.rooms === 1 ? unit : `${unit}s`}</p>
  <p class="where-line">Confirmation to ${escapeHtml(guest.email)}</p>`;
}

function formHtml(total) {
  return `<form id="paymentForm" novalidate>
    <label class="stack">Name on card
      <input name="cardName" type="text" required autocomplete="cc-name">
      <span class="field-error" data-error="cardName"></span>
    </label>
    <label class="stack">Card number
      <input name="number" type="text" inputmode="numeric" required autocomplete="cc-number" maxlength="23" placeholder="•••• •••• •••• ••••">
      <span class="field-error" data-error="number"></span>
    </label>
    <div class="card-row">
      <label class="stack">Expiry
        <input name="expiry" type="text" inputmode="numeric" required autocomplete="cc-exp" maxlength="5" placeholder="MM/YY">
        <span class="field-error" data-error="expiry"></span>
      </label>
      <label class="stack">Security code
        <input name="cvc" type="text" inputmode="numeric" required autocomplete="cc-csc" placeholder="CVC">
        <span class="field-error" data-error="cvc"></span>
      </label>
    </div>
    <p class="account-error" id="paymentError" role="alert" hidden></p>
    <button class="search-btn auth-submit" id="paymentSubmit" type="submit">Pay ${escapeHtml(money(total))}</button>
    <p class="preview-note">Preview only. The card is not sent and nothing is charged. Portico.Api will take payment later.</p>
  </form>`;
}

async function start() {
  const stay = readStay();
  if (!stay) {
    showMessage("Choose a stay first", "Payment starts from a property, a room, and your dates.", homePage, "Back to search");
    return;
  }
  const guest = readCheckout(stay);
  const reserveHref = pageHref(reservePage, stay);
  if (!guest) {
    showMessage("Add the guest details first", "The card form follows the name and email for this stay.", reserveHref, "Back to guest details");
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
    showMessage("That room is not on the list", "Open the property again and choose a room.", pageHref(propertyPage, stay), "Back to the property");
    return;
  }
  const nights = nightCount(stay.checkIn, stay.checkOut);
  const total = room.price * nights * stay.rooms;
  document.getElementById("paymentTitle").textContent = "Payment";
  document.getElementById("paymentMeta").textContent = `${property.name} · ${money(total)}`;
  document.getElementById("paymentBody").innerHTML = `<div class="account-panel">
    ${summaryHtml(property, room, stay, guest, total, nights)}
    ${formHtml(total)}
    <a class="account-switch" href="${escapeHtml(reserveHref)}">Back to guest details</a>
  </div>`;

  const form = document.getElementById("paymentForm");
  bindFormat(form.elements.number, formatCard);
  bindFormat(form.elements.expiry, formatExpiry);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = document.getElementById("paymentError");
    error.hidden = true;
    const cardName = form.elements.cardName.value.trim();
    const number = digits(form.elements.number.value);
    const expiry = expiryParts(form.elements.expiry.value);
    const cvc = digits(form.elements.cvc.value);
    const nameOk = cardName.length >= 2;
    const numberOk = number.length >= 13 && number.length <= 19 && luhn(number);
    const expiryOk = Boolean(expiry) && expiryOpen(expiry);
    const cvcOk = cvc.length === 3 || cvc.length === 4;
    setFieldError(form, "cardName", nameOk ? "" : "Enter the name on the card.");
    setFieldError(form, "number", numberOk ? "" : "Enter a card number.");
    setFieldError(form, "expiry", expiryOk ? "" : "Enter an expiry date that has not passed.");
    setFieldError(form, "cvc", cvcOk ? "" : "Enter the security code.");
    if (!nameOk) {
      form.elements.cardName.focus();
      return;
    }
    if (!numberOk) {
      form.elements.number.focus();
      return;
    }
    if (!expiryOk) {
      form.elements.expiry.focus();
      return;
    }
    if (!cvcOk) {
      form.elements.cvc.focus();
      return;
    }
    const submit = document.getElementById("paymentSubmit");
    submit.disabled = true;
    submit.textContent = "Paying…";
    try {
      const result = await PorticoApi.createReservation({
        propertyId: stay.id,
        roomId: stay.roomId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        adults: stay.adults,
        children: stay.children,
        rooms: stay.rooms,
        name: guest.name,
        email: guest.email,
        phone: guest.phone || "",
        requests: guest.requests || ""
      });
      sessionStorage.removeItem(CHECKOUT);
      window.location.href = `${reservationBase}${encodeURIComponent(result.reference)}`;
    } catch (failure) {
      error.hidden = false;
      error.textContent = failure && failure.message
        ? failure.message
        : "The payment did not go through. Nothing was charged.";
    } finally {
      submit.disabled = false;
      submit.textContent = `Pay ${money(total)}`;
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
