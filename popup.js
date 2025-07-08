// @ts-nocheck
// popup.js

document.addEventListener('DOMContentLoaded', loadCart);

const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');
const itemQuantityInput = document.getElementById('itemQuantity');
const addItemBtn = document.getElementById('addItemBtn');
const scrapeProductBtn = document.getElementById('scrapeProductBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalElement = document.getElementById('cartTotal');
const buyAllBtn = document.getElementById('buyAllBtn');
const generateReceiptBtn = document.getElementById('generateReceiptBtn');
const receiptOutput = document.getElementById('receiptOutput');
const aiStatus = document.getElementById('aiStatus');
const scrapeStatus = document.getElementById('scrapeStatus'); // FIX: Ensure this matches the HTML ID

let cart = []; // In-memory cart state

// --- Cart Management Functions ---

function renderCart() {
    cartItemsList.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</span>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            `;
            cartItemsList.appendChild(li);
            total += item.price * item.quantity;
        });
    }
    cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    updateCartInStorage();
}

function updateCartInStorage() {
    chrome.storage.local.set({ unifiedCart: cart });
}

function loadCart() {
    chrome.storage.local.get(['unifiedCart'], (result) => {
        cart = result.unifiedCart || [];
        renderCart();
    });
}

function addItem(name, price, quantity) {
    if (!name || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
        // Ensure scrapeStatus exists before setting textContent
        if (scrapeStatus) {
            scrapeStatus.textContent = "Error: Invalid item details.";
            scrapeStatus.style.color = "red";
        }
        return;
    }
    const newItem = {
        id: Date.now(),
        name: name,
        price: parseFloat(price),
        quantity: parseInt(quantity)
    };
    cart.push(newItem);
    renderCart();
    // Clear inputs after adding
    itemNameInput.value = '';
    itemPriceInput.value = '';
    itemQuantityInput.value = 1;
    // Ensure status elements exist before clearing
    if (scrapeStatus) scrapeStatus.textContent = ''; // Clear status message
    if (receiptOutput) receiptOutput.textContent = ''; // Clear receipt
}

// --- Event Listeners ---

addItemBtn.addEventListener('click', () => {
    addItem(itemNameInput.value, itemPriceInput.value, itemQuantityInput.value);
});

cartItemsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const itemId = parseInt(event.target.dataset.id);
        cart = cart.filter(item => item.id !== itemId);
        renderCart();
        if (receiptOutput) receiptOutput.textContent = ''; // Clear receipt
    }
});

buyAllBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    alert("Simulated purchase initiated! In a real scenario, this would involve complex interactions with individual vendor checkouts, which is not feasible for a general extension.");
});

generateReceiptBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        if (aiStatus) {
            aiStatus.textContent = "Cart is empty. Nothing to generate.";
            aiStatus.style.color = "orange";
        }
        return;
    }
    if (aiStatus) {
        aiStatus.textContent = 'Generating receipt/itinerary...';
        aiStatus.style.color = "blue";
    }
    if (receiptOutput) receiptOutput.textContent = ''; // Clear previous output

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'generateReceipt',
            cart: cart
        });

        if (response && response.receipt) {
            if (receiptOutput) receiptOutput.textContent = response.receipt;
            if (aiStatus) {
                aiStatus.textContent = 'Generated successfully!';
                aiStatus.style.color = "green";
            }
        } else if (response && response.error) {
            if (receiptOutput) receiptOutput.textContent = `Error: ${response.error}`;
            if (aiStatus) {
                aiStatus.textContent = 'Generation failed.';
                aiStatus.style.color = "red";
            }
        }
    } catch (error) {
        console.error("Error sending message to background script:", error);
        if (receiptOutput) receiptOutput.textContent = `An unexpected error occurred.`;
        if (aiStatus) {
            aiStatus.textContent = 'Generation failed due to an internal error.';
            aiStatus.style.color = "red";
        }
    }
});

scrapeProductBtn.addEventListener('click', async () => {
    // FIX: Ensure scrapeStatus element exists before trying to modify it
    if (scrapeStatus) {
        scrapeStatus.textContent = "Attempting to scrape current page...";
        scrapeStatus.style.color = "blue";
    }

    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
            if (scrapeStatus) {
                scrapeStatus.textContent = "No active tab found.";
                scrapeStatus.style.color = "red";
            }
            return;
        }

        // Execute content script on the active tab
        const response = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
        });

        // The result of executeScript is an array, we expect one result from our content script
        if (response && response[0] && response[0].result) {
            const productData = response[0].result;
            if (productData.name) {
                itemNameInput.value = productData.name;
                itemPriceInput.value = productData.price || '';
                itemQuantityInput.value = productData.quantity || 1;
                if (scrapeStatus) {
                    scrapeStatus.textContent = "Product info scraped! Review and Add to Cart.";
                    scrapeStatus.style.color = "green";
                }
            } else {
                if (scrapeStatus) {
                    scrapeStatus.textContent = "No product info found on this page using generic selectors.";
                    scrapeStatus.style.color = "orange";
                }
            }
        } else {
            if (scrapeStatus) {
                scrapeStatus.textContent = "Failed to inject content script or get response.";
                scrapeStatus.style.color = "red";
            }
        }

    } catch (error) {
        console.error("Error during scraping:", error);
        if (scrapeStatus) {
            scrapeStatus.textContent = `Scraping error: ${error.message}`;
            scrapeStatus.style.color = "red";
        }
    }
});