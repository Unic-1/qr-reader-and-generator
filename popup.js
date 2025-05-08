document.addEventListener("DOMContentLoaded", function () {
  const sendMessageButton = document.getElementById("sendMessage");
  const scanQRButton = document.getElementById("scanQR");
  const selectQRButton = document.getElementById("selectQR");
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

    console.log("RESPONSE", response);

    if (response) {
      const qrList = document.createElement("ul");
      qrList.style.listStyleType = "none";
      qrList.style.margin = "0";
      qrList.style.padding = "0";

      const handleMouseEnter = (qrCode) => () => {
        sendContentMessage({
          action: "applySelectionOverlay",
          qrCode: qrCode,
        });
      };

      const handleMouseLeave = () => () => {
        sendContentMessage({
          action: "removeSelectionOverlay",
        });
      };

      response.qrCodes.forEach((qrCode) => {
        const qrListItem = document.createElement("li");
        qrListItem.style.position = "relative";
        qrListItem.style.cursor = "pointer";
        qrListItem.style.border = "1px solid #ccc";
        qrListItem.style.borderRadius = "5px";
        qrListItem.style.padding = "10px";
        qrListItem.style.margin = "10px 0";
        qrListItem.style.overflow = "hidden";
        qrListItem.style.whiteSpace = "nowrap";
        qrListItem.style.textOverflow = "ellipsis";

        const qrListItemContent = qrCode.data.startsWith("http")
          ? document.createElement("a")
          : document.createElement("span");
        qrListItemContent.href = qrCode.data.startsWith("http")
          ? qrCode.data
          : null;
        qrListItemContent.target = "_blank";
        qrListItemContent.rel = "noopener noreferrer";
        qrListItemContent.innerHTML = qrCode.data;

        qrListItem.addEventListener("mouseenter", handleMouseEnter(qrCode));
        qrListItem.addEventListener("mouseleave", handleMouseLeave());

        qrListItem.appendChild(qrListItemContent);
        qrList.appendChild(qrListItem);
      });

      responseDiv.innerHTML = "";
      responseDiv.appendChild(qrList);
    }
  });

  // Select QR button
  selectQRButton.addEventListener("click", async function () {
    responseDiv.textContent = "Initiating QR selection...";
    const response = await sendContentMessage(
      {
        action: "enableSelection",
      },
      () => {
        window.close();
      }
    );

    if (response) {
      responseDiv.textContent = "Selection enabled";
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
