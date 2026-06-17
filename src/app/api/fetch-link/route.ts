import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ─── Helpers ─────────────────────────────────────────────────
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return "";
  }
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─── Gemini Fallback ─────────────────────────────────────────
async function geminiInfer(
  url: string,
  htmlSnippet: string | null
): Promise<{ title: string; context: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { title: "Untitled Page", context: "Gemini API key not configured." };
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = htmlSnippet
      ? `Given this URL: "${url}" and the following HTML snippet (first 3000 chars):\n\n${htmlSnippet.slice(0, 3000)}\n\nReturn a JSON object with two keys: "title" (a concise page title, max 80 chars) and "context" (a one-line description, max 150 chars). Return ONLY valid JSON, no markdown.`
      : `Given this URL: "${url}", infer what this website/page is about. Return a JSON object with two keys: "title" (a concise page title, max 80 chars) and "context" (a one-line description, max 150 chars). Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(cleaned);
  } catch {
    return { title: "Untitled Page", context: "Could not fetch information." };
  }
}

// ─── Route Handlers ──────────────────────────────────────────

function handleYouTube(url: string, parsedUrl: URL) {
  const host = parsedUrl.hostname.replace("www.", "");
  let videoId: string | null = null;
  let subcategory = "Video";

  if (parsedUrl.pathname.startsWith("/shorts/")) {
    videoId = parsedUrl.pathname.split("/shorts/")[1]?.split(/[/?]/)[0] || null;
    subcategory = "Shorts";
  } else if (parsedUrl.pathname.startsWith("/playlist") || parsedUrl.searchParams.has("list")) {
    subcategory = "Playlist";
    videoId = parsedUrl.searchParams.get("v") || parsedUrl.searchParams.get("list");
  } else if (host === "youtu.be") {
    videoId = parsedUrl.pathname.slice(1).split(/[/?]/)[0] || null;
  } else {
    videoId = parsedUrl.searchParams.get("v");
  }

  return { videoId, subcategory };
}

async function processYouTube(url: string, parsedUrl: URL) {
  const { videoId, subcategory } = handleYouTube(url, parsedUrl);

  let title = "YouTube Video";
  let channel = "Unknown Channel";

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      title = data.title || title;
      channel = data.author_name || channel;
    }
  } catch {
    // Keep defaults
  }

  return {
    category: "YouTube" as const,
    subcategory,
    meta: { title, channel, videoId: videoId || "" },
    favicon: faviconUrl(url),
  };
}

function processLinkedIn(url: string, parsedUrl: URL) {
  const path = parsedUrl.pathname;
  let subcategory = "Page";
  let identifier = "";
  const contentType = "LinkedIn Content";

  if (path.includes("/in/")) {
    subcategory = "User Profile";
    identifier = path.split("/in/")[1]?.replace(/\//g, "") || "Unknown User";
  } else if (path.includes("/company/")) {
    subcategory = "Company Page";
    identifier = path.split("/company/")[1]?.split("/")[0] || "Unknown Company";
  } else if (path.includes("/posts/") || path.includes("/feed/")) {
    subcategory = "Feed Post";
    const parts = path.split("/");
    identifier = parts[1] || "Unknown Author";
  } else if (path.includes("/jobs/")) {
    subcategory = "Job Listing";
    identifier = path.split("/jobs/")[1]?.split("/")[0] || "Job";
  } else {
    subcategory = "Page";
    identifier = path.replace(/^\//, "").split("/")[0] || "LinkedIn";
  }

  return {
    category: "LinkedIn" as const,
    subcategory,
    meta: { identifier: slugToTitle(identifier), contentType },
    favicon: faviconUrl(url),
  };
}

async function processGitHub(url: string, parsedUrl: URL) {
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

  if (parsedUrl.hostname === "gist.github.com") {
    const owner = pathParts[0] || "Unknown";
    return {
      category: "GitHub" as const,
      subcategory: "Gist",
      meta: { username: owner, repoName: null, description: `Gist by ${owner}` },
      favicon: faviconUrl(url),
    };
  }

  const username = pathParts[0] || "";
  const repoName = pathParts[1] || null;

  let subcategory = "User Profile";
  if (repoName) {
    subcategory = "Repository";
  }

  let description = "";
  const html = await fetchHTML(url);
  if (html) {
    const $ = cheerio.load(html);

    if (repoName) {
      description =
        $('meta[property="og:description"]').attr("content") ||
        $('p[class*="f4"]').first().text().trim() ||
        $('meta[name="description"]').attr("content") ||
        "";
    } else {
      description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";

      if (
        $('meta[property="og:type"]').attr("content")?.includes("organization") ||
        description.toLowerCase().includes("organization") ||
        $('a[data-tab-item="org-header-repositories"]').length > 0
      ) {
        subcategory = "Organization";
      }
    }
  }

  if (!description) {
    description = repoName
      ? `${username}/${repoName}`
      : `GitHub profile: ${username}`;
  }

  return {
    category: "GitHub" as const,
    subcategory,
    meta: { username, repoName, description },
    favicon: faviconUrl(url),
  };
}

async function processCodingPlatform(url: string, parsedUrl: URL) {
  const host = parsedUrl.hostname.replace("www.", "");
  const path = parsedUrl.pathname;
  const pathParts = path.split("/").filter(Boolean);

  let platform = "Unknown";
  let subcategory = "Page";
  let entityName = "";
  let type = "";

  if (host.includes("leetcode.com")) {
    platform = "LeetCode";
    if (pathParts[0] === "problems" && pathParts[1]) {
      subcategory = "Question";
      entityName = slugToTitle(pathParts[1]);
      type = "Problem";
    } else if (pathParts[0] === "u" && pathParts[1]) {
      subcategory = "User Profile";
      entityName = pathParts[1];
      type = "Profile";
    } else if (pathParts[0] === "contest") {
      subcategory = "Contest";
      entityName = pathParts[1] ? slugToTitle(pathParts[1]) : "Contest";
      type = "Contest";
    } else if (pathParts[0] === "explore" || pathParts[0] === "studyplan") {
      subcategory = "Course/Playlist";
      entityName = pathParts[1] ? slugToTitle(pathParts[1]) : "Study Plan";
      type = "Study Plan";
    } else {
      subcategory = "Page";
      entityName = pathParts[0] ? slugToTitle(pathParts[0]) : "LeetCode";
      type = "Page";
    }
  } else if (host.includes("codeforces.com")) {
    platform = "Codeforces";
    if (pathParts[0] === "contest" || pathParts[0] === "contests") {
      subcategory = "Contest";
      entityName = pathParts[1] ? `Contest ${pathParts[1]}` : "Contests";
      type = "Contest";
    } else if (pathParts[0] === "problemset" || (pathParts[0] === "contest" && pathParts[2] === "problem")) {
      subcategory = "Question";
      entityName = pathParts.length > 2 ? `Problem ${pathParts[pathParts.length - 1]}` : "Problemset";
      type = "Problem";
    } else if (pathParts[0] === "profile") {
      subcategory = "User Profile";
      entityName = pathParts[1] || "Unknown";
      type = "Profile";
    } else {
      subcategory = "Page";
      entityName = pathParts[0] ? slugToTitle(pathParts[0]) : "Codeforces";
      type = "Page";
    }
  } else if (host.includes("codechef.com")) {
    platform = "CodeChef";
    if (pathParts[0] === "problems" && pathParts[1]) {
      subcategory = "Question";
      entityName = pathParts[1].toUpperCase();
      type = "Problem";
    } else if (pathParts[0] === "users") {
      subcategory = "User Profile";
      entityName = pathParts[1] || "Unknown";
      type = "Profile";
    } else if (pathParts[0] === "contests" || (pathParts[0] && pathParts[0].match(/^[A-Z0-9]+$/i) && pathParts.length === 1)) {
      subcategory = "Contest";
      entityName = pathParts[1] ? slugToTitle(pathParts[1]) : pathParts[0] || "Contests";
      type = "Contest";
    } else if (pathParts[0] === "learn" || pathParts[0] === "courses") {
      subcategory = "Course/Playlist";
      entityName = pathParts[1] ? slugToTitle(pathParts[1]) : "Learning";
      type = "Course";
    } else {
      subcategory = "Page";
      entityName = pathParts[0] ? slugToTitle(pathParts[0]) : "CodeChef";
      type = "Page";
    }
  }

  // Try scraping for a better entity name
  if (subcategory === "Question") {
    const html = await fetchHTML(url);
    if (html) {
      const $ = cheerio.load(html);
      const scraped =
        $("h1").first().text().trim() ||
        $("title").text().trim().split("|")[0]?.trim() ||
        $('meta[property="og:title"]').attr("content");
      if (scraped && scraped.length > 1) {
        entityName = scraped;
      }
    }
  }

  return {
    category: "Coding Platforms" as const,
    subcategory,
    meta: { platform, entityName, type },
    favicon: faviconUrl(url),
  };
}

function processDesign(url: string, parsedUrl: URL) {
  const host = parsedUrl.hostname.replace("www.", "");
  const path = parsedUrl.pathname;
  const pathParts = path.split("/").filter(Boolean);

  const platform = host.includes("figma") ? "Figma" : "Canva";
  let subcategory = "Design Workspace";
  let fileName = "";

  if (platform === "Figma") {
    if (path.includes("/proto/")) {
      subcategory = "Prototype";
    } else if (path.includes("/design/") || path.includes("/file/")) {
      subcategory = "Design Workspace";
    } else if (path.includes("/board/")) {
      subcategory = "Design Workspace";
    }
    const nameSegment = pathParts[pathParts.length - 1] || "";
    fileName = nameSegment ? slugToTitle(decodeURIComponent(nameSegment.split("?")[0])) : "Figma Design";
  } else {
    if (path.includes("/design/")) {
      subcategory = "Design Workspace";
    } else if (path.includes("/templates/")) {
      subcategory = "Template";
    } else if (path.includes("/presentations/")) {
      subcategory = "Presentation";
    }
    const nameSegment = pathParts[pathParts.length - 1] || "";
    fileName = nameSegment ? slugToTitle(decodeURIComponent(nameSegment.split("?")[0])) : "Canva Design";
  }

  return {
    category: "Design" as const,
    subcategory,
    meta: { platform, fileName },
    favicon: faviconUrl(url),
  };
}

function processDocument(url: string, parsedUrl: URL) {
  const host = parsedUrl.hostname;
  const path = parsedUrl.pathname;

  if (path.endsWith(".pdf") || url.toLowerCase().includes(".pdf")) {
    const fileName = path.split("/").pop() || "document.pdf";
    return {
      category: "Documents" as const,
      subcategory: "Static PDF",
      meta: { title: decodeURIComponent(fileName.replace(".pdf", "")), fileExtension: "pdf" },
      favicon: faviconUrl(url),
    };
  }

  let title = "Google Document";
  let ext = "gdoc";

  if (host.includes("docs.google.com")) {
    if (path.includes("/spreadsheets/")) {
      title = "Google Spreadsheet";
      ext = "gsheet";
    } else if (path.includes("/presentation/")) {
      title = "Google Slides";
      ext = "gslides";
    } else if (path.includes("/forms/")) {
      title = "Google Form";
      ext = "gform";
    } else {
      title = "Google Document";
      ext = "gdoc";
    }
  } else if (host.includes("drive.google.com")) {
    title = "Google Drive File";
    ext = "gdrive";
  }

  return {
    category: "Documents" as const,
    subcategory: "Google Drive File",
    meta: { title, fileExtension: ext },
    favicon: faviconUrl(url),
  };
}

async function processBlog(url: string) {
  const html = await fetchHTML(url);
  let title = "";
  let description = "";

  if (html) {
    const $ = cheerio.load(html);
    title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      $('meta[name="twitter:title"]').attr("content") ||
      "";
    description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      "";
  }

  // Gemini fallback ONLY if scraping completely failed
  if (!title && !description) {
    const inferred = await geminiInfer(url, html);
    title = inferred.title;
    description = inferred.context;
  }

  if (!title) title = "Untitled Article";
  if (!description) description = "";

  return {
    category: "Blogs & Articles" as const,
    subcategory: "Reading List",
    meta: { title, description },
    favicon: faviconUrl(url),
  };
}

async function processOther(url: string) {
  const html = await fetchHTML(url);
  const inferred = await geminiInfer(url, html);

  return {
    category: "Others" as const,
    subcategory: "Unclassified",
    meta: { title: inferred.title, context: inferred.context },
    favicon: faviconUrl(url),
  };
}

// ─── Main POST Handler ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: string = body.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid URL." },
        { status: 400 }
      );
    }

    let url = rawUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format." },
        { status: 400 }
      );
    }

    const host = parsedUrl.hostname.replace("www.", "").toLowerCase();

    // ── Rule-based routing ──────────────────────────────────
    let result;

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      result = await processYouTube(url, parsedUrl);
    } else if (host.includes("linkedin.com")) {
      result = processLinkedIn(url, parsedUrl);
    } else if (host === "github.com" || host === "gist.github.com") {
      result = await processGitHub(url, parsedUrl);
    } else if (
      host.includes("leetcode.com") ||
      host.includes("codeforces.com") ||
      host.includes("codechef.com")
    ) {
      result = await processCodingPlatform(url, parsedUrl);
    } else if (host.includes("figma.com") || host.includes("canva.com")) {
      result = processDesign(url, parsedUrl);
    } else if (
      host.includes("drive.google.com") ||
      host.includes("docs.google.com") ||
      parsedUrl.pathname.toLowerCase().endsWith(".pdf")
    ) {
      result = processDocument(url, parsedUrl);
    } else if (
      host.includes("medium.com") ||
      host.includes("substack.com") ||
      host.includes("dev.to") ||
      host.includes("hashnode") ||
      host.includes("wordpress") ||
      host.includes("blogger") ||
      host.includes("ghost.io") ||
      host.includes("telegraph") ||
      host.includes("mirror.xyz")
    ) {
      result = await processBlog(url);
    } else {
      // General fallback — try scraping for blog-like content first
      const html = await fetchHTML(url);
      if (html) {
        const $ = cheerio.load(html);
        const title =
          $('meta[property="og:title"]').attr("content") ||
          $("title").text().trim() ||
          "";
        const desc =
          $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content") ||
          "";

        if (title || desc) {
          result = {
            category: "Blogs & Articles" as const,
            subcategory: "Reading List",
            meta: { title: title || "Untitled", description: desc || "" },
            favicon: faviconUrl(url),
          };
        } else {
          result = await processOther(url);
        }
      } else {
        result = await processOther(url);
      }
    }

    return NextResponse.json({
      success: true,
      data: { url, ...result },
    });
  } catch (err) {
    console.error("fetch-link error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
