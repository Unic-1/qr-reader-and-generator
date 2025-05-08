let selectionMode = false;
let selectionOverlay = null;

// Function to scan QR codes from an image
async function scanQRCode(imageData) {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code ? code.data : null;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Function to scan all images on the page
async function scanAllImages() {
  const images = document.querySelectorAll("img");
  const qrCodes = [];

  for (const img of images) {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrData = await scanQRCode(imageData);

      if (qrData) {
        qrCodes.push({
          data: qrData,
          position: img.getBoundingClientRect(),
        });
      }
    } catch (error) {
      console.error("Error scanning image:", error);
    }
  }

  return qrCodes;
}

// Function to scan a specific area
function scanArea(startX, startY, endX, endY) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  canvas.width = width;
  canvas.height = height;

  context.drawImage(
    document,
    Math.min(startX, endX),
    Math.min(startY, endY),
    width,
    height,
    0,
    0,
    width,
    height
  );

  const imageData = context.getImageData(0, 0, width, height);
  return scanQRCode(imageData);
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  if (request.action === "scanPage") {
    scanAllImages()
      .then((results) => {
        console.log("Scan results:", results);
        sendResponse({ qrCodes: results });
      })
      .catch((error) => {
        console.error("Scanning error:", error);
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (request.action === "enableSelection") {
    try {
      selectionMode = true;
      createSelectionOverlay();
      sendResponse({ success: true });
    } catch (error) {
      console.error("Selection error:", error);
      sendResponse({ error: error.message });
    }
    return true;
  }

  // If no matching action
  sendResponse({ error: "Unknown action" });
  return true;
});

// Create selection overlay
function createSelectionOverlay() {
  selectionOverlay = document.createElement("div");
  selectionOverlay.className = "selection-overlay";
  document.body.appendChild(selectionOverlay);

  let startX, startY;
  let selection = null;

  selectionOverlay.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    startY = e.clientY;

    selection = document.createElement("div");
    selection.style.position = "absolute";
    selection.style.border = "2px solid #4CAF50";
    selection.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
    selection.style.left = startX + "px";
    selection.style.top = startY + "px";
    selectionOverlay.appendChild(selection);
  });

  selectionOverlay.addEventListener("mousemove", (e) => {
    if (selection) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      selection.style.width = Math.abs(width) + "px";
      selection.style.height = Math.abs(height) + "px";
      selection.style.left = (width < 0 ? e.clientX : startX) + "px";
      selection.style.top = (height < 0 ? e.clientY : startY) + "px";
    }
  });

  selectionOverlay.addEventListener("mouseup", async (e) => {
    if (selection) {
      const result = await scanArea(
        parseInt(selection.style.left),
        parseInt(selection.style.top),
        parseInt(selection.style.left) + parseInt(selection.style.width),
        parseInt(selection.style.top) + parseInt(selection.style.height)
      );

      chrome.runtime.sendMessage({
        action: "selectionComplete",
        qrCode: result,
      });

      selectionOverlay.remove();
      selectionMode = false;
    }
  });
}
