import { jsPDF } from "jspdf";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType 
} from "docx";
import { LegalCase } from "../mock_cases";

// Professional PDF Export using jsPDF with crisp legal styling, page wrap headers/footers, and a diagonal "VERITAS" watermark.
export const exportCasePDF = (c: LegalCase) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  let y = 20;
  
  const checkPageBreak = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      drawWatermark();
      drawFooter();
      y = 25;
    }
  };

  const drawWatermark = () => {
    // Watermark removed per user request
  };

  const drawFooter = () => {
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(20, 280, 190, 280);
    
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("VERITAS LEGAL INTELLIGENCE", 20, 286);
    doc.text("Confidential Legal Document", 190, 286, { align: "right" });
  };

  // Run Initial Watermark and Footer
  drawWatermark();
  drawFooter();

  // Draw Primary Header Section
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VERITAS", 20, y);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text("AI Legal Intelligence Platform", 20, y);
  
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(8);
  doc.text(`Generated Date: ${new Date().toISOString().replace('T', ' ').substring(0, 10)}`, 190, y - 5, { align: "right" });
  doc.text(`Case ID: ${c.id}`, 190, y, { align: "right" });

  y += 10;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.7);
  doc.line(20, y, 190, y);
  y += 12;

  // I. CASE INFORMATION
  checkPageBreak(25);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("I. CASE GENERAL REGISTRY STATUS", 20, y);
  y += 12;

  const upcomingHearing = (c.hearingHistory || []).find(h => !h.completed);
  const upcomingText = upcomingHearing 
    ? `Hearing #${upcomingHearing.hearingNo} on ${upcomingHearing.date} - Stage: ${upcomingHearing.status}`
    : "No upcoming scheduled hearings / Case Completed";
  const nextProceedingText = upcomingHearing
    ? `Hearing #${upcomingHearing.hearingNo} [${upcomingHearing.date}]`
    : "None Pending";

  const rawFields = [
    { label: "Case Index Number", val: c.caseIndexNo },
    { label: "Party Name", val: c.petitionerParty },
    { label: "Party Status", val: c.respondentParty },
    { label: "Advocate On Record", val: c.advocateOnRecord },
    { label: "Judicial Forum (Court)", val: c.judicialForum },
    { label: "Filing Year Target", val: String(c.filingYearTarget) },
    { label: "Case Status", val: c.currentCaseStatus },
    { label: "Current Upcoming Hearing", val: upcomingText },
    { label: "Next Scheduled Proceeding", val: nextProceedingText },
    { label: "Classification Category", val: `${c.classificationCategory} - ${c.writCaseType}` },
    { label: "Filing Date Range", val: `${c.filingDateStart} to ${c.filingDateEnd}` },
  ];

  doc.setLineWidth(0.15);
  doc.setDrawColor(210, 210, 210);
  
  rawFields.forEach((f) => {
    // Dynamically split texts to compute row height and center text vertically
    const labelLines = doc.splitTextToSize(f.label, 50);
    const valLines = doc.splitTextToSize(f.val || "N/A", 108);
    const maxLines = Math.max(labelLines.length, valLines.length);
    const itemHeight = maxLines * 4.2 + 6.0;

    checkPageBreak(itemHeight + 2);
    // Left Box Header Styling (Zebra light grey)
    doc.setFillColor(248, 248, 248);
    doc.rect(20, y, 55, itemHeight, "FD");
    
    // Right Info Box
    doc.setFillColor(255, 255, 255);
    doc.rect(75, y, 115, itemHeight, "FD");
    
    // Write Content Text
    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const labelYOffset = (itemHeight - (labelLines.length * 4.2)) / 2 + 3.0;
    for (let i = 0; i < labelLines.length; i++) {
      doc.text(labelLines[i], 23, y + labelYOffset + i * 4.2);
    }
    
    doc.setTextColor(25, 25, 25);
    doc.setFont("helvetica", "normal");
    const valYOffset = (itemHeight - (valLines.length * 4.2)) / 2 + 3.0;
    for (let i = 0; i < valLines.length; i++) {
      doc.text(valLines[i], 78, y + valYOffset + i * 4.2);
    }
    y += itemHeight;
  });

  // II. PARTIES REGISTER
  y += 25; // 20px-30px spacing before section
  checkPageBreak(30);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("II. INTEGRATED PARTIES REGISTER", 20, y);
  y += 12; // 10px-15px spacing below headings

  // Header row draw
  const partiesHeaderHeight = 10;
  doc.setFillColor(242, 242, 242);
  doc.rect(20, y, 40, partiesHeaderHeight, "FD");
  doc.rect(60, y, 70, partiesHeaderHeight, "FD");
  doc.rect(130, y, 60, partiesHeaderHeight, "FD");
  
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Legal Role", 40, y + 6.2, { align: "center" });
  doc.text("Party Full Legal Name", 95, y + 6.2, { align: "center" });
  doc.text("Registered Contact Identity", 160, y + 6.2, { align: "center" });
  y += partiesHeaderHeight;

  const litigantRows = [
    { role: "Petitioner / Plaintiff", name: c.petitionerParty, contact: c.petitionerContact || "client-contact@veritasbase.legal" },
    { role: "Respondent / Accused", name: c.respondentParty, contact: c.respondentContact || "dept-legal-office@government.gov" }
  ];

  litigantRows.forEach((row) => {
    const roleLines = doc.splitTextToSize(row.role, 36);
    const nameLines = doc.splitTextToSize(row.name, 66);
    const contactLines = doc.splitTextToSize(row.contact, 56);
    const maxL = Math.max(roleLines.length, nameLines.length, contactLines.length);
    const rowH = maxL * 4.2 + 8.0;

    checkPageBreak(rowH + 2);
    doc.setFillColor(255, 255, 255);
    doc.rect(20, y, 40, rowH, "FD");
    doc.rect(60, y, 70, rowH, "FD");
    doc.rect(130, y, 60, rowH, "FD");

    doc.setTextColor(25, 25, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);

    const roleYOff = (rowH - (roleLines.length * 4.2)) / 2 + 3.0;
    for (let i = 0; i < roleLines.length; i++) {
      doc.text(roleLines[i], 23, y + roleYOff + i * 4.2);
    }

    const nameYOff = (rowH - (nameLines.length * 4.2)) / 2 + 3.0;
    for (let i = 0; i < nameLines.length; i++) {
      doc.text(nameLines[i], 63, y + nameYOff + i * 4.2);
    }

    const contactYOff = (rowH - (contactLines.length * 4.2)) / 2 + 3.0;
    for (let i = 0; i < contactLines.length; i++) {
      doc.text(contactLines[i], 133, y + contactYOff + i * 4.2);
    }

    y += rowH;
  });

  // III. HEARING TIMELINE TABLE
  y += 25; // 20px-30px spacing before section
  checkPageBreak(30);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("III. HEARING PROGRESSION TIMELINE", 20, y);
  y += 12; // 10px-15px spacing below headings

  // Header row draw
  const timelineHeaderHeight = 10;
  doc.setFillColor(242, 242, 242);
  doc.rect(20, y, 17, timelineHeaderHeight, "FD");
  doc.rect(37, y, 25.5, timelineHeaderHeight, "FD");
  doc.rect(62.5, y, 34, timelineHeaderHeight, "FD");
  doc.rect(96.5, y, 34, timelineHeaderHeight, "FD");
  doc.rect(130.5, y, 59.5, timelineHeaderHeight, "FD");
  
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Hearing No.", 28.5, y + 6.2, { align: "center" });
  doc.text("Date", 49.75, y + 6.2, { align: "center" });
  doc.text("Status", 79.5, y + 6.2, { align: "center" });
  doc.text("Outcome", 113.5, y + 6.2, { align: "center" });
  doc.text("Remarks", 160.25, y + 6.2, { align: "center" });
  y += timelineHeaderHeight;

  const realHistory = c.hearingHistory && c.hearingHistory.length > 0
    ? [...c.hearingHistory].sort((a, b) => a.hearingNo - b.hearingNo)
    : [
        { 
          hearingNo: 1, 
          date: c.hearingDateStart, 
          status: c.currentCaseStatus || "Notice", 
          outcome: "Initial scheduling",
          remarks: "Initial register catalog assignment." 
        }
      ];

  realHistory.forEach((h) => {
    const remarksVal = h.remarks || (h as any).notes || "-";
    
    // Dynamic text split for safe limits
    const col1Lines = doc.splitTextToSize(`#${h.hearingNo}`, 12);
    const col2Lines = doc.splitTextToSize(h.date || "-", 20.5);
    const col3Lines = doc.splitTextToSize(h.status || "-", 29);
    const col4Lines = doc.splitTextToSize(h.outcome || "-", 29);
    const col5Lines = doc.splitTextToSize(remarksVal, 54.5);
    
    const maxL = Math.max(col1Lines.length, col2Lines.length, col3Lines.length, col4Lines.length, col5Lines.length);
    const lineSpacing = 4.2;
    const rowHeight = maxL * lineSpacing + 8.0; // Consistent cell padding top & bottom

    checkPageBreak(rowHeight + 2);

    doc.setFillColor(255, 255, 255);
    doc.rect(20, y, 17, rowHeight, "FD");
    doc.rect(37, y, 25.5, rowHeight, "FD");
    doc.rect(62.5, y, 34, rowHeight, "FD");
    doc.rect(96.5, y, 34, rowHeight, "FD");
    doc.rect(130.5, y, 59.5, rowHeight, "FD");
    
    doc.setFontSize(8);

    // Draw Column 1: Hearing No. (Bold and Centered)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const col1YOff = (rowHeight - (col1Lines.length * lineSpacing)) / 2 + 3.0;
    for (let i = 0; i < col1Lines.length; i++) {
      doc.text(col1Lines[i], 28.5, y + col1YOff + i * lineSpacing, { align: "center" });
    }

    // Draw Column 2: Date (regular and Centered)
    doc.setFont("helvetica", "normal");
    doc.setTextColor(25, 25, 25);
    const col2YOff = (rowHeight - (col2Lines.length * lineSpacing)) / 2 + 3.0;
    for (let i = 0; i < col2Lines.length; i++) {
      doc.text(col2Lines[i], 49.75, y + col2YOff + i * lineSpacing, { align: "center" });
    }

    // Draw Column 3: Status (regular, left aligned with padding)
    const col3YOff = (rowHeight - (col3Lines.length * lineSpacing)) / 2 + 3.0;
    for (let i = 0; i < col3Lines.length; i++) {
      doc.text(col3Lines[i], 65.5, y + col3YOff + i * lineSpacing);
    }

    // Draw Column 4: Outcome (regular, left aligned with padding)
    const col4YOff = (rowHeight - (col4Lines.length * lineSpacing)) / 2 + 3.0;
    for (let i = 0; i < col4Lines.length; i++) {
      doc.text(col4Lines[i], 99.5, y + col4YOff + i * lineSpacing);
    }

    // Draw Column 5: Remarks (regular, left aligned with padding)
    const col5YOff = (rowHeight - (col5Lines.length * lineSpacing)) / 2 + 3.0;
    for (let i = 0; i < col5Lines.length; i++) {
      doc.text(col5Lines[i], 133.5, y + col5YOff + i * lineSpacing);
    }
    
    y += rowHeight;
  });

  // IV. CASE SUMMARY
  y += 25; // 20px-30px spacing before section
  checkPageBreak(25);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("IV. PRIMARY RECORD SUMMARY", 20, y);
  y += 12; // 10px-15px spacing below headings

  doc.setTextColor(45, 45, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  
  const textSummaryBlock = c.caseSummary || "This legal case catalog represents a verified judicial motion filed under the administrative codes of the court forum. Veritas AI engine has compiled this timeline indexing to ensure optimal preparation for incoming hearings.";
  const summaryLines = doc.splitTextToSize(textSummaryBlock, 170);
  summaryLines.forEach((line: string) => {
    checkPageBreak(7);
    doc.text(line, 20, y);
    y += 5.5;
  });

  // V. NOTES AND OBSERVATIONS
  y += 25; // 20px-30px spacing before section
  checkPageBreak(25);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("V. ADVOCATE LOGS & OBSERVATIONS", 20, y);
  y += 12; // 10px-15px spacing below headings

  doc.setTextColor(45, 45, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  
  const textNotesBlock = c.notes || "No supplementary remarks cataloged by the assigned advocate. Enter notes in the active case card panel to generate customized legal records.";
  const notesLines = doc.splitTextToSize(textNotesBlock, 170);
  notesLines.forEach((line: string) => {
    checkPageBreak(7);
    doc.text(line, 20, y);
    y += 5.5;
  });

  doc.save(`Veritas_Legal_Dossier_${c.caseIndexNo.replace(/[\/()\- ]/g, "_")}.pdf`);
};

// Professional DOCX/Word Export leveraging direct office document structures
export const exportCaseWord = (c: LegalCase) => {
  const upcomingHearing = (c.hearingHistory || []).find(h => !h.completed);
  const upcomingText = upcomingHearing 
    ? `Hearing #${upcomingHearing.hearingNo} on ${upcomingHearing.date} - Stage: ${upcomingHearing.status}`
    : "No upcoming scheduled hearings / Case Completed";
  const nextProceedingText = upcomingHearing
    ? `Hearing #${upcomingHearing.hearingNo} [${upcomingHearing.date}]`
    : "None Pending";

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Letterhead
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "VERITAS",
                bold: true,
                size: 34,
                color: "111111",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "AI LEGAL INTELLIGENCE PLATFORM SPECIALIZED REPORT",
                color: "666666",
                bold: true,
                size: 16,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Generated Date: ${new Date().toISOString().substring(0, 10)} | Case Registry Key ID: ${c.id}`,
                color: "888888",
                size: 14,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Divider
          new Paragraph({
            children: [
              new TextRun({
                text: "=================================================================================",
                color: "DDDDDD",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Section I
          new Paragraph({
            children: [
              new TextRun({
                text: "I. CASE GENERAL REGISTRY STATUS",
                bold: true,
                size: 22,
                color: "1A1A1A",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Field Registry Key", bold: true })] })] }),
                  new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "System Catalog Value", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Case Index Number")] }),
                  new TableCell({ children: [new Paragraph(c.caseIndexNo)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Petitioner (Plaintiff)")] }),
                  new TableCell({ children: [new Paragraph(c.petitionerParty)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Respondent (Defendant)")] }),
                  new TableCell({ children: [new Paragraph(c.respondentParty)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Advocate on Record")] }),
                  new TableCell({ children: [new Paragraph(c.advocateOnRecord)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Court / Judicial Forum")] }),
                  new TableCell({ children: [new Paragraph(c.judicialForum)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Filing Target Year")] }),
                  new TableCell({ children: [new Paragraph(String(c.filingYearTarget))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Case Status")] }),
                  new TableCell({ children: [new Paragraph(c.currentCaseStatus)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Current Upcoming Hearing")] }),
                  new TableCell({ children: [new Paragraph(upcomingText)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Next Scheduled Proceeding")] }),
                  new TableCell({ children: [new Paragraph(nextProceedingText)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Writ Classification")] }),
                  new TableCell({ children: [new Paragraph(`${c.classificationCategory} - ${c.writCaseType}`)] }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),
          
          // Section II
          new Paragraph({
            children: [
              new TextRun({
                text: "II. REGISTERED LITIGATING PARTIES",
                bold: true,
                size: 22,
                color: "1A1A1A",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Litigant Role", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full Legal Name", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Contact Information", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                   new TableCell({ children: [new Paragraph("Party Name")] }),
                   new TableCell({ children: [new Paragraph(c.petitionerParty)] }),
                   new TableCell({ children: [new Paragraph(c.petitionerContact || "client-contact@veritasbase.legal")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Respondent Party")] }),
                  new TableCell({ children: [new Paragraph(c.respondentParty)] }),
                  new TableCell({ children: [new Paragraph(c.respondentContact || "dept-legal-office@government.gov")] }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),

          // Section III
          new Paragraph({
            children: [
              new TextRun({
                text: "III. COURT HEARINGS TIMELINE METRICS",
                bold: true,
                size: 22,
                color: "1A1A1A",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hearing No.", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Outcome", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Remarks/Notes", bold: true })] })] }),
                ],
              }),
              ...([...(c.hearingHistory || [
                { hearingNo: 1, date: c.hearingDateStart, status: c.currentCaseStatus || "Notice", outcome: "Initial scheduling", remarks: "Dossier scheduled." }
              ])].sort((a, b) => a.hearingNo - b.hearingNo)).map(h => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Hearing No. ${h.hearingNo}`)] }),
                  new TableCell({ children: [new Paragraph(h.date || "-")] }),
                  new TableCell({ children: [new Paragraph(h.status || "-")] }),
                  new TableCell({ children: [new Paragraph(h.outcome || "-")] }),
                  new TableCell({ children: [new Paragraph(h.remarks || (h as any).notes || "-")] }),
                ],
              })),
            ],
          }),

          new Paragraph({ text: "" }),

          // Section IV
          new Paragraph({
            children: [
              new TextRun({
                text: "IV. PRIMARY RECORD ANALYSIS SUMMARY",
                bold: true,
                size: 22,
                color: "1A1A1A",
              }),
            ],
          }),
          new Paragraph({ text: c.caseSummary || "This legal case catalog represents a verified judicial motion filed under the administrative codes of the court forum. Veritas AI engine has compiled this timeline indexing to ensure optimal preparation for incoming hearings." }),

          new Paragraph({ text: "" }),

          // Section V
          new Paragraph({
            children: [
              new TextRun({
                text: "V. ADVOCATE HANDBOOK OBSERVATIONS",
                bold: true,
                size: 22,
                color: "1A1A1A",
              }),
            ],
          }),
          new Paragraph({ text: c.notes || "No supplementary remarks cataloged by the assigned advocate. Enter notes in the active case card panel to generate customized legal records." }),

          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "=================================================================================",
                color: "DDDDDD",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "VERITAS LEGAL INTELLIGENCE • CONFIDENTIAL LEGAL DOCUMENT",
                size: 14,
                color: "999999",
                bold: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Veritas_Legal_Dossier_${c.caseIndexNo.replace(/[\/()\- ]/g, "_")}.docx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
