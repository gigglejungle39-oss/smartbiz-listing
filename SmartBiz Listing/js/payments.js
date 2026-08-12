const PAYSTACK_PUBLIC_KEY = "pk_test_8b2f0a30aaf21181849900138fc10401a9c2b8a8";
const LISTING_PRICE_KOBO = 1500000;

function getPendingBusinessId() {
  return new URLSearchParams(location.search).get("business") || sessionStorage.getItem("pendingBusinessId");
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("[data-payment-form]");
  if (!form) return;

  const message = form.querySelector("[data-payment-message]");
  const button = form.querySelector('button[type="submit"]');
  const emailInput = form.querySelector('[name="email"]');
  const businessId = getPendingBusinessId();

  function showMessage(text) {
    message.hidden = false;
    message.className = "alert error";
    message.textContent = text;
  }

  if (!businessId) showMessage("No pending business was found. Please submit the listing form first.");

  if (businessId && window.supabaseClient) {
    const { data } = await window.supabaseClient.from("businesses").select("email").eq("id", businessId).maybeSingle();
    if (data?.email) emailInput.value = data.email;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!businessId) return showMessage("Please submit the listing form before making payment.");
    if (PAYSTACK_PUBLIC_KEY.includes("PASTE_YOUR")) return showMessage("Add your Paystack test public key in js/payments.js first.");
    if (!window.PaystackPop) return showMessage("Paystack Checkout could not load. Check your internet connection.");

    button.disabled = true;
    const reference = `smartbiz-${businessId}-${Date.now()}`;
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: emailInput.value.trim(),
      amount: LISTING_PRICE_KOBO,
      currency: "NGN",
      ref: reference,
      metadata: { business_id: businessId },
      callback(response) {
        sessionStorage.setItem("paystackReference", response.reference);
        location.href = `payment-success.html?reference=${encodeURIComponent(response.reference)}&business=${encodeURIComponent(businessId)}`;
      },
      onClose() {
        button.disabled = false;
        showMessage("Payment was not completed. You can try again when ready.");
      }
    });
    handler.openIframe();
  });
});
