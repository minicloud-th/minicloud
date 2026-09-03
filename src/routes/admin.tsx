import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchCategories, fetchProducts, thb } from "@/lib/shop";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "แผงควบคุมแอดมิน — MiniCloud AFK" },
      { name: "description", content: "จัดการสินค้า สต็อกไอเทม โค้ดเติมเงิน และคำสั่งซื้อทั้งหมดของร้าน MiniCloud AFK" },
      { property: "og:title", content: "แผงควบคุมแอดมิน — MiniCloud AFK" },
      { property: "og:description", content: "จัดการสินค้า สต็อก และโค้ดเติมเงิน" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const products = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });
  const codes = useQuery({
    queryKey: ["topup_codes"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topup_codes")
        .select("id, code, amount, used_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
  const allOrders = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, product_name, quantity, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  // product form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert({
      name,
      price: Number(price),
      category_id: categoryId || null,
      image_url: imageUrl || null,
      description: description || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("เพิ่มสินค้าแล้ว");
    setName(""); setPrice(""); setImageUrl(""); setDescription("");
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // stock form
  const [stockProduct, setStockProduct] = useState("");
  const [stockLines, setStockLines] = useState("");

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = stockLines.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!stockProduct || lines.length === 0) {
      toast.error("เลือกสินค้าและใส่ข้อมูลสต็อก");
      return;
    }
    const { error } = await supabase
      .from("stock_items")
      .insert(lines.map((content) => ({ product_id: stockProduct, content })));
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`เพิ่มสต็อก ${lines.length} ชิ้น`);
    setStockLines("");
    void queryClient.invalidateQueries();
  };

  // code form
  const [codeValue, setCodeValue] = useState("");
  const [codeAmount, setCodeAmount] = useState("");

  const addCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("topup_codes")
      .insert({ code: codeValue.trim(), amount: Number(codeAmount) });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("สร้างโค้ดเติมเงินแล้ว");
    setCodeValue(""); setCodeAmount("");
    void queryClient.invalidateQueries({ queryKey: ["topup_codes"] });
  };

  if (!loading && user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav />
        <main className="mx-auto max-w-md px-6 pb-24 pt-40 text-center">
          <h1 className="text-2xl font-semibold">เฉพาะแอดมินเท่านั้น</h1>
          <p className="mt-2 text-sm text-muted-foreground">บัญชีนี้ไม่มีสิทธิ์เข้าถึงแผงควบคุม</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight">แผงควบคุมแอดมิน</h1>

        <Tabs defaultValue="products" className="mt-8">
          <TabsList>
            <TabsTrigger value="products">สินค้า</TabsTrigger>
            <TabsTrigger value="stock">สต็อก</TabsTrigger>
            <TabsTrigger value="codes">โค้ดเติมเงิน</TabsTrigger>
            <TabsTrigger value="orders">คำสั่งซื้อ</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 pt-6">
            <form onSubmit={addProduct} className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ชื่อสินค้า</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>ราคา (บาท)</Label>
                <Input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">— ไม่ระบุ —</option>
                  {(categories.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>ลิงก์รูปภาพ</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>รายละเอียด</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <Button type="submit" variant="glow" className="rounded-full sm:col-span-2">เพิ่มสินค้า</Button>
            </form>

            <div className="space-y-2">
              {(products.data ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                  <span className="text-sm">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-primary">{thb(Number(p.price))}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
                        void queryClient.invalidateQueries({ queryKey: ["products"] });
                      }}
                    >
                      {p.is_active ? "ซ่อน" : "แสดง"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stock" className="pt-6">
            <form onSubmit={addStock} className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="space-y-2">
                <Label>สินค้า</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={stockProduct}
                  onChange={(e) => setStockProduct(e.target.value)}
                >
                  <option value="">— เลือกสินค้า —</option>
                  {(products.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>ข้อมูลสต็อก (1 บรรทัด = 1 ชิ้น)</Label>
                <Textarea rows={6} value={stockLines} onChange={(e) => setStockLines(e.target.value)} />
              </div>
              <Button type="submit" variant="glow" className="rounded-full">เพิ่มสต็อก</Button>
            </form>
          </TabsContent>

          <TabsContent value="codes" className="space-y-6 pt-6">
            <form onSubmit={addCode} className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>โค้ด</Label>
                <Input value={codeValue} onChange={(e) => setCodeValue(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>มูลค่า (บาท)</Label>
                <Input type="number" min="1" value={codeAmount} onChange={(e) => setCodeAmount(e.target.value)} required />
              </div>
              <Button type="submit" variant="glow" className="rounded-full sm:col-span-2">สร้างโค้ด</Button>
            </form>

            <div className="space-y-2">
              {(codes.data ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <span className="font-mono">{c.code}</span>
                  <span className="text-primary">{thb(Number(c.amount))}</span>
                  <span className="text-xs text-muted-foreground">{c.used_at ? "ใช้แล้ว" : "ยังไม่ใช้"}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-2 pt-6">
            {(allOrders.data ?? []).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <span>{o.product_name} × {o.quantity}</span>
                <span className="text-primary">{thb(Number(o.total))}</span>
                <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("th-TH")}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
