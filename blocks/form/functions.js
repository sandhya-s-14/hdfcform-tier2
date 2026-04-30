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
export {
  getFullName, days, submitFormArrayToString,
   maskMobileNumber,startOtpTimer,resendOtp,stopOtpTimer,initOtp
};
