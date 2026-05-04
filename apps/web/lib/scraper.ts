export async function scrapeUrl(url: string): Promise<string> {
  const scraperUrl = process.env.SCRAPER_SERVICE_URL
  if (!scraperUrl) {
    // Scraper service not deployed — pass URL directly to LLM as fallback
    return `Recipe URL: ${url}\n\nNote: Scraping service unavailable. Extract whatever recipe information can be inferred from the URL and metadata.`
  }

  const res = await fetch(`${scraperUrl}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SCRAPER_API_KEY ?? "",
    },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Scraper failed (${res.status}): ${(body as any).error ?? "unknown error"}`)
  }

  const data = await res.json()
  return data.content as string
}
