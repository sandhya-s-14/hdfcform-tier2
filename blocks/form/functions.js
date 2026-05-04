/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
* Masks the first 5 digits of the mobile number with *
* @param {*} mobileNumber
* @returns {string} returns the mobile number with first 5 digits masked
*/
function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return '';
  }
  const value = mobileNumber.toString();
  // Mask first 5 digits and keep the rest
  return ` ${'*'.repeat(5)}${value.substring(5)}`;
}


/*-----------------------------------------------------------------------------------*/
/* ================= OTP TIMER ================= */

function startOtpTimer(globals) {
  const form = globals.form;
  const timerField = form.validate_otp.timer;
  const resendBtn = form.validate_otp.resend_otp;
  const validateBtn = form.validate_otp.validate_otp;

  let seconds = 5;

  if (!timerField) return;

  globals.functions.setProperty(resendBtn, { enabled: false });
  globals.functions.setProperty(validateBtn, { enabled: true });

  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
  }

  // ✅ Initial value
  globals.functions.setProperty(timerField, {
    value: seconds + " secs",
  });

  window.otpTimerInterval = setInterval(() => {
    seconds--;

    if (seconds > 0) {
      globals.functions.setProperty(timerField, {
        value: seconds + " secs",
      });
    }

    if (seconds === 0) {
      globals.functions.setProperty(timerField, {
        value: "1 sec",   // singular case
      });
    }

    if (seconds < 0) {
      clearInterval(window.otpTimerInterval);

      globals.functions.setProperty(timerField, {
        value: "Time expired",
      });

      globals.functions.setProperty(validateBtn, {
        enabled: false,
      });

      const attempts = window.otpAttempts || 0;

      if (attempts < 3) {
        globals.functions.setProperty(resendBtn, {
          enabled: true,
        });
      }
    }
  }, 1000);
}

/* ================= RESEND OTP ================= */

function resendOtp(globals) {
  console.log("🔥 resendOtp");

  const form = globals.form;
  const resendBtn = form.validate_otp.resend_otp;
  const timerField = form.validate_otp.timer;
  const attemptsField = form.validate_otp.attempts_text;

  let attempts = window.otpAttempts || 0;

  // ❗ Already exceeded
  if (attempts >= 3) {
    window.otpLockUntil = window.otpLockUntil || (Date.now() + 15 * 60 * 1000);

    alert("You have exceeded maximum OTP attempts. Please try again after 15 minutes.");

    globals.functions.setProperty(timerField, {
      value: "Maximum attempts reached",
    });

    globals.functions.setProperty(resendBtn, { enabled: false });

    globals.functions.setProperty(attemptsField, {
      value: "No attempts left",
    });

    // ✅ FORCE PANEL SWITCH
    globals.functions.setProperty(form.validate_otp, { _active: false });

    setTimeout(() => {
      globals.functions.setProperty(form.generate_otp, { _active: true });
    }, 100);

    return;
  }

  // ✅ Increment attempts
  attempts++;
  window.otpAttempts = attempts;

  const remaining = 3 - attempts;

  globals.functions.setProperty(attemptsField, {
    value:
      remaining > 0
        ? `${remaining} attempts left`
        : "No attempts left",
  });

  globals.functions.setProperty(resendBtn, { enabled: false });

  console.log("📩 OTP resent");

  // ❗ Hit limit now
 if (attempts >= 3) {
  window.otpLockUntil = Date.now() + 15 * 60 * 1000;

  alert("You have exceeded maximum OTP attempts. Please try again after 15 minutes.");

  // ❌ hide OTP panel
  globals.functions.setProperty(globals.form.validate_otp, {
    visible: false
  });

  // ✅ show Generate OTP panel
  globals.functions.setProperty(globals.form.generate_otp, {
    visible: true
  });

  return;
}

  startOtpTimer(globals);
}

/* ================= STOP TIMER ================= */

function stopOtpTimer() {
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }
}

/* ================= INIT OTP ================= */

