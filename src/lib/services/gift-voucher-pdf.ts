import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// Génère le certificat de bon cadeau en PDF (deux volets : détails du bon à
// gauche, authentification/QR à droite) — reproduit fidèlement la maquette
// "Carte Cadeau" (cadre double, sceau doré, encart valeur, volet
// d'authentification dégradé). pdfkit plutôt qu'un rendu HTML→PDF
// (Puppeteer) : pur JS, aucun binaire Chromium à embarquer dans l'image
// Docker Railway.

const PAGE_WIDTH = 1000;
const PAGE_HEIGHT = 520;
const LEFT_WIDTH = 680;
const RIGHT_X = LEFT_WIDTH;
const RIGHT_WIDTH = PAGE_WIDTH - LEFT_WIDTH;
const MARGIN = 50;
const CONTENT_RIGHT = LEFT_WIDTH - 46; // bord droit utile du volet gauche

const COLORS = {
  cream: "#fdfbf6",
  creamBorder: "#e0d3b2",
  creamBorderSoft: "#ecdfc2",
  gold: "#8a6a2f",
  goldDark: "#5f4720",
  goldMuted: "#a08a5e",
  goldLight: "#cdb98c",
  valueBoxBg: "#f4ebd7",
  ink: "#2b2419",
  inkSoft: "#8d8471",
};

async function fetchImageBuffer(url: string | null): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function eyebrow(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  opts: { color?: string; size?: number; width?: number; align?: "left" | "right" | "center" } = {}
) {
  doc
    .font("Helvetica-Bold")
    .fontSize(opts.size ?? 9)
    .fillColor(opts.color ?? COLORS.goldMuted)
    .text(text.toUpperCase(), x, y, { characterSpacing: 2, width: opts.width, align: opts.align, lineBreak: opts.width != null });
}

function dashedLine(doc: PDFKit.PDFDocument, x1: number, y1: number, x2: number, y2: number, color: string, width = 1) {
  doc.save();
  doc.dash(1.5, { space: 3 }).moveTo(x1, y1).lineTo(x2, y2).lineWidth(width).strokeColor(color).stroke();
  doc.undash();
  doc.restore();
}

function diamond(doc: PDFKit.PDFDocument, cx: number, cy: number, size: number, color: string) {
  doc.save();
  doc.translate(cx, cy).rotate(45);
  doc.rect(-size / 2, -size / 2, size, size).fill(color);
  doc.restore();
}

