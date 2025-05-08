// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'selectionComplete') {
        // Forward the message to the popup if it's open
        chrome.runtime.sendMessage(request, (response) => {
            if (chrome.runtime.lastError) {
                // Popup might be closed, which is normal
                console.log('Popup is not available:', chrome.runtime.lastError.message);
            }
        });
    }
    
    // Always send a response
    sendResponse({ received: true });
    return true;
});
