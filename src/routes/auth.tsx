import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — MiniCloud AFK" },
      { name: "description", content: "เข้าสู่ระบบหรือสมัครสมาชิก MiniCloud AFK เพื่อเติมเงิน สั่งซื้อไอเทม Roblox และดูประวัติคำสั่งซื้อ" },
      { property: "og:title", content: "เข้าสู่ระบบ — MiniCloud AFK" },
      { property: "og:description", content: "สมัครสมาชิกฟรี เติมเงินด้วยโค้ด และรับไอเทมอัตโนมัติทันที" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/profile" });
  }, [user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("เข้าสู่ระบบสำเร็จ");
    void navigate({ to: "/profile" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("สมัครสมาชิกสำเร็จ! หากระบบขอยืนยันอีเมล กรุณาเช็คกล่องจดหมาย");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) { toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ"); return; }
    if (result.redirected) return;
    void navigate({ to: "/profile" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto flex max-w-md flex-col px-6 pb-24 pt-32">
        <div className="animate-fade-up rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-glow)]">
          <h1 className="text-2xl font-semibold tracking-tight">ยินดีต้อนรับ</h1>
          <p className="mt-1 text-sm text-muted-foreground">เข้าสู่ระบบเพื่อเติมเงินและสั่งซื้อไอเทม</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" variant="glow" className="w-full rounded-full" disabled={busy}>
                  เข้าสู่ระบบ
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="MiniCloudFan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">อีเมล</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">รหัสผ่าน</Label>
                  <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" variant="glow" className="w-full rounded-full" disabled={busy}>
                  สมัครสมาชิก
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />หรือ<span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full rounded-full" onClick={google}>
            เข้าสู่ระบบด้วย Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/store" className="hover:text-foreground">ดูสินค้าทั้งหมดก่อน</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
