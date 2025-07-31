const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const API_KEY = "AIzaSyBlsvOWlTml8usiWC8oKr-Y6Bfosev4CXg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?
key=${API_KEY}`

let userMessage = "";
const chatHistory = [];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const generateResponse = async (botMsgHTML) => {
    const textElement = botMsgHTML.querySelector(".message-text")

chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }]
});

    try {
        const response = await fetch(API_URL, { 
            method: "POST",
            headers: {"content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].text.replace().trim();
        textElement.textContent = responseText;
    } catch(error) {
        console.log(error);
    }
}

const handlenFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    promptInput.value = "";

    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message")

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv)

    setTimeout(() => {
        const botMsgHTML = `<img src="gemini-logo.webp" alt="gemini-logo" class="avatar"><p class="message-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading")
        chatsContainer.appendChild(botMsgDiv) 
        generateResponse(botMsgHTML);
    }, 600)
}

promptForm.addEventListener("submit", handlenFormSubmit);