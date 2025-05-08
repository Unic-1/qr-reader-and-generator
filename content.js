console.log("QR Code content script loaded!");

// Add a flag to indicate content script is loaded
window.qrCodeContentScriptLoaded = true;

// Function to handle async operations with proper response
function handleAsyncOperation(sendResponse, operation) {
  // Create a promise to handle the async operation
  const promise = new Promise((resolve) => {
    // Simulate async work (replace with your actual async QR code operations)
    setTimeout(() => {
      resolve(operation());
    }, 500);
  });

  // Chain the promise to send the response when done
  promise.then((result) => {
    sendResponse(result);
  });

  // Return true to keep the message channel open for the async response
  return true;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message received in content script:", request);

  if (request.action === "greeting") {
    // Simple synchronous response
    console.log("Received greeting message:", request.message);
    sendResponse({ reply: "Hello from the content script!" });
    return true;
  }

  // QR code specific actions with async handling
  if (request.action === "scanQR") {
    console.log("QR scan requested");
    return handleAsyncOperation(sendResponse, () => {
      // Your actual QR scanning implementation would go here
      // For example, capturing the webpage, processing with jsQR, etc.
      console.log("QR scanning completed");
      return { status: "Scanning completed", result: "https://example.com" };
    });
  }

  if (request.action === "generateQR") {
    console.log("QR generation requested with data:", request.data);
    return handleAsyncOperation(sendResponse, () => {
      // Your actual QR generation implementation would go here
      console.log("QR generation completed for:", request.data);
      return { status: "Generation completed", data: request.data };
    });
  }

  // Always return true for async message handling
  return true;
});
