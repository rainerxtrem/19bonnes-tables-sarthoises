/**
 * Génère le PDF "Guide des accès" (secrétaire, trésorier, restaurateur +
 * installation de l'application de validation des bons cadeaux). Document
 * interne à l'association, pas un contenu du site — script ponctuel, à
 * relancer manuellement si le contenu doit être régénéré après un futur
 * changement (URLs, libellés de menu, etc.).
 *
 * Usage : npx tsx scripts/generate-access-guide.ts
 * Sortie : docs/guide-acces.pdf
 */
import { mkdirSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";

// Palette reprise de tailwind.config (ink/gold/wine/cream) pour rester
// cohérent avec l'identité visuelle du site — voir COLORS dans
// gift-voucher-pdf.ts pour le même principe appliqué au certificat.
const COLORS = {
  ink900: "#231e1a",
  ink700: "#443c33",
  ink500: "#6f6455",
  ink400: "#8f8271",
  gold700: "#7a5326",
  gold600: "#996b2d",
  wine700: "#642227",
  cream100: "#faf6ee",
  cream200: "#f3ecdb",
  white: "#ffffff",
  border: "#e9e6e1",
};

const MARGIN = 56;
const PAGE_WIDTH = 595.28; // A4 portrait, points
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const OUT_DIR = join(process.cwd(), "docs");
const OUT_FILE = join(OUT_DIR, "guide-acces.pdf");

mkdirSync(OUT_DIR, { recursive: true });

const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
doc.pipe(createWriteStream(OUT_FILE));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureSpace(minHeight: number) {
  if (doc.y + minHeight > doc.page.height - MARGIN) {
    doc.addPage();
  }
}

function sectionTitle(numberLabel: string, title: string) {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 96).fill(COLORS.ink900);
  doc
    .fillColor(COLORS.gold600)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(numberLabel.toUpperCase(), MARGIN, 34, { characterSpacing: 1.5 });
  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(title, MARGIN, 52, { width: CONTENT_WIDTH });
  doc.y = 128;
  doc.fillColor(COLORS.ink900);
}

function subTitle(text: string) {
  ensureSpace(40);
  doc.moveDown(0.8);
  doc.fillColor(COLORS.wine700).font("Helvetica-Bold").fontSize(13).text(text, { width: CONTENT_WIDTH });
  doc.moveDown(0.3);
  doc.fillColor(COLORS.ink900);
}

function body(text: string) {
  ensureSpace(20);
  doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.ink700).text(text, { width: CONTENT_WIDTH, lineGap: 3 });
  doc.moveDown(0.4);
}

function steps(items: string[]) {
  items.forEach((item, i) => {
    ensureSpace(24);
    const y = doc.y;
    doc
      .save()
      .circle(MARGIN + 8, y + 7, 8)
      .fill(COLORS.gold600)
      .restore();
    doc
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(String(i + 1), MARGIN, y + 3, { width: 16, align: "center" });
    doc
      .fillColor(COLORS.ink700)
      .font("Helvetica")
      .fontSize(10.5)
      .text(item, MARGIN + 24, y, { width: CONTENT_WIDTH - 24, lineGap: 2 });
    doc.moveDown(0.35);
  });
  doc.moveDown(0.3);
}

function bullets(items: string[], color = COLORS.ink700) {
  items.forEach((item) => {
    ensureSpace(18);
    const y = doc.y;
    doc.fillColor(COLORS.gold600).font("Helvetica-Bold").fontSize(10.5).text("–", MARGIN, y, { width: 14 });
    doc.fillColor(color).font("Helvetica").fontSize(10.5).text(item, MARGIN + 16, y, { width: CONTENT_WIDTH - 16, lineGap: 2 });
    doc.moveDown(0.25);
  });
  doc.moveDown(0.3);
}

