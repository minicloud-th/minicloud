import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { thb } from "@/lib/shop";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "กระเป๋าเงิน — MiniCloud AFK" },
      { name: "description", content: "เติมเงินด้วยโค้ดเติมเงิน ตรวจสอบยอดคงเหลือ และดูประวัติธุรกรรมทั้งหมดของบัญชี MiniCloud AFK" },
      { property: "og:title", content: "กระเป๋าเงิน — MiniCloud AFK" },
      { property: "og:description", content: "เติมเงินด้วยโค้ดและดูประวัติธุรกรรมของคุณ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const txs = useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, type, note, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.rpc("redeem_topup_code", { _code: code.trim() });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`เติมเงินสำเร็จ +${thb(Number((data as { amount?: number } | null)?.amount ?? 0))}`);
    setCode("");
    void queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight">กระเป๋าเงิน</h1>

        <div className="animate-fade-up mt-8 rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-glow)]">
          <p className="text-xs text-muted-foreground">ยอดเงินคงเหลือ</p>
          <p className="mt-2 text-5xl font-semibold text-primary">{thb(Number(profile?.balance ?? 0))}</p>
          <form onSubmit={redeem} className="mx-auto mt-6 flex max-w-sm gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="กรอกโค้ดเติมเงิน" required />
            <Button type="submit" variant="glow" className="rounded-full" disabled={busy}>เติมเงิน</Button>
          </form>
        </div>

        <h2 className="mt-10 text-lg font-medium">ประวัติธุรกรรม</h2>
        <div className="mt-4 space-y-2">
          {(txs.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีธุรกรรม</p>
          )}
          {(txs.data ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <div>
                <p className="text-sm">{t.note ?? t.type}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.created_at as string).toLocaleString("th-TH")}
                </p>
              </div>
              <span className={Number(t.amount) >= 0 ? "text-primary" : "text-destructive"}>
                {Number(t.amount) >= 0 ? "+" : ""}{thb(Number(t.amount))}
              </span>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
