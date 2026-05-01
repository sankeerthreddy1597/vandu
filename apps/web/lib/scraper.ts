export async function scrapeUrl(url: string): Promise<string> {
  const scraperUrl = process.env.SCRAPER_SERVICE_URL
  if (!scraperUrl) {
    // Scraper service not deployed yet — return URL as-is for the LLM to handle
    return `Recipe URL: ${url}\n\nNote: Full page scraping not yet available. Please extract whatever recipe information can be inferred from the URL and any available metadata.`
  }

  const res = await fetch(`${scraperUrl}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SCRAPER_API_KEY ?? "",
    },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) throw new Error(`Scraper returned ${res.status}`)
  const data = await res.json()
  return data.content as string
}
