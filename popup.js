const fields = ['startUrl', 'maxPage', 'mainTag', 'lockSelector', 'valueSelector', 'outputCleaner'];
const output = document.getElementById('output');


chrome.storage.local.get('scrapedResults', (data) => {
  if (data.scrapedResults) {
    output.value = data.scrapedResults.join('\n') + '\n';
    console.log('[popup] Loaded saved scraped results');
  }
});

fields.forEach(id => {
  const input = document.getElementById(id);
  chrome.storage.local.get(id, (data) => {
    input.value = data[id] || '';
  });

  input.addEventListener('input', () => {
    chrome.storage.local.set({ [id]: input.value }, () => {
      console.log(`[popup] Saved to chrome.storage: ${id} = ${input.value}`);
    });
  });
});


document.getElementById('startBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ scrapingActive: true });
  console.log('[popup] Scraping started');

  const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab[0].id },
    func: () => {
      console.log('[content.js] Triggered by popup Start button');
      chrome.runtime.sendMessage({ type: 'startScraping' });
    }
  });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ scrapingActive: false });
  console.log('[popup] Scraping stopped');
  alert('Scraping stopped.');
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'updateOutput') {
    console.log('[popup] Received output update:', msg.data);

    output.value += msg.data.join('\n') + '\n';
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const text = document.getElementById('output').value;

  if (!text) {
    alert("No output to copy.");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    console.log('[popup] Output copied to clipboard');
    alert("Output copied!");
  }).catch(err => {
    console.error('[popup] Failed to copy output:', err);
    alert("Failed to copy.");
  });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the output?")) {
    document.getElementById('output').value = '';
    chrome.storage.local.remove('scrapedResults', () => {
      console.log('[popup] Output cleared and removed from storage');
    });
  }
});