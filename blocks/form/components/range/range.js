/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */

/* ===== GLOBAL LIMIT ===== */
window.maxEligibleLoan = 1500000;

/* ===== Steps ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Format ===== */
function formatINR(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function formatMonths(value) {
  return `${Math.round(value)} months`;
}

/* ===== Interpolation ===== */
function getActualValue(index, stepsArray) {
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return stepsArray[lower];

  return stepsArray[lower] + (stepsArray[upper] - stepsArray[lower]) * (index - lower);
}

/* ===== Normalize ===== */
function normalizeValue(value, type) {
  return type === 'loan'
    ? Math.round(value / 1000) * 1000
    : Math.round(value);
}

/* ===== Click Support ===== */
function enableTrackClick(wrapper, input) {
  wrapper.addEventListener('click', (e) => {
    if (e.target === input) return;

    const rect = input.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    input.value = percent * (input.max - input.min);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/* ===== MAIN ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector('input');
  if (!input) return fieldDiv;

  const originalName = input.getAttribute('name');

  const isLoan = Number(input.getAttribute('max')) > 100000;
  const type = isLoan ? 'loan' : 'tenure';

  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  input.type = 'range';
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 0.01;
  input.value = stepsArray.length - 1;

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );

  Object.defineProperty(input, 'value', {
    get() {
      return this._actualValue ?? originalDescriptor.get.call(this);
    },
    set(val) {
      originalDescriptor.set.call(this, val);
      this._index = Number(val);
    },
  });

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = originalName;

  input.removeAttribute('name');

  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  const valueBox = document.createElement('div');
  valueBox.className = 'loan-value-box';
  wrapper.appendChild(valueBox);

  const labels = document.createElement('div');
  labels.className = 'range-labels';

  stepsArray.forEach((val, i) => {
    const span = document.createElement('span');

    span.innerText = type === 'loan'
      ? (val === 50000 ? '50K' : `${val / 100000}L`)
      : `${val}m`;

    span.style.left = `${(i / (stepsArray.length - 1)) * 100}%`;

    span.onclick = () => {
      input.value = i;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    labels.appendChild(span);
  });

  /* ===== UPDATED LOGIC ===== */
  function updateUI() {
    const index = Number(originalDescriptor.get.call(input));

    const rawValue = getActualValue(index, stepsArray);
    const actualValue = normalizeValue(rawValue, type);

    /* 🔥 STRICT LIMIT WITHOUT SNAP BACK */
    if (type === 'loan' && window.maxEligibleLoan) {
      const maxIndex = stepsArray.findIndex(
        (val) => val >= window.maxEligibleLoan,
      );

      // ❗ Only block if user tries to exceed max
      if (index > maxIndex) {
        return; // 🚫 STOP movement (don't reset index)
      }
    }

    const percent = (index / (stepsArray.length - 1)) * 100;

    wrapper.style.setProperty('--percent', percent);

    if (valueBox) {
      valueBox.innerText = type === 'loan'
        ? formatINR(actualValue)
        : formatMonths(actualValue);

      valueBox.style.left = `calc(${percent}% - 20px)`;
    }

    input._actualValue = actualValue;
    hidden.value = actualValue;

    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }

  wrapper.appendChild(input);
  wrapper.appendChild(hidden);
  wrapper.appendChild(labels);

  input.addEventListener('input', updateUI);
  enableTrackClick(wrapper, input);

  requestAnimationFrame(updateUI);

  return fieldDiv;
}
