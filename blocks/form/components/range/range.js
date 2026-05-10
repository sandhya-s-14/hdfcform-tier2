/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */

/* ===== GLOBAL LIMIT ===== */
window.maxEligibleLoan = 1500000;

/* ===== LOAN LABELS ===== */
const LOAN_LABELS = [
  50000,
  200000,
  400000,
  600000,
  800000,
  1000000,
  1500000,
];

/* ===== TENURE ===== */
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== FORMAT ===== */
function formatINR(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function formatMonths(value) {
  return `${Math.round(value)} months`;
}

/* ===== CLICK ===== */
function enableTrackClick(wrapper, input) {
  wrapper.addEventListener('click', (e) => {
    if (e.target === input) return;

    const rect = input.getBoundingClientRect();

    const percent = (e.clientX - rect.left) / rect.width;

    input.value = percent * 100;

    input.dispatchEvent(
      new Event('input', { bubbles: true }),
    );
  });
}

/* ===== MAIN ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector('input');

  if (!input) return fieldDiv;

  const originalName = input.getAttribute('name');

  const isLoan = Number(input.getAttribute('max')) > 100000;

  const type = isLoan ? 'loan' : 'tenure';

  /*
   * ===== NORMALIZED RANGE =====
   */

  input.type = 'range';

  input.min = 0;

  input.max = 100;

  input.step = 0.1;

  /*
   * ===== DEFAULT =====
   */

  if (type === 'loan') {
    input.value = (
      (window.maxEligibleLoan - 50000)
      / (1500000 - 50000)
    ) * 100;
  } else {
    input.value = 100;
  }

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );

  Object.defineProperty(input, 'value', {
    get() {
      return this._actualValue
        ?? originalDescriptor.get.call(this);
    },

    set(val) {
      originalDescriptor.set.call(this, val);
    },
  });

  /*
   * ===== HIDDEN =====
   */

  const hidden = document.createElement('input');

  hidden.type = 'hidden';

  hidden.name = originalName;

  input.removeAttribute('name');

  /*
   * ===== WRAPPER =====
   */

  const wrapper = document.createElement('div');

  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  /*
   * ===== VALUE BOX =====
   */

  const valueBox = document.createElement('div');

  valueBox.className = 'loan-value-box';

  wrapper.appendChild(valueBox);

  /*
   * ===== LABELS =====
   */

  const labels = document.createElement('div');

  labels.className = 'range-labels';

  wrapper.appendChild(labels);

  /*
   * ===== BUILD LABELS =====
   */

  function buildLabels() {
    labels.innerHTML = '';

    if (type === 'loan') {
      LOAN_LABELS.forEach((val) => {
        if (val > window.maxEligibleLoan) return;

        const span = document.createElement('span');

        span.innerText = val === 50000
          ? '50K'
          : `${val / 100000}L`;

        const percent = (
          (val - 50000)
          / (1500000 - 50000)
        ) * 100;

        span.style.left = `${percent}%`;

        span.onclick = () => {
          const sliderPercent = (
            (val - 50000)
            / (1500000 - 50000)
          ) * 100;

          input.value = sliderPercent;

          input.dispatchEvent(
            new Event('input', { bubbles: true }),
          );
        };

        labels.appendChild(span);
      });
    } else {
      TENURE_STEPS.forEach((val, i) => {
        const span = document.createElement('span');

        span.innerText = `${val}m`;

        span.style.left = `${(
          i / (TENURE_STEPS.length - 1)
        ) * 100}%`;

        span.onclick = () => {
          input.value = (
            i / (TENURE_STEPS.length - 1)
          ) * 100;

          input.dispatchEvent(
            new Event('input', { bubbles: true }),
          );
        };

        labels.appendChild(span);
      });
    }
  }

  /*
   * ===== UPDATE UI =====
   */

  function updateUI() {
    buildLabels();

    const sliderPercent = Number(
      originalDescriptor.get.call(input),
    );

    let actualValue;

    /*
     * ===== LOAN =====
     */

    if (type === 'loan') {
      actualValue = 50000 + (
        ((window.maxEligibleLoan - 50000)
        * sliderPercent) / 100
      );

      /*
       * smooth values
       */

      actualValue = Math.round(actualValue / 1000) * 1000;

      if (actualValue > window.maxEligibleLoan) {
        actualValue = window.maxEligibleLoan;
      }
    } else {
      /*
       * ===== TENURE =====
       */

      const index = Math.round(
        ((TENURE_STEPS.length - 1)
        * sliderPercent) / 100,
      );

      actualValue = TENURE_STEPS[index];
    }

    /*
     * ===== VISUAL =====
     */

    wrapper.style.setProperty(
      '--percent',
      sliderPercent,
    );

    /*
     * ===== VALUE =====
     */

    valueBox.innerText = type === 'loan'
      ? formatINR(actualValue)
      : formatMonths(actualValue);

    valueBox.style.left = `calc(${sliderPercent}% - 20px)`;

    /*
     * ===== STORE =====
     */

    input._actualValue = actualValue;

    hidden.value = actualValue;

    hidden.dispatchEvent(
      new Event('change', { bubbles: true }),
    );
  }

  /*
   * ===== APPEND =====
   */

  wrapper.appendChild(input);

  wrapper.appendChild(hidden);

  /*
   * ===== EVENTS =====
   */

  input.addEventListener('input', updateUI);

  enableTrackClick(wrapper, input);

  /*
   * ===== INITIAL =====
   */

  requestAnimationFrame(() => {
    updateUI();
  });

  return fieldDiv;
}