function initOtp(globals) {
  const form = globals.form;
  const attemptsField = form.validate_otp.attempts_text;

  window.otpAttempts = 0;

  globals.functions.setProperty(attemptsField, {
    value: "3 attempts left",
    readOnly: true,
  });

  console.log("✅ OTP initialized");

  startOtpTimer(globals);
}
// eslint-disable-next-line import/prefer-default-export

/* ================= DEBUG ================= */

function debugForm(globals) {
  window.myForm = globals.form;
  console.log("myForm", window.myForm);
  return "";
}

/*---------------------------------bureaupage----------------------------------------------*/
/**
 * Returns bank logo based on value
 */
function getBankLogo(bank) {
  const logos = {
    hdfc_bank: "/content/dam/s_hdfc_capstone/hdfc.png",
    icici_bank: "/content/dam/s_hdfc_capstone/icici.png",
    axis_bank: "/content/dam/s_hdfc_capstone/axis.png",
    kotak: "/content/dam/s_hdfc_capstone/kotak.png",
    sbi: "/content/dam/s_hdfc_capstone/sbi.png",
    bank_of_baroda: "/content/dam/s_hdfc_capstone/bob.jpeg",
    idfc_first: "/content/dam/s_hdfc_capstone/idfc.png"
  };
  return logos[bank] || "";
}

/**
 * Creates bank item
 */
function createBankItem(option, select) {
  const item = document.createElement('div');
  item.className = 'bank-item';
  item.dataset.value = option.value;

  item.innerHTML = `
    <img src="${getBankLogo(option.value)}" alt="${option.text}">
    <span>${option.text}</span>
  `;

  item.addEventListener('click', function () {
    updateActiveBank(item, select);
  });

  return item;
}

/**
 * Update selection
 */
function updateActiveBank(selectedItem, select) {
  document.querySelectorAll('.bank-item').forEach(el => {
    el.classList.remove('active');
  });

  selectedItem.classList.add('active');
  select.value = selectedItem.dataset.value;
  select.dispatchEvent(new Event('change'));
}

/**
 * Create right-side dropdown
 */
