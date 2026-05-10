/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */

/* ===== GLOBAL LIMIT ===== */
window.maxEligibleLoan = 1500000;

/* ===== LABEL STEPS ONLY ===== */
const LOAN_LABELS = [
  50000,
  200000,
  400000,
  600000,
  800000,
  1000000,
  1500000,
];

/* ===== TENURE FIXED STEPS ===== */
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== FORMAT ===== */
function formatINR(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function formatMonths(value) {
  return `${Math.round(value)} months`;
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

  /* ===== RANGE CONFIG ===== */
  if (type === 'loan') {
    /*
     * REAL CONTINUOUS SLIDER
     * user can select:
     * 10L, 11L, 12L, 13L...
     */

    input.min = 50000;

    input.max = window.maxEligibleLoan;

    input.step = 1000;

    input.value = window.maxEligibleLoan;
  } else {
    /*
     * TENURE FIXED LABELS
     */

    input.min = 0;

    input.max = TENURE_STEPS.length - 1;

    input.step = 1;

    input.value = TENURE_STEPS.length - 1;
  }

  input.type = 'range';

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

  /* ===== HIDDEN ===== */
  const hidden = document.createElement('input');

  hidden.type = 'hidden';

  hidden.name = originalName;

  input.removeAttribute('name');

  /* ===== WRAPPER ===== */
  const wrapper = document.createElement('div');

  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  /* ===== VALUE BOX ===== */
  const valueBox = document.createElement('div');

  valueBox.className = 'loan-value-box';

  wrapper.appendChild(valueBox);

  /* ===== LABELS ===== */
  const labels = document.createElement('div');

  labels.className = 'range-labels';

  wrapper.appendChild(labels);

  /* ===== BUILD LABELS ===== */
  function buildLabels() {
    labels.innerHTML = '';

    /*
     * ===== LOAN LABELS =====
     * fixed visual labels only
     */
    if (type === 'loan') {
      LOAN_LABELS.forEach((val) => {
        /*
         * hide labels beyond eligibility
         */
        if (val > window.maxEligibleLoan) return;

        const span = document.createElement('span');

        span.innerText = val === 50000
          ? '50K'
          : `${val / 100000}L`;

        /*
         * FIXED POSITION
         * keeps spacing beautiful
         */
        const percent = (
          (val - 50000)
          / (1500000 - 50000)
        ) * 100;

        span.style.left = `${percent}%`;

        /*
         * click label
         */
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
       * ===== TENURE LABELS =====
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

  /* ===== UPDATE UI ===== */
  function updateUI() {
    buildLabels();

    let actualValue;

    /*
     * ===== LOAN =====
     * smooth continuous values
     */
    if (type === 'loan') {
      actualValue = Number(
        originalDescriptor.get.call(input),
      );

      /*
       * hard cap
       */
      if (actualValue > window.maxEligibleLoan) {
        actualValue = window.maxEligibleLoan;

        originalDescriptor.set.call(
          input,
          actualValue,
        );
      }
    } else {
      /*
       * ===== TENURE =====
       * fixed steps only
       */

      let index = Number(
        originalDescriptor.get.call(input),
      );

      index = Math.round(index);

      originalDescriptor.set.call(input, index);

      actualValue = TENURE_STEPS[index];
    }

    /*
     * ===== PERCENT =====
     */

    let percent;

    if (type === 'loan') {
      percent = (
        (actualValue - 50000)
        / (1500000 - 50000)
      ) * 100;
    } else {
      percent = (
        Number(originalDescriptor.get.call(input))
        / (TENURE_STEPS.length - 1)
      ) * 100;
    }

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

    input._actualValue = actualValue;

    hidden.value = actualValue;

    hidden.dispatchEvent(
      new Event('change', { bubbles: true }),
    );
  }

  /* ===== APPEND ===== */
  wrapper.appendChild(input);

  wrapper.appendChild(hidden);

  /* ===== EVENTS ===== */
  input.addEventListener('input', updateUI);

  enableTrackClick(wrapper, input);

  /* ===== INITIAL ===== */
  requestAnimationFrame(() => {
    updateUI();
  });

  return fieldDiv;
}
