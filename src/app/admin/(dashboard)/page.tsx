import Link from "next/link";
import {
  UtensilsCrossed,
  FileText,
  Newspaper,
  Handshake,
  Users,
  Image as ImageIcon,
  Mail,
  Gift,
  AlertTriangle,
  Wallet,
  Send,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getGiftVoucherStats, getMonthlySalesCents, getVouchersExpiringSoonCount } from "@/lib/services/gift-voucher.service";

export const metadata = { title: "Tableau de bord | Administration" };

async function getCounts() {
  const [restaurants, pages, articles, partners, boardMembers, media, unreadMessages] =
    await Promise.all([
      prisma.restaurant.count(),
      prisma.page.count(),
      prisma.article.count(),
      prisma.partner.count(),
      prisma.boardMember.count(),
      prisma.media.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    ]);
  return { restaurants, pages, articles, partners, boardMembers, media, unreadMessages };
}

async function getIndicators() {
  const [monthlySalesCents, expiringSoonCount, giftVoucherStats, newsletterSubscribers] = await Promise.all([
    getMonthlySalesCents(),
    getVouchersExpiringSoonCount(30),
    getGiftVoucherStats(),
    prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
  ]);
  return { monthlySalesCents, expiringSoonCount, pendingPayoutCents: giftVoucherStats.pendingPayoutCents, newsletterSubscribers };
}

function euros(cents: number) {
  return (cents / 100).toFixed(2) + " €";
}

const TILES: {
  key: keyof Awaited<ReturnType<typeof getCounts>>;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "restaurants", label: "Restaurants", href: "/admin/restaurants", icon: UtensilsCrossed },
  { key: "pages", label: "Pages", href: "/admin/pages", icon: FileText },
  { key: "articles", label: "Actualités", href: "/admin/actualites", icon: Newspaper },
  { key: "partners", label: "Partenaires", href: "/admin/partenaires", icon: Handshake },
  { key: "boardMembers", label: "Membres du bureau", href: "/admin/bureau", icon: Users },
  { key: "media", label: "Photos", href: "/admin/galerie", icon: ImageIcon },
  { key: "unreadMessages", label: "Messages non lus", href: "/admin/messages", icon: Mail },
];

export default async function AdminDashboardPage() {
  const [counts, indicators] = await Promise.all([getCounts(), getIndicators()]);
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const INDICATOR_TILES = [
    {
      label: "Ventes bons cadeaux (ce mois)",
      value: euros(indicators.monthlySalesCents),
      href: "/admin/bon-cadeaux",
      icon: Gift,
      highlight: false,
    },
    {
      label: "Bons expirant sous 30 jours",
      value: String(indicators.expiringSoonCount),
      href: "/admin/bon-cadeaux",
      icon: AlertTriangle,
      highlight: indicators.expiringSoonCount > 0,
    },
    {
      label: "Reste à verser aux restaurants",
      value: euros(indicators.pendingPayoutCents),
      href: "/admin/tresorerie",
      icon: Wallet,
      highlight: indicators.pendingPayoutCents > 0,
    },
    {
      label: "Abonnés newsletter",
      value: String(indicators.newsletterSubscribers),
      href: "/admin/newsletter",
      icon: Send,
      highlight: false,
    },
  ];

  return (
    <div>
      <p className="text-sm capitalize text-ink-400">{today}</p>
      <h1 className="mt-1 font-display text-2xl text-ink-900">Tableau de bord</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {INDICATOR_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.label}
              href={tile.href}
              className={
                "group rounded-lg border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md " +
                (tile.highlight ? "border-gold-200 bg-gold-50 hover:border-gold-300" : "border-ink-100 bg-white hover:border-wine-200")
              }
            >
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-sm transition-colors " +
                  (tile.highlight ? "bg-gold-100 text-gold-700" : "bg-cream-100 text-wine-700 group-hover:bg-wine-50")
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 font-display text-2xl text-ink-900">{tile.value}</p>
              <p className="mt-1 text-sm text-ink-500">{tile.label}</p>
            </Link>
          );
        })}
      </div>

      <p className="mb-3 mt-10 text-xs font-medium uppercase tracking-wide text-ink-400">Contenu</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const highlight = tile.key === "unreadMessages" && counts[tile.key] > 0;
          return (
            <Link
              key={tile.key}
              href={tile.href}
              className="group rounded-lg border border-ink-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-wine-200 hover:shadow-md"
            >
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-sm transition-colors " +
                  (highlight
                    ? "bg-gold-100 text-gold-700"
                    : "bg-cream-100 text-wine-700 group-hover:bg-wine-50")
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 font-display text-3xl text-ink-900">{counts[tile.key]}</p>
              <p className="mt-1 text-sm text-ink-500">{tile.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
