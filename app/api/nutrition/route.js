import OpenAI from "openai";

export async function POST(req) {
  const { type, ...data } = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (type === "identify") {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: data.prompt },
            { type: "image_url", image_url: { url: data.image, detail: "low" } },
          ],
        },
      ],
    });
    return Response.json({ result: response.choices[0].message.content.trim() });
  }

  if (type === "recipes") {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: data.prompt }],
    });
    return Response.json({ result: response.choices[0].message.content.trim() });
  }

  if (type === "image") {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: data.label,
      n: 1,
      size: "256x256",
      response_format: "b64_json",
    });
    const b64 = response.data[0]?.b64_json ?? null;
    return Response.json({ result: b64 ? `data:image/png;base64,${b64}` : null });
  }

  return Response.json({ error: "Unknown type" }, { status: 400 });
}
