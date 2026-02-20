import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  let id = sessionStorage.getItem("_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("_sid", id);
  }
  return id;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device_type = "desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "tablet";

  let browser = "unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "Mac";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { device_type, browser, os, user_agent: ua };
}

export function usePageTracking(page: string) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const session_id = getSessionId();
    const deviceInfo = getDeviceInfo();

    supabase.functions.invoke("track-visit", {
      body: {
        session_id,
        page,
        ...deviceInfo,
        referrer: document.referrer || null,
      },
    }).catch(console.error);

    // Heartbeat every 30s
    const interval = setInterval(() => {
      supabase.functions.invoke("track-visit", {
        body: { session_id, page, ...deviceInfo },
      }).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [page]);
}

export function trackEvent(eventType: string, eventData: Record<string, any> = {}) {
  const session_id = getSessionId();
  const deviceInfo = getDeviceInfo();
  supabase.functions.invoke("track-visit", {
    body: {
      session_id,
      event_type: eventType,
      event_data: { ...eventData, ...deviceInfo },
      page: window.location.pathname,
    },
  }).catch(console.error);
}
