import jsPDF from "jspdf";

export interface PDFExportOptions {
  tripLocation: string;
  startDate: string;
  endDate: string;
  noOfPeople: number;
  budget: number;
  itinerary: {
    tripTitle?: string;
    summary?: string;
    estimatedTotalCost?: number;
    days?: Array<{
      dayNumber: number;
      theme: string;
      activities?: Array<{
        timeSlot: string;
        title: string;
        description: string;
        locationName: string;
        category: string;
        estimatedCost?: number;
        bookingRequired?: boolean;
        bookingLink?: string;
      }>;
    }>;
  };
  isDarkMode?: boolean;
}

export function generateTripPDF(options: PDFExportOptions) {
  const { tripLocation, startDate, endDate, noOfPeople, budget, itinerary, isDarkMode = false } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  // Curated color schemes (RGB)
  const colors = isDarkMode
    ? {
        bg: [12, 12, 15],
        text: [244, 244, 245],
        muted: [161, 161, 170],
        primary: [249, 115, 22], // Kova Terracotta Orange
        primaryText: [255, 255, 255],
        cardBg: [22, 22, 26],
        cardBorder: [39, 39, 45],
        badgeBg: [32, 32, 38],
        badgeText: [212, 212, 216],
        link: [96, 165, 250], // Vibrant Blue
        divider: [35, 35, 42],
      }
    : {
        bg: [255, 255, 255],
        text: [24, 24, 27],
        muted: [113, 113, 122],
        primary: [234, 88, 12], // Kova Terracotta Orange
        primaryText: [255, 255, 255],
        cardBg: [248, 250, 252],
        cardBorder: [226, 232, 240],
        badgeBg: [241, 245, 249],
        badgeText: [71, 85, 105],
        link: [37, 99, 235], // Vibrant Blue
        divider: [226, 232, 240],
      };

  const applyPageBackground = () => {
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      applyPageBackground();
      y = margin;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    // Top subtle brand running header on subsequent pages
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("KOVA", margin, margin - 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(`|   Trip to ${tripLocation}`, margin + 12, margin - 4);

    doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, margin - 2, pageWidth - margin, margin - 2);
  };

  // 1. Initial Page Background
  applyPageBackground();

  // 2. Kova Brand Top Banner Header (Page 1)
  // Kova Logo Badge Pill
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(margin, y, 22, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("KOVA", margin + 3.5, y + 5);

  // Tagline & Document Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text("PERSONAL AI TRAVEL AGENT", margin + 25, y + 4.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("ITINERARY REPORT", pageWidth - margin - 32, y + 4.8);

  y += 10;

  // Header Divider
  doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // 3. Trip Title & Location Badge
  doc.setFillColor(colors.badgeBg[0], colors.badgeBg[1], colors.badgeBg[2]);
  doc.roundedRect(margin, y, 50, 6, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colors.badgeText[0], colors.badgeText[1], colors.badgeText[2]);
  doc.text(`LOCATION: ${tripLocation.toUpperCase()}`, margin + 3, y + 4.2);
  y += 9;

  // Trip Main Title
  const tripTitle = itinerary.tripTitle || `Trip to ${tripLocation}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  const splitTitle = doc.splitTextToSize(tripTitle, contentWidth);
  doc.text(splitTitle, margin, y);
  y += splitTitle.length * 7.5 + 2;

  // Trip Summary Paragraph
  if (itinerary.summary) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    const splitSummary = doc.splitTextToSize(itinerary.summary, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.5 + 4;
  }

  // 4. Stat Grid Cards (4 Cards Grid)
  const cardWidth = (contentWidth - 9) / 4; // ~43.2mm each
  const cardHeight = 13;
  const daysCount = itinerary.days?.length || 0;
  const estTotalCost = itinerary.estimatedTotalCost || budget;

  const stats = [
    { label: "DATES", val: `${startDate} - ${endDate}` },
    { label: "EST. COST", val: `$${estTotalCost.toLocaleString()} USD` },
    { label: "PARTY SIZE", val: `${noOfPeople} Traveler(s)` },
    { label: "DURATION", val: `${daysCount} Days` },
  ];

  checkPageBreak(cardHeight + 6);

  stats.forEach((stat, idx) => {
    const cardX = margin + idx * (cardWidth + 3);

    // Card Box
    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, "FD");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(stat.label, cardX + 3, y + 4.5);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const valText = doc.splitTextToSize(stat.val, cardWidth - 5);
    doc.text(valText[0] || "", cardX + 3, y + 9.5);
  });

  y += cardHeight + 8;

  // 5. Day-by-Day Itinerary Timeline
  for (const day of itinerary.days || []) {
    const actCount = day.activities?.length || 0;

    checkPageBreak(16);

    // Day Header Pill Banner
    const dayTagText = `DAY ${day.dayNumber}`;
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(margin, y, 18, 6.5, 1.2, 1.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(dayTagText, margin + 2.5, y + 4.5);

    // Day Theme Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(`—  ${day.theme || "Daily Itinerary"}`, margin + 21, y + 4.8);

    // Activity Count Pill
    doc.setFillColor(colors.badgeBg[0], colors.badgeBg[1], colors.badgeBg[2]);
    doc.roundedRect(pageWidth - margin - 22, y + 0.5, 22, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(`${actCount} activities`, pageWidth - margin - 19, y + 4.3);

    y += 9.5;

    // Day Activities Loop
    for (const act of day.activities || []) {
      const descLines = doc.splitTextToSize(act.description || "", contentWidth - 10);
      const cardBoxHeight = 24 + descLines.length * 4.2;

      checkPageBreak(cardBoxHeight + 3);

      // Card Frame
      doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
      doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
      doc.roundedRect(margin, y, contentWidth, cardBoxHeight, 2, 2, "FD");

      let innerY = y + 5;

      // Category Pill & Time Slot Header
      doc.setFillColor(colors.badgeBg[0], colors.badgeBg[1], colors.badgeBg[2]);
      doc.roundedRect(margin + 4, innerY - 1, 24, 4.5, 0.8, 0.8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text((act.category || "ACTIVITY").toUpperCase(), margin + 5.5, innerY + 2.2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(`•   ${act.timeSlot || "Flexible"}`, margin + 30, innerY + 2.2);

      if (act.bookingRequired) {
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.roundedRect(pageWidth - margin - 28, innerY - 1, 24, 4.5, 0.8, 0.8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text("BOOKING SUGGESTED", pageWidth - margin - 27, innerY + 2.2);
      }

      innerY += 7.5;

      // Activity Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(act.title || "", margin + 4, innerY);
      innerY += 4.8;

      // Location Name
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(`Location: ${act.locationName || tripLocation}`, margin + 4, innerY);
      innerY += 4.8;

      // Activity Description (Clean multi-line selectable text)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(descLines, margin + 4, innerY);
      innerY += descLines.length * 4.2 + 2.5;

      // Cost & Clickable Interactive PDF Links Footer
      if (act.estimatedCost !== undefined) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`Cost: $${act.estimatedCost} USD`, margin + 4, innerY);
      }

      // Google Maps Link (Clickable PDF URI)
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.title} ${act.locationName} ${tripLocation}`)}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(colors.link[0], colors.link[1], colors.link[2]);
      doc.textWithLink("Open Google Maps", pageWidth - margin - (act.bookingLink ? 54 : 26), innerY, { url: mapUrl });

      // Reserve / Booking Link (Clickable PDF URI)
      if (act.bookingLink) {
        const bUrl = act.bookingLink.startsWith("http")
          ? act.bookingLink
          : `https://www.google.com/search?q=${encodeURIComponent(act.bookingLink || act.title)}`;
        doc.textWithLink("Reserve Details", pageWidth - margin - 24, innerY, { url: bUrl });
      }

      y += cardBoxHeight + 3.5;
    }

    y += 4;
  }

  // 6. Running Page Footers (Page X of Y & Kova Branding)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - margin + 2, pageWidth - margin, pageHeight - margin + 2);

    // Left Footer: Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("KOVA", margin, pageHeight - margin + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text("Personal AI Travel Agent  •  Generated for " + tripLocation, margin + 10, pageHeight - margin + 6.5);

    // Right Footer: Page Numbers
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 16, pageHeight - margin + 6.5);
  }

  // Save the crisp, beautifully formatted vector PDF directly!
  const fileName = `${tripLocation.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-trip-plan.pdf`;
  doc.save(fileName);
}
