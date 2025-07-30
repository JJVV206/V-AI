const chatsContainer = document.querySelector(".chats-conainer");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

let userMessage = "";

const createMsgElement = (content, className) => {
    const div = document.createElement("div");
    div.classList.add("message", className);
    div.innerHTML = content;
    return div;
}

const handlenFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();

    if(!userMessage) return;

    const userMsgHTML = `<p class="message-text"></p>`
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message")

    userMsgDiv.querySelector("message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
}

promptForm.addEventListener("submit" , handlenFormSubmit);