function calloutBox(label: string, text: string) {
  ensureSpace(60);
  const startY = doc.y;
  const padding = 12;
  doc.font("Helvetica-Bold").fontSize(9.5);
  const labelHeight = doc.heightOfString(label, { width: CONTENT_WIDTH - padding * 2 });
  doc.font("Helvetica").fontSize(10);
  const textHeight = doc.heightOfString(text, { width: CONTENT_WIDTH - padding * 2, lineGap: 2 });
  const boxHeight = labelHeight + textHeight + padding * 2 + 6;

  doc
    .save()
    .roundedRect(MARGIN, startY, CONTENT_WIDTH, boxHeight, 4)
    .fill(COLORS.cream200)
    .restore();
  doc
    .save()
    .roundedRect(MARGIN, startY, 4, boxHeight, 2)
    .fill(COLORS.gold600)
    .restore();

  doc
    .fillColor(COLORS.gold700)
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text(label.toUpperCase(), MARGIN + padding, startY + padding, {
      width: CONTENT_WIDTH - padding * 2,
      characterSpacing: 0.6,
    });
  doc
    .fillColor(COLORS.ink700)
    .font("Helvetica")
    .fontSize(10)
    .text(text, MARGIN + padding, startY + padding + labelHeight + 4, {
      width: CONTENT_WIDTH - padding * 2,
      lineGap: 2,
    });

  doc.y = startY + boxHeight + 12;
}

function url(text: string) {
  return text; // simple mise en évidence via la police plus bas (courier)
}

function urlLine(label: string, value: string) {
  ensureSpace(24);
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(COLORS.ink900).text(label, MARGIN, doc.y, { continued: false });
  doc
    .font("Courier")
    .fontSize(10.5)
    .fillColor(COLORS.wine700)
    .text(value, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.5);
}

function tableTwoCols(rows: [string, string][], colLabel1: string, colLabel2: string) {
  ensureSpace(30);
  const col1Width = CONTENT_WIDTH * 0.4;
  const col2Width = CONTENT_WIDTH * 0.6;
  let y = doc.y;

  doc.rect(MARGIN, y, CONTENT_WIDTH, 22).fill(COLORS.ink900);
  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text(colLabel1.toUpperCase(), MARGIN + 8, y + 6, { width: col1Width - 8 })
    .text(colLabel2.toUpperCase(), MARGIN + col1Width + 8, y + 6, { width: col2Width - 16 });
  y += 22;
  doc.y = y;

  rows.forEach(([a, b], i) => {
    doc.font("Helvetica").fontSize(9.5);
    const h1 = doc.heightOfString(a, { width: col1Width - 16 });
    const h2 = doc.heightOfString(b, { width: col2Width - 16 });
    const rowH = Math.max(h1, h2) + 12;
    ensureSpace(rowH);
    y = doc.y;
    if (i % 2 === 1) doc.rect(MARGIN, y, CONTENT_WIDTH, rowH).fill(COLORS.cream100);
    doc
      .fillColor(COLORS.ink900)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(a, MARGIN + 8, y + 6, { width: col1Width - 16 });
    doc
      .fillColor(COLORS.ink700)
      .font("Helvetica")
      .fontSize(9.5)
      .text(b, MARGIN + col1Width + 8, y + 6, { width: col2Width - 16 });
    doc.y = y + rowH;
  });
  doc
    .save()
    .lineWidth(0.5)
    .strokeColor(COLORS.border)
    .rect(MARGIN, y, CONTENT_WIDTH, 0)
    .restore();
  doc.moveDown(0.6);
}

// ---------------------------------------------------------------------------
// Page de couverture
// ---------------------------------------------------------------------------

doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.ink900);
doc
  .fillColor(COLORS.gold600)
  .font("Helvetica-Bold")
  .fontSize(12)
  .text("19 BONNES TABLES SARTHOISES", MARGIN, 200, { characterSpacing: 2 });
doc
  .fillColor(COLORS.white)
  .font("Helvetica-Bold")
  .fontSize(34)
  .text("Guide des accès", MARGIN, 230, { width: CONTENT_WIDTH });
