// src/pages/rss.xml.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('blog');
  const publishedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .slice(0, 50);

  const siteUrl = site?.toString() || 'https://my-portfolio-gamma-six-70.vercel.app';
  const lastBuildDate = new Date();
  
  const items = publishedPosts.map(post => {
    const postUrl = `${siteUrl}/blog/${post.id}/`;
    const description = post.data.description || '';
    const content = post.body || '';
    
    return `
      <item>
        <title>${escapeXml(post.data.title)}</title>
        <link>${postUrl}</link>
        <guid isPermaLink="true">${postUrl}</guid>
        <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
        <description>${escapeXml(description)}</description>
        <content:encoded>${escapeXml(content)}</content:encoded>
        <category>${post.data.tags ? post.data.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('') : ''}</category>
      </item>`;
  }).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Portfolio Blog</title>
    <link>${siteUrl}</link>
    <description>Latest posts from my portfolio blog</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <generator>Astro + Custom RSS</generator>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}
