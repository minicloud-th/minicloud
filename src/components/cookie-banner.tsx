import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";

const KEY = "syncx-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = (value: string) => {
    localStorage.setItem(KEY, value);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/90 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Cookie className="size-4" />
          </span>
          <div>
            <p className="font-medium">คุกกี้บนเว็บไซต์นี้</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เราใช้คุกกี้ที่จำเป็นสำหรับการเข้าสู่ระบบ ความปลอดภัย และการชำระเงิน
              ไม่มีคุกกี้โฆษณาหรือการติดตามใด ๆ
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="glow" size="sm" className="rounded-full" onClick={() => accept("all")}>
            ยอมรับทั้งหมด
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => accept("necessary")}
          >
            จำเป็นเท่านั้น
          </Button>
        </div>
      </div>
    </div>
  );
}
