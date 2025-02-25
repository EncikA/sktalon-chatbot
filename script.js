const apiKey = "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";
const model = "mistralai/mixtral-8x7b-instruct";

async function performWebSearch(query) {
    const url = `https://duckduckgo.com/?q=${encodeURI(query)}&format=js`;
    const response = await fetch(url);
    const responseText = await response.text();
    const jsonString = responseText.substring(11, responseText.length - 1);
    const data = JSON.parse jsonString);
    const results = data.results;

    let searchResults = "";
    for (let i = 0; i < results.length; i++) {
        if (results[i].type === "R") {
            const title = results[i].title;
            const description = results[i].abstract;
            const url = results[i].url;
            searchResults += `${i+1}. Title: ${title} - Description: ${description} - URL: ${url}\n\n`;
            if (i >= 2) break; // Take only top 3 results
        }
    }
    return searchResults;
}

async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    addMessage("You: " + userInput, "user");
    document.getElementById("user-input").value = "";

    const searchResults = await performWebSearch(userInput);

    const systemMessage = `You are a helpful and respectful chatbot for SK Stalon. Your responses should be appropriate for a school environment, suitable for kids, parents, and teachers. Avoid any profanity, explicit content, or sensitive topics unless directly related to educational purposes.

    You have access to search results from the web, which are provided below. Use this information to provide accurate responses to the user's questions.

    Search Results:

    ${searchResults}

    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userInput }
                ]
            })
        });

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        addMessage("Bot: " + botReply, "bot");
    } catch (error) {
        addMessage("Bot: Sorry, something went wrong!", "bot");
        console.error(error);
    }
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender, "fade-in");
    messageDiv.innerHTML = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function() {
    addMessage("Bot: Hi, saya Jarvis Ai Chatbot untuk SK Stalon. Macam mana saya boleh bantu hari ini tuan?", "bot");
});
