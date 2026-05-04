import "dotenv/config"
import express from "express"
import { scrapeUrl } from "./scrape"

const app = express()
const PORT = process.env.PORT ?? 3001
const API_KEY = process.env.SCRAPER_API_KEY ?? ""

app.use(express.json())

app.use((req, res, next) => {
  if (req.path === "/health") return next()
  const key = req.headers["x-api-key"]
  console.log(`[scraper] incoming request to ${req.path} with API key: ${key} and current env API key: ${API_KEY} `);
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  next()
})

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

app.post("/scrape", async (req, res) => {
  const { url } = req.body as { url?: string }
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" })
    return
  }

  try {
    const content = await scrapeUrl(url)
    res.json({ content })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed"
    console.error(`[scraper] error scraping ${url}:`, message)
    res.status(422).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`[scraper] listening on port ${PORT}`)
})