export async function generateVoucherPdf(params: {
  amountLabel: string;
  code: string;
  expiryLabel: string | null;
  buyerName: string;
  recipientName: string | null;
  logoUrl: string | null;
}): Promise<Buffer> {
  const { amountLabel, code, expiryLabel, buyerName, recipientName, logoUrl } = params;

  const [qrBuffer, logoBuffer] = await Promise.all([
    QRCode.toBuffer(code, { margin: 1, width: 400, color: { dark: COLORS.ink, light: COLORS.cream } }),
    fetchImageBuffer(logoUrl),
  ]);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ==================== FOND ====================
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.cream);
    const rightGradient = doc.linearGradient(RIGHT_X, 0, PAGE_WIDTH, PAGE_HEIGHT);
    rightGradient.stop(0, COLORS.gold).stop(1, COLORS.goldDark);
    doc.rect(RIGHT_X, 0, RIGHT_WIDTH, PAGE_HEIGHT).fill(rightGradient);

    // Cadre extérieur de la carte + ligne de perforation au raccord des deux volets
    doc.roundedRect(1, 1, PAGE_WIDTH - 2, PAGE_HEIGHT - 2, 6).lineWidth(1).strokeColor(COLORS.creamBorder).stroke();
    for (let y = 10; y < PAGE_HEIGHT; y += 16) {
      doc.circle(RIGHT_X, y, 3).fill(COLORS.cream);
    }

    // ==================== VOLET GAUCHE — double cadre ====================
    doc.rect(14, 14, LEFT_WIDTH - 14 - 12, PAGE_HEIGHT - 28).lineWidth(1).strokeColor(COLORS.creamBorder).stroke();
    doc.rect(19, 19, LEFT_WIDTH - 19 - 17, PAGE_HEIGHT - 38).lineWidth(1.5).strokeColor(COLORS.creamBorderSoft).stroke();

    // ---- En-tête : nom de l'association + sceau ----
    eyebrow(doc, "Association des", MARGIN, 44);
    doc.font("Times-Bold").fontSize(34).fillColor(COLORS.ink).text("19 Bonnes Tables", MARGIN, 58, { lineBreak: false });
    doc.fillColor(COLORS.gold).text("Sarthoises", MARGIN, 96, { lineBreak: false });

    const sealCx = 572;
    const sealCy = 100;
    const sealR = 58;
    const sealGradient = doc.radialGradient(sealCx - 15, sealCy - 17, 2, sealCx, sealCy, sealR);
    sealGradient.stop(0, "#fbf6ea").stop(0.65, "#ecdfc0").stop(1, "#dcc898");
    doc.circle(sealCx, sealCy, sealR).fill(sealGradient);
    doc.circle(sealCx, sealCy, sealR).lineWidth(1).strokeColor(COLORS.goldLight).stroke();
    doc.circle(sealCx, sealCy, sealR + 5).lineWidth(1).strokeColor(COLORS.cream).stroke();
    if (logoBuffer) {
      doc.save();
      doc.circle(sealCx, sealCy, sealR - 10).clip();
      doc.image(logoBuffer, sealCx - (sealR - 10), sealCy - (sealR - 10), { width: (sealR - 10) * 2, height: (sealR - 10) * 2 });
      doc.restore();
    } else {
      doc.font("Times-Bold").fontSize(28).fillColor(COLORS.ink).text("19", sealCx - sealR, sealCy - 14, { width: sealR * 2, align: "center" });
    }

    // ---- Petit séparateur "DEPUIS 1969 · SARTHE" ----
    const dividerY = 152;
    dashedLine(doc, MARGIN, dividerY, MARGIN + 34, dividerY, COLORS.goldLight);
    diamond(doc, MARGIN + 42, dividerY, 5, COLORS.goldLight);
    eyebrow(doc, "Depuis 1969 · Sarthe", MARGIN + 52, dividerY - 4, { size: 8 });

    // ---- Ligne pointillée pleine largeur ----
    dashedLine(doc, MARGIN, 176, CONTENT_RIGHT, 176, COLORS.creamBorder);

    // ---- Titre "Bon-cadeau" + encart Valeur, sur la même ligne ----
    const valueBoxW = 160;
    const valueBoxX = CONTENT_RIGHT - valueBoxW;

    doc.font("Times-Bold").fontSize(64).fillColor(COLORS.ink).text("Bon-cadeau", MARGIN, 196, { lineBreak: false });

    eyebrow(doc, "Valeur", valueBoxX, 196, { size: 8 });
    doc.moveTo(valueBoxX, 212).lineTo(valueBoxX + valueBoxW, 212).lineWidth(2).strokeColor(COLORS.gold).stroke();
    doc.rect(valueBoxX, 213, valueBoxW, 44).fill(COLORS.valueBoxBg);
    doc.moveTo(valueBoxX, 257).lineTo(valueBoxX + valueBoxW, 257).lineWidth(2).strokeColor(COLORS.gold).stroke();
    doc
      .font("Times-Bold")
      .fontSize(36)
      .fillColor(COLORS.gold)
      .text(`${amountLabel} €`, valueBoxX, 222, { width: valueBoxW, align: "center" });

    eyebrow(doc, "À valoir dans l'un des restaurants de l'association", MARGIN, 284, {
      size: 8,
      width: valueBoxX - 24 - MARGIN,
    });

    // ---- Offert par / Offert à ----
    const fieldY = 352;
    const fieldColW = 250;
    eyebrow(doc, "Offert par", MARGIN, fieldY, { size: 8 });
    doc.font("Times-Roman").fontSize(15).fillColor(COLORS.ink).text(buyerName, MARGIN, fieldY + 16, { width: fieldColW, lineBreak: false });
    dashedLine(doc, MARGIN, fieldY + 40, MARGIN + fieldColW, fieldY + 40, COLORS.goldLight);

    eyebrow(doc, "Offert à", 350, fieldY, { size: 8 });
    if (recipientName) {
      doc.font("Times-Roman").fontSize(15).fillColor(COLORS.ink).text(recipientName, 350, fieldY + 16, { width: fieldColW, lineBreak: false });
    }
    dashedLine(doc, 350, fieldY + 40, 350 + fieldColW, fieldY + 40, COLORS.goldLight);

    // ---- Pied du volet gauche ----
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.inkSoft)
      .text("Sur réservation · Non remboursable · Non fractionnable", MARGIN, 448, { lineBreak: false });
    doc.font("Helvetica-Bold").fillColor(COLORS.goldMuted).text("19bonnes-tables-sarthoises.fr", MARGIN, 462, { lineBreak: false });

    if (expiryLabel) {
      eyebrow(doc, "Valable jusqu'au", valueBoxX, 446, { size: 8, width: valueBoxW, align: "right" });
      doc.font("Times-Bold").fontSize(20).fillColor(COLORS.ink).text(expiryLabel, valueBoxX, 460, { width: valueBoxW, align: "right" });
    }

    // ==================== VOLET DROIT — authentification ====================
    const rightCx = RIGHT_X + RIGHT_WIDTH / 2;

    doc.rect(RIGHT_X + 14, 14, RIGHT_WIDTH - 28, PAGE_HEIGHT - 28).lineWidth(1).strokeColor("#f7f1e24d").stroke();

    // fine texture diagonale décorative
    doc.save();
    doc.rect(RIGHT_X, 0, RIGHT_WIDTH, PAGE_HEIGHT).clip();
    doc.opacity(0.06);
    for (let d = -PAGE_HEIGHT; d < RIGHT_WIDTH + PAGE_HEIGHT; d += 14) {
      doc
        .moveTo(RIGHT_X + d, 0)
        .lineTo(RIGHT_X + d + PAGE_HEIGHT, PAGE_HEIGHT)
        .lineWidth(1)
        .strokeColor(COLORS.cream)
        .stroke();
    }
    doc.opacity(1);
    doc.restore();

    // petit sceau monogramme
    doc.circle(rightCx, 46, 16).lineWidth(1).strokeColor("#f7f1e299").stroke();
    doc.font("Times-Bold").fontSize(16).fillColor(COLORS.cream).text("19", rightCx - 20, 37, { width: 40, align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#f7f1e2")
      .fillOpacity(0.75)
      .text("AUTHENTIFICATION", RIGHT_X, 76, { width: RIGHT_WIDTH, align: "center", characterSpacing: 2 });
    doc.fillOpacity(1);

    const qrBoxSize = 190;
    const qrBoxX = rightCx - qrBoxSize / 2;
    const qrBoxY = 98;
    doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 4).fill(COLORS.cream);
    doc.image(qrBuffer, qrBoxX + 16, qrBoxY + 16, { width: qrBoxSize - 32, height: qrBoxSize - 32 });

    const serialLabelY = qrBoxY + qrBoxSize + 22;
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#f7f1e2")
      .fillOpacity(0.75)
      .text("N° DE SÉRIE", RIGHT_X, serialLabelY, { width: RIGHT_WIDTH, align: "center", characterSpacing: 2 });
    doc.fillOpacity(1);

    const serialValueY = serialLabelY + 18;
    doc.moveTo(RIGHT_X + 40, serialValueY - 6).lineTo(PAGE_WIDTH - 40, serialValueY - 6).lineWidth(1).strokeColor("#f7f1e24d").stroke();
    doc
      .font("Courier-Bold")
      .fontSize(15)
      .fillColor(COLORS.cream)
      .text(code, RIGHT_X, serialValueY, { width: RIGHT_WIDTH, align: "center", characterSpacing: 1 });
    doc.moveTo(RIGHT_X + 40, serialValueY + 22).lineTo(PAGE_WIDTH - 40, serialValueY + 22).lineWidth(1).strokeColor("#f7f1e24d").stroke();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#f7f1e2")
      .fillOpacity(0.65)
      .text("Scannez le code pour vérifier ce bon-cadeau", RIGHT_X + 24, serialValueY + 34, {
        width: RIGHT_WIDTH - 48,
        align: "center",
      });
    doc.fillOpacity(1);

    // liseré défilant décoratif en pied de volet
    doc.save();
    doc.rect(RIGHT_X + 14, PAGE_HEIGHT - 26, RIGHT_WIDTH - 28, 12).clip();
    doc
      .font("Helvetica-Bold")
      .fontSize(6)
      .fillColor("#f7f1e2")
      .fillOpacity(0.4)
      .text(
        "LES 19 BONNES TABLES SARTHOISES · LES 19 BONNES TABLES SARTHOISES · LES 19 BONNES TABLES SARTHOISES",
        RIGHT_X + 14,
        PAGE_HEIGHT - 24,
        { characterSpacing: 1.5, lineBreak: false }
      );
    doc.fillOpacity(1);
    doc.restore();

    doc.end();
  });
}
