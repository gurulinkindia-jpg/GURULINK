function getQRContent() {
  const data = getFormData();

  if (data.cardType === "student") {
    return `Student ID: ${data.studentId || "-"}
Name: ${data.studentName || "-"}
Class: ${data.className || "-"}
Roll: ${data.rollNo || "-"}
Phone: ${data.guardianPhone || "-"}`;
  }

  if (data.qrType === "url") {
    return data.url || "https://www.gurulink.co.in";
  }

  if (data.qrType === "phone") {
    return data.phone ? "tel:" + data.phone : "tel:+919876543210";
  }

  if (data.qrType === "email") {
    return data.email ? "mailto:" + data.email : "mailto:example@gmail.com";
  }

  if (data.qrType === "whatsapp") {
    const number = data.phone.replace(/\D/g, "");
    return number ? "https://wa.me/" + number : "https://wa.me/919876543210";
  }

  return `BEGIN:VCARD
VERSION:3.0
FN:${data.name || "Your Name"}
TITLE:${data.title || "Business / Profession"}
TEL:${data.phone || ""}
EMAIL:${data.email || ""}
ADR:${data.address || ""}
URL:${data.url || ""}
END:VCARD`;
}

function updateQR() {
  const box = el("qrPreview");
  if (!box) return;

  box.innerHTML = "";

  const data = getFormData();
  const qrSize = data.cardType === "student" ? 72 : 94;

  new QRCode(box, {
    text: getQRContent() || "https://www.gurulink.co.in",
    width: qrSize,
    height: qrSize,
    colorDark: data.qrColor || "#000000",
    colorLight: data.qrBgColor || "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

