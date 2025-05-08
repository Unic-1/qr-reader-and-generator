console.log("Background service worker started");

// Keep track of tabs where content scripts are injected
const tabsWithContentScripts = new Set();

// Listen for tab updates to track when to inject content scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject scripts when the tab is fully loaded
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("http")
  ) {
    console.log(
      `Tab ${tabId} loaded completely, checking for content script injection`
    );

    // Check if content scripts need to be injected
    if (!tabsWithContentScripts.has(tabId)) {
      injectContentScripts(tabId)
        .then(() => {
          tabsWithContentScripts.add(tabId);
          console.log(`Content scripts injected in tab ${tabId}`);
        })
        .catch((error) => {
          console.error(
            `Failed to inject content scripts in tab ${tabId}:`,
            error
          );
        });
    }
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabsWithContentScripts.delete(tabId);
});

// Function to inject content scripts
async function injectContentScripts(tabId) {
  try {
    // First inject jsQR.js dependency
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["jsQR.js"],
    });

    // Then inject content.js
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });

    // Apply styles if needed
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ["styles.css"],
    });

    return true;
  } catch (error) {
    console.error("Error injecting content scripts:", error);
    throw error;
  }
}
