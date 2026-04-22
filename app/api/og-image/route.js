import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) return NextResponse.json({ image: null, title: null, price: null }, { status: 400 });

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ image: null, title: null, price: null }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ image: null, title: null, price: null }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    if (!res.ok) return NextResponse.json({ image: null, title: null, price: null });

    // Stream first 200 KB — og tags + JSON-LD are always in <head>
    const reader  = res.body?.getReader();
    const decoder = new TextDecoder();
    let html      = '';
    let bytes     = 0;
    const MAX     = 200_000;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html  += decoder.decode(value, { stream: true });
        bytes += value.byteLength;
        if (bytes >= MAX || html.toLowerCase().includes('</head>')) {
          await reader.cancel();
          break;
        }
      }
    } else {
      html = (await res.text()).slice(0, MAX);
    }

    const image = extractOgImage(html, parsedUrl);
    const title = extractTitle(html);
    const price = extractPrice(html);

    return NextResponse.json({ image, title, price });
  } catch {
    return NextResponse.json({ image: null, title: null, price: null });
  }
}

// ── Image ────────────────────────────────────────────────────────────────────

function extractOgImage(html, baseUrl) {
  const patterns = [
    /<meta\s[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta\s[^>]*property=["']og:image:url["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:image:url["']/i,
    /<meta\s[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) {
      const raw = m[1].trim();
      try { return new URL(raw, baseUrl.origin).href; } catch { if (raw.startsWith('http')) return raw; }
    }
  }
  return null;
}

// ── Title ────────────────────────────────────────────────────────────────────

function extractTitle(html) {
  // og:title preferred — usually cleaner than <title>
  const patterns = [
    /<meta\s[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return htmlDecode(m[1].trim());
  }
  // Fallback to <title>
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t?.[1]) return htmlDecode(t[1].trim());
  return null;
}

// ── Price ────────────────────────────────────────────────────────────────────

function extractPrice(html) {
  // 1. JSON-LD structured data (most reliable)
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scripts) {
    try {
      const data  = JSON.parse(s[1]);
      const price = priceFromLD(data);
      if (price != null) return String(price);
    } catch {}
  }

  // 2. Open Graph / product meta tags
  const metaPatterns = [
    /<meta\s[^>]*property=["']og:price:amount["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:price:amount["']/i,
    /<meta\s[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']product:price:amount["']/i,
  ];
  for (const p of metaPatterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].trim();
  }

  return null;
}

function priceFromLD(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const d of data) { const p = priceFromLD(d); if (p != null) return p; }
    return null;
  }
  if (data['@graph']) { const p = priceFromLD(data['@graph']); if (p != null) return p; }

  const type = data['@type'];
  const types = Array.isArray(type) ? type : [type];

  if (types.includes('Product')) {
    const offers = data.offers;
    if (offers) {
      const offer = Array.isArray(offers) ? offers[0] : offers;
      const price = offer?.price ?? offer?.priceSpecification?.price;
      if (price != null) return price;
    }
    if (data.price != null) return data.price;
  }
  if (types.includes('Offer') && data.price != null) return data.price;

  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function htmlDecode(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g,  '<')
    .replace(/&gt;/g,  '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}
