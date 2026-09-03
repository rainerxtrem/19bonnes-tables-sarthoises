import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AdminTopbar({ name, unreadMessages }: { name: string; unreadMessages: number }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-6 shadow-sm">
      <div />
      <div className="flex items-center gap-4">
        {unreadMessages > 0 ? (
          <span className="flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-medium text-gold-800">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
            {unreadMessages} message{unreadMessages > 1 ? "s" : ""} non lu{unreadMessages > 1 ? "s" : ""}
          </span>
        ) : null}

        <div className="flex items-center gap-2.5 border-l border-ink-100 pl-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wine-700 text-xs font-semibold text-cream-50">
            {initials(name)}
          </span>
          <span className="text-sm font-medium text-ink-700">{name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-ink-400 transition-colors hover:bg-cream-100 hover:text-wine-700"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
