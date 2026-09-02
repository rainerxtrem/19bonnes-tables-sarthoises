// Gabarit HTML commun à tous les emails envoyés par le site (newsletter,
// notifications de contact...). Écrit en tables + styles inline, comme il
// est d'usage pour l'emailing : la plupart des clients (Outlook en tête)
// ignorent les balises <style> et le CSS moderne (flexbox, grid...).
//
// Les couleurs sont explicitement figées (fond ET texte, à chaque niveau)
// pour éviter qu'un client en mode sombre (Gmail, Outlook) ne réinterprète
// les couleurs par défaut et n'affiche par exemple du texte blanc sur fond
// blanc — d'où les meta color-scheme et les attributs bgcolor en plus du
// style inline.

const INK_950 = "#17130f";
const INK_900 = "#231e1a";
const INK_500 = "#6f6455";
const GOLD_400 = "#cda047";
const WINE_700 = "#642227";
const CREAM_50 = "#fffdf9";
const CREAM_100 = "#faf6ee";

export function renderEmail({
  siteName,
  tagline = "Le savoir-faire pour mieux vous servir.",
  preheader,
  bodyHtml,
  footerNote,
}: {
  siteName: string;
  tagline?: string;
  /** Aperçu affiché par le client mail dans la liste des messages, avant ouverture. */
  preheader: string;
  /** Contenu principal, déjà en HTML (paragraphes, liens...). */
  bodyHtml: string;
  /** Ligne complémentaire affichée sous le contenu, avant le pied de page (ex. lien de désinscription). */
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(siteName)}</title>
</head>
<body style="margin:0; padding:0; background-color:${CREAM_100};">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CREAM_100}" style="background-color:${CREAM_100}; padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:${CREAM_50}; border-radius:4px; overflow:hidden;">
        <tr>
          <td bgcolor="${INK_950}" style="background-color:${INK_950}; padding:28px 32px; text-align:center;">
            <div style="font-family:Georgia,'Times New Roman',serif; font-size:22px; color:${GOLD_400};">${escapeHtml(siteName)}</div>
            <div style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:13px; color:${CREAM_50}; margin-top:6px;">${escapeHtml(tagline)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.6; color:${INK_900};">
            ${bodyHtml}
            ${footerNote ? `<p style="margin:24px 0 0; padding-top:20px; border-top:1px solid ${CREAM_100}; font-size:12px; line-height:1.5; color:${INK_500};">${footerNote}</p>` : ""}
          </td>
        </tr>
        <tr>
          <td bgcolor="${CREAM_100}" style="background-color:${CREAM_100}; padding:16px 32px; text-align:center; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:${INK_500};">
            ${escapeHtml(siteName)} — Association loi 1901
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Convertit un texte brut (saisi dans un simple textarea) en paragraphes
 * HTML échappés — évite de dépendre d'un éditeur riche pour les campagnes
 * de newsletter, dont le contenu doit rester simple et fiable à l'affichage
 * dans un client mail. */
export function textToParagraphsHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p style="margin:0 0 14px;">${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/** Bouton d'action stylé (lien), à insérer tel quel dans un bodyHtml. */
export function emailButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td bgcolor="${WINE_700}" style="background-color:${WINE_700}; border-radius:3px;"><a href="${url}" style="display:inline-block; padding:12px 24px; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${CREAM_50}; text-decoration:none; letter-spacing:0.02em;">${escapeHtml(label)}</a></td></tr></table>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
