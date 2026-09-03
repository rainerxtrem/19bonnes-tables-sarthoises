import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// Génère le certificat de bon cadeau en PDF (deux volets : détails du bon à
// gauche, authentification/QR à droite) — reproduit le visuel demandé.
// pdfkit plutôt qu'un rendu HTML→PDF (Puppeteer) : pur JS, aucun binaire
// Chromium à embarquer dans l'image Docker Railway.

const PAGE_WIDTH = 1000;
const PAGE_HEIGHT = 520;
const LEFT_WIDTH = 680;
const RIGHT_X = LEFT_WIDTH;
const RIGHT_WIDTH = PAGE_WIDTH - LEFT_WIDTH;
const MARGIN = 50;

const COLORS = {
  cream: "#fdfbf6",
  creamBorder: "#e0d3b2",
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

function eyebrow(doc: PDFKit.PDFDocument, text: string, x: number, y: number, opts: { color?: string; size?: number } = {}) {
  doc
    .font("Helvetica-Bold")
    .fontSize(opts.size ?? 9)
    .fillColor(opts.color ?? COLORS.goldMuted)
    .text(text.toUpperCase(), x, y, { characterSpacing: 2 });
}

function dashedLine(doc: PDFKit.PDFDocument, x1: number, y1: number, x2: number, y2: number, color: string) {
  doc.save();
  doc.dash(1.5, { space: 3 }).moveTo(x1, y1).lineTo(x2, y2).lineWidth(1).strokeColor(color).stroke();
  doc.undash();
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

    // ---- Fond ----
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.cream);
    const rightGradient = doc.linearGradient(RIGHT_X, 0, PAGE_WIDTH, PAGE_HEIGHT);
    rightGradient.stop(0, COLORS.gold).stop(1, COLORS.goldDark);
    doc.rect(RIGHT_X, 0, RIGHT_WIDTH, PAGE_HEIGHT).fill(rightGradient);

    // Cadre extérieur + ligne de perforation au raccord des deux volets
    doc.rect(1, 1, PAGE_WIDTH - 2, PAGE_HEIGHT - 2).lineWidth(1).strokeColor(COLORS.creamBorder).stroke();
    for (let y = 10; y < PAGE_HEIGHT; y += 16) {
      doc.circle(RIGHT_X, y, 3).fill(COLORS.cream);
    }

    // ==================== VOLET GAUCHE ====================
    doc.rect(18, 18, LEFT_WIDTH - 18 - 14, PAGE_HEIGHT - 36).lineWidth(1).strokeColor(COLORS.creamBorder).stroke();

    eyebrow(doc, "Association des", MARGIN, 44);
    doc
      .font("Times-Bold")
      .fontSize(34)
      .fillColor(COLORS.ink)
      .text("19 Bonnes Tables", MARGIN, 58, { lineBreak: false });
    doc.fillColor(COLORS.gold).text("Sarthoises", MARGIN, 96, { lineBreak: false });

    // Sceau / logo
    const sealCx = 605;
    const sealCy = 100;
    const sealR = 56;
    const sealGradient = doc.radialGradient(sealCx - 14, sealCy - 16, 2, sealCx, sealCy, sealR);
    sealGradient.stop(0, "#fbf6ea").stop(0.65, "#ecdfc0").stop(1, "#dcc898");
    doc.circle(sealCx, sealCy, sealR).fill(sealGradient);
    doc.circle(sealCx, sealCy, sealR).lineWidth(1).strokeColor(COLORS.goldLight).stroke();
    doc.circle(sealCx, sealCy, sealR + 5).lineWidth(1).strokeColor(COLORS.cream).stroke();
    if (logoBuffer) {
      doc.save();
      doc.circle(sealCx, sealCy, sealR - 8).clip();
      doc.image(logoBuffer, sealCx - (sealR - 8), sealCy - (sealR - 8), { width: (sealR - 8) * 2, height: (sealR - 8) * 2 });
      doc.restore();
    } else {
      doc
        .font("Times-Bold")
        .fontSize(28)
        .fillColor(COLORS.ink)
        .text("19", sealCx - sealR, sealCy - 14, { width: sealR * 2, align: "center" });
    }

    dashedLine(doc, MARGIN, 158, 616, 158, COLORS.creamBorder);

    doc.font("Times-Bold").fontSize(58).fillColor(COLORS.ink).text("Bon cadeau", MARGIN, 178, { lineBreak: false });
    eyebrow(doc, "À valoir dans l'un des restaurants de l'association", MARGIN, 248, { size: 8 });

    // Encart valeur
    const valueBoxX = 468;
    const valueBoxW = 164;
    eyebrow(doc, "Valeur", valueBoxX, 44, { size: 8 });
    doc.moveTo(valueBoxX, 62).lineTo(valueBoxX + valueBoxW, 62).lineWidth(2).strokeColor(COLORS.gold).stroke();
    doc.rect(valueBoxX, 63, valueBoxW, 46).fill(COLORS.valueBoxBg);
    doc.moveTo(valueBoxX, 109).lineTo(valueBoxX + valueBoxW, 109).lineWidth(2).strokeColor(COLORS.gold).stroke();
    doc
      .font("Times-Bold")
      .fontSize(38)
      .fillColor(COLORS.gold)
      .text(`${amountLabel} €`, valueBoxX, 74, { width: valueBoxW, align: "center" });

    // Offert par / Offert à
    const fieldY = 300;
    eyebrow(doc, "Offert par", MARGIN, fieldY, { size: 8 });
    doc.font("Times-Roman").fontSize(15).fillColor(COLORS.ink).text(buyerName, MARGIN, fieldY + 16, { width: 250, lineBreak: false });
    dashedLine(doc, MARGIN, fieldY + 40, MARGIN + 250, fieldY + 40, COLORS.goldLight);

    eyebrow(doc, "Offert à", 350, fieldY, { size: 8 });
    if (recipientName) {
      doc.font("Times-Roman").fontSize(15).fillColor(COLORS.ink).text(recipientName, 350, fieldY + 16, { width: 250, lineBreak: false });
    }
    dashedLine(doc, 350, fieldY + 40, 350 + 250, fieldY + 40, COLORS.goldLight);

    // Pied du volet gauche
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.inkSoft)
      .text("Sur réservation · Non remboursable · Non fractionnable", MARGIN, 458, { lineBreak: false });
    doc.font("Helvetica-Bold").fillColor(COLORS.goldMuted).text("19bonnes-tables-sarthoises.fr", MARGIN, 472, { lineBreak: false });

    if (expiryLabel) {
      eyebrow(doc, "Valable jusqu'au", 468, 448, { size: 8 });
      doc.font("Times-Bold").fontSize(20).fillColor(COLORS.ink).text(expiryLabel, 468, 462, { width: valueBoxW, align: "right" });
    }

    // ==================== VOLET DROIT ====================
    const rightCx = RIGHT_X + RIGHT_WIDTH / 2;

    doc.rect(RIGHT_X + 14, 18, RIGHT_WIDTH - 28, PAGE_HEIGHT - 36).lineWidth(1).strokeColor("#f7f1e299").stroke();

    doc
      .font("Times-Bold")
      .fontSize(20)
      .fillColor(COLORS.cream)
      .text("19", rightCx - 20, 42, { width: 40, align: "center" });
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#f7f1e2")
      .fillOpacity(0.75)
      .text("AUTHENTIFICATION", RIGHT_X, 74, { width: RIGHT_WIDTH, align: "center", characterSpacing: 2 });
    doc.fillOpacity(1);

    const qrBoxSize = 190;
    const qrBoxX = rightCx - qrBoxSize / 2;
    const qrBoxY = 96;
    doc.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize).fill(COLORS.cream);
    doc.image(qrBuffer, qrBoxX + 15, qrBoxY + 15, { width: qrBoxSize - 30, height: qrBoxSize - 30 });

    const serialY = qrBoxY + qrBoxSize + 26;
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#f7f1e2")
      .fillOpacity(0.75)
      .text("N° DE SÉRIE", RIGHT_X, serialY, { width: RIGHT_WIDTH, align: "center", characterSpacing: 2 });
    doc.fillOpacity(1);
    doc
      .font("Courier-Bold")
      .fontSize(15)
      .fillColor(COLORS.cream)
      .text(code, RIGHT_X, serialY + 16, { width: RIGHT_WIDTH, align: "center", characterSpacing: 1 });

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#f7f1e2")
      .fillOpacity(0.65)
      .text("Scannez le code pour vérifier ce bon cadeau", RIGHT_X + 20, serialY + 44, {
        width: RIGHT_WIDTH - 40,
        align: "center",
      });
    doc.fillOpacity(1);

    doc.end();
  });
}