doc
  .fillColor(COLORS.white)
  .font("Helvetica")
  .fontSize(15)
  .text("Secrétaire · Trésorier · Restaurateur · Application de validation des bons cadeaux", MARGIN, 280, {
    width: CONTENT_WIDTH,
  });

const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
doc
  .fillColor(COLORS.ink400)
  .font("Helvetica")
  .fontSize(10)
  .text(`Document interne — mis à jour le ${today}`, MARGIN, doc.page.height - 80, { width: CONTENT_WIDTH });

// ---------------------------------------------------------------------------
// Sommaire
// ---------------------------------------------------------------------------
doc.addPage();
doc.fillColor(COLORS.wine700).font("Helvetica-Bold").fontSize(18).text("Sommaire");
doc.moveDown(1);

const toc: [string, string][] = [
  ["1", "Accès Secrétaire — bons cadeaux et communication"],
  ["2", "Accès Trésorier — suivi des versements aux restaurants"],
  ["3", "Accès Restaurateur — fiche établissement et validation des bons"],
  ["4", "Installer l'application de validation des bons cadeaux"],
];
toc.forEach(([n, title]) => {
  ensureSpace(28);
  const y = doc.y;
  doc.fillColor(COLORS.gold600).font("Helvetica-Bold").fontSize(13).text(n, MARGIN, y, { width: 24 });
  doc.fillColor(COLORS.ink900).font("Helvetica").fontSize(12).text(title, MARGIN + 28, y, { width: CONTENT_WIDTH - 28 });
  doc.moveDown(0.9);
});

doc.moveDown(1.5);
body(
  "Ce guide explique, pour chaque type de compte, comment il est créé, comment s'y connecter, et ce à quoi il donne accès. Toute création de compte se fait par un Super administrateur, depuis /admin/administrateurs."
);

// ---------------------------------------------------------------------------
// 1. SECRÉTAIRE
// ---------------------------------------------------------------------------
sectionTitle("Section 1", "Accès Secrétaire");

body(
  "Ce rôle donne accès uniquement aux bons cadeaux et au bloc « Communication » (messages de contact, newsletter) de l'administration. Il ne donne accès à rien d'autre : ni aux fiches restaurants, ni aux pages du site, ni aux réglages."
);

subTitle("Créer le compte (réservé au Super administrateur)");
steps([
  "Se connecter à l'administration : /admin/login",
  "Dans le menu, aller dans Réglages > Administrateurs",
  "Cliquer sur « Créer un compte »",
  "Renseigner le nom, l'email et un mot de passe (minimum 12 caractères, avec une majuscule, une minuscule et un chiffre)",
  "Dans le champ Rôle, choisir « Secrétaire (bons cadeaux + communication) »",
  "Valider — le compte peut se connecter immédiatement",
]);

subTitle("Se connecter");
urlLine("Adresse : ", "/admin/login");
body(
  "C'est la même page de connexion que pour les administrateurs. Après connexion, la secrétaire arrive automatiquement sur la page Bons cadeaux (et non sur le tableau de bord général, qui ne lui est pas accessible)."
);

subTitle("Ce que la secrétaire peut faire");
bullets([
  "Bons cadeaux : voir la liste complète, créer un bon manuellement (remise en main propre, geste commercial…), renvoyer un bon par email, changer son statut, le supprimer, exporter la liste en CSV",
  "Communication > Messages : consulter et traiter les messages reçus via le formulaire de contact du site",
  "Communication > Newsletter : voir les abonnés, créer et envoyer une nouvelle campagne",
]);

subTitle("Ce qu'elle ne peut pas faire");
bullets([
  "Modifier les fiches restaurants, les pages du site, les actualités, la galerie, le bureau ou les partenaires",
  "Accéder à la trésorerie (réservée aux trésoriers et aux administrateurs)",
  "Modifier les réglages du site ou gérer les autres comptes",
]);

