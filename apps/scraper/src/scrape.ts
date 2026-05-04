import { chromium, type Page } from "playwright"

const TIMEOUT = 30_000

export async function scrapeUrl(url: string): Promise<string> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US",
    })
    const page = await context.newPage()

    await page.goto(url, { waitUntil: "networkidle", timeout: TIMEOUT })

    if (url.includes("instagram.com")) {
      return await scrapeInstagram(page)
    }
    return await scrapeRecipeSite(page)
  } finally {
    await browser.close()
  }
}

async function scrapeInstagram(page: Page): Promise<string> {
  // og:description carries the post caption on public posts
  const ogDescription = await page
    .$eval("meta[property='og:description']", (el) => el.getAttribute("content"))
    .catch(() => null)

  // Instagram embeds post data in a JSON blob in the page
  const embeddedCaption = await page
    .evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[type='application/ld+json']"))
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent ?? "")
          if (data.articleBody) return data.articleBody as string
          if (data.description) return data.description as string
        } catch {}
      }
      return null
    })
    .catch(() => null)

  const parts = [ogDescription, embeddedCaption].filter(Boolean)
  if (parts.length === 0) {
    throw new Error("Could not extract content from Instagram post — post may be private or require login")
  }
  return parts.join("\n\n")
}

async function scrapeRecipeSite(page: Page): Promise<string> {
  // 1. Try JSON-LD schema.org/Recipe — most recipe sites have this
  const jsonLd = await page
    .evaluate(() => {
      const scripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      )
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent ?? "")
          // Handle single object or @graph array
          const items = Array.isArray(data["@graph"]) ? data["@graph"] : [data]
          const recipe = items.find(
            (item: any) =>
              item["@type"] === "Recipe" ||
              (Array.isArray(item["@type"]) && item["@type"].includes("Recipe")),
          )
          if (recipe) return JSON.stringify(recipe)
        } catch {}
      }
      return null
    })
    .catch(() => null)

  if (jsonLd) return jsonLd

  // 2. Fall back to main text content — strip nav/footer/ads
  const text = await page
    .evaluate(() => {
      const remove = document.querySelectorAll(
        "nav, header, footer, script, style, aside, iframe, [class*='ad'], [id*='ad'], [class*='sidebar']",
      )
      remove.forEach((el) => el.remove())

      // Prefer <main> or <article> if present
      const main =
        document.querySelector("main") ??
        document.querySelector("article") ??
        document.body
      return (main as HTMLElement).innerText
    })
    .catch(() => "")

  if (!text.trim()) throw new Error("Page returned empty content")

  // Cap at 10k chars — enough for any recipe, avoids bloating LLM context
  return text.trim().slice(0, 10_000)
}
