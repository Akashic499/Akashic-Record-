export const EXTRACTION_SCRIPT = `
(function() {
  try {
    var tagsToRemove = ['script', 'style', 'nav', 'header', 'footer', 'aside', 'noscript', 'iframe', 'form'];
    tagsToRemove.forEach(function(tag) {
      var els = document.querySelectorAll(tag);
      for (var i = 0; i < els.length; i++) {
        if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
      }
    });

    var classesToRemove = ['.nav', '.navigation', '.sidebar', '.advertisement', '.ad', '.cookie', '.popup', '.modal', '.menu', '.toolbar', '.breadcrumb'];
    classesToRemove.forEach(function(sel) {
      try {
        var els = document.querySelectorAll(sel);
        for (var i = 0; i < els.length; i++) {
          if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
        }
      } catch(e) {}
    });

    var candidates = [
      'article',
      '[role="main"]',
      'main',
      '.article-body',
      '.article-content',
      '.post-content',
      '.post-body',
      '.entry-content',
      '.content-body',
      '.story-body',
      '#content',
      '#main-content',
      '#article-body',
      '.content'
    ];

    var mainEl = null;
    for (var i = 0; i < candidates.length; i++) {
      try {
        var el = document.querySelector(candidates[i]);
        if (el && el.innerText && el.innerText.trim().length > 200) {
          mainEl = el;
          break;
        }
      } catch(e) {}
    }

    var source = mainEl || document.body;
    var rawText = (source.innerText || source.textContent || '');

    var lines = rawText.split('\\n')
      .map(function(l) { return l.trim(); })
      .filter(function(l) { return l.length > 25; })
      .filter(function(l) { return !/^[\\s\\d\\W]{5,}$/.test(l); });

    var content = lines.slice(0, 150).join(' ').replace(/\\s+/g, ' ').substring(0, 12000);

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'PAGE_CONTENT',
      title: document.title || window.location.hostname,
      url: window.location.href,
      content: content,
      wordCount: content.split(/\\s+/).length
    }));
  } catch(e) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PAGE_CONTENT',
        title: document.title || '',
        url: window.location.href,
        content: '',
        wordCount: 0
      }));
    } catch(e2) {}
  }
  true;
})();
`;

export const SKIP_URLS = [
  'about:',
  'chrome:',
  'data:',
  'javascript:',
  'file:',
  'blob:',
];

export function shouldExtract(url: string): boolean {
  if (!url) return false;
  for (const skip of SKIP_URLS) {
    if (url.startsWith(skip)) return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.includes('.') && !trimmed.includes(' ')) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}
