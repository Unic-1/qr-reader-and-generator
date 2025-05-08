document.addEventListener("DOMContentLoaded", function () {
  const sendMessageButton = document.getElementById("sendMessage");
  const scanQRButton = document.getElementById("scanQR");
  const generateQRButton = document.getElementById("generateQR");
  const responseDiv = document.getElementById("response");

  // Function to send messages to content script with error handling
  async function sendContentMessage(message) {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        responseDiv.textContent = "No active tab found";
        return null;
      }

      // Make sure content script is loaded using the scripting API
      try {
        // First inject jsQR.js which is a dependency
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["jsQR.js"],
        });

        // Then inject content.js
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
        console.log("Content scripts injected");
      } catch (injectionError) {
        console.log("Content script injection issue:", injectionError);
        // This is expected if scripts are already injected, we continue
      }

      // Verify content script is loaded with a function
      try {
        const checkResult = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            return window.qrCodeContentScriptLoaded === true;
          },
        });

        if (!checkResult[0].result) {
          console.warn(
            "Content script flag not found, it may not be properly loaded"
          );
        } else {
          console.log("Content script verified as loaded");
        }
      } catch (checkError) {
        console.error("Error checking content script:", checkError);
      }

      // Now send the message
      console.log("Sending message to content script:", message);
      return await chrome.tabs.sendMessage(tab.id, message);
    } catch (error) {
      responseDiv.textContent = "Error: " + error.message;
      console.error("Error in communication:", error);
      return null;
    }
  }

  // Test connection button
  sendMessageButton.addEventListener("click", async function () {
    responseDiv.textContent = "Testing connection...";
    const response = await sendContentMessage({
      action: "greeting",
      message: "Hello from popup!",
    });

    if (response) {
      responseDiv.textContent =
        "Connection successful! Response: " + response.reply;
    } else {
      responseDiv.textContent = "Connection failed. Check console for details.";
    }
  });

  // Scan QR button
  scanQRButton.addEventListener("click", async function () {
    responseDiv.textContent = "Initiating QR scan...";
    const response = await sendContentMessage({
      action: "scanQR",
    });

    if (response) {
      responseDiv.textContent = "Scan status: " + response.status;
    }
  });

  // Generate QR button
  generateQRButton.addEventListener("click", async function () {
    const qrData = prompt("Enter text to encode in QR:", "https://example.com");
    if (!qrData) return;

    responseDiv.textContent = "Generating QR code...";
    const response = await sendContentMessage({
      action: "generateQR",
      data: qrData,
    });

    if (response) {
      responseDiv.textContent = "Generation status: " + response.status;
    }
  });
});
