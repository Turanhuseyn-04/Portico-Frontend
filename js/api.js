"use strict";

const PorticoApi = (() => {
  // Set baseUrl (for example "https://localhost:7001/api") once Portico.Api is running.
  // An empty baseUrl keeps the preview on this browser.
  const config = { baseUrl: "", latency: 450 };
  const mockMode = new URLSearchParams(window.location.search).get("mock") || "";
  const RESERVATIONS = "portico-reservations";
  const ACCOUNT = "portico-account";
  const SAVED = "portico:saved";
  const MESSAGES = "portico-messages";

  // The sample confirmation. A saved record with the same reference replaces it.
  const SAMPLE = {
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

  // Words the list cards already show. Prices, scores, and cities come from the stay itself.
  const LIST_FACE = {
    marble: { type: "Suite", scarce: true, amenities: ["Courtyard", "Breakfast", "River walk"], blurb: "A stone suite behind a working portico, one street up from the river." },
    screens: { type: "Room", scarce: false, amenities: ["Cedar bath", "Garden", "Work desk"], blurb: "A small room with paper screens and a cedar bath down the hall." },
    atelier: { type: "Studio", scarce: false, amenities: ["Work desk", "Courtyard", "Bike"], blurb: "A studio with a work table, a good lamp, and a quiet courtyard." },
    riad: { type: "House", scarce: false, amenities: ["Whole house", "Roof terrace", "Breakfast"], blurb: "A whole riad: four small doors, one orange tree, a roof for breakfast." },
    orchard: { type: "Suite", scarce: true, amenities: ["Sea view", "Breakfast", "Terrace"], blurb: "A lemon-scented suite on the cliff path, with the port below." },
    patio: { type: "Room", scarce: false, amenities: ["Patio", "Fan", "Walk to market"], blurb: "A tiled room on a patio that stays cool after lunch." },
    greenhouse: { type: "Studio", scarce: false, amenities: ["Kitchenette", "Courtyard", "Work desk"], blurb: "A glass-roofed studio two blocks from the bakery you will use." },
    gallery: { type: "House", scarce: false, amenities: ["Whole house", "Fireplace", "Old Town"], blurb: "A long stone gallery of a house, with a fire and a steep stair." }
  };

  class ApiError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "ApiError";
      this.code = code;
    }
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(storage, key, fallback) {
    try {
      const value = JSON.parse(storage.getItem(key) || "");
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${config.baseUrl}${path}`, {
        ...options,
        headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.headers || {}) }
      });
    } catch {
      throw new ApiError("network", "The server could not be reached.");
    }
    if (response.status === 404) throw new ApiError("not-found", "That record does not exist.");
    if (!response.ok) throw new ApiError("server", `The server answered ${response.status}.`);
    if (response.status === 204) return null;
    return response.json();
  }

  function dateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function parseKey(key) {
    const [year, month, day] = String(key).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function nightKeys(checkIn, checkOut) {
    const keys = [];
    const end = parseKey(checkOut);
    for (let day = parseKey(checkIn); day < end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
      keys.push(dateKey(day));
    }
    return keys;
  }

  function today() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function seeded(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  function catalog() {
    if (typeof MOCK_PROPERTIES === "undefined") throw new ApiError("server", "The stay list is not on this page.");
    return MOCK_PROPERTIES;
  }

  function findMock(id) {
    const property = catalog().find((item) => item.id === id);
    if (!property) throw new ApiError("not-found", "That stay does not exist.");
    return property;
  }

  function readReservations() {
    const saved = readJson(sessionStorage, RESERVATIONS, {});
    const bag = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    return { ...clone(SAMPLE), ...bag };
  }

  function writeReservation(trip) {
    const saved = readJson(sessionStorage, RESERVATIONS, {});
    const bag = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    bag[trip.reference] = trip;
    writeJson(sessionStorage, RESERVATIONS, bag);
  }

  function bookedOn(propertyId, roomId, key) {
    return Object.values(readReservations()).reduce((sum, trip) => {
      if (!trip || trip.cancelled) return sum;
      if (trip.propertyId !== propertyId || trip.roomId !== roomId) return sum;
      if (key < trip.checkIn || key >= trip.checkOut) return sum;
      return sum + (Number(trip.rooms) || 1);
    }, 0);
  }

  // Free rooms are the rooms for sale minus reservations that cover the night. A cancelled night is free again.
  function mockAvailability(property, checkIn, checkOut) {
    const nights = nightKeys(checkIn, checkOut);
    return property.rooms.map((room) => {
      const perNight = {};
      let left = nights.length ? Infinity : (Number(room.inventory) || 0);
      let soldOutOn = null;
      nights.forEach((key) => {
        const free = (Number(room.inventory) || 0) - bookedOn(property.id, room.id, key);
        perNight[key] = free;
        if (free <= 0 && !soldOutOn) soldOutOn = key;
        left = Math.min(left, Math.max(0, free));
      });
      if (left === Infinity) left = 0;
      return {
        roomId: room.id,
        left,
        soldOutOn,
        nights: nights.length,
        nightly: room.price,
        total: room.price * nights.length,
        perNight
      };
    });
  }

  function stayCard(property, index) {
    const address = property.address || {};
    const rooms = property.rooms || [];
    const cheapest = rooms.reduce((best, room) => (room.price < best.price ? room : best), rooms[0] || { price: 0 });
    const face = LIST_FACE[property.id] || {};
    const photo = (property.gallery && property.gallery[0] && property.gallery[0].src) || "";
    return {
      id: property.id,
      name: property.name,
      city: address.city || "",
      country: address.country || "",
      area: address.area || "",
      type: face.type || "Room",
      property: property.type || "",
      score: property.score,
      reviews: property.reviewCount,
      price: cheapest.price || 0,
      maxGuests: rooms.reduce((max, room) => Math.max(max, Number(room.sleeps) || 0), 0),
      cancel: rooms.some((room) => room.refundable),
      scarce: Boolean(face.scarce),
      amenities: face.amenities || [],
      blurb: face.blurb || property.summary || "",
      image: photo,
      order: index
    };
  }

  function withCard(property, index) {
    const copy = clone(property);
    copy.card = stayCard(copy, index);
    return copy;
  }

  function guestStay(payload) {
    return {
      propertyId: payload.propertyId,
      roomId: payload.roomId,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      rooms: Number(payload.rooms) || 1,
      adults: Number(payload.adults) || 1,
      children: Number(payload.children) || 0,
      name: payload.name,
      email: payload.email
    };
  }

  function refundAmount(trip) {
    if (!trip.refundable) return 0;
    const limit = parseKey(trip.checkIn);
    limit.setDate(limit.getDate() - 3);
    return today() <= limit ? Number(trip.total) || 0 : 0;
  }

  function readAccount() {
    const account = readJson(localStorage, ACCOUNT, null);
    if (!account || !account.email) return null;
    return { name: account.name || "", email: account.email };
  }

  function readSavedIds() {
    const ids = readJson(localStorage, SAVED, []);
    return Array.isArray(ids) ? ids : [];
  }

  function readMessages() {
    const list = readJson(localStorage, MESSAGES, []);
    return Array.isArray(list) ? list : [];
  }

  // GET /properties
  async function listProperties() {
    if (config.baseUrl) {
      const rows = await request("/properties");
      return rows.map(withCard);
    }
    await wait(config.latency * 0.5);
    if (mockMode === "error") throw new ApiError("server", "The stay list could not be loaded.");
    return catalog().map(withCard);
  }

  // GET /properties/{id}
  async function getProperty(id) {
    if (config.baseUrl) return request(`/properties/${encodeURIComponent(id)}`);
    await wait(config.latency);
    if (mockMode === "error") throw new ApiError("server", "The stay could not be loaded.");
    const property = clone(findMock(id));
    return {
      ...property,
      policies: { ...MOCK_POLICIES[property.type], ...(property.policies || {}) },
      amenityGroups: property.amenityGroups || MOCK_AMENITY_GROUPS[property.type]
    };
  }

  // GET /properties/{id}/availability?checkIn=yyyy-MM-dd&checkOut=yyyy-MM-dd
  async function getAvailability(id, checkIn, checkOut) {
    if (config.baseUrl) {
      const query = new URLSearchParams({ checkIn, checkOut });
      return request(`/properties/${encodeURIComponent(id)}/availability?${query}`);
    }
    await wait(config.latency * 0.8);
    if (mockMode === "rooms-error") throw new ApiError("server", "Availability could not be loaded.");
    return mockAvailability(findMock(id), checkIn, checkOut);
  }

  // GET /properties/{id}/reviews
  async function listReviews(propertyId) {
    if (config.baseUrl) return request(`/properties/${encodeURIComponent(propertyId)}/reviews`);
    await wait(config.latency * 0.4);
    return clone(findMock(propertyId).reviews || []);
  }

  // POST /reservations
  async function createReservation(payload) {
    const stay = guestStay(payload || {});
    if (config.baseUrl) return request("/reservations", { method: "POST", body: JSON.stringify(stay) });
    await wait(config.latency * 2);
    const property = findMock(stay.propertyId);
    const room = (property.rooms || []).find((item) => item.id === stay.roomId);
    const offer = mockAvailability(property, stay.checkIn, stay.checkOut).find((item) => item.roomId === stay.roomId);
    if (!room || !offer || offer.left < stay.rooms) throw new ApiError("unavailable", "That room was just taken for these dates.");
    const reference = `PT-${Math.floor(seeded(`${stay.email}:${stay.checkIn}:${Date.now()}`) * 900000 + 100000)}`;
    const address = property.address || {};
    const photo = (property.gallery && property.gallery[0] && property.gallery[0].src) || "";
    const total = offer.nightly * offer.nights * stay.rooms;
    writeReservation({
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
      children: stay.children,
      name: stay.name,
      email: stay.email
    });
    return { reference, status: "Pending", total, currency: "EUR" };
  }

  // GET /reservations
  async function listReservations() {
    if (config.baseUrl) return request("/reservations");
    await wait(config.latency * 0.4);
    return Object.values(readReservations()).sort((a, b) => String(a.checkIn).localeCompare(String(b.checkIn)));
  }

  // GET /reservations/{reference}
  async function getReservation(reference) {
    if (!reference) return null;
    if (config.baseUrl) {
      try {
        return await request(`/reservations/${encodeURIComponent(reference)}`);
      } catch (error) {
        if (error && error.code === "not-found") return null;
        throw error;
      }
    }
    await wait(config.latency * 0.3);
    return readReservations()[reference] || null;
  }

  // POST /reservations/{reference}/cancel
  async function cancelReservation(reference) {
    if (config.baseUrl) return request(`/reservations/${encodeURIComponent(reference)}/cancel`, { method: "POST" });
    await wait(config.latency * 0.6);
    const trip = readReservations()[reference];
    if (!trip) throw new ApiError("not-found", "That reservation does not exist.");
    const next = { ...trip, cancelled: true, refund: refundAmount(trip) };
    writeReservation(next);
    return next;
  }

  // POST /account/register
  async function register(payload) {
    const account = { name: String((payload && payload.name) || "").trim(), email: String((payload && payload.email) || "").trim() };
    if (config.baseUrl) return request("/account/register", { method: "POST", body: JSON.stringify(account) });
    await wait(config.latency * 0.5);
    writeJson(localStorage, ACCOUNT, account);
    return account;
  }

  // POST /account/signin
  async function signIn(payload) {
    const email = String((payload && payload.email) || "").trim();
    if (config.baseUrl) return request("/account/signin", { method: "POST", body: JSON.stringify({ email }) });
    await wait(config.latency * 0.5);
    const account = readAccount();
    if (account && account.email.toLowerCase() === email.toLowerCase()) return account;
    throw new ApiError("unauthorized", "That email did not match an account in this browser.");
  }

  // GET /account
  async function currentAccount() {
    if (config.baseUrl) {
      try {
        return await request("/account");
      } catch (error) {
        if (error && error.code === "not-found") return null;
        throw error;
      }
    }
    await wait(config.latency * 0.2);
    return readAccount();
  }

  // GET /account/saved
  async function listSaved() {
    if (config.baseUrl) return request("/account/saved");
    await wait(config.latency * 0.2);
    return readSavedIds();
  }

  // POST /account/saved/{id}
  async function saveStay(id) {
    if (config.baseUrl) return request(`/account/saved/${encodeURIComponent(id)}`, { method: "POST" });
    const ids = readSavedIds().filter((item) => item !== id);
    ids.push(id);
    writeJson(localStorage, SAVED, ids);
    return ids;
  }

  // DELETE /account/saved/{id}
  async function unsaveStay(id) {
    if (config.baseUrl) return request(`/account/saved/${encodeURIComponent(id)}`, { method: "DELETE" });
    const ids = readSavedIds().filter((item) => item !== id);
    writeJson(localStorage, SAVED, ids);
    return ids;
  }

  // GET /messages
  async function listMessages() {
    if (config.baseUrl) return request("/messages");
    await wait(config.latency * 0.3);
    return readMessages();
  }

  // POST /messages
  async function createMessage(payload) {
    const note = {
      name: String((payload && payload.name) || "").trim(),
      email: String((payload && payload.email) || "").trim(),
      stay: String((payload && payload.stay) || "").trim(),
      message: String((payload && payload.message) || "").trim(),
      at: new Date().toISOString()
    };
    if (config.baseUrl) return request("/messages", { method: "POST", body: JSON.stringify(note) });
    const list = readMessages();
    list.push(note);
    writeJson(localStorage, MESSAGES, list);
    return note;
  }

  return {
    config,
    ApiError,
    listProperties,
    getProperty,
    getAvailability,
    listReviews,
    createReservation,
    getReservation,
    listReservations,
    cancelReservation,
    register,
    signIn,
    currentAccount,
    listSaved,
    saveStay,
    unsaveStay,
    listMessages,
    createMessage
  };
})();
