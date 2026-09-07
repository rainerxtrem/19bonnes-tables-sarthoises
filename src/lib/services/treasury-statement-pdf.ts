import PDFDocument from "pdfkit";

// Relevé comptable mensuel des versements aux restaurants (bons cadeaux
// validés en salle, à rembourser par l'association) — même approche pdfkit
// que le certificat de bon cadeau (gift-voucher-pdf.ts) : pur JS, pas de
// Chromium à embarquer. Mise en page volontairement sobre (tableau, pas de
// maquette élaborée) : c'est un document comptable, pas un support visuel.

const COLORS = {
  ink900: "#231e1a",
  ink700: "#443c33",
  ink500: "#6f6455",
  ink400: "#8f8271",
  gold600: "#996b2d",
  wine700: "#642227",
  cream100: "#faf6ee",
  cream200: "#f3ecdb",
  white: "#ffffff",
  border: "#e9e6e1",
  green700: "#15803d",
  amber700: "#b45309",
};

const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export interface StatementVoucherRow {
  code: string;
  amountCents: number;
  redeemedAt: Date | null;
  payoutStatus: "PENDING" | "PAID";
  buyerName: string;
  recipientName: string | null;
}

export interface StatementRestaurantRow {
  restaurantName: string;
  pendingCents: number;
  paidCents: number;
  vouchers: StatementVoucherRow[];
}

function euros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export async function generateTreasuryStatementPdf(params: {
  siteName: string;
  periodLabel: string;
  restaurants: StatementRestaurantRow[];
}): Promise<Buffer> {
  const { siteName, periodLabel, restaurants } = params;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    function ensureSpace(minHeight: number) {
      if (doc.y + minHeight > doc.page.height - MARGIN) doc.addPage();
    }

    // En-tête
    doc.fillColor(COLORS.gold600).font("Helvetica-Bold").fontSize(10).text(siteName.toUpperCase(), { characterSpacing: 1 });
    doc.moveDown(0.3);
    doc.fillColor(COLORS.ink900).font("Helvetica-Bold").fontSize(18).text("Relevé des versements aux restaurants");
    doc.fillColor(COLORS.ink500).font("Helvetica").fontSize(11).text(periodLabel);
    doc.moveDown(0.2);
    doc
      .fillColor(COLORS.ink400)
      .fontSize(8.5)
      .text(`Document généré le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`);
    doc.moveDown(1.2);

    const grandTotalPending = restaurants.reduce((sum, r) => sum + r.pendingCents, 0);
    const grandTotalPaid = restaurants.reduce((sum, r) => sum + r.paidCents, 0);

    if (restaurants.length === 0) {
      doc.fillColor(COLORS.ink500).font("Helvetica").fontSize(11).text("Aucun bon cadeau validé sur cette période.");
    }

    for (const restaurant of restaurants) {
      ensureSpace(70);
      doc.fillColor(COLORS.wine700).font("Helvetica-Bold").fontSize(13).text(restaurant.restaurantName);
      doc.moveDown(0.3);

      // En-têtes de colonnes
      const colCode = MARGIN;
      const colDate = MARGIN + 90;
      const colClient = MARGIN + 190;
      const colStatus = MARGIN + 380;
      const colAmount = PAGE_WIDTH - MARGIN - 70;

      let y = doc.y;
      doc.rect(MARGIN, y, CONTENT_WIDTH, 20).fill(COLORS.cream200);
      doc.fillColor(COLORS.ink500).font("Helvetica-Bold").fontSize(8.5);
      doc.text("CODE", colCode + 6, y + 6, { width: 70 });
      doc.text("VALIDÉ LE", colDate + 6, y + 6, { width: 90 });
      doc.text("CLIENT", colClient + 6, y + 6, { width: 180 });
      doc.text("VERSEMENT", colStatus + 6, y + 6, { width: 100 });
      doc.text("MONTANT", colAmount, y + 6, { width: 70, align: "right" });
      y += 20;
      doc.y = y;

      for (const [i, voucher] of restaurant.vouchers.entries()) {
        ensureSpace(20);
        y = doc.y;
        if (i % 2 === 1) doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(COLORS.cream100);
        doc.fillColor(COLORS.ink700).font("Helvetica").fontSize(8.5);
        doc.text(voucher.code, colCode + 6, y + 5, { width: 80 });
        doc.text(
          voucher.redeemedAt ? voucher.redeemedAt.toLocaleDateString("fr-FR") : "—",
          colDate + 6,
          y + 5,
          { width: 90 }
        );
        doc.text(voucher.recipientName || voucher.buyerName, colClient + 6, y + 5, { width: 180 });
        doc
          .fillColor(voucher.payoutStatus === "PAID" ? COLORS.green700 : COLORS.amber700)
          .text(voucher.payoutStatus === "PAID" ? "Versé" : "Non versé", colStatus + 6, y + 5, { width: 100 });
        doc.fillColor(COLORS.ink900).font("Helvetica-Bold").text(euros(voucher.amountCents), colAmount, y + 5, { width: 70, align: "right" });
        doc.y = y + 18;
      }

      ensureSpace(24);
      y = doc.y + 4;
      doc
        .save()
        .lineWidth(0.5)
        .strokeColor(COLORS.border)
        .moveTo(MARGIN, y)
        .lineTo(MARGIN + CONTENT_WIDTH, y)
        .stroke()
        .restore();
      doc.y = y + 6;
      doc
        .fillColor(COLORS.ink700)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          `Sous-total — Versé : ${euros(restaurant.paidCents)}   ·   Restant dû : ${euros(restaurant.pendingCents)}`,
          MARGIN,
          doc.y,
          { width: CONTENT_WIDTH, align: "right" }
        );
      doc.moveDown(1.4);
    }

    if (restaurants.length > 0) {
      ensureSpace(50);
      doc.rect(MARGIN, doc.y, CONTENT_WIDTH, 40).fill(COLORS.ink900);
      const boxY = doc.y;
      doc
        .fillColor(COLORS.white)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          `TOTAL GÉNÉRAL — Versé : ${euros(grandTotalPaid)}   ·   Restant dû : ${euros(grandTotalPending)}`,
          MARGIN + 12,
          boxY + 14,
          { width: CONTENT_WIDTH - 24 }
        );
      doc.y = boxY + 40 + 8;
    }

    // Pied de page (numérotation) sur toutes les pages
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(COLORS.ink400)
        .font("Helvetica")
        .fontSize(8)
        .text(`${i + 1} / ${pageCount}`, MARGIN, doc.page.height - 30, { width: CONTENT_WIDTH, align: "center" });
    }

    doc.end();
  });
}
