import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { thb } from "@/lib/shop";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "โปรไฟล์ของฉัน — MiniCloud AFK" },
      { name: "description", content: "จัดการชื่อผู้ใช้ ดูยอดเงินคงเหลือ และเข้าถึงคำสั่งซื้อของคุณใน MiniCloud AFK" },
      { property: "og:title", content: "โปรไฟล์ของฉัน — MiniCloud AFK" },
      { property: "og:description", content: "จัดการบัญชีและยอดเงินคงเหลือของคุณ" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, isAdmin, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) setUsername(profile.username);
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({ username }).eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("บันทึกโปรไฟล์แล้ว");
    refreshProfile();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight">โปรไฟล์ของฉัน</h1>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="animate-fade-up rounded-2xl border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground">ยอดเงินคงเหลือ</p>
            <p className="mt-1 text-3xl font-semibold text-primary">{thb(Number(profile?.balance ?? 0))}</p>
            <Button asChild variant="glow" size="sm" className="mt-4 rounded-full">
              <Link to="/wallet">เติมเงิน</Link>
            </Button>
          </div>
          <div className="animate-fade-up rounded-2xl border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground">อีเมล</p>
            <p className="mt-1 break-all text-sm">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link to="/orders">คำสั่งซื้อของฉัน</Link>
              </Button>
              {isAdmin && (
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/admin">หน้าแอดมิน</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={save} className="animate-fade-up mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="glow" className="rounded-full">บันทึก</Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => void signOut().then(() => navigate({ to: "/" }))}>
              ออกจากระบบ
            </Button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
