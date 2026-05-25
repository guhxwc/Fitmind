export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("A chave de API do Groq (GROQ_API_KEY) não está configurada.");
    }

    const { model, contents, config } = req.body;

    // Map model request to a high-performance Groq model
    let mappedModel = "llama-3.1-8b-instant";
    const m = (model || "").toLowerCase();
    if (m.includes("pro") || m.includes("70b") || m.includes("gemini-3.1-pro")) {
      mappedModel = "llama-3.3-70b-versatile";
    }

    const messages: any[] = [];

    // Process systemInstruction if provided
    if (config?.systemInstruction) {
      let systemText = "";
      if (typeof config.systemInstruction === "string") {
        systemText = config.systemInstruction;
      } else if (config.systemInstruction.parts) {
        if (typeof config.systemInstruction.parts === "string") {
          systemText = config.systemInstruction.parts;
        } else if (Array.isArray(config.systemInstruction.parts)) {
          systemText = config.systemInstruction.parts.map((p: any) => p.text || "").join("\n");
        }
      }
      if (systemText) {
        messages.push({ role: "system", content: systemText });
      }
    }

    // Convert contents payload (supports string or Gemini parts array)
    if (typeof contents === "string") {
      messages.push({ role: "user", content: contents });
    } else if (Array.isArray(contents)) {
      for (const c of contents) {
        let role = c.role;
        if (role === "model") {
          role = "assistant";
        } else if (!role) {
          role = "user";
        }

        let contentStr = "";
        if (typeof c.parts === "string") {
          contentStr = c.parts;
        } else if (Array.isArray(c.parts)) {
          contentStr = c.parts.map((p: any) => p.text || "").join("\n");
        } else if (c.content) {
          contentStr = typeof c.content === "string" ? c.content : JSON.stringify(c.content);
        } else {
          contentStr = JSON.stringify(c);
        }

        messages.push({ role, content: contentStr });
      }
    } else if (contents) {
      messages.push({ role: "user", content: JSON.stringify(contents) });
    }

    // Match JSON output requirements
    const isJsonMode = 
      config?.responseMimeType === "application/json" || 
      (typeof contents === "string" && contents.toLowerCase().includes("json")) ||
      (Array.isArray(contents) && JSON.stringify(contents).toLowerCase().includes("json"));

    const payload: any = {
      model: mappedModel,
      messages: messages,
      temperature: 0.2,
    };

    if (isJsonMode) {
      payload.response_format = { type: "json_object" };
      const hasJsonInPrompt = messages.some(msg => msg.content.toLowerCase().includes("json"));
      if (!hasJsonInPrompt) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
          lastMsg.content += "\nRespond ONLY in valid raw JSON format.";
        }
      }
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const textContent = result.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      text: textContent
    });
  } catch (error: any) {
    console.error("Groq-proxied Serverless API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
