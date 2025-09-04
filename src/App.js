import React, { useState, useEffect } from "react";
import "./App.css";
import "prismjs/themes/prism-tomorrow.css";
import Prism from "prismjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// load common languages
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-bash";

function App() {
  const [sessionId] = useState(() => Date.now().toString());
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(
        "https://kgnb1ea7la.execute-api.us-east-1.amazonaws.com/prod/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, prompt }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMsg = { role: "assistant", content: data.reply };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg = {
        role: "assistant",
        content: `Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setPrompt("");
  };

  return (
    <div className="chat-container">
      <h2>AI Assistant (Nova Pro)</h2>
      <p className="description">
        Powered by Amazon's Nova Pro model, this assistant provides intelligent,
        real-time responses with memory recall and improved CSS. Your chat history is stored to
        enhance follow-up conversations and context understanding.
      </p>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.role}`}>
            {msg.role === "assistant" ? (
              <ReactMarkdown
                children={msg.content}
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    if (inline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }

                    // FIX: handle children as string or array
                    const codeText = Array.isArray(children)
                      ? children.join("")
                      : children;

                    const copyToClipboard = () => {
                      navigator.clipboard.writeText(codeText).then(() => {
                        alert("Code copied to clipboard!");
                      });
                    };

                    return (
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={copyToClipboard}
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "8px",
                            padding: "2px 6px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: "#4CAF50",
                            color: "white",
                          }}
                        >
                          Copy
                        </button>
                        <pre>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                }}
              />
            ) : (
              <div>{msg.content}</div>
            )}
          </div>
        ))}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your message"
      />
      <button onClick={sendPrompt}>Send</button>
    </div>
  );
}

export default App;