calloutBox(
  "À savoir",
  "Si la secrétaire tape directement l'adresse d'une page qui ne lui est pas ouverte, elle est automatiquement redirigée vers Bons cadeaux plutôt que déconnectée."
);

// ---------------------------------------------------------------------------
// 2. TRÉSORIER
// ---------------------------------------------------------------------------
sectionTitle("Section 2", "Accès Trésorier");

body(
  "Ce rôle donne accès, dans l'administration, uniquement à la trésorerie : le suivi des sommes à verser aux restaurants pour les bons cadeaux utilisés chez eux. Rien d'autre ne lui est ouvert."
);

subTitle("Créer le compte (réservé au Super administrateur)");
steps([
  "Se connecter à l'administration : /admin/login",
  "Aller dans Réglages > Administrateurs > « Créer un compte »",
  "Renseigner nom, email et mot de passe",
  "Choisir le rôle « Trésorier (versements bons cadeaux) »",
  "Valider",
]);

subTitle("Se connecter");
urlLine("Adresse : ", "/admin/login");
body(
  "C'est la même page de connexion que pour les administrateurs et la secrétaire. Après connexion, le trésorier arrive automatiquement sur la page Trésorerie (et non sur le tableau de bord général, qui ne lui est pas accessible)."
);

subTitle("Ce que le trésorier peut faire");
bullets([
  "Voir, pour chaque restaurant membre, le montant déjà versé et le montant restant à verser",
  "Marquer un bon cadeau individuel comme versé ou non versé",
  "Marquer en une fois tous les bons en attente d'un restaurant comme versés",
  "Consulter les statistiques globales des bons cadeaux (vendus, utilisés, montants)",
  "Télécharger le relevé comptable mensuel au format PDF",
]);

calloutBox(
  "À savoir",
  "Un Super administrateur ou un Admin n'a pas besoin d'un compte trésorier séparé : il retrouve exactement les mêmes informations et les mêmes actions au même endroit (Association > Trésorerie), simplement avec accès au reste de l'administration en plus."
);

// ---------------------------------------------------------------------------
// 3. RESTAURATEUR
// ---------------------------------------------------------------------------
sectionTitle("Section 3", "Accès Restaurateur");

body(
  "Ce rôle est destiné à un restaurant membre : il permet de gérer sa propre fiche (informations, photos, galerie) et de valider les bons cadeaux présentés par les clients, dans n'importe lequel des restaurants membres — pas seulement le sien."
);

subTitle("Créer le compte");
steps([
  "Se connecter à l'administration : /admin/login (Admin ou Super administrateur)",
  "Aller dans Réglages > Administrateurs > « Créer un compte »",
  "Renseigner nom, email et mot de passe",
  "Choisir le rôle « Restaurateur (une seule fiche) »",
  "Sélectionner, dans la liste, le restaurant que ce compte doit gérer",
  "Valider — transmettre l'email et le mot de passe au restaurateur",
]);

subTitle("Se connecter");
urlLine("Adresse : ", "/mon-restaurant/login");
body(
  "Une fois connecté, le restaurateur reste connecté très longtemps (180 jours) : il n'a pas besoin de ressaisir ses identifiants à chaque service en salle. Seule une déconnexion manuelle (bouton dédié) referme la session avant ce délai."
);

subTitle("Ce que le restaurateur voit après connexion");
body("Un écran d'accueil propose deux choix :");
bullets([
  "« Modifier ma page restaurant » — informations, photos et galerie de son établissement, visibles immédiatement sur le site public",
  "« Validation bons cadeaux » — vérifier et valider un bon cadeau présenté par un client (voir section 4 pour l'installer en application)",
]);

// ---------------------------------------------------------------------------
// 4. APPLICATION DE VALIDATION DES BONS CADEAUX
// ---------------------------------------------------------------------------
sectionTitle("Section 4", "Installer l'application de validation des bons");

