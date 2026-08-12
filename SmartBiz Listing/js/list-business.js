function createSlug(value) {
  const base = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "business";
  return `${base}-${Date.now().toString(36)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-business-form]");
  if (!form) return;
  const message = form.querySelector("[data-form-message]");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!window.supabaseClient) {
      message.hidden = false;
      message.className = "alert error";
      message.textContent = "Supabase is unavailable. Check your configuration.";
      return;
    }

    const values = Object.fromEntries(new FormData(form).entries());
    const business = {
      business_name: values.business_name.trim(),
      slug: createSlug(values.business_name),
      category: values.category,
      description: values.description.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      website: values.website.trim() || null,
      payment_status: "pending",
      approval_status: "pending"
    };

    button.disabled = true;
    button.textContent = "Saving...";
    message.hidden = true;
    const { data, error } = await window.supabaseClient.from("businesses").insert(business).select("id").single();

    if (error) {
      console.error("Business submission failed:", error);
      message.hidden = false;
      message.className = "alert error";
      message.textContent = `Could not save the business: ${error.message}`;
      button.disabled = false;
      button.textContent = "Save and continue to payment";
      return;
    }

    sessionStorage.setItem("pendingBusinessId", data.id);
    window.location.href = `payment.html?business=${encodeURIComponent(data.id)}`;
  });
});
