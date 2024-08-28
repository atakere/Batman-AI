const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const initialHeight = chatInput.scrollHeight;
const API_KEY = "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";

const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor !== "&#9788;")
    themeButton.innerHTML =  document.body.classList.contains("light-mode")
    ? "&#9790"
    : "&#9788";

    const defaultText = `<div class="default-text">
            <h1>Batman AI </h1>
            <p> Start a conversation and explore the power of AI. <br> Your chat history will be displayed here.<p>
        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
};

loadDataFromLocalStorage();

const createElement = (html, className) => {
    // Create new div and apply chat, specified class and set html content of div   
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv; // Return the created chat div
}

async function query(incomingChatDiv) {
    const pElement = document.createElement("p");

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs:userText,
                    parameters: {
                        max_length: 150,
                        temperature: 0.7,
                        top_p: 0.65,
                        do_sample: true,
                    },
                }),
            }
        );

        const result = await response.json();
        const text =result[0].generated_text;
        const lines = text.split("\n");

        // Remove the first line (the question) and join the rest
        const responseWithoutQuestion = lines
            .slice(1)
            .join("\n")
            .trim()
            .replace(/\n/g, "<br>");
        incomingChatDiv.querySelector(".typing-animation").remove();
        pElement.innerHTML = JSON.stringify(responseWithoutQuestion).trim();
    }   catch (error) {
        incomingChatDiv.querySelector(".typing-animation").remove();
        pElement.classList.add("error");
        pElement.textContent = `${error}. Please try again later`;
    }
    
    // console.log(incomingChatDiv) 
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.innerHTML = "&check;";
    setTimeout(() => (copyBtn.innerHTML = "&#10064;"), 1000)
};

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./images/chatGPT.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)">&#10064;</span>
                 </div>`

    //Create an outgoing chat div with user's message and append it to chat container
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollTo)  
    query(incomingChatDiv); 
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); //Get chatInput value and remove extra spaces
    if(!userText) return;

    chatInput.value = ""
    chatInput.style.height = `${initialHeight}px`

    const html = `<div class="chat-content">
                <div class="chat-details">
                    <img src="./images/user.png" alt="user-img">
                    <p>${userText}</p>
                </div>
            </div>`;

    //Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    setTimeout(showTypingAnimation, 500);
}

themeButton.addEventListener("click", () => {
    const moonEntity = "&#9790;";
    const sunEntity = "&#9788;";

    document.body.classList.toggle("light-mode");
    localStorage.setItem(
        "theme-color",
        document.body.classList.contains("light-mode") ? moonEntity : sunEntity
    );

    themeButton.innerHTML = document.body.classList.contains("light-mode")
    ? moonEntity
    : sunEntity;
});

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
});

chatInput.addEventListener("Input", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger than 800 pixels, handle the outgoing chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
})

sendButton.addEventListener("click", handleOutgoingChat);