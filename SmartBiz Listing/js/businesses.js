const demoBusinesses = [
  { id: "demo-1", business_name: "Lagos Creative Studio", category: "Creative Services", city: "Lagos", description: "Brand strategy, design and digital content for growing businesses." },
  { id: "demo-2", business_name: "GreenBasket Foods", category: "Food & Catering", city: "Abuja", description: "Fresh local produce and dependable catering for every occasion." },
  { id: "demo-3", business_name: "PrimeFix Technologies", category: "Technology", city: "Port Harcourt", description: "IT support, device repairs and practical technology solutions." }
];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function businessCard(item) {
  const name = item.business_name || "Unnamed business";
  const location = [item.city, item.state].filter(Boolean).join(", ") || "Nigeria";
  const profileKey = item.slug || item.id;
  const logo = item.logo_url
    ? `<img src="${escapeHtml(item.logo_url)}" alt="${escapeHtml(name)} logo">`
    : "&#10022;";

  return `<article class="card listing-card">
    <div class="listing-image">${logo}</div>
    <div class="listing-body">
      <span class="badge">${item.approval_status === "approved" ? "Verified listing" : "Business listing"}</span>
      <h3>${escapeHtml(name)}</h3>
      <div class="meta"><span>${escapeHtml(item.category || "Business")}</span><span>&bull;</span><span>${escapeHtml(location)}</span></div>
      <p>${escapeHtml(item.description || "Contact this business for more information.")}</p>
      <a class="btn btn-outline mt-2" href="business-profile.html?business=${encodeURIComponent(profileKey)}">View profile</a>
    </div>
  </article>`;
}

function filterBusinesses(items) {
  const params = new URLSearchParams(location.search);
  const term = (params.get("q") || "").trim().toLowerCase();
  const category = (params.get("category") || "").trim().toLowerCase();

  return items.filter(item => {
    const searchable = [item.business_name, item.description, item.city, item.state, item.category]
      .filter(Boolean).join(" ").toLowerCase();
    return (!term || searchable.includes(term)) &&
      (!category || (item.category || "").toLowerCase().includes(category));
  });
}

async function loadBusinesses() {
  const list = document.querySelector("[data-business-list]");
  if (!list) return;

  list.innerHTML = `<div class="card empty-state">Loading businesses...</div>`;
  let businesses = demoBusinesses;

  if (window.supabaseClient) {
    const { data, error } = await window.supabaseClient
      .from("businesses")
      .select("id,business_name,slug,category,description,city,state,logo_url,approval_status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load businesses from Supabase:", error.message);
    } else {
      businesses = data || [];
    }
  }

  const filtered = filterBusinesses(businesses);
  const displayed = location.pathname.endsWith("index.html") || location.pathname.endsWith("/")
    ? filtered.slice(0, 3)
    : filtered;

  list.innerHTML = displayed.length
    ? displayed.map(businessCard).join("")
    : `<div class="card empty-state">No businesses match your search yet. Try a different keyword.</div>`;

  const count = document.querySelector("[data-result-count]");
  if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? "business" : "businesses"} found`;
}

document.addEventListener("DOMContentLoaded", loadBusinesses);
