document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => nav?.classList.remove("open")));
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  document.querySelectorAll("[data-search-form]").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    const query = new URLSearchParams(new FormData(form)).toString();
    window.location.href = `search-businesses.html?${query}`;
  }));
});
