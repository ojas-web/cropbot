const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
apiKey: process.env.GROQ_API_KEY,
baseURL: "https://api.groq.com/openai/v1"
});

const messages = [
{
role: "system",
content: "You are a helpful AI assistant."
}
];

app.post("/chat", async (req, res) => {

```
try {

    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({
            reply: "No message provided."
        });
    }

    messages.push({
        role: "user",
        content: userMessage
    });

    const completion =
        await client.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages,
            temperature: 0.7,
            max_tokens: 1024
        });

    const reply =
        completion.choices?.[0]?.message?.content ||
        "No response generated.";

    messages.push({
        role: "assistant",
        content: reply
    });

    const MAX_HISTORY = 50;

    if (messages.length > MAX_HISTORY + 1) {

        messages.splice(
            1,
            messages.length - (MAX_HISTORY + 1)
        );
    }

    res.json({
        reply
    });

} catch (err) {

    console.error(
        err.response?.data ||
        err.message ||
        err
    );

    res.status(500).json({
        reply: "Server Error"
    });
}
```

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});


