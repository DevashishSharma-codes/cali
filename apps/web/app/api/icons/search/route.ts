import { NextRequest, NextResponse } from 'next/server';

// Curated priority map for popular technologies so official colorful logos are always #1
const CURATED_TECH_MAP: Record<string, string[]> = {
  angular: ['logos:angular-icon', 'logos:angular', 'devicon:angular', 'skill-icons:angular-dark', 'skill-icons:angular-light'],
  php: ['logos:php', 'devicon:php', 'skill-icons:php-dark', 'skill-icons:php-light'],
  react: ['logos:react', 'devicon:react', 'skill-icons:react-dark'],
  vue: ['logos:vue', 'devicon:vuejs', 'skill-icons:vuejs-dark'],
  python: ['logos:python', 'devicon:python', 'skill-icons:python-dark'],
  aws: ['logos:aws', 'logos:aws-lambda', 'logos:aws-ec2', 'logos:aws-s3', 'logos:aws-dynamodb', 'logos:aws-cloudfront'],
  lambda: ['logos:aws-lambda', 'logos:serverless'],
  serverless: ['logos:serverless', 'logos:aws-lambda'],
  docker: ['logos:docker-icon', 'devicon:docker', 'skill-icons:docker'],
  kubernetes: ['logos:kubernetes', 'devicon:kubernetes', 'skill-icons:kubernetes'],
  k8s: ['logos:kubernetes', 'devicon:kubernetes', 'skill-icons:kubernetes'],
  postgres: ['logos:postgresql', 'devicon:postgresql', 'skill-icons:postgresql-dark'],
  postgresql: ['logos:postgresql', 'devicon:postgresql', 'skill-icons:postgresql-dark'],
  mysql: ['logos:mysql-icon', 'devicon:mysql', 'skill-icons:mysql-dark'],
  redis: ['logos:redis', 'devicon:redis', 'skill-icons:redis-dark'],
  mongo: ['logos:mongodb-icon', 'devicon:mongodb', 'skill-icons:mongodb'],
  mongodb: ['logos:mongodb-icon', 'devicon:mongodb', 'skill-icons:mongodb'],
  tailwind: ['logos:tailwindcss-icon', 'devicon:tailwindcss', 'skill-icons:tailwindcss-dark'],
  typescript: ['logos:typescript-icon', 'devicon:typescript', 'skill-icons:typescript'],
  javascript: ['logos:javascript', 'devicon:javascript', 'skill-icons:javascript'],
  node: ['logos:nodejs-icon', 'devicon:nodejs', 'skill-icons:nodejs-dark'],
  nodejs: ['logos:nodejs-icon', 'devicon:nodejs', 'skill-icons:nodejs-dark'],
  java: ['logos:java', 'devicon:java', 'skill-icons:java-dark'],
  golang: ['logos:go', 'devicon:go', 'skill-icons:golang'],
  go: ['logos:go', 'devicon:go', 'skill-icons:golang'],
  rust: ['logos:rust', 'devicon:rust', 'skill-icons:rust'],
  csharp: ['logos:c-sharp', 'devicon:csharp', 'skill-icons:cs'],
  cpp: ['logos:c-plusplus', 'devicon:cplusplus', 'skill-icons:cpp'],
  html: ['logos:html-5', 'devicon:html5', 'skill-icons:html'],
  css: ['logos:css-3', 'devicon:css3', 'skill-icons:css'],
  flutter: ['logos:flutter', 'devicon:flutter', 'skill-icons:flutter-dark'],
  swift: ['logos:swift', 'devicon:swift', 'skill-icons:swift'],
  kotlin: ['logos:kotlin-icon', 'devicon:kotlin', 'skill-icons:kotlin-dark'],
  graphql: ['logos:graphql', 'devicon:graphql', 'skill-icons:graphql-dark'],
  nextjs: ['logos:nextjs-icon', 'devicon:nextjs', 'skill-icons:nextjs-dark'],
  next: ['logos:nextjs-icon', 'devicon:nextjs', 'skill-icons:nextjs-dark'],
  django: ['logos:django-icon', 'devicon:django', 'skill-icons:django'],
  fastapi: ['logos:fastapi-icon', 'devicon:fastapi', 'skill-icons:fastapi'],
  spring: ['logos:spring-icon', 'devicon:spring', 'skill-icons:spring-dark'],
  kafka: ['logos:kafka-icon', 'devicon:apachekafka', 'skill-icons:kafka'],
  elasticsearch: ['logos:elasticsearch', 'skill-icons:elasticsearch-dark'],
  cloudflare: ['logos:cloudflare-icon', 'skill-icons:cloudflare-dark'],
  supabase: ['logos:supabase-icon', 'skill-icons:supabase-dark'],
  firebase: ['logos:firebase', 'devicon:firebase', 'skill-icons:firebase'],
  vercel: ['logos:vercel-icon', 'skill-icons:vercel-dark'],
  stripe: ['logos:stripe', 'skill-icons:stripe-dark'],
  openai: ['logos:openai-icon'],
  chatgpt: ['logos:openai-icon'],
  google: ['logos:google-icon', 'logos:google-cloud', 'logos:google'],
  microsoft: ['logos:microsoft-icon', 'logos:azure-icon', 'logos:microsoft'],
  azure: ['logos:azure-icon', 'logos:microsoft-icon'],
  gcp: ['logos:google-cloud', 'logos:google-icon'],
  apple: ['logos:apple', 'devicon:apple'],
  netflix: ['logos:netflix-icon'],
  spotify: ['logos:spotify-icon'],
  slack: ['logos:slack-icon', 'devicon:slack'],
  discord: ['logos:discord-icon', 'devicon:discord'],
  github: ['logos:github-icon', 'devicon:github', 'skill-icons:github-dark'],
  gitlab: ['logos:gitlab', 'devicon:gitlab', 'skill-icons:gitlab-dark'],
  figma: ['logos:figma', 'devicon:figma', 'skill-icons:figma-dark'],
  jira: ['logos:jira', 'devicon:jira'],
  postman: ['logos:postman-icon', 'skill-icons:postman'],
  vscode: ['logos:visual-studio-code', 'skill-icons:vscode-dark'],
};

