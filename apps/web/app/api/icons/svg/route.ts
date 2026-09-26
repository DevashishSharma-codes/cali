import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name')?.trim() || '';

  if (!name) {
    return new NextResponse('Icon name required', { status: 400 });
  }

  // Extract prefix and raw name (e.g., 'logos:angular' -> prefix='logos', rawName='angular')
  let prefix = '';
  let rawName = name;
  if (name.includes(':')) {
    const parts = name.split(':');
    prefix = parts[0] || '';
    rawName = parts[1] || name;
  } else if (name.includes('/')) {
    const parts = name.split('/');
    prefix = parts[0] || '';
    rawName = parts[1] || name;
  }

  const cleanName = rawName.toLowerCase();
  const cleanNoIcon = cleanName.replace(/-icon$/, '');

  // Multi-CDN mirror candidates in order of speed and color fidelity
  const candidateUrls: string[] = [];

  // 1. Gil Barbara / SVG Logos (100% full-color official brand vectors & gradients)
  if (prefix === 'logos' || !prefix) {
    candidateUrls.push(`https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/${cleanName}.svg`);
    candidateUrls.push(`https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/${cleanNoIcon}.svg`);
    candidateUrls.push(`https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/${cleanNoIcon}-icon.svg`);
  }

  // 2. Devicon (Original colored developer & tech logos)
  if (prefix === 'devicon' || prefix === 'devicon-original' || !prefix) {
    candidateUrls.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/${cleanNoIcon}/${cleanNoIcon}-original.svg`);
    candidateUrls.push(`https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/${cleanNoIcon}/${cleanNoIcon}-plain.svg`);
  }

  // 3. Simple Icons (Provides brand-colored vector)
  if (prefix === 'simple-icons') {
    candidateUrls.push(`https://cdn.simpleicons.org/${cleanNoIcon}`);
  }

  // 4. Skill Icons / VSCode Icons / Iconify mirrors
  candidateUrls.push(`https://api.iconify.design/${prefix ? `${prefix}:${rawName}` : rawName}.svg`);
  candidateUrls.push(`https://api.simplesvg.com/${prefix ? `${prefix}:${rawName}` : rawName}.svg`);
  candidateUrls.push(`https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/${cleanName}.svg`);
  candidateUrls.push(`https://cdn.simpleicons.org/${cleanNoIcon}`);

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Pencil Canvas Whiteboard)',
        },
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        let svgText = await res.text();
        if (svgText && svgText.includes('<svg') && !svgText.includes('error code:')) {
          // If the SVG contains currentColor or no color fill (monochrome black), replace with clean bright color for dark mode
          if (svgText.includes('fill="currentColor"') || svgText.includes('stroke="currentColor"')) {
            svgText = svgText
              .replace(/fill="currentColor"/g, 'fill="#e2e8f0"')
              .replace(/stroke="currentColor"/g, 'stroke="#e2e8f0"');
          }

          return new NextResponse(svgText, {
            status: 200,
            headers: {
              'Content-Type': 'image/svg+xml; charset=utf-8',
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    } catch {
      // try next candidate
    }
  }

  // Return clean vector badge fallback so canvas rendering never fails
  const fallbackBadge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#1e1e24" stroke="#cae39f" stroke-width="4"/><text x="50" y="55" fill="#cae39f" font-size="13" font-weight="bold" font-family="'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif" text-anchor="middle">${rawName.slice(0, 8)}</text></svg>`;

  return new NextResponse(fallbackBadge, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
