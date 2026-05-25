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

    if (config?.responseSchema) {
       messages.push({ role: "system", content: `You must return your response in the following JSON schema format: ${JSON.stringify(config.responseSchema)}` });
    }

    // Convert contents payload (supports string or Gemini parts array)
    let hasImage = false;

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

        if (typeof c.parts === "string") {
          messages.push({ role, content: c.parts });
        } else if (Array.isArray(c.parts)) {
          const hasInlineData = c.parts.some((p: any) => p.inlineData);
          if (hasInlineData) {
            const contentArray: any[] = [];
            let hasImageInPart = false;
            let audioText = "";
            let regularText = "";
            
            for (const p of c.parts) {
              if (p.text) {
                regularText += p.text + "\n";
                contentArray.push({ type: "text", text: p.text });
              } else if (p.inlineData) {
                if (p.inlineData.mimeType.startsWith("audio/")) {
                   // Transcribe audio using Groq Whisper
                   const buffer = Buffer.from(p.inlineData.data, 'base64');
                   const blob = new Blob([buffer], { type: p.inlineData.mimeType });
                   const formData = new FormData();
                   let ext = "webm";
                   if (p.inlineData.mimeType.includes("mp3")) ext = "mp3";
                   else if (p.inlineData.mimeType.includes("ogg")) ext = "ogg";
                   else if (p.inlineData.mimeType.includes("wav")) ext = "wav";
                   else if (p.inlineData.mimeType.includes("m4a")) ext = "m4a";

                   formData.append("file", blob, `audio.${ext}`);
                   formData.append("model", "whisper-large-v3");

                   const audioRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                       method: "POST",
                       headers: {
                           "Authorization": `Bearer ${apiKey}`,
                       },
                       body: formData as any
                   });

                   if (audioRes.ok) {
                      const audioResult = await audioRes.json();
                      audioText += `\n[Transcrição do Áudio]: "${audioResult.text}"\n`;
                   } else {
                      const err = await audioRes.text();
                      console.error("Whisper error:", err);
                      audioText += `\n[Erro na transcrição do áudio: ${err}]\n`;
                   }
                } else if (p.inlineData.mimeType.startsWith("image/")) {
                  hasImageInPart = true;
                  hasImage = true;
                  contentArray.push({ 
                    type: "image_url", 
                    image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` }
                  });
                }
              }
            }
            
            if (hasImageInPart) {
              if (audioText) {
                 contentArray.push({ type: "text", text: audioText });
              }
              messages.push({ role, content: contentArray });
            } else {
              messages.push({ role, content: regularText + audioText });
            }
          } else {
            messages.push({ role, content: c.parts.map((p: any) => p.text || "").join("\n") });
          }
        } else if (c.content) {
          messages.push({ role, content: typeof c.content === "string" ? c.content : JSON.stringify(c.content) });
        } else {
          messages.push({ role, content: JSON.stringify(c) });
        }
      }
    } else if (contents) {
      messages.push({ role: "user", content: JSON.stringify(contents) });
    }

    if (hasImage) {
      mappedModel = "meta-llama/llama-4-scout-17b-16e-instruct";
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
    let textContent = result.choices?.[0]?.message?.content || "";
    
    // Strip markdown JSON block formatting if present, as models often wrap json format
    if (textContent.startsWith("```json")) {
      textContent = textContent.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    } else if (textContent.startsWith("```")) {
      textContent = textContent.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    }

    return res.status(200).json({
      text: textContent
    });
  } catch (error: any) {
    console.error("Groq-proxied Serverless API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
