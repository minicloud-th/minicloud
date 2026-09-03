import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { thb } from "@/lib/shop";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "คำสั่งซื้อของฉัน — MiniCloud AFK" },
      { name: "description", content: "ดูประวัติคำสั่งซื้อไอเทม Roblox และรับข้อมูลสินค้าที่ส่งอัตโนมัติจาก MiniCloud AFK" },
      { property: "og:title", content: "คำสั่งซื้อของฉัน — MiniCloud AFK" },
      { property: "og:description", content: "ประวัติคำสั่งซื้อและข้อมูลไอเทมที่ได้รับ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const orders = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, product_name, quantity, total, status, delivered_content, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight">คำสั่งซื้อของฉัน</h1>

        <div className="mt-8 space-y-4">
          {(orders.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีคำสั่งซื้อ</p>
          )}
          {(orders.data ?? []).map((o) => (
            <article key={o.id} className="animate-fade-up rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">{o.product_name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("th-TH")} · จำนวน {o.quantity}
                  </p>
                </div>
                <span className="text-primary">{thb(Number(o.total))}</span>
              </div>
              {o.delivered_content && (
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-secondary p-4 text-xs">
                  {o.delivered_content}
                </pre>
              )}
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
