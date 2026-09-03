import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "หน้าหลัก" },
  { to: "/store", label: "ร้านค้า" },
  { to: "/contact", label: "ติดต่อเรา" },
] as const;

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Zap className="size-4 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">SyncX</span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full">
            เข้าสู่ระบบ
          </Button>
          <Button size="sm" variant="glow" className="rounded-full">
            สมัครสมาชิก
          </Button>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} SYNCX STUIDO</p>
        <p>แอดมินพร้อมบริการ 24 ชม.</p>
      </div>
    </footer>
  );
}
