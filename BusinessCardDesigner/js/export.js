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

function isMobileDesignerDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 850px)").matches;
}

function openBlobInCurrentTab(blob) {
  const blobUrl = URL.createObjectURL(blob);
  window.location.href = blobUrl;
}

async function deliverBlobFile(blob, filename, mimeType) {
  const canUseFile =
    typeof File !== "undefined";

  if (canUseFile && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: mimeType });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: filename,
          files: [file]
        });
        return;
      }
    } catch (err) {
      console.warn("Web Share file fallback skipped", err);
    }
  }

  if (isMobileDesignerDevice()) {
    openBlobInCurrentTab(blob);
    return;
  }

  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}

async function downloadPNG() {
  const canvas = await makeCardCanvas();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

  if (!blob) {
    alert("PNG export failed. Please try again.");
    return;
  }

  if (isMobileDesignerDevice() && !(navigator.canShare && typeof File !== "undefined")) {
    window.location.href = canvas.toDataURL("image/png");
    return;
  }

  await deliverBlobFile(blob, "business-card.png", "image/png");
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
  const blob = pdf.output("blob");

  await deliverBlobFile(blob, "single-business-card.pdf", "application/pdf");
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
  let pdf;
  let fileName;

  if (data.sheet === "a3" && data.orientation === "vertical") {
    pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a3"
    });

    pdf.addImage(img, "PNG", 0, 0, 297, 420);
    fileName = "A3-vertical-business-cards.pdf";
  }
  else if (data.sheet === "a3") {
    pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3"
    });

    pdf.addImage(img, "PNG", 0, 0, 420, 297);
    fileName = "A3-business-cards.pdf";
  }
  else if (data.sheet === "a4" && data.orientation === "vertical") {
    pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    pdf.addImage(img, "PNG", 0, 0, 210, 297);
    fileName = "A4-vertical-business-cards.pdf";
  }
  else {
    pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    pdf.addImage(img, "PNG", 0, 0, 297, 210);
    fileName = "A4-business-cards.pdf";
  }

  const blob = pdf.output("blob");

  await deliverBlobFile(blob, fileName, "application/pdf");
}
