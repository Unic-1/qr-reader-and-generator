# QR Code Reader Chrome Extension

This Chrome extension allows you to read QR codes on web pages. It provides two main features:
1. Scan all QR codes on the current page
2. Select a specific area to scan for QR codes

## Installation

1. Download the [jsQR library](https://github.com/cozmo/jsQR/releases) and place `jsQR.js` in the extension directory
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Choose one of two options:
   - "Scan All QRs on Page": Automatically detects and reads all QR codes on the current page
   - "Select Area to Scan": Allows you to draw a selection box around a specific area to scan

## Features

- Scans multiple QR codes simultaneously
- Interactive area selection for precise scanning
- Clickable results that copy to clipboard
- Simple and intuitive interface

## Dependencies

- [jsQR](https://github.com/cozmo/jsQR) - QR code reading library
