export async function generateContent(options: {
    model?: string;
    contents: any;
    config?: any;
}) {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/gemini`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: options.model || 'gemini-3-flash-preview',
            contents: options.contents,
            config: options.config
        })
    });

    if (!response.ok) {
        throw new Error('Falha na resposta da API Gemini: ' + response.statusText);
    }

    return await response.json();
}
