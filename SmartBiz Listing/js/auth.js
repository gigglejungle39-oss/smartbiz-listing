document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-demo-auth]").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    const alert = form.querySelector(".alert");
    alert.className = "alert success";
    alert.textContent = "Frontend form validated. Supabase authentication will be added in the next phase.";
  }));
});
