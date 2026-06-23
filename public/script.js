const chat = document.getElementById("chat");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const input = document.getElementById("message");
const newChatBtn = document.getElementById("newChat");

let chatHistory = [];

function addMessage(text,type){

    const div = document.createElement("div");

    div.className = `message ${type}`;

    div.textContent = text;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;

    return div;
}

async function sendMessage(){

    const text = input.value.trim();

    if(!text) return;

    document.querySelector(".welcome")?.remove();

    addMessage(text,"user");

    input.value = "";

    const typing = addMessage(
        "Thinking...",
        "ai typing"
    );

    try{

        const response = await fetch("/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                message:text
            })

        });

        const data = await response.json();

        typing.remove();

       renderAIMessage(
          data.reply || "NO RESPONSE"
       );

        saveHistory(text);

    }catch(err){

        typing.textContent =
            "Error connecting to AI.";

        console.error(err);
    }
}

function saveHistory(text){

    const history =
        document.getElementById("history");

    const item =
        document.createElement("div");

    item.className =
        "history-item";

    item.textContent =
        text.substring(0,30);

    history.prepend(item);
}

sendBtn.addEventListener(
    "click",
    sendMessage
);

input.addEventListener(
    "keydown",
    e=>{
        if(e.key==="Enter"){
            sendMessage();
        }
    }
);

newChatBtn.addEventListener(
    "click",
    ()=>{

        chat.innerHTML=`
        <div class="welcome">
        <h1>How can I help today?</h1>
        </div>
        `;
    }
);

if(
    "webkitSpeechRecognition"
    in window
){

    const recognition =
        new webkitSpeechRecognition();

    recognition.lang="en-US";

    micBtn.onclick=()=>{
        recognition.start();
    };

    recognition.onresult=(e)=>{

        input.value=
            e.results[0][0].transcript;

        sendMessage();


    };

}



function renderAIMessage(text) {

    const div = document.createElement("div");
    div.className = "message ai";

    // Hide thinking blocks
    text = text.replace(
        /<think>([\s\S]*?)<\/think>/gi,
        (match, thinkText) => {

            const encoded =
                encodeURIComponent(thinkText);

            return `
            <div class="think-container">

                <div
                    class="think-header"
                    onclick="toggleThink(this)"
                >
                    🧠 Show Thinking
                </div>

                <div
                    class="think-content"
                    style="display:none;"
                >
                    ${escapeHtml(thinkText)}
                </div>

            </div>
            `;
        }
    );

    // Existing code block renderer
    text = text.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (match, lang, code) => {

            const encoded =
                encodeURIComponent(code);

            return `
            <div class="code-block">

                <div class="code-header">

                    <span>${lang || "code"}</span>

                    <div class="code-buttons">

                        <button onclick="copyCode(this)">
                            Copy
                        </button>

                        <button onclick="previewCode('${encoded}')">
                            Preview
                        </button>

                        <button onclick="downloadCode('${encoded}')">
                            Download
                        </button>

                    </div>

                </div>

                <pre><code>${escapeHtml(code)}</code></pre>

            </div>
            `;
        }
    );

    div.innerHTML = text;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
}
function escapeHtml(text){

    return text
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;");
}

function copyCode(btn){

    const code =
        btn.closest(".code-block")
           .querySelector("code")
           .textContent;

    navigator.clipboard.writeText(code);

    btn.innerText = "Copied!";

    setTimeout(()=>{
        btn.innerText="Copy";
    },1500);
}

function previewCode(code){

    const decoded =
        decodeURIComponent(code);

    const win =
        window.open();

    win.document.write(decoded);
}

function downloadCode(code){

    const decoded =
        decodeURIComponent(code);

    const blob =
        new Blob(
            [decoded],
            {type:"text/plain"}
        );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        "ai-code.txt";

    a.click();
}

function toggleThink(header){

    const content =
        header.nextElementSibling;

    const visible =
        content.style.display === "block";

    if(visible){

        content.style.display = "none";

        header.innerHTML =
            "Show Thinking";

    }else{

        content.style.display = "block";

        header.innerHTML =
            "Hide Thinking";
    }
}