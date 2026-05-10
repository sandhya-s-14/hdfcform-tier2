/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */

/* ===== GLOBAL ===== */
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
  return `${value} months`;
}

/* ===== CLICK SUPPORT ===== */
function enableTrackClick(wrapper, input) {
  wrapper.addEventListener('click', (e) => {
    if (e.target === input) return;

    const rect = input.getBoundingClientRect();

    const percent = (e.clientX - rect.left) / rect.width;

    const min = Number(input.min);
    const max = Number(input.max);

    input.value = min + ((max - min) * percent);

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
   * ===== LOAN =====
   */

  if (type === 'loan') {
    input.type = 'range';

    input.min = 50000;

    input.max = window.maxEligibleLoan;

    input.step = 1000;

    input.value = input.max;
  } else {
    /*
     * ===== TENURE =====
     */

    input.type = 'range';

    input.min = 0;

    input.max = TENURE_STEPS.length - 1;

    input.step = 1;

    input.value = TENURE_STEPS.length - 1;
  }

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

        /*
         * fixed visual positions
         */

        const percent = (
          (val - 50000)
          / (1500000 - 50000)
        ) * 100;

        span.style.left = `${percent}%`;

        span.onclick = () => {
          input.value = val;

          input.dispatchEvent(
            new Event('input', { bubbles: true }),
          );
        };

        labels.appendChild(span);
      });
    } else {
      /*
       * ===== TENURE =====
       */

      TENURE_STEPS.forEach((val, i) => {
        const span = document.createElement('span');

        span.innerText = `${val}m`;

        span.style.left = `${(
          i / (TENURE_STEPS.length - 1)
        ) * 100}%`;

        span.onclick = () => {
          input.value = i;

          input.dispatchEvent(
            new Event('input', { bubbles: true }),
          );
        };

        labels.appendChild(span);
      });
    }
  }

  /*
   * ===== UPDATE =====
   */

  function updateUI() {
    /*
     * IMPORTANT
     * dynamically sync slider max
     */

    if (type === 'loan') {
      input.max = window.maxEligibleLoan;

      if (
        Number(input.value)
        > window.maxEligibleLoan
      ) {
        input.value = window.maxEligibleLoan;
      }
    }

    buildLabels();

    let actualValue;

    let percent;

    /*
     * ===== LOAN =====
     */

    if (type === 'loan') {
      actualValue = Number(input.value);

      /*
       * smooth values
       */

      actualValue = (
        Math.round(actualValue / 1000) * 1000
      );

      percent = (
        (actualValue - 50000)
        / (1500000 - 50000)
      ) * 100;
    } else {
      /*
       * ===== TENURE =====
       */

      const index = Number(input.value);

      actualValue = TENURE_STEPS[index];

      percent = (
        index / (TENURE_STEPS.length - 1)
      ) * 100;
    }

    /*
     * ===== VISUAL =====
     */

    wrapper.style.setProperty(
      '--percent',
      percent,
    );

    /*
     * ===== VALUE BOX =====
     */

    valueBox.innerText = type === 'loan'
      ? formatINR(actualValue)
      : formatMonths(actualValue);

    valueBox.style.left = `calc(${percent}% - 20px)`;

    /*
     * ===== STORE =====
     */

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

  input.addEventListener('change', updateUI);

  enableTrackClick(wrapper, input);

  /*
   * ===== INITIAL =====
   */

  requestAnimationFrame(() => {
    updateUI();
  });

  return fieldDiv;
}
