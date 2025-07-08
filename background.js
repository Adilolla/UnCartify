// @ts-nocheck
// background.js

// IMPORTANT: Replace with your actual Gemini API key.
// Your current key is: AIzaSyCxbfBRZzKm8glnyf-K4pMLXmliWMcaRac
// For production, consider using a backend server to proxy requests
// and keep your API key secure.
const GEMINI_API_KEY = 'AIzaSyCxbfBRZzKm8glnyf-K4pMLXmliWMcaRac'; // <-- Your key is here now
// FIX: Changed v1beta to v1 in the API URL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateReceipt') {
        // Removed the problematic check for the key being equal to itself.
        // Now it only checks if the key is an empty string or undefined/null.
        if (!GEMINI_API_KEY) {
            sendResponse({ error: "Gemini API key is not configured (it's empty). Please set it in background.js" });
            return true; // Indicate that sendResponse will be called asynchronously
        }
        generateReceiptAI(request.cart)
            .then(receipt => sendResponse({ receipt: receipt }))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Indicate that sendResponse will be called asynchronously
    }
});

async function generateReceiptAI(cartItems) {
    const cartSummary = cartItems.map(item =>
        `${item.name} (Qty: ${item.quantity}, Price: $${item.price.toFixed(2)})`
    ).join('\n');

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

    const prompt = `
    You are an AI assistant tasked with generating a detailed receipt or a travel itinerary based on a list of items.
    If the items clearly indicate a trip (e.g., flights, hotels, tours), generate a brief itinerary.
    Otherwise, generate a formal receipt.

    Here are the items purchased/listed:
    ${cartSummary}

    Total Amount: $${total}

    Please generate either:
    1. A formal receipt including itemized list, quantity, unit price, total for each item, subtotal, and grand total. Add a small placeholder for Tax.
    2. A brief travel itinerary, if items are travel-related.

    Conclude with a friendly closing remark.

    Example Receipt Format:
    --- Receipt ---
    Date: ${new Date().toLocaleDateString()}
    Customer: Extension User

    Item             Qty   Unit Price   Total
    -------------------------------------------------
    [Item Name]      [X]   $[Y.YY]      $[Z.ZZ]
    ...
    -------------------------------------------------
    Subtotal:                             $[Total.Total]
    Tax (e.g., 8%):                       $[Tax.Amount]
    Grand Total:                          $[Grand.Total]

    Thank you for your purchase!

    Example Itinerary Format:
    --- Travel Itinerary ---
    Destination: [Implied Destination]
    Dates: [Implied Dates]

    Day 1: [Activity]
    Day 2: [Activity]
    ...

    Have a wonderful trip!
    `;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API error response:", errorData);
            throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || 'No receipt/itinerary generated.';

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}