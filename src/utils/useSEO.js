// Lightweight SEO/meta tag manager. No external deps.
// Sets document.title, common meta tags, Open Graph, Twitter, canonical, and
// (optionally) one JSON-LD structured-data script per route.
// Reverts to previous values on unmount so SPA navigation stays clean.

import { useEffect } from 'react';

const upsertMeta = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs.match || {}).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  if (attrs.content != null) el.setAttribute('content', attrs.content);
  return el;
};

const upsertLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return el;
};

const setJsonLd = (id, data) => {
  let el = document.getElementById(id);
  if (data == null) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
  jsonLd,
} = {}) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // Standard meta
    if (description) {
      upsertMeta('meta[name="description"]', { match: { name: 'description' }, content: description });
    }
    if (tags && tags.length) {
      upsertMeta('meta[name="keywords"]', {
        match: { name: 'keywords' },
        content: tags.join(', '),
      });
    }

    // Open Graph
    upsertMeta('meta[property="og:title"]', { match: { property: 'og:title' }, content: title || prevTitle });
    if (description) upsertMeta('meta[property="og:description"]', { match: { property: 'og:description' }, content: description });
    upsertMeta('meta[property="og:type"]', { match: { property: 'og:type' }, content: type });
    if (image) upsertMeta('meta[property="og:image"]', { match: { property: 'og:image' }, content: image });
    if (pageUrl) upsertMeta('meta[property="og:url"]', { match: { property: 'og:url' }, content: pageUrl });
    if (publishedTime) upsertMeta('meta[property="article:published_time"]', { match: { property: 'article:published_time' }, content: publishedTime });
    if (modifiedTime) upsertMeta('meta[property="article:modified_time"]', { match: { property: 'article:modified_time' }, content: modifiedTime });
    if (author) upsertMeta('meta[property="article:author"]', { match: { property: 'article:author' }, content: author });

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { match: { name: 'twitter:card' }, content: image ? 'summary_large_image' : 'summary' });
    upsertMeta('meta[name="twitter:title"]', { match: { name: 'twitter:title' }, content: title || prevTitle });
    if (description) upsertMeta('meta[name="twitter:description"]', { match: { name: 'twitter:description' }, content: description });
    if (image) upsertMeta('meta[name="twitter:image"]', { match: { name: 'twitter:image' }, content: image });

    // Canonical
    if (pageUrl) upsertLink('canonical', pageUrl);

    // Structured data
    if (jsonLd) setJsonLd('ld-json-route', jsonLd);

    return () => {
      document.title = prevTitle;
      setJsonLd('ld-json-route', null);
    };
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, JSON.stringify(tags || []), JSON.stringify(jsonLd || null)]);
};
