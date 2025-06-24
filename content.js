(async () => {
  console.log('[content] Content script injected.');

  await new Promise(res => setTimeout(res, 2000)); 

  chrome.storage.local.get('scrapingActive', (data) => {
    if (!data.scrapingActive) {
      console.log('[content] Scraping is not active. Exiting script.');
      return; 
    }

    chrome.storage.local.get([
      'mainTag', 'lockSelector', 'valueSelector'
    ], (cfg) => {
      console.log('[content] Loaded config:', cfg);

      const elements = document.querySelectorAll(cfg.mainTag);
      console.log(`[content] Found ${elements.length} elements with tag ${cfg.mainTag}`);

      const filtered = Array.from(elements).filter(el => {
        if (!cfg.lockSelector) return true;
        if (cfg.lockSelector.startsWith('attr:')) {
          const attr = cfg.lockSelector.split(':')[1];
          return el.hasAttribute(attr);
        } else if (cfg.lockSelector.startsWith('class:')) {
          const className = cfg.lockSelector.split(':')[1];
          return el.classList.contains(className);
        } else if (cfg.lockSelector.startsWith('id:')) {
          const id = cfg.lockSelector.split(':')[1];
          return el.id === id;
        }
        return false;
      });

      console.log(`[content] Filtered ${filtered.length} elements after lockSelector`);

      const values = filtered.map(el => {
        if (cfg.valueSelector.startsWith('attr:')) {
          return el.getAttribute(cfg.valueSelector.split(':')[1]) || '';
        } else if (cfg.valueSelector.startsWith('class:')) {
          const className = cfg.valueSelector.split(':')[1];
          return el.querySelector(`.${className}`)?.innerText || '';
        } else if (cfg.valueSelector.startsWith('id:')) {
          const id = cfg.valueSelector.split(':')[1];
          return el.querySelector(`#${id}`)?.innerText || '';
        }
        return '';
      });

        const urlParams = new URLSearchParams(window.location.search);
        let currentPage = 1;

        for (const [key, value] of urlParams.entries()) {
            if (value.startsWith('SPG:')) {
                currentPage = parseInt(value.split('SPG:')[1], 10) || 1; 
                break;
            } else if (!isNaN(parseInt(value, 10))) { 
                currentPage = parseInt(value, 10);
                break; 
            }
        }
        console.log(`[content] Scraped ${values.length} values from page ${currentPage}`);

        chrome.runtime.sendMessage({ type: 'scrapedData', data: values, page: currentPage });
    });
  });
})();