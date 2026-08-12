const PROFILE_SITE_URL = "https://smartbiz-listing.vercel.app";

function profileEscape(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function setProfileSeo(business) {
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const title = `${business.business_name} in ${location || "Nigeria"} | SMARTBIZ LISTING`;
  const description = (business.description || `${business.business_name}, ${business.category} in ${location}.`).slice(0, 155);
  const url = `${PROFILE_SITE_URL}/business-profile.html?business=${encodeURIComponent(business.slug)}`;
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('link[rel="canonical"]').href = url;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description,
    url,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    image: business.logo_url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address || undefined,
      addressLocality: business.city || undefined,
      addressRegion: business.state || undefined,
      addressCountry: "NG"
    }
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", async () => {
  const key = new URLSearchParams(location.search).get("business");
  const content = document.querySelector("[data-profile-content]");
  if (!key || !window.supabaseClient) {
    content.innerHTML = '<div class="card empty-state"><h2>Listing not found</h2><p>Return to the homepage and try again.</p></div>';
    return;
  }

  const { data: business, error } = await window.supabaseClient
    .from("businesses")
    .select("business_name,slug,category,description,phone,whatsapp,email,address,city,state,website,logo_url,opening_hours")
    .eq("slug", key)
    .eq("payment_status", "paid")
    .eq("approval_status", "approved")
    .maybeSingle();

  if (error || !business) {
    document.querySelector("[data-profile-badge]").textContent = "Unavailable";
    document.querySelector("[data-profile-name]").textContent = "Listing not found";
    document.querySelector("[data-profile-meta]").textContent = "This listing is not published.";
    content.innerHTML = '<div class="card empty-state"><p>The business may still be awaiting payment or approval.</p><a class="btn btn-primary mt-2" href="index.html">Return home</a></div>';
    return;
  }

  setProfileSeo(business);
  const place = [business.city, business.state].filter(Boolean).join(", ") || "Nigeria";
  document.querySelector("[data-profile-badge]").textContent = "Verified listing";
  document.querySelector("[data-profile-name]").textContent = business.business_name;
  document.querySelector("[data-profile-meta]").textContent = `${business.category} • ${place}`;
  const logo = business.logo_url
    ? `<img src="${profileEscape(business.logo_url)}" alt="${profileEscape(business.business_name)} logo">`
    : "&#10022;";
  const contact = [business.phone, business.whatsapp && `WhatsApp: ${business.whatsapp}`, business.email, business.address, place]
    .filter(Boolean).map(profileEscape).join("<br>");
  const website = business.website
    ? `<a class="btn btn-outline" href="${profileEscape(business.website)}" target="_blank" rel="noopener">Visit website</a>` : "";
  content.innerHTML = `<div class="card profile-head"><div class="profile-logo">${logo}</div><div><h2>${profileEscape(business.business_name)}</h2><p class="mt-2">${profileEscape(business.description)}</p></div>${business.phone ? `<a class="btn btn-green" href="tel:${profileEscape(business.phone)}">Call business</a>` : ""}</div><div class="grid grid-3 mt-3"><div class="card"><h3>About</h3><p>${profileEscape(business.category)}</p></div><div class="card"><h3>Contact</h3><p>${contact}</p></div><div class="card"><h3>Business hours</h3><p>${profileEscape(business.opening_hours || "Contact the business for opening hours.")}</p></div></div><div class="hero-actions">${website}</div>`;
});
