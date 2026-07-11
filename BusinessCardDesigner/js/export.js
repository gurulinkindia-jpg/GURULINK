let preparedExport = null;

function revokePreparedExportUrl() {
  if (preparedExport && preparedExport.url) {
    URL.revokeObjectURL(preparedExport.url);
  }
}

function closePreparedExport() {
  const modal = document.getElementById("mobileExportModal");

  if (modal) {
    modal.classList.remove("active");
  }

  revokePreparedExportUrl();
  preparedExport = null;
}

function showPreparedExport(title, text) {
  const modal = document.getElementById("mobileExportModal");
  const titleEl = document.getElementById("mobileExportTitle");
  const textEl = document.getElementById("mobileExportText");
  const shareBtn = document.getElementById("mobileExportShareBtn");

  if (!modal || !titleEl || !textEl) {
    return;
  }

  titleEl.textContent = title || "Export Ready";
  textEl.textContent = text || "Choose what you want to do with this file.";

  if (shareBtn) {
    const canUseFileShare =
      typeof File !== "undefined" &&
      navigator.canShare &&
      preparedExport &&
      navigator.canShare({
        files: [new File([preparedExport.blob], preparedExport.filename, { type: preparedExport.mimeType })]
      });

    shareBtn.style.display = canUseFileShare ? "inline-flex" : "none";
  }

  modal.classList.add("active");
}

function prepareMobileExport(blob, filename, mimeType, title, text) {
  revokePreparedExportUrl();

  preparedExport = {
    blob,
    filename,
    mimeType,
    url: URL.createObjectURL(blob)
  };

  showPreparedExport(title, text);
}

async function sharePreparedExport() {
  if (!preparedExport || typeof File === "undefined" || !navigator.canShare) {
    openPreparedExport();
    return;
  }

  try {
    const file = new File(
      [preparedExport.blob],
      preparedExport.filename,
      { type: preparedExport.mimeType }
    );

    if (!navigator.canShare({ files: [file] })) {
      openPreparedExport();
      return;
    }

    await navigator.share({
      title: preparedExport.filename,
      files: [file]
    });

    closePreparedExport();
  } catch (err) {
    console.warn("Mobile share failed", err);
    openPreparedExport();
  }
}

function openPreparedExport() {
  if (!preparedExport || !preparedExport.url) {
    return;
  }

  const opened = window.open(preparedExport.url, "_blank");

  if (!opened) {
    window.location.href = preparedExport.url;
  }
}

function downloadPreparedExport() {
  if (!preparedExport || !preparedExport.url) {
    return;
  }

  const link = document.createElement("a");
  link.href = preparedExport.url;
  link.download = preparedExport.filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getCardCaptureScale() {
  return isMobileDesignerDevice() ? 2.2 : 4;
}

function getSheetCaptureScale() {
  return isMobileDesignerDevice() ? 1.4 : 2;
}

async function makeCardCanvas() {
  updateCard();
  await wait(500);

  const card = el("cardCanvas");
  const oldTransform = card.style.transform;

  card.style.transform = "scale(1)";

  const canvas = await html2canvas(card, {
    scale: getCardCaptureScale(),
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

async function deliverBlobFile(blob, filename, mimeType) {
  if (isMobileDesignerDevice()) {
    prepareMobileExport(
      blob,
      filename,
      mimeType,
      "Export Ready",
      "Tap Share, Open, or Download for your exported file."
    );
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
    scale: getSheetCaptureScale(),
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

window.closePreparedExport = closePreparedExport;
window.sharePreparedExport = sharePreparedExport;
window.openPreparedExport = openPreparedExport;
window.downloadPreparedExport = downloadPreparedExport;
