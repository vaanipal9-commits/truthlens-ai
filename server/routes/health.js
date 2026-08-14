export function healthRoute(_req, res) {
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasTavily = !!process.env.TAVILY_API_KEY;
  res.json({
    ok: true,
    service: "truthlens-backend",
    time: new Date().toISOString(),
    groq: hasGroq,
    tavily: hasTavily,
    searchProvider: hasTavily ? "tavily" : "groq-compound",
  });
}
