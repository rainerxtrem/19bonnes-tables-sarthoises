import { signOut } from "@/lib/auth";

export function AdminTopbar({ name, unreadMessages }: { name: string; unreadMessages: number }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {unreadMessages > 0 ? (
          <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
            {unreadMessages} message{unreadMessages > 1 ? "s" : ""} non lu{unreadMessages > 1 ? "s" : ""}
          </span>
        ) : null}
        <span className="text-sm text-gray-600">{name}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button type="submit" className="text-sm text-gray-500 hover:text-brand-dark">
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  );
}
