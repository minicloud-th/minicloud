import { createFileRoute } from "@tanstack/react-router";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import cat1 from "@/assets/cat-1.jpg";
import cat2 from "@/assets/cat-2.jpg";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "ร้านค้า — MiniCloud AFK" },
      { name: "description", content: "เลือกซื้อไอเทม Roblox ทั้งหมดของ MiniCloud AFK ระบบส่งสินค้าอัตโนมัติ ปลอดภัย 24 ชม." },
      { property: "og:title", content: "ร้านค้า — MiniCloud AFK" },
      { property: "og:description", content: "เลือกซื้อไอเทม Roblox ทั้งหมดของ MiniCloud AFK ระบบส่งสินค้าอัตโนมัติ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Store,
});

const products = [
  { name: "ไอเทมดาบฟ้า", price: "99", image: cat1, stock: 1 },
  { name: "สัตว์เลี้ยงเมฆ", price: "149", image: cat2, stock: 1 },
];

function Store() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28">
        <h1 className="text-4xl font-semibold tracking-tight">ร้านค้า</h1>
        <p className="mt-2 text-sm text-muted-foreground">ไอเทม Roblox ทั้งหมดพร้อมส่งอัตโนมัติ</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <article
              key={p.name}
              className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
              style={{ "--fade-delay": `${i * 120}ms` } as React.CSSProperties}
            >
              <img
                src={p.image}
                alt={p.name}
                width={768}
                height={512}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="space-y-3 p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-medium">{p.name}</h2>
                  <span className="text-primary">฿{p.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">คงเหลือ {p.stock} ชิ้น</p>
                <Button variant="glow" className="w-full rounded-full">
                  สั่งซื้อ
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
