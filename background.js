let config = {};
let allResults = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[background] Message received:', message);

  if (message.type === 'startScraping') {
    chrome.storage.local.set({ scrapingActive: true }, () => {
      chrome.storage.local.get([
        'startUrl', 'maxPage', 'mainTag', 'lockSelector', 'valueSelector'
      ], (items) => {
        config = items;
        allResults = [];

        const urlObj = new URL(config.startUrl);
        const searchParams = urlObj.searchParams;

        let spgFound = false;
        for (const [key, value] of searchParams.entries()) {
          if (value.startsWith('SPG:')) {
            const startNum = parseInt(value.split('SPG:')[1], 10) || 1;
            searchParams.set(key, startNum.toString()); 
            spgFound = true;
            break; 
          }
        }
        if (!spgFound) {
            let numParamFound = false;
            for (const [key, value] of searchParams.entries()) {
                if (!isNaN(parseInt(value, 10))) {
                    searchParams.set(key, '1'); 
                    numParamFound = true;
                    break;
                }
            }
            if (!numParamFound && Object.keys(config).includes('startUrl')) {
                console.warn("[background] No numeric or 'SPG:' page parameter found in startUrl. Ensure content.js can correctly infer page 1.");
            }
        }


        const updatedStartUrl = urlObj.toString();
        console.log('[background] Updated startUrl after SPG detection:', updatedStartUrl);

        config.startUrl = updatedStartUrl; 
        chrome.tabs.update(sender.tab.id, { url: updatedStartUrl });
      });
    });
  }

  if (message.type === 'scrapedData') {
    console.log(`[background] Data received from page ${message.page}:`, message.data);

    chrome.storage.local.get('outputCleaner', (data) => {
      let cleanedData = message.data;
      const outputCleanerRegexString = data.outputCleaner;
      if (outputCleanerRegexString) {
        try {
          const regex = new RegExp(outputCleanerRegexString, 'g');
          cleanedData = message.data.map(item => {
            const matches = [...item.matchAll(regex)];
            return matches.map(m => m[0]).join(' ') || item;
          });
          console.log('[background] Data cleaned:', cleanedData);
        } catch (e) {
          console.warn('[background] Invalid regex from storage, skipping cleaning:', outputCleanerRegexString);
        }
      }

      allResults.push(...cleanedData); 

      chrome.storage.local.set({ scrapedResults: allResults }, () => {
        console.log('[background] Updated scrapedResults in chrome.storage.local');
      });

      chrome.runtime.sendMessage({ type: 'updateOutput', data: cleanedData }); 

      const currentPage = message.page;
      if (currentPage < Number(config.maxPage)) {
        const nextPage = currentPage + 1;
        console.log(`[background] Navigating to next page: ${nextPage}`);

        setTimeout(() => {
          const currentUrl = new URL(config.startUrl);
          const searchParams = currentUrl.searchParams;

          let pageParamFound = false;
          for (const [key, value] of searchParams.entries()) {
            if (value.startsWith('SPG:') || !isNaN(parseInt(value, 10))) {
              searchParams.set(key, nextPage.toString());
              pageParamFound = true;
              break; 
            }
          }

          if (!pageParamFound) {
              console.warn(`[background] No page parameter found in URL ${config.startUrl} to update for next page. Ensure your URL structure supports pagination.`);
          }

          const nextUrl = currentUrl.toString();
          console.log(`[background] Next URL: ${nextUrl}`);
          chrome.tabs.update(sender.tab.id, { url: nextUrl });

        }, 3000);
      } else {
        console.log('[background] ✅ Scraping complete. Setting scrapingActive to false.');
        chrome.storage.local.set({ scrapingActive: false }, () => {  
            chrome.tabs.sendMessage(sender.tab.id, { type: 'scrapingComplete' });  
        });
      }
    });
  }

  return true;
});