function createPrintCard(index) {
  const data = getFormData();

  const wrap = document.createElement("div");
  wrap.className = "print-card-wrap";

  wrap.innerHTML = `
    <span class="crop tl"></span>
    <span class="crop tr"></span>
    <span class="crop bl"></span>
    <span class="crop br"></span>

   <div class="business-card print-card ${data.template} ${data.font} ${data.orientation}">
      <div class="decor decor-1"></div>
      <div class="decor decor-2"></div>

      <div class="card-element logo-block">
        <img class="card-logo" src="${appState.logo}">
      </div>

      <div class="card-element text-block name-block">
        <div>${safe(data.name || "Your Name")}</div>
      </div>

      <div class="card-element text-block title-block">
        <div>${safe(data.title || "Business / Profession")}</div>
      </div>

      <div class="card-element text-block phone-block">
        <div>${safe(data.phone ? "📞 " + data.phone : "📞 Phone Number")}</div>
      </div>

      <div class="card-element text-block email-block">
        <div>${safe(data.email ? "✉️ " + data.email : "✉️ Email Address")}</div>
      </div>

      <div class="card-element text-block address-block">
        <div>${safe(data.address ? "📍 " + data.address : "📍 Address")}</div>
      </div>

      <div class="card-element text-block url-block">
        <div>${safe(data.url || "Scan QR to open digital business card")}</div>
      </div>

      <div class="card-element qr-block">
        <div class="qr-frame">
          <div id="printQr${index}" class="print-qr"></div>
        </div>
      </div>
    </div>
  `;

  return wrap;
}

function populatePrintSheet() {
  updateCard();

  const data = getFormData();
  const sheet = el("printSheet");
  let count;

  if (data.orientation === "vertical") {
    count = data.sheet === "a3" ? 16 : 9;
  } else {
    count = data.sheet === "a3" ? 20 : 9;
  }

  sheet.innerHTML = "";
  sheet.className = "print-sheet " + data.sheet + (data.orientation === "vertical" ? " vertical-print" : "");

  for (let i = 1; i <= count; i++) {
    sheet.appendChild(createPrintCard(i));
  }

  for (let i = 1; i <= count; i++) {
    new QRCode(el("printQr" + i), {
      text: getQRContent(),
      width: 58,
      height: 58,
      colorDark: data.qrColor || "#000000",
      colorLight: data.qrBgColor || "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

async function buildPrintSheet() {
  populatePrintSheet();
  await wait(120);
}

function printSheet() {
  const printArea = el("printArea");
  const printTitle = "GURULINK Business Card Sheet";
  document.title = printTitle;

  if (
    typeof window.AndroidPrint !== "undefined" &&
    window.AndroidPrint &&
    typeof window.AndroidPrint.printPage === "function"
  ) {
    populatePrintSheet();
    printArea.style.display = "block";
    window.AndroidPrint.printPage(printTitle);
    setTimeout(() => {
      printArea.style.display = "";
    }, 3000);
    return;
  }

  const isMobile =
    typeof isMobileDesignerDevice === "function" &&
    isMobileDesignerDevice();

  if (isMobile && typeof downloadPrintPDF === "function") {
    const printButton = el("printPreviewBtn");
    const originalButtonText = printButton ? printButton.textContent : "Print / PDF";
    const previewWindow = window.open("", "_blank");

    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Preparing Business Card PDF</title>
          <style>
            body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef4ff;font-family:Arial,sans-serif;color:#0d47a1;text-align:center;padding:24px}
            strong{display:block;font-size:20px;margin-bottom:8px}
            span{color:#475569;font-size:14px}
          </style>
        </head>
        <body><div><strong>Preparing your PDF...</strong><span>Please wait. The print-ready card sheet will open here.</span></div></body>
        </html>
      `);
      previewWindow.document.close();
    }

    if (printButton) {
      printButton.disabled = true;
      printButton.textContent = "Preparing PDF...";
    }

    downloadPrintPDF(previewWindow)
      .catch(error => {
        console.error("Mobile print PDF failed", error);
        if (previewWindow && !previewWindow.closed) {
          previewWindow.close();
        }
        alert("Could not prepare the print PDF. Please try again.");
      })
      .finally(() => {
        if (printButton) {
          printButton.disabled = false;
          printButton.textContent = originalButtonText;
        }
      });
    return;
  }

  populatePrintSheet();
  let printAreaReset = false;

  printArea.style.display = "block";

  const resetPrintArea = () => {
    if (printAreaReset) return;
    printAreaReset = true;
    printArea.style.display = "";
  };

  window.addEventListener("afterprint", resetPrintArea, { once:true });

  window.focus();
  window.print();
  setTimeout(resetPrintArea, 5000);
}

function safe(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
