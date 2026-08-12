const SUPABASE_URL = "https://dfimmzclanjknfmaquxm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ccPpk1GzHYtL1C-jR4eqdQ_ufFPUc8R";

const hasSupabaseConfig = !SUPABASE_URL.includes("PASTE_") && !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

if (!window.supabaseClient && hasSupabaseConfig && window.supabase) {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
}

window.testSupabaseConnection = async function () {
    if (!hasSupabaseConfig) {
        console.info("Supabase is not configured yet. Add your Project URL and Publishable key in js/supabase.js.");
        return false;
    }

    try {
        const { error } = await window.supabaseClient
            .from("businesses")
            .select("id")
            .limit(1);

        if (error) throw error;
        console.log("Supabase connected successfully");
        return true;
    } catch (error) {
        console.error("Supabase connection failed:", error?.message || error);
        return false;
    }
};

if (hasSupabaseConfig) window.testSupabaseConnection();
