import { prisma } from "@/lib/db/prisma";
import { MessageList } from "@/components/admin/message-list";

export const metadata = { title: "Messages | Administration" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: { authorUser: { select: { name: true } } },
      },
    },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Messages de contact</h1>
      <MessageList
        initialRows={messages.map((m) => ({
          id: m.id,
          fullName: m.fullName,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          status: m.status,
          createdAt: m.createdAt.toISOString(),
          replies: m.replies.map((r) => ({
            id: r.id,
            direction: r.direction,
            body: r.body,
            createdAt: r.createdAt.toISOString(),
            authorName: r.authorUser?.name ?? null,
          })),
        }))}
      />
    </div>
  );
}
