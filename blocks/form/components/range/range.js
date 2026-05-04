/* ===== Step Values ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Formatters ===== */
function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function formatMonths(value) {
  return Math.round(value) + " months";
}

/* ===== Get interpolated value ===== */
function getActualValue(index, stepsArray) {
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return stepsArray[lowerIndex];
  }

  const lowerValue = stepsArray[lowerIndex];
  const upperValue = stepsArray[upperIndex];

  return lowerValue + (upperValue - lowerValue) * (index - lowerIndex);
}

/* ===== Normalize ===== */
function normalizeValue(value, type) {
  return type === "loan"
    ? Math.round(value / 1000) * 1000
    : Math.round(value);
}

/* ===== Click on track ===== */
function enableTrackClick(wrapper, input) {
  wrapper.addEventListener("click", (e) => {
    if (e.target === input) return;

    const rect = input.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    const clamped = Math.max(0, Math.min(1, percent));
    const value = clamped * (input.max - input.min);

    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/* ===== Main ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");
  if (!input) return fieldDiv;

  const originalName = input.getAttribute("name");

  const originalMax = Number(input.getAttribute("max"));
  const isLoan = originalMax > 100000;

  const type = isLoan ? "loan" : "tenure";
  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Slider Setup ===== */
  input.type = "range";
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 0.01;

  input.value = stepsArray.length - 1;

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  );

  /* ===== SAFE OVERRIDE ===== */
  Object.defineProperty(input, "value", {
    get() {
      return this._actualValue ?? originalDescriptor.get.call(this);
    },
    set(val) {
      originalDescriptor.set.call(this, val);
      this._index = Number(val);
    }
  });

  /* ===== Hidden input ===== */
  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.name = originalName;

  input.removeAttribute("name");

  /* ===== Wrapper ===== */
  const wrapper = document.createElement("div");
  wrapper.className = "range-widget-wrapper decorated";

  input.after(wrapper);

  /* ===== Value Box ===== */
  const valueBox = document.createElement("div");
  valueBox.className = "loan-value-box";
  wrapper.appendChild(valueBox);

  /* ===== Labels ===== */
  const labels = document.createElement("div");
  labels.className = "range-labels";

  stepsArray.forEach((val, i) => {
    const span = document.createElement("span");

    span.innerText =
      (type === "loan"
        ? val === 50000
          ? "50K"
          : val / 100000 + "L"
        : val + "m") + " ";

    span.style.left = `${(i / (stepsArray.length - 1)) * 100}%`;

    span.addEventListener("click", () => {
      input.value = i;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    labels.appendChild(span);
  });

  /* ===== Update UI ===== */
  function updateUI() {
    const index = Number(originalDescriptor.get.call(input));

    const rawValue = getActualValue(index, stepsArray);
    const actualValue = normalizeValue(rawValue, type);

    const percent = (index / (stepsArray.length - 1)) * 100;

    wrapper.style.setProperty("--percent", percent);

    if (valueBox) {
      valueBox.innerText =
        type === "loan" ? formatINR(actualValue) : formatMonths(actualValue);

      valueBox.style.left = `calc(${percent}% - 20px)`;
    }

    // store actual value
    input._actualValue = actualValue;
    hidden.value = actualValue;

    // ✅ Correct AEM trigger
    hidden.dispatchEvent(new Event("change", { bubbles: true }));

    // lock slider
    originalDescriptor.set.call(input, index);
  }

  /* ===== Append ===== */
  wrapper.appendChild(input);
  wrapper.appendChild(hidden);
  wrapper.appendChild(labels);

  input.addEventListener("input", updateUI);
  enableTrackClick(wrapper, input);

  requestAnimationFrame(() => {
    updateUI();
  });

  return fieldDiv;
}