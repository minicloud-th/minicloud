import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, Clock } from "lucide-react";

import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "ติดต่อเรา — MiniCloud AFK" },
      { name: "description", content: "ติดต่อทีมงาน MiniCloud AFK ผ่านแชทหรืออีเมล แอดมินพร้อมดูแลตลอด 24 ชั่วโมง" },
      { property: "og:title", content: "ติดต่อเรา — MiniCloud AFK" },
      { property: "og:description", content: "แอดมิน MiniCloud AFK พร้อมดูแลคุณตลอด 24 ชั่วโมง" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const channels = [
  { icon: MessageCircle, title: "แชทกับแอดมิน", detail: "ตอบกลับภายในไม่กี่นาที" },
  { icon: Mail, title: "อีเมล", detail: "support@minicloud.afk" },
  { icon: Clock, title: "เวลาทำการ", detail: "ทุกวัน ตลอด 24 ชั่วโมง" },
];

function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <h1 className="text-4xl font-semibold tracking-tight">ติดต่อเรา</h1>
        <p className="mt-2 text-sm text-muted-foreground">แอดมินพร้อมบริการ 24 ชม.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {channels.map((c, i) => (
            <div
              key={c.title}
              className="animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
              style={{ "--fade-delay": `${i * 100}ms` } as React.CSSProperties}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <p className="mt-4 font-medium">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
