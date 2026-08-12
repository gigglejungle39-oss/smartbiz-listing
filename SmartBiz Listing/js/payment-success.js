document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const reference = params.get("reference");
  const businessId = params.get("business");
  const icon = document.querySelector("[data-payment-icon]");
  const label = document.querySelector("[data-payment-label]");
  const title = document.querySelector("[data-payment-title]");
  const copy = document.querySelector("[data-payment-copy]");

  if (!reference || !businessId || !window.supabaseClient) {
    icon.textContent = "!"; label.textContent = "Verification unavailable";
    title.textContent = "We could not verify this payment";
    copy.textContent = "Keep your payment reference and contact support before trying again.";
    return;
  }

  const { data, error } = await window.supabaseClient.functions.invoke("verify-paystack", {
    body: { reference, businessId }
  });

  if (error || !data?.verified) {
    icon.textContent = "!"; label.textContent = "Payment not verified";
    title.textContent = "Your listing is still pending";
    copy.textContent = data?.message || "We could not confirm this payment yet. Keep your Paystack reference and contact support.";
    return;
  }

  icon.textContent = "✓"; label.textContent = "Payment successful";
  title.textContent = "Your listing is on its way";
  copy.textContent = "Your ₦15,000 payment has been verified. Your business will appear after review.";
  sessionStorage.removeItem("pendingBusinessId");
  sessionStorage.removeItem("paystackReference");
});