function createOtherBankDropdown(select) {
  const dropdown = document.createElement('select');
  dropdown.className = 'bank-other-dropdown';

  const defaultValue = select.value || 'hdfc_bank';
const defaultOption = Array.from(select.options).find(o => o.value === defaultValue);

const option = document.createElement('option');
option.value = defaultOption.value;
option.text = defaultOption.text;
dropdown.appendChild(option);

  Array.from(select.options).forEach(opt => {
    if (!opt.value || opt.value === "other_bank") return;

    const option = document.createElement('option');
    option.value = opt.value;
    option.text = opt.text;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener('change', function () {
    select.value = dropdown.value;

    document.querySelectorAll('.bank-item').forEach(el => {
      el.classList.remove('active');
    });
  });

  return dropdown;
}

/**
 * Init UI
 */
function initBankSelection() {
  const select = document.querySelector("select[name='salary_bank']");
  if (!select || select.dataset.initialized) return;

  select.dataset.initialized = 'true';
  select.style.display = 'none';

  const container = document.createElement('div');
  container.className = 'bank-container';

  const left = document.createElement('div');
  left.className = 'bank-left';

  const row = document.createElement('div');
  row.className = 'bank-row';

  const defaultValue = select.value || 'hdfc_bank';
  const defaultOption = Array.from(select.options).find(o => o.value === defaultValue);

  // ✅ SHOW ONLY HDFC ICON
  const defaultItem = createBankItem(defaultOption, select);
  defaultItem.classList.add("active");
  row.appendChild(defaultItem);

  left.appendChild(row);

  // ✅ DROPDOWN (HDFC + OTHER BANK ONLY)
  const dropdown = document.createElement("select");
  dropdown.className = "bank-other-dropdown";

  const hdfcOpt = document.createElement("option");
  hdfcOpt.value = defaultOption.value;
  hdfcOpt.text = defaultOption.text;
  dropdown.appendChild(hdfcOpt);

  const otherOpt = document.createElement("option");
  otherOpt.value = "other_bank";
  otherOpt.text = "Other Bank";
  dropdown.appendChild(otherOpt);

  const right = document.createElement("div");
  right.className = "bank-right";
  right.appendChild(dropdown);

  container.appendChild(left);
  container.appendChild(right);

  select.parentNode.appendChild(container);

  // ✅ WHEN USER SELECTS "OTHER BANK"
  dropdown.addEventListener("change", function () {

    if (dropdown.value === "other_bank") {

      row.innerHTML = ""; // clear

      // show ALL bank icons
      Array.from(select.options).forEach(opt => {
         if (!opt.value || opt.value === "other_bank") return;

        const item = createBankItem(opt, select);
        row.appendChild(item);
      });

      // OPTIONAL: update dropdown to full list
      dropdown.innerHTML = "";
      Array.from(select.options).forEach(opt => {
        if (!opt.value || opt.value === "other_bank") return;

        const option = document.createElement("option");
        option.value = opt.value;
        option.text = opt.text;
        dropdown.appendChild(option);
      });

    } else {
      // normal selection
      select.value = dropdown.value;
    }
  });
}

/**
 * Default select
 */
function setDefaultBank(select, container) {
  const value = select.value || 'hdfc_bank';
  const active = container.querySelector(`[data-value="${value}"]`);
  if (active) active.classList.add('active');
}

/**
 * AEM safe init
 */
function observeBankField() {
  const observer = new MutationObserver(() => {
    if (document.querySelector("select[name='salary_bank']")) {
      initBankSelection();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

observeBankField();

/*======================EMI FUNCTION==================================================*/
/**
 * EMI Calculation (WORKS WITH YOUR RANGE.JS)
 */
function updateOfferEMI(globals) {
  try {
    // ✅ SAFE CHECK (important for your setup)
    if (!globals || typeof globals !== "object") {
      console.warn("Invalid globals:", globals);
      return;
    }

    const form = globals.form;
    if (!form) {
      console.warn("Form not found in globals");
      return;
    }

    // ✅ GET VALUES FROM HIDDEN INPUT (STRICT SELECTOR)
    const loanAmount = Number(
      document.querySelector('input[type="hidden"][name="loan_amount_slider"]')?.value
    ) || 0;

    const tenure = Number(
      document.querySelector('input[type="hidden"][name="loan_tenture_slider"]')?.value
    ) || 0;

    console.log("✅ Loan:", loanAmount, "Tenure:", tenure);

    if (!loanAmount || !tenure) return;

    // ✅ INTEREST
    const annualRate = 12;
    const monthlyRate = annualRate / (12 * 100);

    // ✅ EMI
    const emi =
      (loanAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);

    const emiRounded = Math.round(emi);

    const total = emiRounded * tenure;
    const interest = total - loanAmount;
    const tax = Math.round(interest * 0.18);

    // ✅ UPDATE UI
    globals.functions.setProperty(
      form.offer_page.avail_panel.avail_input,
      { value: "₹" + loanAmount.toLocaleString("en-IN") }
    );

    globals.functions.setProperty(
      form.offer_page.avail_panel.emi_input.emi_amount,
      { value: "₹" + emiRounded.toLocaleString("en-IN") }
    );

    globals.functions.setProperty(
      form.offer_page.avail_panel.emi_input.roi,
      { value: annualRate + "%" }
    );

    globals.functions.setProperty(
      form.offer_page.avail_panel.emi_input.tax,
      { value: "₹" + tax.toLocaleString("en-IN") }
    );

  } catch (e) {
    console.error("EMI ERROR:", e);
  }
}

export {
  getFullName, days, submitFormArrayToString,
   maskMobileNumber,startOtpTimer,resendOtp,stopOtpTimer,initOtp,
   debugForm,getBankLogo,
   createBankItem,updateActiveBank,createOtherBankDropdown,initBankSelection,observeBankField,
   updateOfferEMI
};
