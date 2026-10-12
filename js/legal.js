const header = document.getElementById("header");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
let authMode = "signin";

function closeMenu() {
  nav.classList.remove("is-open");
  header.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

function openAuth(mode) {
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
  authModal.hidden = true;
  document.body.classList.remove("no-scroll");
}

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  header.classList.toggle("menu-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !authModal.hidden) closeAuth();
});
