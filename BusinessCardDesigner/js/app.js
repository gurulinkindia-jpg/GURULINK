/* =========================
   MAIN APP
========================= */

const defaultLogo =
  "data:image/svg+xml;base64," +
  btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" rx="90" fill="white"/>
  <circle cx="90" cy="90" r="78" fill="#1565c0"/>
  <text x="90" y="102" font-size="34" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">LOGO</text>
</svg>
`);

const defaultStudentPhoto =
  "data:image/svg+xml;base64," +
  btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="220">
  <rect width="180" height="220" rx="18" fill="white"/>
  <circle cx="90" cy="75" r="38" fill="#1565c0"/>
  <rect x="45" y="125" width="90" height="55" rx="25" fill="#1565c0"/>
  <text x="90" y="205" font-size="16" text-anchor="middle" fill="#1565c0" font-family="Arial">PHOTO</text>
</svg>
`);

let appState = {
  logo: defaultLogo,
  studentPhoto: defaultStudentPhoto,
  zoom: 1
};

function el(id) {
  return document.getElementById(id);
}

function getFormData() {
  return {
    cardType: el("cardTypeSelect") ? el("cardTypeSelect").value : "business",

    template: el("templateSelect").value,
    font: el("fontSelect").value,
    orientation: el("orientationSelect") ? el("orientationSelect").value : "horizontal",

    name: el("nameInput").value.trim(),
    title: el("titleInput").value.trim(),
    phone: el("phoneInput").value.trim(),
    email: el("emailInput").value.trim(),
    url: el("urlInput").value.trim(),
    address: el("addressInput").value.trim(),

    studentName: el("studentNameInput") ? el("studentNameInput").value.trim() : "",
    schoolName: el("schoolNameInput") ? el("schoolNameInput").value.trim() : "",
    className: el("classInput") ? el("classInput").value.trim() : "",
    rollNo: el("rollInput") ? el("rollInput").value.trim() : "",
    studentId: el("studentIdInput") ? el("studentIdInput").value.trim() : "",
    validUntil: el("validUntilInput") ? el("validUntilInput").value.trim() : "",
    guardianPhone: el("guardianPhoneInput") ? el("guardianPhoneInput").value.trim() : "",

    qrType: el("qrType").value,
    qrColor: el("qrColor").value,
    qrBgColor: el("qrBgColor").value,
    sheet: el("sheetSelect").value
  };
}

function updateCardType() {
  const data = getFormData();

  if (el("businessFields")) {
    el("businessFields").style.display =
      data.cardType === "student" ? "none" : "block";
  }

  if (el("studentFields")) {
    el("studentFields").style.display =
      data.cardType === "student" ? "block" : "none";
  }

  if (data.cardType === "student") {
    if (el("orientationSelect")) {
      el("orientationSelect").value = "vertical";
    }

    el("studentPhotoBlock").style.display = "block";
    el("studentExtraBlock").style.display = "block";

    el("phoneBlock").style.display = "none";
    el("emailBlock").style.display = "none";
    el("addressBlock").style.display = "none";
    el("urlBlock").style.display = "block";
  } else {
    el("studentPhotoBlock").style.display = "none";
    el("studentExtraBlock").style.display = "none";

    el("phoneBlock").style.display = "block";
    el("emailBlock").style.display = "block";
    el("addressBlock").style.display = "block";
    el("urlBlock").style.display = "block";
  }

  updateCard();
}

function updateCard() {
  const data = getFormData();

  const card = el("cardCanvas");
  card.className = `business-card ${data.template} ${data.font} ${data.orientation} ${data.cardType}-mode`;

  el("cardLogo").src = appState.logo;

  if (data.cardType === "student") {
    el("cardName").innerText = data.studentName || "Student Name";
    el("cardTitle").innerText = data.schoolName || "School / Institute Name";

    el("studentPhoto").src = appState.studentPhoto;

    el("studentExtraText").innerHTML = `
      Class: ${data.className || "-"}<br>
      Roll No: ${data.rollNo || "-"}<br>
      Student ID: ${data.studentId || "-"}<br>
      Valid Until: ${data.validUntil || "-"}<br>
      Guardian: ${data.guardianPhone || "-"}
    `;

    el("cardUrl").innerText = data.studentId
      ? "Scan QR to verify Student ID: " + data.studentId
      : "Scan QR to verify Student ID";
  } else {
    el("cardName").innerText = data.name || "Your Name";
    el("cardTitle").innerText = data.title || "Business / Profession";
    el("cardPhone").innerText = data.phone ? "📞 " + data.phone : "📞 Phone Number";
    el("cardEmail").innerText = data.email ? "✉️ " + data.email : "✉️ Email Address";
    el("cardAddress").innerText = data.address ? "📍 " + data.address : "📍 Address";
    el("cardUrl").innerText = data.url || "Scan QR to open digital business card";
  }

  updateQR();
}

