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
  populatePrintSheet();

  const printArea = el("printArea");
  const printTitle = "GURULINK Business Card Sheet";
  let printAreaReset = false;

  printArea.style.display = "block";
  document.title = printTitle;

  const resetPrintArea = () => {
    if (printAreaReset) return;
    printAreaReset = true;
    printArea.style.display = "";
  };

  window.addEventListener("afterprint", resetPrintArea, { once:true });

  if (
    typeof window.AndroidPrint !== "undefined" &&
    window.AndroidPrint &&
    typeof window.AndroidPrint.printPage === "function"
  ) {
    window.AndroidPrint.printPage(printTitle);
    setTimeout(resetPrintArea, 3000);
    return;
  }

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
