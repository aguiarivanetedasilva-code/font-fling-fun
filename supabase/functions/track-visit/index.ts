import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { session_id, page, device_type, browser, os, user_agent, referrer, event_type, event_data } = body;

    // Get IP from request headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Get geolocation from IP using free API
    let geo = { city: null, region: null, country: null, lat: null, lon: null };
    if (ip && ip !== "unknown" && ip !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,lat,lon`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          geo = {
            city: geoData.city || null,
            region: geoData.regionName || null,
            country: geoData.country || null,
            lat: geoData.lat || null,
            lon: geoData.lon || null,
          };
        }
      } catch (e) {
        console.error("Geo lookup failed:", e);
      }
    }

    if (event_type) {
      // Track event - enrich with IP and geo
      const enrichedData = {
        ...(event_data || {}),
        ip_address: ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
      };
      const { error } = await supabase.from("site_events").insert({
        session_id,
        event_type,
        event_data: enrichedData,
        page,
      });
      if (error) throw error;
    } else {
      // Track visit - upsert by session_id + page
      const { data: existing } = await supabase
        .from("site_visits")
        .select("id")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        // Update last_seen
        const { error } = await supabase
          .from("site_visits")
          .update({
            is_online: true,
            last_seen_at: new Date().toISOString(),
            page,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // New visit
        const { error } = await supabase.from("site_visits").insert({
          session_id,
          ip_address: ip,
          city: geo.city,
          region: geo.region,
          country: geo.country,
          latitude: geo.lat,
          longitude: geo.lon,
          device_type,
          browser,
          os,
          user_agent,
          page,
          referrer,
          is_online: true,
          last_seen_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Track error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