function bindFormEvents() {
  const ids = [
    "cardTypeSelect",
    "templateSelect",
    "fontSelect",
    "orientationSelect",

    "nameInput",
    "titleInput",
    "phoneInput",
    "emailInput",
    "urlInput",
    "addressInput",

    "studentNameInput",
    "schoolNameInput",
    "classInput",
    "rollInput",
    "studentIdInput",
    "validUntilInput",
    "guardianPhoneInput",

    "qrType",
    "qrColor",
    "qrBgColor",
    "sheetSelect"
  ];

  ids.forEach(id => {
    const node = el(id);
    if (!node) return;

    node.addEventListener("input", updateCard);
    node.addEventListener("change", updateCard);
  });
}

function bindLogoUpload() {
  const logoInput = el("logoInput");
  const schoolLogoInput = el("schoolLogoInput");

  if (logoInput) {
    logoInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        appState.logo = e.target.result;
        el("cardLogo").src = appState.logo;
        updateCard();
      };

      reader.readAsDataURL(file);
    });
  }

  if (schoolLogoInput) {
    schoolLogoInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid school logo.");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        appState.logo = e.target.result;
        el("cardLogo").src = appState.logo;
        updateCard();
      };

      reader.readAsDataURL(file);
    });
  }
}

function bindStudentPhotoUpload() {
  const photoInput = el("studentPhotoInput");

  if (!photoInput) return;

  photoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid student photo.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      appState.studentPhoto = e.target.result;
      el("studentPhoto").src = appState.studentPhoto;
      updateCard();
    };

    reader.readAsDataURL(file);
  });
}

function zoomIn() {
  appState.zoom = Math.min(appState.zoom + 0.1, 1.8);
  applyZoom();
}

function zoomOut() {
  appState.zoom = Math.max(appState.zoom - 0.1, 0.5);
  applyZoom();
}

function applyZoom() {
  el("cardCanvas").style.transform = `scale(${appState.zoom})`;
  el("zoomLabel").innerText = Math.round(appState.zoom * 100) + "%";
}

function saveProject() {
  const data = {
    form: getFormData(),
    logo: appState.logo,
    studentPhoto: appState.studentPhoto,
    positions: getElementPositions()
  };

  localStorage.setItem("businessCardProject", JSON.stringify(data));
  alert("Project saved.");
}

function loadProject() {
  const saved = localStorage.getItem("businessCardProject");

  if (!saved) {
    alert("No saved project found.");
    return;
  }

  const project = JSON.parse(saved);
  const form = project.form || {};

  Object.keys(form).forEach(key => {
    const inputId = {
      cardType: "cardTypeSelect",
      template: "templateSelect",
      font: "fontSelect",
      orientation: "orientationSelect",

      name: "nameInput",
      title: "titleInput",
      phone: "phoneInput",
      email: "emailInput",
      url: "urlInput",
      address: "addressInput",

      studentName: "studentNameInput",
      schoolName: "schoolNameInput",
      className: "classInput",
      rollNo: "rollInput",
      studentId: "studentIdInput",
      validUntil: "validUntilInput",
      guardianPhone: "guardianPhoneInput",

      qrType: "qrType",
      qrColor: "qrColor",
      qrBgColor: "qrBgColor",
      sheet: "sheetSelect"
    }[key];

    if (inputId && el(inputId)) {
      el(inputId).value = form[key];
    }
  });

  if (project.logo) appState.logo = project.logo;
  if (project.studentPhoto) appState.studentPhoto = project.studentPhoto;

  updateCardType();

  if (project.positions) {
    setElementPositions(project.positions);
  }

  alert("Project loaded.");
}

function loadGurulinkPrefill() {
  const saved = localStorage.getItem("gurulinkBusinessCardPrefill");

  if (!saved) return;

  try {
    const profile = JSON.parse(saved) || {};

    if (el("cardTypeSelect")) el("cardTypeSelect").value = profile.cardType || "business";
    if (el("nameInput")) el("nameInput").value = profile.name || "";
    if (el("titleInput")) el("titleInput").value = profile.title || "";
    if (el("phoneInput")) el("phoneInput").value = profile.phone || "";
    if (el("emailInput")) el("emailInput").value = profile.email || "";
    if (el("urlInput")) el("urlInput").value = profile.url || "";
    if (el("addressInput")) el("addressInput").value = profile.address || "";

    if (profile.logo) {
      appState.logo = profile.logo;
      if (el("cardLogo")) {
        el("cardLogo").src = appState.logo;
      }
    }

    updateCardType();
    updateCard();
  } catch (err) {
    console.error("Business card prefill failed", err);
  } finally {
    localStorage.removeItem("gurulinkBusinessCardPrefill");
  }
}

function resetProject() {
  if (!confirm("Reset the project?")) return;

  localStorage.removeItem("businessCardProject");
  location.reload();
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initApp() {
  el("cardLogo").src = appState.logo;

  if (el("studentPhoto")) {
    el("studentPhoto").src = appState.studentPhoto;
  }

  bindFormEvents();
  bindLogoUpload();
  bindStudentPhotoUpload();
  initEditor();
  updateCardType();
  loadGurulinkPrefill();
  applyZoom();
}

document.addEventListener("DOMContentLoaded", initApp);
