import { NextRequest, NextResponse } from "next/server";

type OpenGraphData = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
};

const META_PATTERN =
  /<meta\s+(?:[^>]*?(?:property|name)=["']([^"']+)["'][^>]*?(?:content)=["']([^"']*)["'][^>]*?)>|<meta\s+(?:[^>]*?(?:content)=["']([^"']*)["'][^>]*?(?:property|name)=["']([^"']+)["'][^>]*?)>/gi;
const TITLE_PATTERN = /<title[^>]*>([^<]*)<\/title>/i;

const extractOpenGraph = (html: string): OpenGraphData => {
  const ogData: OpenGraphData = {};

  let match: RegExpExecArray | null;
  while ((match = META_PATTERN.exec(html)) !== null) {
    const [, keyA, valueA, valueB, keyB] = match;
    const key = (keyA ?? keyB ?? "").toLowerCase();
    const value = valueA ?? valueB ?? "";

    switch (key) {
      case "og:title":
      case "twitter:title":
        ogData.title ||= value;
        break;
      case "og:description":
      case "twitter:description":
        ogData.description ||= value;
        break;
      case "og:image":
      case "twitter:image":
        ogData.image ||= value;
        break;
      case "og:url":
        ogData.url ||= value;
        break;
      case "og:site_name":
        ogData.siteName ||= value;
        break;
      case "og:type":
        ogData.type ||= value;
        break;
      default:
        break;
    }
  }

  if (!ogData.title) {
    const titleMatch = TITLE_PATTERN.exec(html);
    ogData.title = titleMatch?.[1]?.trim();
  }

  return ogData;
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid url parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(target.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch target", status: response.status },
        { status: 502 }
      );
    }

    const html = await response.text();
    const og = extractOpenGraph(html);

    return NextResponse.json({ data: og });
  } catch (error) {
    console.error("OG fetch error", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
