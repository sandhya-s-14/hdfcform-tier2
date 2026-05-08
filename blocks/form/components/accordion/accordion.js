export function handleAccordionNavigation(panel, tab, forceOpen = false) {
  const accordionTabs = panel?.querySelectorAll(':scope > fieldset');

  accordionTabs.forEach((otherTab) => {
    if (otherTab !== tab) {
      otherTab.classList.add('accordion-collapse');
    }
  });

  if (forceOpen) {
    tab.classList.remove('accordion-collapse');
  } else {
    tab.classList.toggle('accordion-collapse');
  }
}

/* ===== Email Domain Chips ===== */

function styleEmailDomains(panel) {
  const domainWrapper = panel.querySelector(
    '.field-personal-email-domains p',
  );

  if (!domainWrapper) return;

  // Prevent duplicate chips
  if (domainWrapper.querySelector('.email-chip')) return;

  const text = domainWrapper.textContent.trim();

  // Split properly from continuous text
  const domains = text.match(
    /gmail\.com|outlook\.com|yahoo\.com/g,
  );

  if (!domains) return;

  // Clear existing text
  domainWrapper.innerHTML = '';

  domains.forEach((domain) => {
    const chip = document.createElement('span');

    chip.className = 'email-chip';

    chip.textContent = domain;

    domainWrapper.appendChild(chip);
  });
}

/* ===== MAIN ===== */

export default function decorate(panel) {
  panel.classList.add('accordion');

  const accordionTabs = panel?.querySelectorAll(':scope > fieldset');

  accordionTabs?.forEach((tab, index) => {
    tab.dataset.index = index;

    const legend = tab.querySelector(':scope > legend');

    legend?.classList.add('accordion-legend');

    // Collapse all except first
    if (index !== 0) {
      tab.classList.add('accordion-collapse');
    }

    legend?.addEventListener('click', () => {
      handleAccordionNavigation(panel, tab);
    });
  });

  // Wait for AEM render
  setTimeout(() => {
    styleEmailDomains(panel);
  }, 300);

  return panel;
}
