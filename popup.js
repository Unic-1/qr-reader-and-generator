document.addEventListener("DOMContentLoaded", () => {
  const scanPageButton = document.getElementById("scanPage");
  const selectAreaButton = document.getElementById("selectArea");
  const qrList = document.getElementById("qrList");

  // Scan entire page for QR codes
  scanPageButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "scanPage" },
          (response) => {
            console.log();

            if (chrome.runtime.lastError) {
              //   console.error(
              //     "Error sending message:",
              //     chrome?.runtime?.lastError
              //   );
              return;
            }
            if (response && response.qrCodes) {
              displayResults(response.qrCodes);
            }
          }
        );
      }
    });
  });

  // Enable area selection mode
  selectAreaButton.addEventListener("click", () => {
    console.log("CLICKED selectAreaButton");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "enableSelection" },
          () => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
              return;
            }
            window.close(); // Close popup to allow selection
          }
        );
      }
    });
  });

  // Display QR code results
  function displayResults(qrCodes) {
    qrList.innerHTML = "";
    qrCodes.forEach((qr) => {
      const li = document.createElement("li");
      li.textContent = qr.data;
      li.addEventListener("click", () => {
        navigator.clipboard.writeText(qr.data);
        li.style.backgroundColor = "#90EE90";
        setTimeout(() => {
          li.style.backgroundColor = "";
        }, 500);
      });
      qrList.appendChild(li);
    });
  }
});

// Listen for selection results
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "selectionComplete" && request.qrCode) {
    displayResults([{ data: request.qrCode }]);
  }
});
