import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { thb, type Product } from "@/lib/shop";
import fallback from "@/assets/cat-1.jpg";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "รายละเอียดสินค้า — MiniCloud AFK" },
      { name: "description", content: "ดูรายละเอียดไอเทม Roblox ราคา สต็อกคงเหลือ และสั่งซื้อรับของอัตโนมัติทันทีที่ MiniCloud AFK" },
      { property: "og:title", content: "รายละเอียดสินค้า — MiniCloud AFK" },
      { property: "og:description", content: "ไอเทม Roblox ส่งอัตโนมัติ ปลอดภัย 24 ชม." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const product = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const stock = useQuery({
    queryKey: ["stock", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("product_stock", { _product_id: id });
      if (error) throw error;
      return Number(data ?? 0);
    },
  });

  const buy = async () => {
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("purchase_product", { _product_id: id, _quantity: qty });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void queryClient.invalidateQueries();
    toast.success("สั่งซื้อสำเร็จ! ดูไอเทมได้ที่หน้าคำสั่งซื้อ");
    void data;
    void navigate({ to: "/orders" });
  };

  const p = product.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        {product.isLoading && <p className="text-sm text-muted-foreground">กำลังโหลด...</p>}
        {!product.isLoading && !p && (
          <p className="text-sm text-muted-foreground">ไม่พบสินค้านี้ — <Link to="/store" className="text-primary">กลับไปหน้าร้านค้า</Link></p>
        )}
        {p && (
          <div className="grid animate-fade-up gap-10 md:grid-cols-2">
            <img
              src={p.image_url || fallback}
              alt={p.name}
              width={768}
              height={512}
              className="aspect-[3/2] w-full rounded-3xl border border-border object-cover shadow-[var(--shadow-glow)]"
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
              <p className="mt-3 text-3xl text-primary">{thb(Number(p.price))}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                คงเหลือ {stock.data ?? 0} ชิ้น · ขายแล้ว {p.sold_count} ชิ้น
              </p>
              <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button className="px-4 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button className="px-4 py-2" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <Button
                  variant="glow"
                  className="flex-1 rounded-full"
                  disabled={busy || (stock.data ?? 0) < qty}
                  onClick={buy}
                >
                  {(stock.data ?? 0) < qty ? "สินค้าหมด" : "ซื้อเลย"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
