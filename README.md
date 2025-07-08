Unified Cart Extension
A Smarter Way to Shop and Plan
The Unified Cart Extension is a browser tool that helps you gather items from any website into a single cart. Whether you're shopping across multiple stores or planning a trip, this extension keeps everything organized in one place and can generate a receipt or itinerary when you're ready.

Features
Universal Cart
Manually add items from any website by entering the name, price, and quantity.

Smart Scraping
On a product page, click a button and the extension will attempt to auto-fill the product name and price. Works on many sites, but not guaranteed on all due to differences in how websites are built.

AI-Powered Receipt or Itinerary Generation
Once your cart is filled, the extension uses Google Gemini to create a clear, itemized receipt. If your cart contains travel-related items (like hotels or flights), it will instead generate a basic travel itinerary.

Simulated Checkout
You can simulate a full checkout experience by clicking a button. This doesn’t process payments, but demonstrates what a unified checkout could look like.

Installation Instructions
Download the Files
Make sure you have all the required files in a single folder:
manifest.json, popup.html, popup.js, background.js, content-script.js, popup.css, hello_extensions.png

Open Chrome Extensions Page

Open Chrome and go to chrome://extensions/

Turn on Developer Mode (top right corner)

Load the Extension

Click the Load unpacked button

Select the folder containing the extension files

Confirm Installation
The extension should now appear in your extensions list. You may also see the cart icon in your browser toolbar (pin it using the puzzle icon if needed).

How to Use
Open the Extension
Click the Unified Cart Extension icon in your browser toolbar.

Add Items to Cart

Manually: Enter the item name, price, and quantity, then click "Add to Cart"

Using Scrape: Navigate to a product page and click "Scrape Product Info" to auto-fill name and price (if detected), then click "Add to Cart"

Manage Your Cart

View added items in the "Your Unified Cart" section

Click "Remove" to delete an item

The total updates automatically

Simulate Checkout
Click the "Simulated Buy All" button to test a checkout flow (for demonstration purposes only)

Generate Receipt or Itinerary

Click "Generate Receipt/Itinerary (AI)"

The extension will generate and display a formatted receipt or travel itinerary in the output section

Important Notes
Gemini API Key Required
You need a valid Gemini API key for AI receipt/itinerary generation. Add your key in background.js. Without it, this feature will not work.

Scraping Limitations
Since every website is different, scraping might not work perfectly on all product pages. Manual entry is always available as a fallback.

Reload After Changes
If you edit any extension files (like updating your API key), go to chrome://extensions/ and click the reload icon on the extension card. If issues continue, remove and re-add the extension.

