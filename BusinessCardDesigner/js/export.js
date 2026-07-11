async function makeCardCanvas() {
  updateCard();
  await wait(500);

  const card = el("cardCanvas");
  const oldTransform = card.style.transform;

  card.style.transform = "scale(1)";

  const canvas = await html2canvas(card, {
    scale: 4,
    backgroundColor: null,
    useCORS: true,
    allowTaint: true
  });

  card.style.transform = oldTransform;

  return canvas;
}

async function downloadPNG() {
  const canvas = await makeCardCanvas();

  const link = document.createElement("a");
  link.download = "business-card.png";
  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadSinglePDF() {
  const canvas = await makeCardCanvas();
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [85.6, 53.98]
  });

  pdf.addImage(img, "PNG", 0, 0, 85.6, 53.98);
  pdf.save("single-business-card.pdf");
}

async function downloadPrintPDF() {
  await buildPrintSheet();

  el("printArea").style.display = "block";
  await wait(700);

  const sheet = el("printSheet");

  const canvas = await html2canvas(sheet, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true
  });

  el("printArea").style.display = "";

  const img = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const data = getFormData();

  if (data.sheet === "a3" && data.orientation === "vertical") {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a3"
    });

    pdf.addImage(img, "PNG", 0, 0, 297, 420);
    pdf.save("A3-vertical-business-cards.pdf");
    return;
  }

  if (data.sheet === "a3") {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3"
    });

    pdf.addImage(img, "PNG", 0, 0, 420, 297);
    pdf.save("A3-business-cards.pdf");
    return;
  }

  if (data.sheet === "a4" && data.orientation === "vertical") {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    pdf.addImage(img, "PNG", 0, 0, 210, 297);
    pdf.save("A4-vertical-business-cards.pdf");
    return;
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  pdf.addImage(img, "PNG", 0, 0, 297, 210);
  pdf.save("A4-business-cards.pdf");
}