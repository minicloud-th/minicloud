import { Link } from "@tanstack/react-router";
import { Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
...
        <Link to="/" className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-lg animate-glow"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Cloud className="size-4 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            MiniCloud <span className="text-primary">AFK</span>
          </span>
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
        <p>© {new Date().getFullYear()} MiniCloud AFK — Roblox Shop</p>
        <p>แอดมินพร้อมบริการ 24 ชม.</p>
      </div>
    </footer>
  );
}
