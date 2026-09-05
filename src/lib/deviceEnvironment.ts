/**
 * GOS3 · agente: Gemini / ProtocolEngine · papel: Client & Host Environment Diagnostics
 * fase: fase 5 — padronização e governança de especificações · data: 2026-09-05 · hora: 12:47:00 UTC
 * antes: Hardcoded proot Alpine / Termux e memória estática
 * depois: Detecção dinâmica de ambiente de execução (Desk, VM, Mobile) tanto no Host (Node/OS) quanto no Client (Browser/Device)
 * base: commit gos3-core-v1.0, docs/GOS3-SPECIFICATION.md
 * assinatura: Gemini · Client & Host Environment Diagnostics · GOS3
 */

export interface ClientDeviceInfo {
  category: "desk" | "vm" | "mobile";
  categoryLabel: string;
  osName: string;
  browserName: string;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  dpr: number;
  hardwareConcurrency: number;
  deviceMemoryGB: number | null;
  userAgent: string;
}

export function detectClientDevice(): ClientDeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      category: "vm",
      categoryLabel: "Server / Headless VM",
      osName: "Linux / Unknown",
      browserName: "Node.js / Headless",
      isTouch: false,
      screenWidth: 1920,
      screenHeight: 1080,
      dpr: 1,
      hardwareConcurrency: 2,
      deviceMemoryGB: 4,
      userAgent: "Server/SSR",
    };
  }

  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isMobileUA = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouch = (navigator.maxTouchPoints || 0) > 0;
  const width = window.innerWidth || window.screen?.width || 1024;
  const height = window.innerHeight || window.screen?.height || 768;
  const dpr = window.devicePixelRatio || 1;

  // OS detection
  let osName = "Desconhecido";
  if (isAndroid) {
    osName = "Android (Mobile)";
    if (/Samsung/i.test(ua) || /SM-/i.test(ua)) osName = "Android (Samsung Galaxy)";
  } else if (isIOS) {
    osName = "Apple iOS";
  } else if (/Windows/i.test(ua)) {
    osName = "Windows PC";
  } else if (/Macintosh|Mac OS/i.test(ua)) {
    osName = "macOS Workstation";
  } else if (/Linux/i.test(ua)) {
    osName = "Linux Desktop / VM";
  }

  // Browser detection
  let browserName = "Navegador Web";
  if (/Edg/i.test(ua)) browserName = "Microsoft Edge";
  else if (/Chrome/i.test(ua)) browserName = "Google Chrome";
  else if (/Firefox/i.test(ua)) browserName = "Mozilla Firefox";
  else if (/Safari/i.test(ua)) browserName = "Apple Safari";

  // Category determination
  let category: "desk" | "vm" | "mobile" = "desk";
  let categoryLabel = "Desktop (Workstation / PC)";

  if (isMobileUA || (isTouch && width < 800) || isAndroid || isIOS) {
    category = "mobile";
    categoryLabel = `Mobile (${osName})`;
  } else if (/Cloud|Container|Headless|Phantom|Puppeteer/i.test(ua)) {
    category = "vm";
    categoryLabel = "VM (Ambiente Virtualizado)";
  } else if (width >= 1024) {
    category = "desk";
    categoryLabel = `Desktop (${osName})`;
  }

  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const deviceMemoryGB = (navigator as any).deviceMemory || null;

  return {
    category,
    categoryLabel,
    osName,
    browserName,
    isTouch,
    screenWidth: width,
    screenHeight: height,
    dpr,
    hardwareConcurrency,
    deviceMemoryGB,
    userAgent: ua,
  };
}
