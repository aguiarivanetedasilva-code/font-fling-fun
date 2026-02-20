import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Eye, MousePointer, CreditCard, Monitor, Smartphone, Tablet, MapPin, Globe, LogOut, Copy, Clock, Calendar } from "lucide-react";

interface Visit {
  id: string;
  session_id: string;
  ip_address: string;
  city: string;
  region: string;
  country: string;
  device_type: string;
  browser: string;
  os: string;
  page: string;
  is_online: boolean;
  last_seen_at: string;
  created_at: string;
}

interface SiteEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data: {
    valor?: string;
    placa?: string;
    device_type?: string;
    browser?: string;
    os?: string;
    ip_address?: string;
    city?: string;
    region?: string;
    country?: string;
    [key: string]: any;
  };
  page: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "visitors" | "orders" | "pix" | "events">("overview");

  useEffect(() => {
    checkAuth();
    fetchData();

    // Realtime subscription for online visitors
    const channel = supabase
      .channel("admin-visits")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visits" }, () => {
        fetchVisits();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "site_events" }, () => {
        fetchEvents();
      })
      .subscribe();

    // Refresh every 15s
    const interval = setInterval(fetchData, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) { navigate("/admin/login"); }
  };

  const fetchData = async () => {
    await Promise.all([fetchVisits(), fetchEvents()]);
    setLoading(false);
  };

  const fetchVisits = async () => {
    const { data } = await supabase.from("site_visits").select("*").order("last_seen_at", { ascending: false }).limit(500);
    if (data) setVisits(data as Visit[]);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from("site_events").select("*").order("created_at", { ascending: false }).limit(500);
    if (data) setEvents(data as SiteEvent[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // Calculate stats
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const onlineVisitors = visits.filter(v => v.is_online && new Date(v.last_seen_at) > fiveMinAgo);
  const totalVisits = visits.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayVisits = visits.filter(v => new Date(v.created_at) >= today);
  const todayEvents = events.filter(e => new Date(e.created_at) >= today);

  const pixCopied = events.filter(e => e.event_type === "pix_copied").length;
  const pixCopiedToday = todayEvents.filter(e => e.event_type === "pix_copied").length;
  const ordersCreated = events.filter(e => e.event_type === "order_created").length;
  const ordersToday = todayEvents.filter(e => e.event_type === "order_created").length;

  const orderEvents = events.filter(e => e.event_type === "order_created");
  const pixEvents = events.filter(e => e.event_type === "pix_copied");

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("pt-BR"),
      time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
  };

  // Device breakdown
  const deviceCount = (type: string) => visits.filter(v => v.device_type === type).length;
  const devicePercent = (type: string) => totalVisits ? Math.round((deviceCount(type) / totalVisits) * 100) : 0;

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === "mobile") return <Smartphone className="w-4 h-4" />;
    if (type === "tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s atrás`;
    if (s < 3600) return `${Math.floor(s / 60)}m atrás`;
    if (s < 86400) return `${Math.floor(s / 3600)}h atrás`;
    return `${Math.floor(s / 86400)}d atrás`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Carregando painel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
              <span className="text-gray-900 font-black text-lg">P</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">{onlineVisitors.length} online</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
          {([
            { key: "overview", label: "Visão Geral" },
            { key: "visitors", label: "Visitantes" },
            { key: "orders", label: "Pedidos" },
            { key: "pix", label: "Pix Copiado" },
            { key: "events", label: "Eventos" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <StatCard icon={<Users className="w-5 h-5" />} label="Online Agora" value={onlineVisitors.length} color="green" />
              <StatCard icon={<Eye className="w-5 h-5" />} label="Total Visitas" value={totalVisits} sub={`${todayVisits.length} hoje`} color="blue" />
              <StatCard icon={<CreditCard className="w-5 h-5" />} label="Pedidos Feitos" value={ordersCreated} sub={`${ordersToday} hoje`} color="purple" />
              <StatCard icon={<Copy className="w-5 h-5" />} label="Pix Copiado" value={pixCopied} sub={`${pixCopiedToday} hoje`} color="lime" />
            </div>

            {/* Device breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4">Dispositivos</h3>
                <div className="space-y-3">
                  {["mobile", "desktop", "tablet"].map((type) => (
                    <div key={type} className="flex items-center gap-3">
                      <DeviceIcon type={type} />
                      <span className="text-gray-400 text-sm capitalize w-16">{type}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-lime-400 rounded-full transition-all" style={{ width: `${devicePercent(type)}%` }} />
                      </div>
                      <span className="text-white text-sm font-semibold w-16 text-right">{deviceCount(type)} ({devicePercent(type)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Online now list */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Online Agora ({onlineVisitors.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {onlineVisitors.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum visitante online</p>
                  ) : (
                    onlineVisitors.slice(0, 10).map((v) => (
                      <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <DeviceIcon type={v.device_type} />
                          <div>
                            <p className="text-white text-xs font-semibold">{v.ip_address || "—"}</p>
                            <p className="text-gray-500 text-xs">{v.city ? `${v.city}, ${v.region}` : "Local desconhecido"}</p>
                          </div>
                        </div>
                        <span className="text-gray-500 text-xs">{v.page}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent events */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-bold text-sm mb-4">Eventos Recentes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum evento registrado</p>
                ) : (
                  events.slice(0, 20).map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <EventBadge type={e.event_type} />
                        <div>
                          <p className="text-white text-xs font-semibold">{eventLabel(e.event_type)}</p>
                          <p className="text-gray-500 text-xs">{e.page}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">{timeAgo(e.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "visitors" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Status</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">IP</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Localização</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Dispositivo</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Navegador</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Página</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Última atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.slice(0, 100).map((v) => {
                    const isOn = v.is_online && new Date(v.last_seen_at) > fiveMinAgo;
                    return (
                      <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${isOn ? "bg-green-400" : "bg-gray-600"}`} />
                        </td>
                        <td className="px-4 py-3 text-white text-xs font-mono">{v.ip_address || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-300 text-xs">{v.city ? `${v.city}, ${v.region}` : "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <DeviceIcon type={v.device_type} />
                            <span className="text-gray-300 text-xs capitalize">{v.device_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{v.browser} / {v.os}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{v.page}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{timeAgo(v.last_seen_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h2 className="text-white font-bold text-lg">Pedidos Feitos ({orderEvents.length})</h2>
              <span className="text-gray-500 text-sm">({ordersToday} hoje)</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Data</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Hora</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Placa</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Valor</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">IP</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Localização</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Dispositivo</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Navegador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderEvents.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum pedido registrado</td></tr>
                    ) : (
                      orderEvents.map((e) => {
                        const dt = formatDateTime(e.created_at);
                        const d = e.event_data;
                        return (
                          <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-white text-xs">{dt.date}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-white text-xs">{dt.time}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-lime-400 text-xs font-bold">{d.placa || "—"}</td>
                            <td className="px-4 py-3 text-white text-xs font-semibold">R$ {d.valor || "—"}</td>
                            <td className="px-4 py-3 text-gray-300 text-xs font-mono">{d.ip_address || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-300 text-xs">{d.city ? `${d.city}, ${d.region}` : "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <DeviceIcon type={d.device_type || "desktop"} />
                                <span className="text-gray-300 text-xs capitalize">{d.device_type || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-300 text-xs">{d.browser || "—"} / {d.os || "—"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pix" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Copy className="w-5 h-5 text-lime-400" />
              <h2 className="text-white font-bold text-lg">Pix Copiado ({pixEvents.length})</h2>
              <span className="text-gray-500 text-sm">({pixCopiedToday} hoje)</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Data</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Hora</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Placa</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Valor</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">IP</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Localização</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Dispositivo</th>
                      <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Navegador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pixEvents.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum Pix copiado registrado</td></tr>
                    ) : (
                      pixEvents.map((e) => {
                        const dt = formatDateTime(e.created_at);
                        const d = e.event_data;
                        return (
                          <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-white text-xs">{dt.date}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-white text-xs">{dt.time}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-lime-400 text-xs font-bold">{d.placa || "—"}</td>
                            <td className="px-4 py-3 text-white text-xs font-semibold">R$ {d.valor || "—"}</td>
                            <td className="px-4 py-3 text-gray-300 text-xs font-mono">{d.ip_address || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-300 text-xs">{d.city ? `${d.city}, ${d.region}` : "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <DeviceIcon type={d.device_type || "desktop"} />
                                <span className="text-gray-300 text-xs capitalize">{d.device_type || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-300 text-xs">{d.browser || "—"} / {d.os || "—"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Evento</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Dados</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Página</th>
                    <th className="text-left text-gray-400 font-semibold px-4 py-3 text-xs">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 100).map((e) => (
                    <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <EventBadge type={e.event_type} />
                          <span className="text-white text-xs font-semibold">{eventLabel(e.event_type)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono max-w-xs truncate">
                        {JSON.stringify(e.event_data)}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{e.page}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{timeAgo(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number; sub?: string; color: string }) => {
  const colors: Record<string, string> = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    lime: "bg-lime-400/10 text-lime-400 border-lime-400/20",
  };

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-semibold opacity-80">{label}</span></div>
      <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
};

const EventBadge = ({ type }: { type: string }) => {
  if (type === "pix_copied") return <div className="w-6 h-6 rounded bg-lime-400/20 flex items-center justify-center"><Copy className="w-3 h-3 text-lime-400" /></div>;
  if (type === "order_created") return <div className="w-6 h-6 rounded bg-purple-400/20 flex items-center justify-center"><CreditCard className="w-3 h-3 text-purple-400" /></div>;
  return <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center"><Globe className="w-3 h-3 text-gray-400" /></div>;
};

const eventLabel = (type: string) => {
  const map: Record<string, string> = {
    pix_copied: "Pix Copiado",
    order_created: "Pedido Criado",
    page_view: "Visualização",
  };
  return map[type] || type;
};

export default Admin;
