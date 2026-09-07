// Adressage dédié à la capture automatique des réponses des clients aux
// messages de contact (voir /api/webhooks/resend-inbound). Un sous-domaine
// séparé (CONTACT_REPLY_DOMAIN, ex. reponses.19bonnes-tables-sarthoises.fr)
// reçoit les emails via Resend Inbound, sans toucher à la vraie boîte
// contact@ (IONOS) utilisée pour tout le reste.
//
// Adressage "plus" par identifiant de message (msg-<id>@sous-domaine) plutôt
// que corrélation via les en-têtes In-Reply-To/References : plus robuste
// (certains clients mail ou relais peuvent altérer ces en-têtes), et
// l'identifiant est directement lisible dans l'adresse "to" du webhook.

export function contactReplyDomain(): string | null {
  return process.env.CONTACT_REPLY_DOMAIN || null;
}

export function buildInboundReplyAddress(contactMessageId: string): string | null {
  const domain = contactReplyDomain();
  if (!domain) return null;
  return `msg-${contactMessageId}@${domain}`;
}

/** Extrait l'id du ContactMessage à partir d'une adresse "to" reçue par le
 * webhook (ex. "msg-abc123@reponses.example.fr" → "abc123"), ou null si
 * l'adresse ne correspond pas au format attendu. */
export function parseContactMessageIdFromAddress(address: string): string | null {
  const domain = contactReplyDomain();
  if (!domain) return null;
  const local = address.split("@")[0];
  const host = address.split("@")[1];
  if (!local || !host || host.toLowerCase() !== domain.toLowerCase()) return null;
  const match = local.match(/^msg-(.+)$/);
  return match?.[1] ?? null;
}
