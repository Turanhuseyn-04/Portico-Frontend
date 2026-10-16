"use strict";

const root = document.getElementById("account");
const form = document.getElementById("accountForm");
const mode = root.dataset.mode || "signin";
const header = document.getElementById("header");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

function closeMenu() {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  header.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
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
  if (event.target.closest(".nav a")) closeMenu();
});

document.querySelectorAll(".password-toggle").forEach((toggle) => {
  const input = toggle.closest(".password-field").querySelector("input");
  toggle.addEventListener("click", () => {
    const shown = input.type === "password";
    input.type = shown ? "text" : "password";
    toggle.classList.toggle("is-shown", shown);
    toggle.setAttribute("aria-pressed", String(shown));
    toggle.setAttribute("aria-label", shown ? "Hide password" : "Show password");
  });
});

if (mode === "signin") {
  const params = new URLSearchParams(window.location.search);
  const failed = root.dataset.failed === "true" || params.get("failed") === "1";
  const email = form.elements.email.value || root.dataset.email || params.get("email") || "";
  if (email) form.elements.email.value = email;
  if (failed) {
    document.getElementById("accountError").hidden = false;
    document.getElementById("accountTitle").textContent = "Sign in failed";
    document.title = "Sign in failed — Portico";
    (email ? form.elements.password : form.elements.email).focus();
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // A known email opens the account. The password is not sent or stored.
    const email = form.elements.email.value.trim();
    try {
      await PorticoApi.signIn({ email });
      window.location.href = root.dataset.accountUrl;
    } catch {
      const next = new URL(root.dataset.failedUrl, window.location.href);
      next.searchParams.set("email", email);
      window.location.href = next.href;
    }
  });
} else {
  const confirmError = document.getElementById("confirmError");
  const confirm = form.elements.confirm;
  confirm.addEventListener("input", () => {
    confirm.removeAttribute("aria-invalid");
    if (confirmError) confirmError.hidden = true;
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.elements.password.value !== confirm.value) {
      confirm.setAttribute("aria-invalid", "true");
      if (confirmError) confirmError.hidden = false;
      confirm.focus();
      return;
    }
    await PorticoApi.register({
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim()
    });
    window.location.href = root.dataset.accountUrl;
  });
}
