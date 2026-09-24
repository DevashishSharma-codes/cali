'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  getCustomEntities,
  saveCustomEntity,
  deleteCustomEntity,
  LibraryEntity,
  CURATED_ARCHITECTURE_ENTITIES,
  makeSvgDataUri,
} from '../lib/entityLibrary';
import { Shape } from '../lib/types';
import { preloadCanvasImage } from '../lib/draw';
import {
  Search,
  X,
  Plus,
  Trash2,
  Boxes,
  Cloud,
  Check,
  Globe,
  Database,
  Code2,
  Building2,
  Terminal,
  Bookmark,
  Laptop,
  Cpu,
  Users,
  GitCommit,
  Sparkles,
} from 'lucide-react';

interface EntityLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertEntity: (entity: LibraryEntity) => void;
  selectedShapes: Shape[];
  onSaveSuccess?: () => void;
}

export interface OnlineIconResult {
  iconName: string;
  collection: string;
  title: string;
  svgUrl: string;
}

type DisplayItem =
  | { type: 'curated'; entity: LibraryEntity }
  | { type: 'online'; icon: OnlineIconResult };

// --------------------------------------------------------------------------
// PRE-FETCHED FAMOUS ICONS BY CATEGORY (LOADS 0MS ON OPEN)
// --------------------------------------------------------------------------
const CATEGORY_FEATURED_ICONS: Record<string, string[]> = {
  all: [
    'logos:aws-lambda',
    'logos:serverless',
    'logos:aws',
    'logos:google-icon',
    'logos:microsoft-icon',
    'logos:apple',
    'logos:docker-icon',
    'logos:kubernetes',
    'logos:postgresql',
    'logos:redis',
    'logos:mongodb-icon',
    'logos:react',
    'logos:nextjs-icon',
    'logos:angular-icon',
    'logos:vue',
    'logos:nodejs-icon',
    'logos:python',
    'logos:typescript-icon',
    'logos:php',
    'logos:java',
    'logos:go',
    'logos:rust',
    'logos:openai-icon',
    'logos:github-icon',
    'logos:stripe',
    'logos:tailwindcss-icon',
    'logos:cloudflare-icon',
    'logos:supabase-icon',
    'logos:vercel-icon',
    'logos:mysql-icon',
    'logos:kafka-icon',
    'logos:graphql',
  ],
  cloud: [
    'logos:aws-lambda',
    'logos:serverless',
    'logos:aws',
    'logos:aws-s3',
    'logos:aws-ec2',
    'logos:aws-dynamodb',
    'logos:aws-cloudfront',
    'logos:aws-api-gateway',
    'logos:aws-rds',
    'logos:aws-sqs',
    'logos:google-cloud',
    'logos:azure-icon',
    'logos:cloudflare-icon',
    'logos:supabase-icon',
    'logos:vercel-icon',
    'logos:firebase',
    'logos:digital-ocean',
    'logos:heroku-icon',
  ],
  companies: [
    'logos:google-icon',
    'logos:microsoft-icon',
    'logos:apple',
    'logos:amazon',
    'logos:meta-icon',
    'logos:openai-icon',
    'logos:github-icon',
    'logos:stripe',
    'logos:netflix-icon',
    'logos:spotify-icon',
    'logos:discord-icon',
    'logos:slack-icon',
    'logos:twitter',
    'logos:linkedin-icon',
    'logos:uber-icon',
  ],
  databases: [
    'logos:postgresql',
    'logos:redis',
    'logos:mongodb-icon',
    'logos:mysql-icon',
    'logos:kafka-icon',
    'logos:elasticsearch',
    'logos:graphql',
    'logos:sqlite',
    'logos:cassandra',
    'logos:neo4j',
    'logos:mariadb-icon',
    'logos:couchbase',
  ],
  frameworks: [
    'logos:react',
    'logos:nextjs-icon',
    'logos:angular-icon',
    'logos:vue',
    'logos:nodejs-icon',
    'logos:typescript-icon',
    'logos:javascript',
    'logos:python',
    'logos:php',
    'logos:java',
    'logos:go',
    'logos:rust',
    'logos:c-sharp',
    'logos:c-plusplus',
    'logos:ruby',
    'logos:swift',
    'logos:kotlin-icon',
    'logos:flutter',
    'logos:django-icon',
    'logos:fastapi-icon',
    'logos:spring-icon',
    'logos:tailwindcss-icon',
  ],
  devops: [
    'logos:docker-icon',
    'logos:kubernetes',
    'logos:git-icon',
    'logos:linux-tux',
    'logos:nginx',
    'logos:terraform-icon',
    'logos:ansible',
    'logos:jenkins',
    'logos:gitlab',
    'logos:figma',
    'logos:jira',
    'logos:postman-icon',
    'logos:visual-studio-code',
  ],
  devices: [],
  architecture: [],
  people: [],
  flowchart: [],
};

