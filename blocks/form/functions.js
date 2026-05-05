/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
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
  const { form } = globals;
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
    value: `${seconds} secs`,
  });

  window.otpTimerInterval = setInterval(() => {
    seconds -= 1;

    if (seconds > 0) {
      globals.functions.setProperty(timerField, {
        value: `${seconds} secs`,
      });
    }

    if (seconds === 0) {
      globals.functions.setProperty(timerField, {
        value: '1 sec', // singular case
      });
    }

    if (seconds < 0) {
      clearInterval(window.otpTimerInterval);

      globals.functions.setProperty(timerField, {
        value: 'Time expired',
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
  console.log('🔥 resendOtp');

  const { form } = globals;
  const resendBtn = form.validate_otp.resend_otp;
  const timerField = form.validate_otp.timer;
  const attemptsField = form.validate_otp.attempts_text;

  let attempts = window.otpAttempts || 0;

  // ❗ Already exceeded
  if (attempts >= 3) {
    window.otpLockUntil = window.otpLockUntil || (Date.now() + 15 * 60 * 1000);

    alert('You have exceeded maximum OTP attempts. Please try again after 15 minutes.');

    globals.functions.setProperty(timerField, {
      value: 'Maximum attempts reached',
    });

    globals.functions.setProperty(resendBtn, { enabled: false });

    globals.functions.setProperty(attemptsField, {
      value: 'No attempts left',
    });

    // ✅ FORCE PANEL SWITCH
    globals.functions.setProperty(form.validate_otp, { _active: false });

    setTimeout(() => {
      globals.functions.setProperty(form.generate_otp, { _active: true });
    }, 100);

    return;
  }

  // ✅ Increment attempts
  attempts += 1;
  window.otpAttempts = attempts;

  const remaining = 3 - attempts;

  globals.functions.setProperty(attemptsField, {
    value:
      remaining > 0
        ? `${remaining} attempts left`
        : 'No attempts left',
  });

  globals.functions.setProperty(resendBtn, { enabled: false });

  console.log('📩 OTP resent');

  // ❗ Hit limit now
  if (attempts >= 3) {
    window.otpLockUntil = Date.now() + 15 * 60 * 1000;

    alert('You have exceeded maximum OTP attempts. Please try again after 15 minutes.');

    // ❌ hide OTP panel
    globals.functions.setProperty(globals.form.validate_otp, {
      visible: false,
    });

    // ✅ show Generate OTP panel
    globals.functions.setProperty(globals.form.generate_otp, {
      visible: true,
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
  const { form } = globals;
  const attemptsField = form.validate_otp.attempts_text;

  window.otpAttempts = 0;

  globals.functions.setProperty(attemptsField, {
    value: '3 attempts left',
    readOnly: true,
  });

  console.log('✅ OTP initialized');

  startOtpTimer(globals);
}
// eslint-disable-next-line import/prefer-default-export

/* ================= DEBUG ================= */

function debugForm(globals) {
  window.myForm = globals.form;
  console.log('myForm', window.myForm);
  return '';
}

/* ---------------------------------bureaupage----------------------------------------------*/
/**
 * Returns bank logo based on value
 */
function getBankLogo(bank) {
  const logos = {
    hdfc_bank: '/content/dam/s_hdfc_capstone/hdfc.png',
    icici_bank: '/content/dam/s_hdfc_capstone/icici.png',
    axis_bank: '/content/dam/s_hdfc_capstone/axis.png',
    kotak: '/content/dam/s_hdfc_capstone/kotak.png',
    sbi: '/content/dam/s_hdfc_capstone/sbi.png',
    bank_of_baroda: '/content/dam/s_hdfc_capstone/bob.jpeg',
    idfc_first: '/content/dam/s_hdfc_capstone/idfc.png',
  };
  return logos[bank] || '';
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

  item.addEventListener('click', () => {
    updateActiveBank(item, select);
  });

  return item;
}

/**
 * Update selection
 */
function updateActiveBank(selectedItem, select) {
  document.querySelectorAll('.bank-item').forEach((el) => {
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
  const defaultOption = Array.from(select.options).find((o) => o.value === defaultValue);

  const option = document.createElement('option');
  option.value = defaultOption.value;
  option.text = defaultOption.text;
  dropdown.appendChild(option);

  Array.from(select.options).forEach((opt) => {
    if (!opt.value || opt.value === 'other_bank') return;

    const option = document.createElement('option');
    option.value = opt.value;
    option.text = opt.text;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener('change', () => {
    select.value = dropdown.value;

    document.querySelectorAll('.bank-item').forEach((el) => {
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
  const defaultOption = Array.from(select.options).find((o) => o.value === defaultValue);

  // ✅ SHOW ONLY HDFC ICON
  const defaultItem = createBankItem(defaultOption, select);
  defaultItem.classList.add('active');
  row.appendChild(defaultItem);

  left.appendChild(row);

  // ✅ DROPDOWN (HDFC + OTHER BANK ONLY)
  const dropdown = document.createElement('select');
  dropdown.className = 'bank-other-dropdown';

  const hdfcOpt = document.createElement('option');
  hdfcOpt.value = defaultOption.value;
  hdfcOpt.text = defaultOption.text;
  dropdown.appendChild(hdfcOpt);

  const otherOpt = document.createElement('option');
  otherOpt.value = 'other_bank';
  otherOpt.text = 'Other Bank';
  dropdown.appendChild(otherOpt);

  const right = document.createElement('div');
  right.className = 'bank-right';
  right.appendChild(dropdown);

  container.appendChild(left);
  container.appendChild(right);

  select.parentNode.appendChild(container);

  // ✅ WHEN USER SELECTS "OTHER BANK"
  dropdown.addEventListener('change', () => {
    if (dropdown.value === 'other_bank') {
      row.innerHTML = ''; // clear

      // show ALL bank icons
      Array.from(select.options).forEach((opt) => {
        if (!opt.value || opt.value === 'other_bank') return;

        const item = createBankItem(opt, select);
        row.appendChild(item);
      });

      // OPTIONAL: update dropdown to full list
      dropdown.innerHTML = '';
      Array.from(select.options).forEach((opt) => {
        if (!opt.value || opt.value === 'other_bank') return;

        const option = document.createElement('option');
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

/*= =====================================EMI CALCULATION================================= */
/**
 * @param {scope} globals
 */
function getLoanAmountValue(globals) {
  const data = globals.functions.exportData();
  return Number(data.loan_amount_slider) || 0;
}

/**
 * @param {scope} globals
 */
function getTenureValue(globals) {
  const data = globals.functions.exportData();
  return Number(data.loan_tenture_slider) || 0;
}

/**
 * 🔹 FOR avail_input (Loan Amount display)
 * @param {scope} globals
 */
function loanAmount(globals) {
  const data = globals.functions.exportData();

  const val = Number(data.loan_amount_slider) || 1500000; // ✅ default

  return `₹${val.toLocaleString('en-IN')}`;
}

/**
 * 🔹 FOR emi_amount
 * @param {scope} globals
 */
function emi(globals) {
  const data = globals.functions.exportData();

  const loanAmount = Number(data.loan_amount_slider) || 1500000; // ✅ default

  const tenure = Number(data.loan_tenture_slider) || 84; // ✅ default

  const annualRate = 10.97;
  const r = annualRate / (12 * 100);

  const emiValue = (loanAmount * r * (1 + r) ** tenure)
    / ((1 + r) ** tenure - 1);

  return `₹${Math.round(emiValue).toLocaleString('en-IN')}`;
}

/**
 * 🔹 FOR roi
 * @param {scope} globals
 */
function roi() {
  return '10.97%';
}

/**
 * 🔹 FOR tax
 * @param {scope} globals
 */
function tax() {
  return '₹4,000';
}

/*= ====================================GENERATE OTP======================================= */
/* ================= GENERATE OTP ================= */
/**
 * @param {scope} globals
 */
function generateOTP(globals) {
  try {
    const data = globals.functions.exportData();

    const payload = {
      mobile: data.mobile_no || '',
      pan: data.pan_firstpage || null,
      dob: data.dob_firstpage || null,
    };

    if (!payload.mobile || (!payload.pan && !payload.dob)) {
      alert('Enter Mobile and PAN or DOB');
      return;
    }

    fetch('https://lugged-delay-rift.ngrok-free.dev/api/hdfc-tier2/generate-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        const { form } = globals;

        const otpField = form.validate_otp.enter_otp;
        const resendBtn = form.validate_otp.resend_otp;
        const attemptsField = form.validate_otp.attempts_text;

        // ✅ INIT only once
        if (window.otpTryCount === undefined) {
          window.otpTryCount = 0;
        }

        const remaining = 3 - window.otpTryCount;

        globals.functions.setProperty(attemptsField, {
          value:
            remaining > 0
              ? `${remaining} attempts left`
              : 'No attempts left',
        });

        // Autofill OTP (testing)
        if (result?.data?.otp) {
          globals.functions.setProperty(otpField, {
            value: String(result.data.otp),
          });
        }

        globals.functions.setProperty(resendBtn, { enabled: false });

        runOtpCountdown(globals);
      })
      .catch((err) => {
        console.error('Generate OTP Error:', err);
        alert('API Error');
      });
  } catch (e) {
    console.error(e);
  }
}

/* ================= TIMER ================= */
/**
 * @param {scope} globals
 */
function runOtpCountdown(globals) {
  const timerField = globals.form.validate_otp.timer;
  const resendBtn = globals.form.validate_otp.resend_otp;

  let seconds = 30;

  if (window.otpIntervalRef) {
    clearInterval(window.otpIntervalRef);
  }

  window.otpIntervalRef = setInterval(() => {
    seconds -= 1;

    if (seconds > 0) {
      globals.functions.setProperty(timerField, {
        value: `${seconds} sec`,
      });
    } else {
      clearInterval(window.otpIntervalRef);

      globals.functions.setProperty(timerField, {
        value: 'Resend available',
      });

      globals.functions.setProperty(resendBtn, {
        enabled: true,
      });
    }
  }, 1000);
}

/* ================= VALIDATE OTP ================= */
/**
 * @param {scope} globals
 */
function validateOTP(globals) {
  try {
    const data = globals.functions.exportData();

    const payload = {
      mobile: data.mobile_no || '',
      otp: data.enter_otp || '',
      pan: data.pan_firstpage || null,
      dob: data.dob_firstpage || null,
    };

    fetch('https://lugged-delay-rift.ngrok-free.dev/api/hdfc-tier2/validate-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        const { form } = globals;

        const attemptsField = form.validate_otp.attempts_text;
        const resendBtn = form.validate_otp.resend_otp;
        const timerField = form.validate_otp.timer;

        const addressField = form.customer_details.address_details.address_as_per_aadhaar_records;

        const addressTypeField = form.customer_details.address_details.aadhaar_address_type;

        console.log('API RESPONSE:', result);

        /* ================= SUCCESS ================= */
        if (result?.message?.toLowerCase().includes('validated')) {
          // stop timer
          if (window.otpIntervalRef) {
            clearInterval(window.otpIntervalRef);
          }

          // ✅ SET ADDRESS
          if (result?.data?.address) {
            globals.functions.setProperty(addressField, {
              value: result.data.address,
              readOnly: true,
            });

            // auto select BOTH
            globals.functions.setProperty(addressTypeField, {
              value: 'Both',
            });
          }

          // move to next panel
          globals.functions.setProperty(form.validate_otp, {
            _active: false,
          });

          globals.functions.setProperty(form.customer_details, {
            _active: true,
          });

          return;
        }

        /* ================= INVALID OTP ================= */

        window.otpTryCount = (window.otpTryCount || 0) + 1;

        const remaining = 3 - window.otpTryCount;

        globals.functions.setProperty(attemptsField, {
          value:
            remaining > 0
              ? `${remaining} attempts left`
              : 'No attempts left',
        });

        // stop timer immediately
        if (window.otpIntervalRef) {
          clearInterval(window.otpIntervalRef);
        }

        // enable resend
        globals.functions.setProperty(timerField, {
          value: 'Resend available',
        });

        globals.functions.setProperty(resendBtn, {
          enabled: true,
        });

        if (window.otpTryCount >= 3) {
          globals.functions.setProperty(resendBtn, {
            enabled: false,
          });

          globals.functions.setProperty(timerField, {
            value: 'Locked for 15 minutes',
          });

          alert('Maximum attempts reached. Try after 15 minutes.');
        } else {
          alert('Invalid OTP. Please try again.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('API Error ❌');
      });
  } catch (e) {
    console.error(e);
  }
}

/* ================= RESEND OTP ================= */
/**
 * @param {scope} globals
 */
function handleResendOtp(globals) {
  // ❗ DECREASE attempts on resend
  window.otpTryCount = (window.otpTryCount || 0) + 1;

  const remaining = 3 - window.otpTryCount;

  const attemptsField = globals.form.validate_otp.attempts_text;

  globals.functions.setProperty(attemptsField, {
    value:
      remaining > 0
        ? `${remaining} attempts left`
        : 'No attempts left',
  });

  // 🔒 LOCK
  if (window.otpTryCount >= 3) {
    alert('Max attempts reached. Please try again after 15 minutes.');
    return;
  }

  // ✅ Generate again
  generateOTP(globals);
}

export {
  getFullName, days, submitFormArrayToString,
  maskMobileNumber, startOtpTimer, resendOtp, stopOtpTimer, initOtp,
  debugForm, getBankLogo,
  createBankItem, updateActiveBank, createOtherBankDropdown, initBankSelection, observeBankField,
  getLoanAmountValue, getTenureValue, loanAmount, emi, roi, tax, generateOTP
  , validateOTP, handleResendOtp, runOtpCountdown,
};
