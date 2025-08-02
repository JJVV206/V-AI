// DOM Elements
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const addFileBtn = document.getElementById("add-file-btn");
const cancelFileBtn = document.getElementById("cancel-file-btn");
const filePreview = document.querySelector(".file-preview");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const deleteChatsBtn = document.getElementById("delete-chats-btn");
const suggestionsItems = document.querySelectorAll(".suggestions-item");


const API_KEY = "AIzaSyBlsvOWlTml8usiWC8oKr-Y6Bfosev4CXg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;


let userMessage = "";
let chatHistory = [];
let currentFile = null;
let isDarkTheme = true;


const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const scrollToBottom = () => {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
};

const typingEffect = (response, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = response.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
        }
    }, 40);
};


const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload only images (JPEG, PNG, GIF, WebP) or PDF files.');
        return;
    }

    currentFile = file;
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            filePreview.src = event.target.result;
            filePreview.style.display = 'block';
            addFileBtn.style.display = 'none';
            cancelFileBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        filePreview.src = "Images/docicon.svg";
        filePreview.style.scale = 0.5;
        filePreview.style.display = 'block';
        addFileBtn.style.display = 'none';
        cancelFileBtn.style.display = 'block';
    }
};

const clearFileUpload = () => {
    currentFile = null;
    filePreview.src = '';
    filePreview.style.display = 'none';
    addFileBtn.style.display = 'block';
    cancelFileBtn.style.display = 'none';
};

const toggleTheme = () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme', !isDarkTheme);
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
};


const deleteAllChats = () => {
    if (chatsContainer.children.length === 0) return;
    
    if (confirm('Are you sure you want to delete all chats?')) {
        chatsContainer.innerHTML = '';
        chatHistory = [];
        scrollToBottom();
    }
};


const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");


    const requestPayload = {
        contents: [
            ...chatHistory,
            {
                role: "user",
                parts: currentFile ? [
                    { text: userMessage },
                    {
                        inline_data: {
                            mime_type: currentFile.type,
                            data: await fileToBase64(currentFile)
                        }
                    }
                ] : [
                    { text: userMessage }
                ]
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to generate response');
        }

        const responseText = data.candidates[0].content.parts[0].text.trim();
        typingEffect(responseText, textElement, botMsgDiv);
        
        chatHistory.push({ role: "user", parts: currentFile ? [
            { text: userMessage },
            {
                inline_data: {
                    mime_type: currentFile.type,
                    data: await fileToBase64(currentFile)
                }
            }
        ] : [{ text: userMessage }] });
        
        chatHistory.push({ role: "model", parts: [{ text: responseText }] });
        
    
        clearFileUpload();
        
    } catch (error) {
        console.error('API Error:', error);
        textElement.textContent = "Sorry, I encountered an error. Please try again.";
        botMsgDiv.classList.remove("loading");
    }
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};


const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value = "";

    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
        const botMsgHTML = `<img src="Images/gemini-logo.webp" alt="gemini-logo" class="avatar"><p class="message-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 600);
};


const handleSuggestionClick = (suggestionText) => {
    promptInput.value = suggestionText;
    promptInput.focus();
};


promptForm.addEventListener("submit", handleFormSubmit);

addFileBtn.addEventListener("click", () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', handleFileUpload);
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
});

cancelFileBtn.addEventListener("click", clearFileUpload);

themeToggleBtn.addEventListener("click", toggleTheme);

deleteChatsBtn.addEventListener("click", deleteAllChats);

suggestionsItems.forEach(item => {
    item.addEventListener("click", () => {
        const text = item.querySelector(".text").textContent;
        handleSuggestionClick(text);
    });
});


const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    isDarkTheme = false;
    document.body.classList.add('light-theme');
    themeToggleBtn.querySelector('.material-symbols-outlined').textContent = 'dark_mode';
}


const updateUI = () => {
    const hasChats = chatsContainer.children.length > 0;
    document.querySelector('.app-header').style.display = hasChats ? 'none' : 'block';
    document.querySelector('.suggestions').style.display = hasChats ? 'none' : 'flex';
};


updateUI();


const observer = new MutationObserver(updateUI);
observer.observe(chatsContainer, { childList: true });