// Priority score by icon collection name
function getCollectionScore(collection: string, iconName: string, query: string, paletteMap: Record<string, boolean>): number {
  let score = 0;

  // Tier 1: Real authentic colored vector logos
  if (collection === 'logos') score += 2000;
  else if (collection === 'devicon' || collection === 'devicon-original') score += 1800;
  else if (collection === 'skill-icons') score += 1600;
  else if (collection === 'vscode-icons') score += 1400;
  else if (collection === 'material-icon-theme') score += 1300;
  else if (collection === 'thesvg-color') score += 1200;
  else if (paletteMap[collection] === true) score += 1000;
  else if (collection === 'simple-icons') score += 600;
  else if (collection === 'catppuccin') score += 500;
  else score += 100; // Monochrome general icons like mdi, akar-icons, lineicons, teenyicons, etc.

  // Bonus for exact name matching
  const cleanIconName = iconName.toLowerCase();
  const cleanQuery = query.toLowerCase();
  if (cleanIconName === cleanQuery || cleanIconName === `${cleanQuery}-icon`) {
    score += 800;
  } else if (cleanIconName.includes(cleanQuery)) {
    score += 300;
  }

  // Demote outline / stroke-only monochrome icon sets
  if (['mdi', 'akar-icons', 'lineicons', 'teenyicons', 'fa7-brands', 'fa6-brands', 'fa-brands', 'cib', 'bxl', 'carbon', 'solar', 'ph', 'la', 'ion'].includes(collection)) {
    score -= 400;
  }

  return score;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim().toLowerCase() || '';
  const limit = parseInt(searchParams.get('limit') || '48', 10);

  if (!query) {
    return NextResponse.json({ icons: [], total: 0 });
  }

  try {
    // 1. Check curated priority logos for exact matching keywords
    const curatedMatches: string[] = [];
    for (const [key, icons] of Object.entries(CURATED_TECH_MAP)) {
      if (query === key || query.includes(key) || key.includes(query)) {
        curatedMatches.push(...icons);
      }
    }

    // 2. Fetch results from Iconify API
    const iconifyUrl = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=64`;
    const res = await fetch(iconifyUrl, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Pencil Canvas Whiteboard)',
      },
    });

    let rawIcons: string[] = [];
    const paletteMap: Record<string, boolean> = {};

    if (res.ok) {
      const data = await res.json();
      rawIcons = data.icons || [];
      if (data.collections) {
        for (const [colName, colMeta] of Object.entries<any>(data.collections)) {
          paletteMap[colName] = colMeta?.palette === true;
        }
      }
    }

    // 3. Combine curated matches with search results (deduped)
    const combinedSet = new Set<string>([...curatedMatches, ...rawIcons]);
    const allIcons = Array.from(combinedSet);

    // 4. Rank and sort so COLORFUL, AUTHENTIC BRAND LOGOS ALWAYS COME FIRST!
    allIcons.sort((a, b) => {
      const [colA, nameA] = a.split(':');
      const [colB, nameB] = b.split(':');
      const scoreA = getCollectionScore(colA || '', nameA || '', query, paletteMap);
      const scoreB = getCollectionScore(colB || '', nameB || '', query, paletteMap);
      return scoreB - scoreA;
    });

    const finalIcons = allIcons.slice(0, limit);

    return NextResponse.json({
      icons: finalIcons,
      total: finalIcons.length,
    });
  } catch (err: any) {
    console.error('Error in /api/icons/search:', err);
    return NextResponse.json({ icons: [], total: 0, error: err.message }, { status: 500 });
  }
}
