function applyTemplate(templateName) {
  const data = getFormData();
  el("cardCanvas").className = `business-card ${templateName} ${data.font}`;
}

function resetElementLayout() {
  const positions = {
    logoBlock: {
      left: "26px",
      top: "26px",
      width: "82px",
      height: "82px"
    },
    nameBlock: {
      left: "124px",
      top: "33px",
      width: "330px"
    },
    titleBlock: {
      left: "124px",
      top: "76px",
      width: "330px"
    },
    phoneBlock: {
      left: "26px",
      top: "145px",
      width: "330px"
    },
    emailBlock: {
      left: "26px",
      top: "177px",
      width: "330px"
    },
    addressBlock: {
      left: "26px",
      top: "209px",
      width: "330px"
    },
    urlBlock: {
      left: "26px",
      bottom: "26px",
      width: "335px"
    },
    qrBlock: {
      right: "26px",
      bottom: "26px",
      width: "112px",
      height: "112px"
    }
  };

  Object.keys(positions).forEach(id => {
    const item = el(id);
    if (!item) return;

    item.removeAttribute("style");
    Object.assign(item.style, positions[id]);
  });

  updateCard();
}

document.addEventListener("DOMContentLoaded", function () {
  const templateSelect = el("templateSelect");

  if (templateSelect) {
    templateSelect.addEventListener("change", function () {
      applyTemplate(this.value);
    });
  }
});