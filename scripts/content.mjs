// Everything the assets say. Edit this file, then run `npm run build`.
export const profile = {
  name: 'Bintang Fabian',
  fullName: 'Bintang Fabian Putra',
  role: 'Software Engineer',
  tagline: ['Turning complex ideas into', 'simple, functional solutions.'],
  location: 'Bekasi, Indonesia',
  timezone: 'UTC+7',
  status: 'Open to collaboration',
  email: 'bintangalfin33@gmail.com',
  // "bintang" means "star" in Indonesian — the idea behind the constellation artwork.
  meaning: 'bintang · star',
};

export const links = [
  { id: 'portfolio', label: 'Portfolio', icon: 'globe', href: 'https://bintangfabian.vercel.app' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/in/bintangfabian' },
  { id: 'email', label: 'Email', icon: 'mail', href: 'mailto:bintangalfin33@gmail.com' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', href: 'https://instagram.com/bintangfabiaan' },
];

export const sections = [
  { id: 'about', no: '01', eyebrow: 'ABOUT', title: 'Driven by curiosity.' },
  { id: 'work', no: '02', eyebrow: 'SELECTED WORK', title: "Things I've built." },
  { id: 'stack', no: '03', eyebrow: 'TOOLBOX', title: 'Tools I build with.' },
  { id: 'activity', no: '04', eyebrow: 'ACTIVITY', title: 'On GitHub lately.' },
];

export const focus = [
  {
    id: 'web', accent: 'blue', label: 'WEB', title: 'Front-End Web',
    desc: 'Responsive, accessible interfaces and dashboards that make complex data feel simple.',
    tags: ['REACT', 'NEXT.JS', 'LARAVEL'],
  },
  {
    id: 'mobile', accent: 'purple', label: 'MOBILE', title: 'Mobile Apps',
    desc: 'Cross-platform and native Android apps with clean, offline-first experiences.',
    tags: ['FLUTTER', 'KOTLIN', 'ROOM'],
  },
  {
    id: 'iot', accent: 'teal', label: 'IOT', title: 'IoT Systems',
    desc: 'Sensor-to-dashboard pipelines that stream field data in real time.',
    tags: ['ARDUINO', 'MQTT', 'SOCKET.IO'],
  },
];

// [label, simple-icons slug]
export const stack = [
  { label: 'Languages', accent: null, items: [['TypeScript', 'typescript'], ['JavaScript', 'javascript'], ['PHP', 'php'], ['Dart', 'dart'], ['Kotlin', 'kotlin'], ['C / C++', 'cplusplus'], ['HTML', 'html5'], ['CSS', 'css']] },
  { label: 'Frontend', accent: 'blue', items: [['React', 'react'], ['Next.js', 'nextdotjs'], ['Tailwind CSS', 'tailwindcss'], ['Vite', 'vite']] },
  { label: 'Backend & Data', accent: 'blue', items: [['Laravel', 'laravel'], ['Node.js', 'nodedotjs'], ['Express', 'express'], ['MySQL', 'mysql'], ['SQLite', 'sqlite']] },
  { label: 'Mobile', accent: 'purple', items: [['Flutter', 'flutter'], ['Android', 'android'], ['Android Studio', 'androidstudio']] },
  { label: 'IoT', accent: 'teal', items: [['Arduino', 'arduino'], ['MQTT', 'mqtt'], ['Socket.IO', 'socketdotio']] },
  { label: 'Tools', accent: null, items: [['Git', 'git'], ['GitHub', 'github'], ['Docker', 'docker'], ['Vercel', 'vercel']] },
];

export const projects = [
  {
    id: 'alina', name: 'Alina Official Store', accent: 'blue', kind: 'E-COMMERCE · LIVE',
    desc: 'Storefront and admin dashboard for a modest-fashion brand, with DOKU payments and Biteship shipping.',
    stack: ['NEXT.JS', 'REACT', 'CONVEX', 'TAILWIND'],
    href: 'https://alinaofficial.store', live: 'alinaofficial.store',
  },
  {
    id: 'xpresspos', name: 'XpressPOS', accent: 'purple', kind: 'POINT OF SALE',
    desc: 'Multi-tenant, multi-store point of sale with open bills and a real-time backend dashboard.',
    stack: ['FLUTTER', 'LARAVEL FILAMENT', 'REST API', 'MYSQL'],
    href: 'https://bintangfabian.vercel.app/projects/xpresspos',
  },
  {
    id: 'ams', name: 'AMS Store', accent: 'blue', kind: 'B2B COMMERCE',
    desc: 'Nurse call catalog with a 3D product viewer, orders and a signed quotation flow with PDF invoices.',
    stack: ['NEXT.JS', 'NESTJS', 'PRISMA', 'THREE.JS'],
    href: 'https://bintangfabian.vercel.app/projects/ams-store',
  },
  {
    id: 'sikopas', name: 'SIKOPAS', accent: 'teal', kind: 'AGRITECH · ERP',
    desc: 'Oil palm plantation management: Laravel API, web dashboard and an offline-first Flutter field app.',
    stack: ['LARAVEL', 'FLUTTER', 'POSTGIS', 'REDIS'],
    href: 'https://bintangfabian.vercel.app/projects/sikopas',
  },
];

export const footer = {
  title: "Let's build something together.",
  sub: 'Open to collaboration — reach me at bintangalfin33@gmail.com',
};