const POPULAR_SEARCH_PRESETS = [
  'Server Rack',
  'iPhone',
  'MacBook',
  'AWS Lambda',
  'Load Balancer',
  'Serverless',
  'Angular',
  'PHP',
  'React',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'Redis',
  'MongoDB',
  'Python',
  'TypeScript',
  'Google',
  'Microsoft',
  'Azure',
  'AI Agent',
  'Firewall',
  'Cloudflare',
];

// Helper to convert icon identifier to an OnlineIconResult
function iconNameToResult(item: string): OnlineIconResult {
  const [prefix, name] = item.split(':');
  const formattedTitle = (name || item)
    .replace(/-icon$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    iconName: item,
    collection: prefix || 'icon',
    title: formattedTitle,
    svgUrl: `/api/icons/svg?name=${encodeURIComponent(item)}`,
  };
}

// --------------------------------------------------------------------------
// GLOBAL IN-MEMORY SWR CACHE
// --------------------------------------------------------------------------
const globalSearchCache = new Map<string, OnlineIconResult[]>();
const globalSvgCache = new Map<string, string>();
let isPrewarmed = false;

function prewarmAllCategories() {
  if (isPrewarmed || typeof window === 'undefined') return;
  isPrewarmed = true;

  // Pre-seed category cache immediately
  for (const [cat, icons] of Object.entries(CATEGORY_FEATURED_ICONS)) {
    globalSearchCache.set(`cat:${cat}`, icons.map(iconNameToResult));
  }

  // Pre-fetch top 40 SVGs asynchronously
  const initialToFetch = CATEGORY_FEATURED_ICONS.all || [];
  initialToFetch.slice(0, 32).forEach((iconName, idx) => {
    setTimeout(async () => {
      if (globalSvgCache.has(iconName)) return;
      try {
        const res = await fetch(`/api/icons/svg?name=${encodeURIComponent(iconName)}`);
        if (res.ok) {
          const text = await res.text();
          if (text && text.includes('<svg')) {
            globalSvgCache.set(iconName, text);
            preloadCanvasImage(makeSvgDataUri(text));
          }
        }
      } catch {}
    }, idx * 100);
  });
}

