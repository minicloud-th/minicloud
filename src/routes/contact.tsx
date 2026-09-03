import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, Clock } from "lucide-react";

import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "ติดต่อเรา — SYNCX STUIDO" },
      { name: "description", content: "ติดต่อทีมงาน SYNCX STUIDO ผ่านแชทหรืออีเมล แอดมินพร้อมดูแลตลอด 24 ชั่วโมง" },
      { property: "og:title", content: "ติดต่อเรา — SYNCX STUIDO" },
      { property: "og:description", content: "แอดมิน SYNCX STUIDO พร้อมดูแลคุณตลอด 24 ชั่วโมง" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const channels = [
  { icon: MessageCircle, title: "แชทกับแอดมิน", detail: "ตอบกลับภายในไม่กี่นาที" },
  { icon: Mail, title: "อีเมล", detail: "support@syncx.studio" },
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
          {channels.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card/60 p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
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
