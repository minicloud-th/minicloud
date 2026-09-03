import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Users, ShoppingBag, Package, CheckCircle2, ArrowRight, Megaphone } from "lucide-react";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import cat1 from "@/assets/cat-1.jpg";
import cat2 from "@/assets/cat-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SYNCX STUIDO — ร้านค้าออนไลน์ บริการ 24 ชม." },
      {
        name: "description",
        content:
          "SYNCX STUIDO ร้านค้าออนไลน์อัตโนมัติ สินค้าหลากหลายหมวดหมู่ ส่งไว ปลอดภัย แอดมินพร้อมบริการตลอด 24 ชั่วโมง",
      },
      { property: "og:title", content: "SYNCX STUIDO — ร้านค้าออนไลน์ บริการ 24 ชม." },
      {
        property: "og:description",
        content: "เลือกซื้อสินค้าตามหมวดหมู่ ระบบอัตโนมัติ พร้อมแอดมินดูแลตลอด 24 ชม.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const stats = [
  { icon: Users, label: "ผู้ใช้งาน", value: "173", unit: "คน" },
  { icon: ShoppingBag, label: "สินค้า", value: "100", unit: "รายการ" },
  { icon: Package, label: "คลังสินค้า", value: "99", unit: "ชิ้น" },
  { icon: CheckCircle2, label: "ขายแล้ว", value: "98", unit: "ชิ้น" },
];

const categories = [
  { name: "Example 1", count: 1, image: cat1 },
  { name: "Example 2", count: 1, image: cat2 },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden">
          <img
            src={heroBg}
            alt=""
            width={1920}
            height={1088}
            className="absolute inset-0 size-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />

          <div className="relative mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 pt-24 text-center">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl">
              SYNCX STUIDO
            </h1>
            <p className="mt-6 text-sm text-muted-foreground sm:text-base">
              แอดมินพร้อมบริการ 24 ชม.
            </p>

            <form
              className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-xl"
              onSubmit={(e) => e.preventDefault()}
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                placeholder="ค้นหาสินค้าหรือหมวดหมู่"
                aria-label="ค้นหาสินค้า"
                className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" variant="secondary" className="rounded-full">
                ค้นหา
              </Button>
            </form>

            <Button asChild size="xl" variant="glow" className="mt-8">
              <Link to="/store">
                เลือกซื้อสินค้า <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-semibold">
                    {s.value}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">{s.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary">ประกาศ</p>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Megaphone className="size-5" />
            </span>
            <p className="text-sm">ทดสอบ</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <h2 className="text-3xl font-semibold tracking-tight">เลือกหมวดหมู่สินค้า</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            เรียกดูสินค้าตามหมวดหมู่ที่คุณสนใจ
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.name}
                to="/store"
                className="group overflow-hidden rounded-2xl border border-border bg-card/60 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  width={768}
                  height={512}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.count} รายการ</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