body(
  "L'espace restaurateur peut être installé comme une application sur un téléphone ou une tablette (icône sur l'écran d'accueil, ouverture en plein écran, sans barre d'adresse). C'est le moyen le plus rapide pour valider un bon cadeau en salle : plus besoin de rouvrir un navigateur et de retaper l'adresse à chaque fois."
);

subTitle("Sur iPhone / iPad (navigateur Safari)");
steps([
  "Ouvrir Safari et aller sur /mon-restaurant/login (ou se connecter directement)",
  "Appuyer sur l'icône de partage (le carré avec une flèche vers le haut), en bas de l'écran",
  "Faire défiler et appuyer sur « Sur l'écran d'accueil »",
  "Confirmer en appuyant sur « Ajouter » en haut à droite",
  "Une icône « Mon restaurant » apparaît sur l'écran d'accueil, comme une application",
]);

subTitle("Sur Android (navigateur Chrome)");
steps([
  "Ouvrir Chrome et aller sur /mon-restaurant/login",
  "Appuyer sur le menu (les trois points en haut à droite)",
  "Appuyer sur « Ajouter à l'écran d'accueil » ou « Installer l'application » (le libellé exact dépend de la version de Chrome)",
  "Confirmer l'ajout",
]);

calloutBox(
  "Important",
  "Cette installation ne fonctionne que depuis /mon-restaurant (l'espace restaurateur). Elle n'est pas proposée depuis l'administration (/admin)."
);

subTitle("Utiliser l'application au quotidien");
steps([
  "Ouvrir l'icône « Mon restaurant » depuis l'écran d'accueil du téléphone ou de la tablette",
  "Se connecter une première fois avec l'email et le mot de passe du compte restaurateur — la connexion reste ensuite active pendant 180 jours",
  "Appuyer sur « Validation bons cadeaux »",
  "Scanner le QR code du bon cadeau avec l'appareil photo, ou saisir manuellement son code",
  "Vérifier les informations affichées (montant, statut, expéditeur/destinataire)",
  "Confirmer la validation — le bon est marqué comme utilisé et ne pourra plus être présenté une seconde fois",
]);

calloutBox(
  "Un bon expiré ou déjà utilisé",
  "L'application l'indique clairement avant toute validation (statut « Expiré » ou « Déjà utilisé ») — aucune validation n'est possible dans ce cas, quel que soit le restaurant."
);

// ---------------------------------------------------------------------------
// Tableau récapitulatif final
// ---------------------------------------------------------------------------
doc.addPage();
doc.fillColor(COLORS.wine700).font("Helvetica-Bold").fontSize(18).text("Récapitulatif");
doc.moveDown(1);

tableTwoCols(
  [
    ["Secrétaire", "/admin/login — bons cadeaux + communication"],
    ["Trésorier", "/admin/login — versements aux restaurants"],
    ["Restaurateur", "/mon-restaurant/login — fiche + validation des bons"],
    ["Admin / Super admin", "/admin/login — accès complet à l'administration"],
  ],
  "Rôle",
  "Connexion et périmètre"
);

doc.moveDown(1);
body(
  "Tous les comptes (hors visiteurs du site) sont créés depuis /admin/administrateurs, accessible uniquement à un Super administrateur."
);

// ---------------------------------------------------------------------------
// Pied de page (numérotation) sur toutes les pages
// ---------------------------------------------------------------------------
const pageCount = doc.bufferedPageRange().count;
for (let i = 0; i < pageCount; i++) {
  doc.switchToPage(i);
  if (i === 0) continue; // pas de numéro sur la couverture
  doc
    .fillColor(COLORS.ink400)
    .font("Helvetica")
    .fontSize(8.5)
    .text(`${i} / ${pageCount - 1}`, MARGIN, doc.page.height - 36, {
      width: CONTENT_WIDTH,
      align: "center",
    });
}

doc.end();

console.log(`Guide généré : ${OUT_FILE}`);