export function EntityLibraryModal({
  isOpen,
  onClose,
  onInsertEntity,
  selectedShapes,
  onSaveSuccess,
}: EntityLibraryModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<OnlineIconResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewSvgs, setPreviewSvgs] = useState<Record<string, string>>({});
  const [customEntities, setCustomEntities] = useState<LibraryEntity[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [hoverTrafficLight, setHoverTrafficLight] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-warm on initial load
  useEffect(() => {
    prewarmAllCategories();
  }, []);

  // Reset minimized/maximized state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomEntities(getCustomEntities());
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Curated items filtered by active category or search query
  const curatedMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (activeCategory === 'custom') return [];

    return CURATED_ARCHITECTURE_ENTITIES.filter((entity) => {
      // 1. If searching, query overrides category constraints
      if (query) {
        const matchesQuery =
          entity.name.toLowerCase().includes(query) ||
          entity.description?.toLowerCase().includes(query) ||
          entity.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          entity.category.toLowerCase().includes(query);
        return matchesQuery;
      }

      // 2. Default category filtering
      if (activeCategory === 'all') {
        return true;
      }

      if (activeCategory === 'devices') {
        return entity.category === 'devices';
      }

      if (activeCategory === 'architecture') {
        return entity.category === 'architecture' || entity.category === 'devices';
      }

      if (activeCategory === 'people') {
        return entity.category === 'people';
      }

      if (activeCategory === 'flowchart') {
        return entity.category === 'flowchart';
      }

      if (activeCategory === 'databases') {
        return entity.tags.includes('database') || entity.tags.includes('cluster') || entity.tags.includes('sql');
      }

      if (activeCategory === 'cloud') {
        return entity.tags.includes('vpc') || entity.tags.includes('cloud') || entity.tags.includes('load balancer') || entity.tags.includes('firewall');
      }

      return entity.category === activeCategory;
    });
  }, [searchQuery, activeCategory]);

  // Load category or query
  const loadCategoryOrQuery = useCallback(async (category: string, query: string) => {
    const trimmedQuery = query.trim().toLowerCase();

    // 1. If searching a query
    if (trimmedQuery) {
      if (globalSearchCache.has(trimmedQuery)) {
        const cached = globalSearchCache.get(trimmedQuery)!;
        setResults(cached);
        setIsSearching(false);

        const previews: Record<string, string> = {};
        cached.forEach((r) => {
          if (globalSvgCache.has(r.iconName)) {
            previews[r.iconName] = globalSvgCache.get(r.iconName)!;
          }
        });
        setPreviewSvgs((prev) => ({ ...prev, ...previews }));
        return;
      }

      setIsSearching(true);
      try {
        let data: any = null;
        try {
          const res = await fetch(`/api/icons/search?query=${encodeURIComponent(trimmedQuery)}&limit=48`);
          if (res.ok) data = await res.json();
        } catch {}

        if (!data || !data.icons || data.icons.length === 0) {
          setResults([]);
          globalSearchCache.set(trimmedQuery, []);
          setIsSearching(false);
          return;
        }

        const items: OnlineIconResult[] = data.icons.map(iconNameToResult);
        globalSearchCache.set(trimmedQuery, items);
        setResults(items);

        // Pre-fetch SVGs in background
        items.slice(0, 32).forEach(async (r) => {
          if (globalSvgCache.has(r.iconName)) {
            setPreviewSvgs((prev) => ({ ...prev, [r.iconName]: globalSvgCache.get(r.iconName)! }));
            return;
          }
          try {
            const svgRes = await fetch(r.svgUrl);
            if (svgRes.ok) {
              const text = await svgRes.text();
              if (text && text.includes('<svg')) {
                globalSvgCache.set(r.iconName, text);
                setPreviewSvgs((prev) => ({ ...prev, [r.iconName]: text }));
                preloadCanvasImage(makeSvgDataUri(text));
              }
            }
          } catch {}
        });
      } catch (err) {
        console.warn('Search warning:', err);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // 2. Default: Category view
    if (category === 'custom' || category === 'devices' || category === 'people' || category === 'flowchart') {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const featured = CATEGORY_FEATURED_ICONS[category] || CATEGORY_FEATURED_ICONS.all || [];
    const items = featured.map(iconNameToResult);
    setResults(items);
    setIsSearching(false);

    // Populate existing preview SVGs from cache
    const previews: Record<string, string> = {};
    items.forEach((r) => {
      if (globalSvgCache.has(r.iconName)) {
        previews[r.iconName] = globalSvgCache.get(r.iconName)!;
      }
    });
    setPreviewSvgs((prev) => ({ ...prev, ...previews }));

    // Fetch missing SVGs
    items.forEach(async (r) => {
      if (!globalSvgCache.has(r.iconName)) {
        try {
          const res = await fetch(r.svgUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && text.includes('<svg')) {
              globalSvgCache.set(r.iconName, text);
              setPreviewSvgs((prev) => ({ ...prev, [r.iconName]: text }));
              preloadCanvasImage(makeSvgDataUri(text));
            }
          }
        } catch {}
      }
    });
  }, []);

  // Update on query or category change
  useEffect(() => {
    if (!isOpen) return;

    if (searchQuery.trim()) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        loadCategoryOrQuery(activeCategory, searchQuery);
      }, 200);
    } else {
      loadCategoryOrQuery(activeCategory, '');
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, activeCategory, isOpen, loadCategoryOrQuery]);

  // Unified items list: Blends both Curated Items and Real Online Logos seamlessly on the first screen
  const displayItems = useMemo<DisplayItem[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. If in custom templates tab
    if (activeCategory === 'custom') return [];

    // 2. If user is searching a query
    if (query) {
      const curatedMatchesFormatted: DisplayItem[] = curatedMatches.map((entity) => ({
        type: 'curated',
        entity,
      }));
      const onlineMatchesFormatted: DisplayItem[] = results.map((icon) => ({
        type: 'online',
        icon,
      }));

      // Interleave matching curated and online icons
      const combined: DisplayItem[] = [];
      let cIdx = 0;
      let oIdx = 0;
      while (cIdx < curatedMatchesFormatted.length || oIdx < onlineMatchesFormatted.length) {
        if (cIdx < curatedMatchesFormatted.length) {
          combined.push(curatedMatchesFormatted[cIdx]!);
          cIdx++;
        }
        if (oIdx < onlineMatchesFormatted.length) {
          combined.push(onlineMatchesFormatted[oIdx]!);
          oIdx++;
        }
        if (oIdx < onlineMatchesFormatted.length) {
          combined.push(onlineMatchesFormatted[oIdx]!);
          oIdx++;
        }
      }
      return combined;
    }

    // 3. Default "All Items" View -> Beautiful Interleaved Mix of Curated + Real Brand Logos
    if (activeCategory === 'all') {
      const mixed: DisplayItem[] = [];
      const onlineResults = results.length > 0
        ? results
        : (CATEGORY_FEATURED_ICONS.all || []).map(iconNameToResult);

      const curatedPriorityIds = [
        'device-serverrack',
        'device-macbook',
        'device-iphone',
        'arch-loadbalancer',
        'arch-firewall',
        'arch-dbcluster',
        'arch-microservice',
        'arch-vpc',
        'arch-messagequeue',
        'person-developer',
        'person-ai',
        'person-user',
        'flowchart-decision',
        'flowchart-process',
        'device-monitor',
        'device-tablet',
        'device-iot',
        'arch-cdn-edge',
        'arch-apigateway',
        'arch-storagebucket',
      ];

      const curatedMap = new Map(CURATED_ARCHITECTURE_ENTITIES.map((c) => [c.id, c]));
      const curatedSelected = curatedPriorityIds
        .map((id) => curatedMap.get(id))
        .filter(Boolean) as LibraryEntity[];

      let cIdx = 0;
      let oIdx = 0;

      // Pattern: 1 Curated -> 2 Online -> 1 Curated -> 2 Online...
      while (cIdx < curatedSelected.length || oIdx < onlineResults.length) {
        if (cIdx < curatedSelected.length) {
          mixed.push({ type: 'curated', entity: curatedSelected[cIdx]! });
          cIdx++;
        }
        if (oIdx < onlineResults.length) {
          mixed.push({ type: 'online', icon: onlineResults[oIdx]! });
          oIdx++;
        }
        if (oIdx < onlineResults.length) {
          mixed.push({ type: 'online', icon: onlineResults[oIdx]! });
          oIdx++;
        }
      }

      return mixed;
    }

    // 4. Specific category view
    const categoryCurated: DisplayItem[] = curatedMatches.map((entity) => ({
      type: 'curated',
      entity,
    }));
    const categoryOnline: DisplayItem[] = results.map((icon) => ({
      type: 'online',
      icon,
    }));

    return [...categoryCurated, ...categoryOnline];
  }, [searchQuery, activeCategory, curatedMatches, results]);

  // Insert Curated Entity onto canvas INSTANTLY (0ms latency)
  const handleInsertCurated = (entity: LibraryEntity, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (entity.previewSvg) {
      preloadCanvasImage(makeSvgDataUri(entity.previewSvg));
    }
    onInsertEntity(entity);
    onClose();
  };

  // Insert Online Icon onto canvas INSTANTLY (0ms latency, synchronous UI response)
  const handleInsertIcon = (icon: OnlineIconResult, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const cachedSvg = previewSvgs[icon.iconName] || globalSvgCache.get(icon.iconName);
    const finalSrc = cachedSvg && cachedSvg.includes('<svg')
      ? makeSvgDataUri(cachedSvg)
      : `/api/icons/svg?name=${encodeURIComponent(icon.iconName)}`;

    // Preload canvas image in memory immediately
    preloadCanvasImage(finalSrc);

    const fallbackSvg =
      cachedSvg && cachedSvg.includes('<svg')
        ? cachedSvg
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#1e1e24" stroke="#cae39f" stroke-width="4"/><text x="50" y="55" fill="#cae39f" font-size="13" font-weight="bold" font-family="system-ui" text-anchor="middle">${icon.title.slice(0, 8)}</text></svg>`;

    const entity: LibraryEntity = {
      id: `online-${icon.iconName.replace(/[^a-zA-Z0-9]/g, '-')}`,
      name: icon.title,
      category: 'cloud',
      tags: [icon.title.toLowerCase(), icon.collection, 'online', 'iconify'],
      description: `Official logo from ${icon.collection}`,
      previewSvg: fallbackSvg,
      createShapes: (center, style, genId) => {
        const w = 88;
        const h = 88;
        return [
          {
            type: 'image',
            src: finalSrc,
            x: Math.round(center.x - w / 2),
            y: Math.round(center.y - h / 2 - 12),
            width: w,
            height: h,
            opacity: style.opacity ?? 100,
            clientId: genId(),
          },
          {
            type: 'text',
            text: icon.title,
            x: Math.round(center.x - icon.title.length * 4.5),
            y: Math.round(center.y + h / 2 - 6),
            fontSize: 18,
            strokeColor: style.strokeColor || '#ffffff',
            opacity: style.opacity ?? 100,
            clientId: genId(),
          },
        ];
      },
    };

    onInsertEntity(entity);
    onClose();
  };

  // Handle saving current selected shapes as a custom template
  const handleSaveSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || selectedShapes.length === 0) return;

    setIsSaving(true);
    const success = saveCustomEntity(templateName.trim(), selectedShapes);
    if (success) {
      setCustomEntities(getCustomEntities());
      setTemplateName('');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
      onSaveSuccess?.();
    }
    setIsSaving(false);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved custom template?')) {
      deleteCustomEntity(id);
      setCustomEntities(getCustomEntities());
    }
  };

  if (!isOpen) return null;

  // Render floating minimized dock capsule if user clicked Yellow traffic light
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '28px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          backgroundColor: 'rgba(18, 20, 30, 0.55)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(36px) saturate(220%)',
          WebkitBackdropFilter: 'blur(36px) saturate(220%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '9999px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          color: '#ffffff',
          cursor: 'pointer',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
        }}
        onClick={() => setIsMinimized(false)}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(202, 227, 159, 0.2)',
            border: '1px solid rgba(202, 227, 159, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cae39f',
          }}
        >
          <Globe size={13} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Icon & Architecture Library</span>
        <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.55)' }}>Click to restore</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
            onClose();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            marginLeft: '4px',
          }}
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(6, 10, 20, 0.28)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: isMaximized ? '12px' : '24px',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .mac-glass-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .mac-glass-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .mac-glass-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .mac-glass-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.32);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>

      {/* Mac Glass Window Container */}
      <div
        style={{
          width: isMaximized ? '97vw' : '100%',
          maxWidth: isMaximized ? 'none' : '1140px',
          height: isMaximized ? '95vh' : '88vh',
          maxHeight: isMaximized ? 'none' : '840px',
          backgroundColor: 'rgba(15, 20, 32, 0.38)',
          backgroundImage:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 30%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(36px) saturate(210%) brightness(108%)',
          WebkitBackdropFilter: 'blur(36px) saturate(210%) brightness(108%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: isMaximized ? '18px' : '24px',
          boxShadow:
            '0 32px 80px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          position: 'relative',
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Titlebar with Authentic Functional Traffic Light Buttons */}
        <div
          style={{
            padding: '16px 22px 14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.02) 100%)',
            userSelect: 'none',
          }}
        >
          {/* Left: macOS Traffic Lights with Functional Handlers and Pixel-Perfect Glyphs */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onMouseEnter={() => setHoverTrafficLight(true)}
            onMouseLeave={() => setHoverTrafficLight(false)}
          >
            {/* Red Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
                border: '1px solid rgba(224, 68, 62, 0.95)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                outline: 'none',
                transition: 'transform 0.1s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {hoverTrafficLight && (
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M1.5 1.5L5.5 5.5M5.5 1.5L1.5 5.5" stroke="#4c0002" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Yellow Minimize Button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to Dock"
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
                border: '1px solid rgba(222, 161, 35, 0.95)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                outline: 'none',
                transition: 'transform 0.1s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {hoverTrafficLight && (
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M1 3.5H6" stroke="#5b3c00" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Green Zoom / Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              title={isMaximized ? 'Exit Full Screen' : 'Full Screen'}
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#27c93f',
                border: '1px solid rgba(26, 171, 41, 0.95)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                outline: 'none',
                transition: 'transform 0.1s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {hoverTrafficLight && (
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  {isMaximized ? (
                    <path d="M1 3.5 L3.5 1 L3.5 3.5 Z M6 3.5 L3.5 6 L3.5 3.5 Z" fill="#004d1a" />
                  ) : (
                    <path d="M1 1 L3.6 1 L1 3.6 Z M6 6 L3.4 6 L6 3.4 Z" fill="#004d1a" />
                  )}
                </svg>
              )}
            </button>
          </div>

          {/* Center: macOS Clean Window Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '7px',
                background: 'rgba(202, 227, 159, 0.2)',
                border: '1px solid rgba(202, 227, 159, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cae39f',
              }}
            >
              <Globe size={14} />
            </div>
            <span style={{ fontSize: '0.94rem', fontWeight: 600, letterSpacing: '-0.015em', color: '#ffffff' }}>
              Icon & Architecture Library
            </span>
          </div>

          {/* Right: Key Hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'rgba(255, 255, 255, 0.65)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                padding: '2px 7px',
                borderRadius: '6px',
                fontFamily: 'monospace',
              }}
            >
              ESC
            </span>
          </div>
        </div>

        {/* Mac Spotlight Search & Frosted Filter Bar */}
        <div
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '11px',
            background: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* Spotlight Search Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: 'rgba(202, 227, 159, 0.95)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Spotlight Search: server racks, iphone, macbook, load balancers, aws lambda, react, python..."
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 42px',
                  backgroundColor: 'rgba(255, 255, 255, 0.075)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxShadow: 'inset 0 1.5px 3px rgba(0, 0, 0, 0.25), 0 1px 1px rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(202, 227, 159, 0.85)';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(202, 227, 159, 0.25), inset 0 1.5px 3px rgba(0, 0, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.boxShadow =
                    'inset 0 1.5px 3px rgba(0, 0, 0, 0.25), 0 1px 1px rgba(255, 255, 255, 0.1)';
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.14)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Mac Segmented Frosted Glass Category Pills */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '2px 0',
            }}
          >
            {[
              { id: 'all', label: 'All Items', icon: <Boxes size={13} /> },
              { id: 'devices', label: 'Devices', icon: <Laptop size={13} /> },
              { id: 'architecture', label: 'Infra & System', icon: <Cpu size={13} /> },
              { id: 'cloud', label: 'Cloud & AWS', icon: <Cloud size={13} /> },
              { id: 'companies', label: 'Tech Giants', icon: <Building2 size={13} /> },
              { id: 'databases', label: 'Databases', icon: <Database size={13} /> },
              { id: 'frameworks', label: 'Frameworks', icon: <Code2 size={13} /> },
              { id: 'devops', label: 'DevOps', icon: <Terminal size={13} /> },
              { id: 'people', label: 'People', icon: <Users size={13} /> },
              { id: 'flowchart', label: 'Flowcharts', icon: <GitCommit size={13} /> },
              { id: 'custom', label: `My Saved (${customEntities.length})`, icon: <Bookmark size={13} /> },
            ].map((cat) => {
              const isActive = activeCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: isActive
                      ? '1px solid rgba(202, 227, 159, 0.55)'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: isActive
                      ? 'rgba(202, 227, 159, 0.22)'
                      : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive
                      ? '0 4px 14px rgba(202, 227, 159, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      : 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }
                  }}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Preset Tags with Glassmorphic Styling */}
          <div
            style={{
              display: 'flex',
              gap: '5px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginRight: '2px',
              }}
            >
              Quick:
            </span>
            {POPULAR_SEARCH_PRESETS.map((preset) => {
              const isSelected = searchQuery.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSearchQuery(preset)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '7px',
                    border: isSelected
                      ? '1px solid rgba(202, 227, 159, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isSelected
                      ? 'rgba(202, 227, 159, 0.2)'
                      : 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(8px)',
                    color: isSelected ? '#cae39f' : 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.73rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.09)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    }
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area: Custom Templates Tab View */}
        {activeCategory === 'custom' && !searchQuery ? (
          <div
            className="mac-glass-scroll"
            style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '24px' }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.08rem', fontWeight: 600 }}>Personal Saved Components</h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                Select shapes on your whiteboard canvas and save them as reusable multi-shape templates.
              </p>
            </div>

            {/* Save current selection section */}
            {selectedShapes.length > 0 ? (
              <form
                onSubmit={handleSaveSelection}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(202, 227, 159, 0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(202, 227, 159, 0.3)',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder={`Name template for ${selectedShapes.length} selected item${selectedShapes.length > 1 ? 's' : ''}...`}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!templateName.trim() || isSaving}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#cae39f',
                    color: '#121212',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: !templateName.trim() ? 'not-allowed' : 'pointer',
                    opacity: !templateName.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(202, 227, 159, 0.3)',
                  }}
                >
                  <Plus size={16} />
                  Save Selection ({selectedShapes.length})
                </button>
              </form>
            ) : (
              <div
                style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  fontSize: '0.84rem',
                  marginBottom: '20px',
                }}
              >
                Tip: Select shapes or diagrams on the canvas, then open this library to save them as reusable templates.
              </div>
            )}

            {/* Custom list grid */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '14px',
                alignContent: 'start',
              }}
            >
              {customEntities.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No saved templates yet.
                </div>
              ) : (
                customEntities.map((entity) => (
                  <div
                    key={entity.id}
                    onClick={() => {
                      onInsertEntity(entity);
                      onClose();
                    }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0.5px rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '10px',
                      }}
                      dangerouslySetInnerHTML={{ __html: entity.previewSvg }}
                    />
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{entity.name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                      {entity.description}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustom(entity.id, e)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '6px',
                        padding: '4px',
                        color: '#f87171',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Main Combined Unified Grid: Interleaved Curated Primitives + Real Brand Logos */
          <div
            className="mac-glass-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '14px',
              alignContent: 'start',
            }}
          >
            {/* Shimmer skeleton placeholders when fetching new query */}
            {isSearching && displayItems.length === 0 && (
              <>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <div
                      style={{
                        width: '70%',
                        height: '14px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <div
                      style={{
                        width: '40%',
                        height: '10px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.06)',
                      }}
                    />
                  </div>
                ))}
              </>
            )}

            {/* Empty search state if no items exist */}
            {!isSearching && displayItems.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#94a3b8',
                }}
              >
                <Globe size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' }}>No items or icons found</div>
                <div style={{ fontSize: '0.84rem', marginTop: '4px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Try searching for &quot;server rack&quot;, &quot;iphone&quot;, &quot;macbook&quot;, &quot;aws
                  lambda&quot;, &quot;angular&quot;, &quot;php&quot;, &quot;postgres&quot;...
                </div>
              </div>
            )}

            {/* Unified Mac Crystal Glass Cards */}
            {displayItems.map((item) => {
              if (item.type === 'curated') {
                const entity = item.entity;
                return (
                  <div
                    key={`curated-${entity.id}`}
                    onClick={(e) => handleInsertCurated(entity, e)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.045)',
                      backgroundImage:
                        'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.13)',
                      borderRadius: '16px',
                      padding: '16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0.5px rgba(255, 255, 255, 0.22)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(202, 227, 159, 0.65)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.boxShadow =
                        '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(202, 227, 159, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.13)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.045)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0.5px rgba(255, 255, 255, 0.22)';
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '10px',
                      }}
                      dangerouslySetInnerHTML={{ __html: entity.previewSvg }}
                    />

                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        color: '#f8fafc',
                        marginBottom: '2px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entity.name}
                    </div>

                    <div
                      style={{
                        fontSize: '0.71rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: '1.25',
                        marginBottom: '6px',
                        height: '24px',
                        overflow: 'hidden',
                      }}
                    >
                      {entity.description}
                    </div>

                    <div
                      style={{
                        fontSize: '0.67rem',
                        color: '#cae39f',
                        background: 'rgba(202, 227, 159, 0.15)',
                        border: '1px solid rgba(202, 227, 159, 0.35)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {entity.category === 'devices'
                        ? 'Hardware'
                        : entity.category === 'architecture'
                        ? 'System Infra'
                        : entity.category}
                    </div>
                  </div>
                );
              }

              const icon = item.icon;
              const svgData = previewSvgs[icon.iconName] || globalSvgCache.get(icon.iconName);
              return (
                <div
                  key={`online-${icon.iconName}`}
                  onClick={(e) => handleInsertIcon(icon, e)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.045)',
                    backgroundImage:
                      'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.13)',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0.5px rgba(255, 255, 255, 0.22)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(202, 227, 159, 0.65)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(202, 227, 159, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.13)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.045)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0.5px rgba(255, 255, 255, 0.22)';
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    {svgData ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        dangerouslySetInnerHTML={{ __html: svgData }}
                      />
                    ) : (
                      <img
                        src={icon.svgUrl}
                        alt={icon.title}
                        style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        loading="lazy"
                        onLoad={() => {
                          preloadCanvasImage(icon.svgUrl);
                        }}
                        onError={(e) => {
                          (e.target as any).src = `https://api.iconify.design/${icon.iconName}.svg`;
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      color: '#f8fafc',
                      marginBottom: '2px',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {icon.title}
                  </div>

                  <div
                    style={{
                      fontSize: '0.71rem',
                      color: 'rgba(255, 255, 255, 0.55)',
                      lineHeight: '1.25',
                      marginBottom: '6px',
                      height: '24px',
                      overflow: 'hidden',
                    }}
                  >
                    Official Vector Logo
                  </div>

                  <div
                    style={{
                      fontSize: '0.67rem',
                      color: 'rgba(255, 255, 255, 0.75)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                    }}
                  >
                    {icon.collection}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* macOS Frosted Glass Footer */}
        <div
          style={{
            padding: '11px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(12, 14, 22, 0.45)',
            backdropFilter: 'blur(25px)',
            fontSize: '0.76rem',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Click any hardware device, architecture component, or vector logo to drop on canvas.</span>
          </div>
          {saveToast && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#cae39f',
                fontWeight: 600,
              }}
            >
              <Check size={14} /> Template saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

