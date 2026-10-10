"use strict";

const PorticoApi = (() => {
  // Set baseUrl (for example "https://localhost:7001/api") once the ASP.NET Core Web API is running.
  const config = { baseUrl: "", latency: 450 };
  const mockMode = new URLSearchParams(window.location.search).get("mock") || "";

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
    if (response.status === 404) throw new ApiError("not-found", "That stay does not exist.");
    if (!response.ok) throw new ApiError("server", `The server answered ${response.status}.`);
    return response.json();
  }

  function dateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function parseKey(key) {
    const [year, month, day] = key.split("-").map(Number);
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

  function seeded(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  function freeOnNight(room, key) {
    const weekday = parseKey(key).getDay();
    const demand = weekday === 5 || weekday === 6 ? room.demand * 2 : room.demand;
    if (seeded(`${room.id}:${key}`) < demand) return 0;
    return 1 + Math.floor(seeded(`${key}:${room.id}`) * room.inventory);
  }

  function mockAvailability(property, checkIn, checkOut) {
    const nights = nightKeys(checkIn, checkOut);
    return property.rooms.map((room) => {
      let left = room.inventory;
      let soldOutOn = null;
      nights.forEach((key) => {
        const free = Math.min(room.inventory, freeOnNight(room, key));
        if (free === 0 && !soldOutOn) soldOutOn = key;
        left = Math.min(left, free);
      });
      return { roomId: room.id, left, soldOutOn, nights: nights.length, nightly: room.price, total: room.price * nights.length };
    });
  }

  function findMock(id) {
    const property = MOCK_PROPERTIES.find((item) => item.id === id);
    if (!property) throw new ApiError("not-found", "That stay does not exist.");
    return property;
  }

  // GET /api/properties/{id}
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

  // GET /api/properties/{id}/availability?checkIn=yyyy-MM-dd&checkOut=yyyy-MM-dd
  async function getAvailability(id, checkIn, checkOut) {
    if (config.baseUrl) {
      const query = new URLSearchParams({ checkIn, checkOut });
      return request(`/properties/${encodeURIComponent(id)}/availability?${query}`);
    }
    await wait(config.latency * 0.8);
    if (mockMode === "rooms-error") throw new ApiError("server", "Availability could not be loaded.");
    return mockAvailability(findMock(id), checkIn, checkOut);
  }

  // POST /api/reservations
  async function createReservation(payload) {
    if (config.baseUrl) return request("/reservations", { method: "POST", body: JSON.stringify(payload) });
    await wait(config.latency * 2);
    const property = findMock(payload.propertyId);
    const offer = mockAvailability(property, payload.checkIn, payload.checkOut).find((item) => item.roomId === payload.roomId);
    if (!offer || offer.left < payload.rooms) throw new ApiError("unavailable", "That room was just taken for these dates.");
    const reference = `PT-${Math.floor(seeded(`${payload.email}:${payload.checkIn}:${Date.now()}`) * 900000 + 100000)}`;
    return { reference, status: "Pending", total: offer.nightly * offer.nights * payload.rooms, currency: "EUR" };
  }

  return { config, ApiError, getProperty, getAvailability, createReservation };
})();
