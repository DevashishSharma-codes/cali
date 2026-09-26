import { Shape, ShapeStyle } from './types';

export type EntityCategory =
  | 'all'
  | 'cloud'
  | 'companies'
  | 'databases'
  | 'frameworks'
  | 'architecture'
  | 'devices'
  | 'people'
  | 'flowchart'
  | 'custom';

export interface LibraryEntity {
  id: string;
  name: string;
  category: 'cloud' | 'companies' | 'databases' | 'frameworks' | 'architecture' | 'devices' | 'people' | 'flowchart' | 'custom';
  tags: string[];
  description?: string;
  previewSvg: string;
  createShapes: (
    center: { x: number; y: number },
    style: ShapeStyle,
    generateId: () => string
  ) => Shape[];
}

// Helper to construct crisp SVG data URI for instant previews and rendering
export function makeSvgDataUri(svgContent: string): string {
  const cleaned = svgContent.trim().replace(/\n/g, '').replace(/\s+/g, ' ');
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

// --------------------------------------------------------------------------
// 1. OFFICIAL CLOUD & AWS LOGOS
// --------------------------------------------------------------------------

export const svgAws = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#232f3e"/><path fill="#ff9900" d="M129.5 174.6c-28.7 0-54.3-10.7-74.8-28.5-2.6-2.3-1.6-5.2 1.3-4.1 22.4 8.7 48.7 13.9 74.3 13.9 37.8 0 71.9-10.7 97.4-28.4 3.7-2.6 6.9.9 4.3 3.6-24.8 26.6-61.9 43.5-102.5 43.5zm79.1-17.7c-3.2-4.1-21.2-1.9-29.3-1-2.4.3-2.8-1.5-.7-2.9 13.9-9.1 36.6-6.5 40.2-2.1 3.5 4.3-1 27.6-14.1 38-2 1.6-3.8.7-2.8-1.4 3.5-7.3 9.9-26.5 6.7-30.6zM85.4 79.5c0 5.6-2.5 10.7-6.9 14-4.5 3.3-10.4 4.8-16.7 4.8-4.4 0-8.6-.7-12.2-2.1v-8.7c3.5 1.7 7.7 2.6 11.8 2.6 3.8 0 7.2-.9 9.7-2.7 2.5-1.9 3.8-4.7 3.8-7.9 0-3.3-1.4-6-4.1-8-2.6-2-6.5-3.6-11.5-4.8-6.4-1.5-11.4-3.8-14.8-6.8-3.4-3-5.2-7.3-5.2-12.8 0-5.3 2.3-9.9 6.6-13.1 4.3-3.2 9.9-4.8 15.9-4.8 4.2 0 8.1.6 11.5 1.8v8.6c-3.1-1.3-6.9-2-10.7-2-3.4 0-6.4.8-8.8 2.4-2.3 1.6-3.6 4.1-3.6 7 0 2.9 1.4 5.3 4 7.2 2.6 1.8 6.4 3.3 11.3 4.5 6.6 1.6 11.7 4 15.1 7.2 3.4 3.1 5.2 7.7 5.2 13.7zm49.1-28.8l-15.6 46.1h-10.7L92.6 50.7h11.2l9.7 32.7 9.8-32.7h11.2zm38.8 33.3c0 4.6-2 8.7-5.8 11.5-3.8 2.8-8.9 4.2-14.7 4.2-4.1 0-8-.6-11.4-1.9V89c3.3 1.5 7.1 2.3 10.9 2.3 3.3 0 6.1-.7 8.1-2.1 2.1-1.4 3.1-3.6 3.1-6.1 0-2.4-.9-4.4-2.8-5.8-1.9-1.4-4.8-2.5-8.5-3.3-5.4-1.1-9.6-2.7-12.5-4.8-2.9-2.1-4.4-5.3-4.4-9.3 0-4.3 1.8-8 5.3-10.5 3.5-2.6 8.1-3.9 13.4-3.9 3.6 0 7.1.5 10.3 1.5v8.3c-2.9-1.1-6.2-1.7-9.5-1.7-3 0-5.6.6-7.5 1.9-1.9 1.3-2.9 3.1-2.9 5.4 0 2.2.9 4 2.8 5.2 1.8 1.2 4.7 2.2 8.4 3 5.4 1.1 9.6 2.7 12.6 4.9 3 2.1 4.5 5.2 4.5 9.1z"/></svg>`;

export const svgAwsLambda = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="lambda-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#c8511b"/><stop offset="100%" stop-color="#ff9900"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#lambda-grad)"/><path fill="#ffffff" d="M89.6 211.2H49.9l43.9-91.8l19.9 41zm7.1-100.6a3.2 3.2 0 0 0-2.9-1.8H93.8a3.2 3.2 0 0 0-2.9 1.8L41.9 213a3.2 3.2 0 0 0 2.9 4.6h46.8a3.2 3.2 0 0 0 2.9-1.8l25.7-54.1a3.2 3.2 0 0 0 0-2.8zM208 211.2h-39.5L105.2 78.6a3.2 3.2 0 0 0-2.9-1.8H76.5l.03-32h50.6l63 132.6a3.2 3.2 0 0 0 2.9 1.8H208zm3.2-38.4h-16.1L132 40.2a3.2 3.2 0 0 0-2.9-1.8H73.3a3.2 3.2 0 0 0-3.2 3.2l-.03 38.4a3.2 3.2 0 0 0 3.2 3.2h27l63.3 132.6a3.2 3.2 0 0 0 2.9 1.8h44.7a3.2 3.2 0 0 0 3.2-3.2V176a3.2 3.2 0 0 0-3.2-3.2z"/></svg>`;

export const svgServerless = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#18181b"/><path fill="#fd5750" d="M136 28L68 120h48l-28 108 84-118h-48z"/></svg>`;

export const svgAwsS3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="s3-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#b00808"/><stop offset="100%" stop-color="#e05243"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#s3-grad)"/><path fill="#ffffff" d="M128 42l76 38v96l-76 38-76-38V80l76-38zm0 24L74 92l54 27 54-27-54-26zm60 41l-50 25v69l50-25v-69zm-70 94v-69l-50-25v69l50 25z"/></svg>`;

export const svgAwsEc2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="ec2-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#d05c17"/><stop offset="100%" stop-color="#ff9900"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#ec2-grad)"/><rect x="68" y="68" width="120" height="120" rx="14" fill="#ffffff" fill-opacity="0.25"/><rect x="84" y="84" width="88" height="88" rx="8" fill="#ffffff"/><path fill="#ff9900" d="M102 110h52v12h-52zm0 24h52v12h-52z"/><path stroke="#ffffff" stroke-width="8" stroke-linecap="round" d="M96 48v16m32-16v16m32-16v16m-64 128v16m32-16v16m32-16v16M48 96h16m-16 32h16m-16 32h16m128-64h16m-16 32h16m-16 32h16"/></svg>`;

export const svgAwsDynamoDb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="ddb-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#234485"/><stop offset="100%" stop-color="#3b48cc"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#ddb-grad)"/><path fill="#ffffff" d="M72 58h112v34H72zm0 53h112v34H72zm0 53h112v34H72z" fill-opacity="0.3"/><path fill="#85b2ff" d="M86 68h84v14H86zm0 53h84v14H86zm0 53h84v14H86z"/><circle cx="58" cy="75" r="7" fill="#ffffff"/><circle cx="58" cy="128" r="7" fill="#ffffff"/><circle cx="58" cy="181" r="7" fill="#ffffff"/></svg>`;

export const svgAwsCloudFront = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="cf-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#5c2d91"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#cf-grad)"/><circle cx="128" cy="128" r="70" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="14 10"/><circle cx="128" cy="128" r="28" fill="#ffffff"/><path stroke="#ffffff" stroke-width="8" stroke-linecap="round" d="M128 40v20m0 136v20M40 128h20m136 0h20"/></svg>`;

export const svgAwsApiGateway = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="apigw-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#b80061"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#apigw-grad)"/><rect x="60" y="60" width="136" height="136" rx="24" fill="none" stroke="#ffffff" stroke-width="12"/><path stroke="#ffffff" stroke-width="12" stroke-linecap="round" d="M90 128h76M128 90v76"/><circle cx="90" cy="128" r="10" fill="#ffffff"/><circle cx="166" cy="128" r="10" fill="#ffffff"/><circle cx="128" cy="90" r="10" fill="#ffffff"/><circle cx="128" cy="166" r="10" fill="#ffffff"/></svg>`;

export const svgAwsRds = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="rds-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#1b4c80"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#rds-grad)"/><ellipse cx="128" cy="74" rx="68" ry="26" fill="#ffffff"/><path d="M60 74v54c0 14.36 30.44 26 68 26s68-11.64 68-26V74" fill="none" stroke="#ffffff" stroke-width="10"/><path d="M60 128v54c0 14.36 30.44 26 68 26s68-11.64 68-26v-54" fill="none" stroke="#ffffff" stroke-width="10"/></svg>`;

export const svgAwsSqs = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="sqs-grad" x1="0%" x2="100%" y1="100%" y2="0%"><stop offset="0%" stop-color="#d05c17"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#sqs-grad)"/><rect x="52" y="76" width="34" height="104" rx="6" fill="#ffffff"/><rect x="111" y="76" width="34" height="104" rx="6" fill="#ffffff"/><rect x="170" y="76" width="34" height="104" rx="6" fill="#ffffff"/><path stroke="#ffffff" stroke-width="8" stroke-linecap="round" d="M38 128h180M196 110l18 18-18 18"/></svg>`;

export const svgGoogleCloud = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 206"><path fill="#ea4335" d="M141.5 60.3l18.5-32A85.6 85.6 0 0 0 81.3 50.8l27.8 27.8c8.9-10.7 20-16.7 32.4-18.3z"/><path fill="#4285f4" d="M228.6 102.5c0-6.1-.8-12-2.3-17.7l-49.8.1c3.2 5.3 4.9 11.3 4.9 17.6 0 16.5-11.8 30.3-27.4 33.6l16.1 27.9c34-8.8 58.5-39.7 58.5-61.5z"/><path fill="#fbbc05" d="M109.1 78.6L81.3 50.8A85.7 85.7 0 0 0 42.6 131l27.9 16.1c-2.4-14.1 1.2-28.7 10.7-39.7 7.7-8.9 17.3-15.6 27.9-28.8z"/><path fill="#34a853" d="M154 164l-16.1-27.9c-3.1.6-6.3 1-9.6 1-13.6 0-25.5-7.7-31.3-19L69.1 134.2C80.2 165.7 110.6 188 146.4 188c8.2 0 16.1-1.2 23.6-3.4l-16-20.6z"/></svg>`;

export const svgAzure = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#008ad7" d="M142 28L40 216h62l30-58 50 58h58L142 28z"/><path fill="#0078d4" d="M132 158l-30 58h96l-38-58h-28z"/><path fill="#50e6ff" d="M142 28l-40 82 48 48 32-48-40-82z"/></svg>`;

export const svgCloudflare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#18181b"/><path fill="#f38020" d="M196 90a56 56 0 0 0-108-10A42 42 0 0 0 42 120a44 44 0 0 0 4 86h150a48 48 0 0 0 0-96c0-6.8-.7-13.4-2-19.8l2-.2z"/><path fill="#faae40" d="M188 126a48 48 0 0 0-18-3l-2 .1A56 56 0 0 0 88 80a42 42 0 0 0-46 40c-.4 2-.7 4-1 6a44 44 0 0 0 4 80h150a48 48 0 0 0 0-96c-2.4 0-4.7.4-7 1.1z"/></svg>`;

export const svgVercel = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#000000"/><polygon points="128,48 216,198 40,198" fill="#ffffff"/></svg>`;

export const svgSupabase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#1c1c1c"/><path fill="#3ecf8e" d="M145 28L46 150h75l-10 78 99-122h-75l10-78z"/></svg>`;

export const svgFirebase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 350"><path fill="#ffa000" d="M38.8 189.7L82.1 106a12 12 0 0 1 22.3 2.8l21.2 114.7L38.8 189.7z"/><path fill="#f57c00" d="M165.7 137.6l-32.9-62.5a12 12 0 0 0-21.4 0L38.8 189.7l86.8 48.8 40.1-100.9z"/><path fill="#ffca28" d="M217.2 270.4L188.7 94.6a12 12 0 0 0-23-2.9l-37.1 70 88.6 108.7z"/><path fill="#ffa000" d="M134.4 346.5a16 16 0 0 0 14.8-1.5L251 278.4 217.2 270.4 134.4 346.5z"/></svg>`;

// --------------------------------------------------------------------------
// 2. HARDWARE, CLIENT DEVICES & MODERN ELECTRONICS
// --------------------------------------------------------------------------

export const svgMacBook = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(0, 48)"><rect x="36" y="16" width="184" height="114" rx="8" fill="#18181b" stroke="#52525b" stroke-width="4"/><rect x="44" y="24" width="168" height="96" rx="4" fill="#09090b"/><circle cx="128" cy="20" r="2.5" fill="#71717a"/><path d="M12 136h232a8 8 0 0 1 8 8v4H4v-4a8 8 0 0 1 8-8z" fill="#27272a" stroke="#52525b" stroke-width="3"/><path d="M108 136h40v4h-40z" fill="#71717a"/><rect x="70" y="45" width="116" height="54" rx="6" fill="#181822" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4 2"/><circle cx="85" cy="58" r="3" fill="#ef4444"/><circle cx="95" cy="58" r="3" fill="#eab308"/><circle cx="105" cy="58" r="3" fill="#22c55e"/><line x1="85" y1="72" x2="145" y2="72" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="85" y1="82" x2="165" y2="82" stroke="#cae39f" stroke-width="2" stroke-linecap="round"/></g></svg>`;

export const svgIphone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(63, 13)"><rect x="10" y="10" width="110" height="210" rx="26" fill="#18181b" stroke="#52525b" stroke-width="4"/><rect x="16" y="16" width="98" height="198" rx="20" fill="#09090b"/><rect x="47" y="22" width="36" height="10" rx="5" fill="#27272a"/><circle cx="73" cy="27" r="2" fill="#71717a"/><rect x="26" y="48" width="78" height="42" rx="8" fill="#181822" stroke="#cae39f" stroke-width="1.5"/><circle cx="38" cy="62" r="4" fill="#cae39f"/><line x1="48" y1="62" x2="90" y2="62" stroke="#f8fafc" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="74" x2="80" y2="74" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><rect x="26" y="100" width="78" height="70" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/><circle cx="65" cy="130" r="14" fill="#6366f1" fill-opacity="0.3" stroke="#818cf8" stroke-width="2"/><line x1="40" y1="156" x2="90" y2="156" stroke="#c7d2fe" stroke-width="2" stroke-linecap="round"/></g></svg>`;

export const svgMonitor = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(0, 28)"><rect x="16" y="16" width="224" height="136" rx="10" fill="#18181b" stroke="#52525b" stroke-width="4"/><rect x="24" y="24" width="208" height="116" rx="6" fill="#09090b"/><path d="M108 152l-12 36h64l-12-36" fill="#27272a" stroke="#52525b" stroke-width="3"/><rect x="76" y="188" width="104" height="6" rx="3" fill="#52525b"/><rect x="40" y="42" width="176" height="80" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/><path stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none" d="M60 95l25-25 30 20 40-35 30 25"/><circle cx="155" cy="55" r="4" fill="#f59e0b"/></g></svg>`;

export const svgTablet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(43, 13)"><rect x="12" y="10" width="146" height="210" rx="18" fill="#18181b" stroke="#52525b" stroke-width="4"/><rect x="18" y="16" width="134" height="198" rx="12" fill="#09090b"/><circle cx="85" cy="14" r="2.5" fill="#71717a"/><rect x="30" y="36" width="110" height="70" rx="8" fill="#1a1c2e" stroke="#c084fc" stroke-width="1.5"/><line x1="42" y1="56" x2="110" y2="56" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/><line x1="42" y1="72" x2="126" y2="72" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round"/><line x1="42" y1="88" x2="95" y2="88" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/></g></svg>`;

export const svgServerRack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(33, 3)"><rect x="16" y="14" width="158" height="222" rx="14" fill="#18181b" stroke="#3f3f46" stroke-width="4"/><rect x="26" y="24" width="138" height="42" rx="6" fill="#22222a" stroke="#52525b" stroke-width="2"/><rect x="26" y="74" width="138" height="42" rx="6" fill="#22222a" stroke="#52525b" stroke-width="2"/><rect x="26" y="124" width="138" height="42" rx="6" fill="#22222a" stroke="#52525b" stroke-width="2"/><rect x="26" y="174" width="138" height="42" rx="6" fill="#22222a" stroke="#52525b" stroke-width="2"/><circle cx="42" cy="45" r="4.5" fill="#22c55e"/><circle cx="56" cy="45" r="4.5" fill="#3b82f6"/><circle cx="70" cy="45" r="4.5" fill="#cae39f"/><line x1="94" y1="45" x2="148" y2="45" stroke="#71717a" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="95" r="4.5" fill="#22c55e"/><circle cx="56" cy="95" r="4.5" fill="#3b82f6"/><circle cx="70" cy="95" r="4.5" fill="#eab308"/><line x1="94" y1="95" x2="148" y2="95" stroke="#71717a" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="145" r="4.5" fill="#22c55e"/><circle cx="56" cy="145" r="4.5" fill="#3b82f6"/><circle cx="70" cy="145" r="4.5" fill="#22c55e"/><line x1="94" y1="145" x2="148" y2="145" stroke="#71717a" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="195" r="4.5" fill="#22c55e"/><circle cx="56" cy="195" r="4.5" fill="#a855f7"/><circle cx="70" cy="195" r="4.5" fill="#3b82f6"/><line x1="94" y1="195" x2="148" y2="195" stroke="#71717a" stroke-width="4" stroke-linecap="round"/></g></svg>`;

export const svgBladeServer = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(0, 73)"><rect x="16" y="16" width="224" height="78" rx="10" fill="#18181b" stroke="#52525b" stroke-width="4"/><rect x="28" y="28" width="110" height="54" rx="6" fill="#27272a" stroke="#3f3f46" stroke-width="2"/><line x1="42" y1="42" x2="124" y2="42" stroke="#52525b" stroke-width="3" stroke-linecap="round"/><line x1="42" y1="55" x2="124" y2="55" stroke="#52525b" stroke-width="3" stroke-linecap="round"/><line x1="42" y1="68" x2="124" y2="68" stroke="#52525b" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="55" r="7" fill="#22c55e"/><circle cx="182" cy="55" r="7" fill="#3b82f6"/><circle cx="204" cy="55" r="7" fill="#cae39f"/><rect x="220" y="38" width="10" height="34" rx="2" fill="#3f3f46"/></g></svg>`;

export const svgIotDevice = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><g transform="translate(48, 48)"><rect x="24" y="24" width="112" height="112" rx="22" fill="#18181b" stroke="#3f3f46" stroke-width="4"/><circle cx="80" cy="80" r="28" fill="#22c55e" fill-opacity="0.2" stroke="#22c55e" stroke-width="3"/><circle cx="80" cy="80" r="10" fill="#22c55e"/><path stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" d="M80 34a46 46 0 0 1 46 46m-92 0a46 46 0 0 1 46-46"/><path stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" fill="none" d="M80 20a60 60 0 0 1 60 60m-120 0a60 60 0 0 1 60-60"/></g></svg>`;

// --------------------------------------------------------------------------
// 3. ARCHITECTURE & SYSTEM DESIGN PRIMITIVES
// --------------------------------------------------------------------------

export const svgLoadBalancer = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#cae39f" stroke-width="6"/><circle cx="64" cy="128" r="18" fill="#cae39f"/><circle cx="192" cy="68" r="15" fill="#cae39f"/><circle cx="192" cy="128" r="15" fill="#cae39f"/><circle cx="192" cy="188" r="15" fill="#cae39f"/><path stroke="#cae39f" stroke-width="8" stroke-linecap="round" fill="none" d="M82 128h38l40-52m-40 52h40m-40 0l40 52"/><polygon points="172,68 160,62 163,74" fill="#cae39f"/><polygon points="172,128 160,122 160,134" fill="#cae39f"/><polygon points="172,188 163,182 160,194" fill="#cae39f"/></svg>`;

export const svgFirewall = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#f97316" stroke-width="6"/><path d="M128 36L48 68v74c0 54 34 90 80 102 46-12 80-48 80-102V68l-80-32z" fill="#ea580c" fill-opacity="0.25" stroke="#f97316" stroke-width="8"/><path stroke="#ffffff" stroke-width="8" stroke-linecap="round" d="M128 88v80M88 128h80"/><circle cx="128" cy="128" r="12" fill="#f97316"/></svg>`;

export const svgMicroservice = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#06b6d4" stroke-width="6"/><rect x="58" y="58" width="140" height="140" rx="20" fill="#0891b2" fill-opacity="0.25" stroke="#06b6d4" stroke-width="6"/><circle cx="92" cy="92" r="12" fill="#06b6d4"/><circle cx="164" cy="92" r="12" fill="#06b6d4"/><circle cx="92" cy="164" r="12" fill="#06b6d4"/><circle cx="164" cy="164" r="12" fill="#06b6d4"/><path stroke="#06b6d4" stroke-width="6" d="M92 92h72v72H92z"/><circle cx="128" cy="128" r="8" fill="#ffffff"/></svg>`;

export const svgDbCluster = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#3b82f6" stroke-width="6"/><ellipse cx="96" cy="74" rx="44" ry="18" fill="#3b82f6" fill-opacity="0.4" stroke="#3b82f6" stroke-width="5"/><path d="M52 74v38c0 9.94 19.7 18 44 18s44-8.06 44-18V74" fill="none" stroke="#3b82f6" stroke-width="5"/><ellipse cx="160" cy="136" rx="44" ry="18" fill="#22c55e" fill-opacity="0.4" stroke="#22c55e" stroke-width="5"/><path d="M116 136v38c0 9.94 19.7 18 44 18s44-8.06 44-18v-38" fill="none" stroke="#22c55e" stroke-width="5"/><path stroke="#cae39f" stroke-width="5" stroke-dasharray="6 4" stroke-linecap="round" fill="none" d="M130 96c16 0 28 8 28 22"/></svg>`;

export const svgCloudVpc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#a855f7" stroke-width="6" stroke-dasharray="14 10"/><path fill="#9333ea" fill-opacity="0.25" d="M80 160h96a36 36 0 0 0 0-72 24 24 0 0 0-20-12 48 48 0 0 0-84 32 28 28 0 0 0 8 52z"/><circle cx="128" cy="128" r="9" fill="#c084fc"/><rect x="52" y="52" width="40" height="20" rx="4" fill="#a855f7" fill-opacity="0.3"/><text x="72" y="66" fill="#e9d5ff" font-size="11" font-weight="bold" font-family="'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif" text-anchor="middle">VPC</text></svg>`;

export const svgMessageQueue = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#eab308" stroke-width="6"/><rect x="42" y="90" width="40" height="76" rx="8" fill="#ca8a04" fill-opacity="0.3" stroke="#eab308" stroke-width="4"/><rect x="94" y="90" width="40" height="76" rx="8" fill="#ca8a04" fill-opacity="0.3" stroke="#eab308" stroke-width="4"/><rect x="146" y="90" width="40" height="76" rx="8" fill="#ca8a04" fill-opacity="0.3" stroke="#eab308" stroke-width="4"/><circle cx="62" cy="128" r="7" fill="#fef08a"/><circle cx="114" cy="128" r="7" fill="#fef08a"/><circle cx="166" cy="128" r="7" fill="#fef08a"/><path stroke="#ffffff" stroke-width="6" stroke-linecap="round" d="M30 128h6m162 0h28m-12-12l12 12-12 12"/></svg>`;

export const svgCdnEdge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#ec4899" stroke-width="6"/><circle cx="128" cy="128" r="68" fill="#be185d" fill-opacity="0.25" stroke="#ec4899" stroke-width="6"/><ellipse cx="128" cy="128" rx="30" ry="68" fill="none" stroke="#ec4899" stroke-width="4"/><line x1="60" y1="128" x2="196" y2="128" stroke="#ec4899" stroke-width="4"/><circle cx="98" cy="100" r="7" fill="#ffffff"/><circle cx="158" cy="100" r="7" fill="#ffffff"/><circle cx="128" cy="158" r="7" fill="#ffffff"/></svg>`;

export const svgApiGateway = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#8b5cf6" stroke-width="6"/><rect x="58" y="58" width="140" height="140" rx="20" fill="#6d28d9" fill-opacity="0.25" stroke="#8b5cf6" stroke-width="6"/><path stroke="#ffffff" stroke-width="8" stroke-linecap="round" d="M84 128h88M128 84v88"/><circle cx="84" cy="128" r="10" fill="#a78bfa"/><circle cx="172" cy="128" r="10" fill="#a78bfa"/><circle cx="128" cy="84" r="10" fill="#a78bfa"/><circle cx="128" cy="172" r="10" fill="#a78bfa"/></svg>`;

export const svgStorageBucket = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="36" fill="#181820" stroke="#f43f5e" stroke-width="6"/><path d="M60 76l18 124c1 7 24 14 50 14s49-7 50-14l18-124" fill="#be123c" fill-opacity="0.25" stroke="#f43f5e" stroke-width="6"/><ellipse cx="128" cy="76" rx="68" ry="24" fill="#be123c" fill-opacity="0.4" stroke="#f43f5e" stroke-width="6"/><line x1="84" y1="130" x2="172" y2="130" stroke="#fda4af" stroke-width="4" stroke-linecap="round"/></svg>`;

// --------------------------------------------------------------------------
// 4. PEOPLE & PERSONAS
// --------------------------------------------------------------------------

export const svgUserAvatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><circle cx="65" cy="65" r="58" fill="#181820" stroke="#cae39f" stroke-width="4"/><circle cx="65" cy="46" r="20" fill="#cae39f"/><path d="M30 106c0-20 16-36 35-36s35 16 35 36" fill="#cae39f" fill-opacity="0.85"/></svg>`;

export const svgDeveloper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><circle cx="65" cy="65" r="58" fill="#181820" stroke="#61dafb" stroke-width="4"/><circle cx="65" cy="44" r="18" fill="#61dafb"/><rect x="38" y="70" width="54" height="36" rx="6" fill="#1e293b" stroke="#61dafb" stroke-width="2.5"/><path stroke="#61dafb" stroke-width="3" stroke-linecap="round" d="M48 84l-5 4 5 4m34-8l5 4-5 4m-14-1l-4 10"/></svg>`;

export const svgDevOps = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><circle cx="65" cy="65" r="58" fill="#181820" stroke="#ff9900" stroke-width="4"/><circle cx="65" cy="46" r="18" fill="#ff9900"/><path d="M34 104c0-16 14-26 31-26s31 10 31 26" fill="#ff9900" fill-opacity="0.85"/><circle cx="94" cy="48" r="9" fill="#232f3e" stroke="#ff9900" stroke-width="3"/><path stroke="#ff9900" stroke-width="2.5" d="M94 42v6l4 2"/></svg>`;

export const svgAiBot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><circle cx="65" cy="65" r="58" fill="#181820" stroke="#10b981" stroke-width="4"/><rect x="38" y="42" width="54" height="42" rx="10" fill="#064e3b" stroke="#10b981" stroke-width="3"/><circle cx="52" cy="58" r="5" fill="#34d399"/><circle cx="78" cy="58" r="5" fill="#34d399"/><line x1="65" y1="28" x2="65" y2="42" stroke="#10b981" stroke-width="3.5"/><circle cx="65" cy="26" r="3.5" fill="#10b981"/><path stroke="#10b981" stroke-width="3" stroke-linecap="round" d="M54 72h22"/></svg>`;

export const svgProductManager = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><circle cx="65" cy="65" r="58" fill="#181820" stroke="#f43f5e" stroke-width="4"/><circle cx="65" cy="44" r="18" fill="#f43f5e"/><rect x="36" y="72" width="58" height="34" rx="6" fill="#3f1422" stroke="#f43f5e" stroke-width="2.5"/><line x1="46" y1="84" x2="84" y2="84" stroke="#fda4af" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="94" x2="72" y2="94" stroke="#fda4af" stroke-width="2.5" stroke-linecap="round"/></svg>`;

// --------------------------------------------------------------------------
// 5. FLOWCHARTS
// --------------------------------------------------------------------------

export const svgDecision = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,14 88,50 50,86 12,50" fill="rgba(202,227,159,0.18)" stroke="#cae39f" stroke-width="3.5"/></svg>`;

export const svgProcessBox = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="12" y="26" width="76" height="48" rx="6" fill="rgba(202,227,159,0.18)" stroke="#cae39f" stroke-width="3.5"/></svg>`;

export const svgTerminator = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70"><rect x="8" y="10" width="104" height="50" rx="25" fill="rgba(202,227,159,0.18)" stroke="#cae39f" stroke-width="3.5"/></svg>`;

export const svgDocument = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M22 14h38l22 22v48c0 4-8 8-18 4s-18-4-32 4V14z" fill="rgba(202,227,159,0.18)" stroke="#cae39f" stroke-width="3.5"/><path d="M60 14v22h22" fill="none" stroke="#cae39f" stroke-width="3"/><line x1="32" y1="42" x2="60" y2="42" stroke="#cae39f" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="54" x2="54" y2="54" stroke="#cae39f" stroke-width="3" stroke-linecap="round"/></svg>`;

export const svgDbCylinder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110"><ellipse cx="50" cy="24" rx="36" ry="14" fill="rgba(202,227,159,0.22)" stroke="#cae39f" stroke-width="3.5"/><path d="M14 24v58c0 7.7 16.1 14 36 14s36-6.3 36-14V24" fill="rgba(202,227,159,0.12)" stroke="#cae39f" stroke-width="3.5"/><path d="M14 53c0 7.7 16.1 14 36 14s36-6.3 36-14" fill="none" stroke="#cae39f" stroke-width="3.5"/></svg>`;

// Helper builder to create uniform clean Entity shapes
export function makeIconEntity(
  id: string,
  name: string,
  category: LibraryEntity['category'],
  tags: string[],
  description: string,
  svgContent: string,
  label: string,
  defaultSize = 84
): LibraryEntity {
  return {
    id,
    name,
    category,
    tags: [...tags, name.toLowerCase(), category],
    description,
    previewSvg: svgContent,
    createShapes: (center, style, genId) => {
      const w = defaultSize;
      const h = defaultSize;
      return [
        {
          type: 'image',
          src: makeSvgDataUri(svgContent),
          x: Math.round(center.x - w / 2),
          y: Math.round(center.y - h / 2 - 12),
          width: w,
          height: h,
          opacity: style.opacity ?? 100,
          clientId: genId(),
        },
        {
          type: 'text',
          text: label,
          x: Math.round(center.x - (label.length * 5)),
          y: Math.round(center.y + h / 2 - 6),
          fontSize: 18,
          strokeColor: style.strokeColor || '#ffffff',
          opacity: style.opacity ?? 100,
          clientId: genId(),
        },
      ];
    },
  };
}

// --------------------------------------------------------------------------
// CURATED ARCHITECTURE, HARDWARE & SYSTEM PRIMITIVES
// --------------------------------------------------------------------------

export const CURATED_ARCHITECTURE_ENTITIES: LibraryEntity[] = [
  // --- DEVICES & HARDWARE ---
  makeIconEntity('device-serverrack', 'Server Rack / Datacenter', 'devices', ['server', 'rack', 'datacenter', 'cluster', 'metal', 'host', 'hardware', 'chassis'], 'Enterprise 42U datacenter server rack chassis', svgServerRack, 'Server Rack', 96),
  makeIconEntity('device-blade-server', '1U Blade Server', 'devices', ['server', 'blade', 'host', 'compute', 'hardware', 'node'], 'Rackmount 1U high-density compute server node', svgBladeServer, 'Blade Server', 96),
  makeIconEntity('device-macbook', 'MacBook / Laptop', 'devices', ['laptop', 'macbook', 'computer', 'client', 'notebook', 'pc', 'apple'], 'Modern client laptop developer workstation', svgMacBook, 'Client Laptop', 96),
  makeIconEntity('device-iphone', 'iPhone / Mobile Device', 'devices', ['phone', 'mobile', 'iphone', 'ios', 'android', 'app', 'smartphone', 'device'], 'Modern smartphone with dynamic island display', svgIphone, 'Mobile App', 84),
  makeIconEntity('device-monitor', 'Desktop / 4K Monitor', 'devices', ['desktop', 'display', 'screen', 'imac', 'web', 'monitor', 'pc'], 'Widescreen 4K desktop studio display', svgMonitor, 'Desktop Client', 96),
  makeIconEntity('device-tablet', 'iPad / Tablet Device', 'devices', ['tablet', 'ipad', 'touch', 'device', 'screen', 'mobile'], 'Touchscreen tablet client device', svgTablet, 'Tablet Device', 88),
  makeIconEntity('device-iot', 'IoT Device / Sensor', 'devices', ['iot', 'sensor', 'device', 'smart', 'hardware', 'embedded', 'node'], 'Smart IoT sensor and embedded controller', svgIotDevice, 'IoT Node', 84),

  // --- ARCHITECTURE & SYSTEM DESIGN PRIMITIVES ---
  makeIconEntity('arch-loadbalancer', 'Load Balancer (ALB/NLB)', 'architecture', ['load balancer', 'alb', 'nlb', 'traffic', 'proxy', 'reverse proxy', 'gateway'], 'Distributes incoming traffic across backend clusters', svgLoadBalancer, 'Load Balancer', 92),
  makeIconEntity('arch-firewall', 'Firewall / WAF Shield', 'architecture', ['firewall', 'waf', 'security', 'shield', 'filter', 'ddos', 'guard'], 'Web application firewall and DDoS perimeter guard', svgFirewall, 'Firewall WAF', 88),
  makeIconEntity('arch-microservice', 'Microservice Pod / Container', 'architecture', ['microservice', 'service', 'pod', 'container', 'app', 'backend', 'k8s', 'kubernetes'], 'Microservice worker container pod', svgMicroservice, 'Microservice', 88),
  makeIconEntity('arch-dbcluster', 'DB Cluster (Primary/Replica)', 'architecture', ['database', 'cluster', 'primary', 'replica', 'sql', 'ha', 'storage'], 'High availability database cluster with replication', svgDbCluster, 'DB Cluster', 90),
  makeIconEntity('arch-vpc', 'Cloud VPC Isolated Network', 'architecture', ['vpc', 'network', 'subnet', 'cloud', 'security group', 'perimeter'], 'Virtual Private Cloud isolated network perimeter', svgCloudVpc, 'Cloud VPC', 92),
  makeIconEntity('arch-messagequeue', 'Message Queue / Event Buffer', 'architecture', ['queue', 'mq', 'kafka', 'rabbitmq', 'sqs', 'events', 'pubsub', 'buffer'], 'Asynchronous message broker & event queue buffer', svgMessageQueue, 'Message Queue', 90),
  makeIconEntity('arch-cdn-edge', 'CDN Edge / Global POP', 'architecture', ['cdn', 'edge', 'cache', 'pop', 'cloudflare', 'cloudfront', 'global'], 'Global content delivery edge cache point of presence', svgCdnEdge, 'CDN Edge', 90),
  makeIconEntity('arch-apigateway', 'API Gateway Router', 'architecture', ['api', 'gateway', 'router', 'rest', 'graphql', 'endpoints', 'proxy'], 'Unified API Gateway router with rate limiting', svgApiGateway, 'API Gateway', 90),
  makeIconEntity('arch-storagebucket', 'Object Storage Bucket', 'architecture', ['storage', 'bucket', 's3', 'blob', 'files', 'media', 'data'], 'Scalable object and blob media storage bucket', svgStorageBucket, 'Storage Bucket', 88),

  // --- PEOPLE & PERSONAS ---
  makeIconEntity('person-user', 'User / End-User Persona', 'people', ['user', 'actor', 'client', 'customer', 'person', 'audience'], 'End-user interacting with web or mobile apps', svgUserAvatar, 'User', 84),
  makeIconEntity('person-developer', 'Software Engineer / Developer', 'people', ['dev', 'developer', 'coder', 'engineer', 'programmer', 'tech'], 'Software engineer writing code and testing APIs', svgDeveloper, 'Developer', 84),
  makeIconEntity('person-devops', 'DevOps / Cloud Architect', 'people', ['devops', 'admin', 'architect', 'cloud', 'sre', 'sysadmin'], 'DevOps Engineer managing cloud infrastructure', svgDevOps, 'DevOps', 84),
  makeIconEntity('person-ai', 'AI Agent / Assistant', 'people', ['ai', 'agent', 'bot', 'robot', 'llm', 'assistant', 'neural'], 'Autonomous AI agent or conversational bot', svgAiBot, 'AI Agent', 84),
  makeIconEntity('person-pm', 'Product Manager / Lead', 'people', ['pm', 'product', 'manager', 'lead', 'design', 'scrum', 'agile'], 'Product manager organizing sprints & system flow', svgProductManager, 'Product Lead', 84),

  // --- FLOWCHARTS & DIAGRAMMING ---
  {
    id: 'flowchart-decision',
    name: 'Decision Diamond',
    category: 'flowchart',
    tags: ['decision', 'flowchart', 'branch', 'if', 'condition'],
    description: 'Conditional decision branch in flow diagrams',
    previewSvg: svgDecision,
    createShapes: (center, style, genId) => [
      {
        type: 'diamond',
        x: Math.round(center.x - 60),
        y: Math.round(center.y - 45),
        width: 120,
        height: 90,
        strokeColor: style.strokeColor || '#cae39f',
        backgroundColor: style.backgroundColor || 'transparent',
        fillStyle: style.fillStyle || 'hachure',
        strokeWidth: style.strokeWidth || 2,
        roughness: style.roughness || 1.2,
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
      {
        type: 'text',
        text: 'Decision?',
        x: Math.round(center.x - 34),
        y: Math.round(center.y - 12),
        fontSize: 18,
        strokeColor: style.strokeColor || '#ffffff',
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
    ],
  },
  {
    id: 'flowchart-process',
    name: 'Process Step',
    category: 'flowchart',
    tags: ['process', 'step', 'action', 'task', 'flowchart'],
    description: 'Standard action or processing state',
    previewSvg: svgProcessBox,
    createShapes: (center, style, genId) => [
      {
        type: 'rect',
        x: Math.round(center.x - 70),
        y: Math.round(center.y - 36),
        width: 140,
        height: 72,
        strokeColor: style.strokeColor || '#cae39f',
        backgroundColor: style.backgroundColor || 'transparent',
        fillStyle: style.fillStyle || 'hachure',
        strokeWidth: style.strokeWidth || 2,
        roughness: style.roughness || 1.2,
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
      {
        type: 'text',
        text: 'Process Step',
        x: Math.round(center.x - 46),
        y: Math.round(center.y - 10),
        fontSize: 18,
        strokeColor: style.strokeColor || '#ffffff',
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
    ],
  },
  {
    id: 'flowchart-terminator',
    name: 'Start / End Terminator',
    category: 'flowchart',
    tags: ['start', 'end', 'terminator', 'flowchart'],
    description: 'Start or termination node for flowcharts',
    previewSvg: svgTerminator,
    createShapes: (center, style, genId) => [
      {
        type: 'rect',
        x: Math.round(center.x - 60),
        y: Math.round(center.y - 30),
        width: 120,
        height: 60,
        strokeColor: style.strokeColor || '#cae39f',
        backgroundColor: style.backgroundColor || 'transparent',
        fillStyle: style.fillStyle || 'hachure',
        strokeWidth: style.strokeWidth || 2,
        roughness: style.roughness || 1.2,
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
      {
        type: 'text',
        text: 'Start / End',
        x: Math.round(center.x - 40),
        y: Math.round(center.y - 10),
        fontSize: 18,
        strokeColor: style.strokeColor || '#ffffff',
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
    ],
  },
  {
    id: 'flowchart-document',
    name: 'Document / Report',
    category: 'flowchart',
    tags: ['document', 'report', 'file', 'data', 'flowchart', 'artifact'],
    description: 'Generated document or data artifact',
    previewSvg: svgDocument,
    createShapes: (center, style, genId) => [
      {
        type: 'image',
        src: makeSvgDataUri(svgDocument),
        x: Math.round(center.x - 44),
        y: Math.round(center.y - 56),
        width: 88,
        height: 88,
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
      {
        type: 'text',
        text: 'Document',
        x: Math.round(center.x - 38),
        y: Math.round(center.y + 36),
        fontSize: 18,
        strokeColor: style.strokeColor || '#ffffff',
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
    ],
  },
  {
    id: 'flowchart-database',
    name: 'Database Storage Node',
    category: 'flowchart',
    tags: ['database', 'storage', 'cylinder', 'data', 'flowchart'],
    description: 'Database persistent storage cylinder shape',
    previewSvg: svgDbCylinder,
    createShapes: (center, style, genId) => [
      {
        type: 'image',
        src: makeSvgDataUri(svgDbCylinder),
        x: Math.round(center.x - 44),
        y: Math.round(center.y - 56),
        width: 88,
        height: 96,
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
      {
        type: 'text',
        text: 'Database',
        x: Math.round(center.x - 36),
        y: Math.round(center.y + 44),
        fontSize: 18,
        strokeColor: style.strokeColor || '#ffffff',
        opacity: style.opacity ?? 100,
        clientId: genId(),
      },
    ],
  },
];

export const BUILT_IN_ENTITIES: LibraryEntity[] = CURATED_ARCHITECTURE_ENTITIES;

// --------------------------------------------------------------------------
// CUSTOM SAVED TEMPLATES (LOCAL STORAGE PERSISTENCE)
// --------------------------------------------------------------------------

const STORAGE_KEY = 'pencil_custom_templates_v2';

export interface CustomSavedEntity {
  id: string;
  name: string;
  category: 'custom';
  tags: string[];
  shapesJson: string;
  previewSvg?: string;
  createdAt: number;
}

export function getCustomEntities(): LibraryEntity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: CustomSavedEntity[] = JSON.parse(raw);

    return parsed.map((item) => ({
      id: item.id,
      name: item.name,
      category: 'custom',
      tags: item.tags,
      description: `Custom saved template (${new Date(item.createdAt).toLocaleDateString()})`,
      previewSvg: item.previewSvg || svgProcessBox,
      createShapes: (center, style, genId) => {
        try {
          const shapes: Shape[] = JSON.parse(item.shapesJson);
          return shapes.map((shape) => {
            const clone = JSON.parse(JSON.stringify(shape));
            delete clone.id;
            clone.clientId = genId();

            if (clone.type === 'pencil') {
              clone.points = clone.points.map((p: any) => ({
                x: Math.round(p.x + center.x),
                y: Math.round(p.y + center.y),
              }));
            } else if (
              clone.type === 'rect' ||
              clone.type === 'diamond' ||
              clone.type === 'image' ||
              clone.type === 'text'
            ) {
              clone.x = Math.round(clone.x + center.x);
              clone.y = Math.round(clone.y + center.y);
            } else if (clone.type === 'circle') {
              clone.centerX = Math.round(clone.centerX + center.x);
              clone.centerY = Math.round(clone.centerY + center.y);
            } else if (clone.type === 'line' || clone.type === 'arrow') {
              clone.startX = Math.round(clone.startX + center.x);
              clone.startY = Math.round(clone.startY + center.y);
              clone.endX = Math.round(clone.endX + center.x);
              clone.endY = Math.round(clone.endY + center.y);
            }
            return clone;
          });
        } catch (err) {
          console.error('Failed to parse custom shapes:', err);
          return [];
        }
      },
    }));
  } catch (e) {
    console.error('Failed to load custom entities:', e);
    return [];
  }
}

export function saveCustomEntity(name: string, selectedShapes: Shape[], previewSvg?: string): boolean {
  if (typeof window === 'undefined' || selectedShapes.length === 0) return false;
  try {
    const minXs = selectedShapes.map((s) => {
      if (s.type === 'pencil') return Math.min(...s.points.map((p) => p.x));
      if (s.type === 'circle') return s.centerX - s.radius;
      if (s.type === 'line' || s.type === 'arrow') return Math.min(s.startX, s.endX);
      return s.x;
    });
    const maxXs = selectedShapes.map((s) => {
      if (s.type === 'pencil') return Math.max(...s.points.map((p) => p.x));
      if (s.type === 'circle') return s.centerX + s.radius;
      if (s.type === 'line' || s.type === 'arrow') return Math.max(s.startX, s.endX);
      return s.x + ((s as any).width || (s.type === 'text' ? 100 : 40));
    });
    const minYs = selectedShapes.map((s) => {
      if (s.type === 'pencil') return Math.min(...s.points.map((p) => p.y));
      if (s.type === 'circle') return s.centerY - s.radius;
      if (s.type === 'line' || s.type === 'arrow') return Math.min(s.startY, s.endY);
      return s.y;
    });
    const maxYs = selectedShapes.map((s) => {
      if (s.type === 'pencil') return Math.max(...s.points.map((p) => p.y));
      if (s.type === 'circle') return s.centerY + s.radius;
      if (s.type === 'line' || s.type === 'arrow') return Math.max(s.startY, s.endY);
      return s.y + ((s as any).height || (s.type === 'text' ? 30 : 40));
    });

    const minX = Math.min(...minXs);
    const maxX = Math.max(...maxXs);
    const minY = Math.min(...minYs);
    const maxY = Math.max(...maxYs);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const normalizedShapes = selectedShapes.map((s) => {
      const clone = JSON.parse(JSON.stringify(s));
      delete clone.id;
      if (clone.type === 'pencil') {
        clone.points = clone.points.map((p: any) => ({ x: p.x - centerX, y: p.y - centerY }));
      } else if (
        clone.type === 'rect' ||
        clone.type === 'diamond' ||
        clone.type === 'image' ||
        clone.type === 'text'
      ) {
        clone.x -= centerX;
        clone.y -= centerY;
      } else if (clone.type === 'circle') {
        clone.centerX -= centerX;
        clone.centerY -= centerY;
      } else if (clone.type === 'line' || clone.type === 'arrow') {
        clone.startX -= centerX;
        clone.startY -= centerY;
        clone.endX -= centerX;
        clone.endY -= centerY;
      }
      return clone;
    });

    const newCustom: CustomSavedEntity = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Custom Shape',
      category: 'custom',
      tags: ['custom', 'template', name.toLowerCase()],
      shapesJson: JSON.stringify(normalizedShapes),
      previewSvg: previewSvg || (selectedShapes[0]?.type === 'image' ? (selectedShapes[0] as any).src : undefined),
      createdAt: Date.now(),
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: CustomSavedEntity[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Error saving custom entity:', e);
    return false;
  }
}

export function deleteCustomEntity(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const existing: CustomSavedEntity[] = JSON.parse(raw);
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
}
