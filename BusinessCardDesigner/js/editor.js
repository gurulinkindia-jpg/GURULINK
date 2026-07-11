let selectedElement = null;

function initEditor() {
  document.querySelectorAll(".card-element").forEach(item => {
    item.addEventListener("mousedown", startDrag);
    item.addEventListener("click", selectElement);
  });

  bindElementControls();
}

function selectElement(e) {
  e.stopPropagation();

  document.querySelectorAll(".card-element").forEach(x => x.classList.remove("selected"));

  selectedElement = e.currentTarget;
  selectedElement.classList.add("selected");

  el("selectedInfo").innerText = "Selected: " + selectedElement.id;

  const style = window.getComputedStyle(selectedElement);
  el("fontSizeControl").value = parseInt(style.fontSize) || 16;
  el("widthControl").value = parseInt(style.width) || 200;
}

function startDrag(e) {
  if (e.target.tagName === "INPUT") return;

  selectElement(e);

  const target = e.currentTarget;
  const card = el("cardCanvas").getBoundingClientRect();

  const startX = e.clientX;
  const startY = e.clientY;
  const startLeft = target.offsetLeft;
  const startTop = target.offsetTop;

  function move(ev) {
    const dx = (ev.clientX - startX) / appState.zoom;
    const dy = (ev.clientY - startY) / appState.zoom;

    target.style.left = Math.max(0, Math.min(540 - target.offsetWidth, startLeft + dx)) + "px";
    target.style.top = Math.max(0, Math.min(340 - target.offsetHeight, startTop + dy)) + "px";
    target.style.right = "auto";
    target.style.bottom = "auto";
  }

  function stop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", stop);
}

function bindElementControls() {
  el("fontSizeControl").addEventListener("input", function () {
    if (!selectedElement) return;
    selectedElement.style.fontSize = this.value + "px";
  });

  el("textColorControl").addEventListener("input", function () {
    if (!selectedElement) return;
    selectedElement.style.color = this.value;
  });

  el("widthControl").addEventListener("input", function () {
    if (!selectedElement) return;
    selectedElement.style.width = this.value + "px";
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".card-element") && !e.target.closest(".right-panel")) {
      document.querySelectorAll(".card-element").forEach(x => x.classList.remove("selected"));
      selectedElement = null;
      el("selectedInfo").innerText = "No element selected";
    }
  });
}

function bringSelectedForward() {
  if (!selectedElement) return;
  selectedElement.style.zIndex = Number(selectedElement.style.zIndex || 5) + 1;
}

function sendSelectedBackward() {
  if (!selectedElement) return;
  selectedElement.style.zIndex = Math.max(2, Number(selectedElement.style.zIndex || 5) - 1);
}

function deleteSelected() {
  if (!selectedElement) return;
  selectedElement.style.display = "none";
  selectedElement = null;
}

function getElementPositions() {
  const data = {};
  document.querySelectorAll(".card-element").forEach(item => {
    data[item.id] = {
      left: item.style.left,
      top: item.style.top,
      right: item.style.right,
      bottom: item.style.bottom,
      width: item.style.width,
      fontSize: item.style.fontSize,
      color: item.style.color,
      zIndex: item.style.zIndex,
      display: item.style.display
    };
  });
  return data;
}

function setElementPositions(data) {
  Object.keys(data).forEach(id => {
    const item = el(id);
    if (!item) return;
    Object.assign(item.style, data[id]);
  });
}