const STORAGE_KEY = "linkki-prototype-v1";
// Selo visual baseado no owner_id retornado pelo Supabase, nunca no nickname.
const LINKKI_OFFICIAL_USER_ID = "75ec8fa2-22ed-4d84-bcca-c262db7bd6d6";
const LINKKI_TURNSTILE_SITE_KEY = "0x4AAAAAAF0ZSAOsq3_DSjAb";
const linkkiTurnstileWidgets = new WeakMap();
function initializeTurnstile() {
  if (!window.turnstile) return;
  document.querySelectorAll('[data-linkki-turnstile]').forEach((el) => {
    if (linkkiTurnstileWidgets.has(el)) return;
    const widgetId = window.turnstile.render(el, {
      sitekey: LINKKI_TURNSTILE_SITE_KEY,
      theme: 'auto',
      'expired-callback': () => { const form = el.closest('form'); if (form) setFormError(form, 'Verificação expirada. Confirme novamente.'); }
    });
    linkkiTurnstileWidgets.set(el, widgetId);
  });
}
function captchaTokenFor(form) {
  const el = form?.querySelector('[data-linkki-turnstile]');
  if (!el || !window.turnstile) throw new Error('A verificação de segurança ainda está carregando. Aguarde um instante.');
  const id = linkkiTurnstileWidgets.get(el);
  const token = id === undefined ? '' : window.turnstile.getResponse(id);
  if (!token) throw new Error('Conclua a verificação de segurança antes de continuar.');
  return token;
}
function resetCaptcha(form) {
  const el = form?.querySelector('[data-linkki-turnstile]');
  const id = el && linkkiTurnstileWidgets.get(el);
  if (id !== undefined && window.turnstile) window.turnstile.reset(id);
}
window.linkkiTurnstileReady = initializeTurnstile;

// Configure URL e chave publica em supabase-config.js (nunca use service_role).
const authClient = (window.supabase && window.LINKKI_SUPABASE_URL && window.LINKKI_SUPABASE_ANON_KEY && !window.LINKKI_SUPABASE_URL.includes('COLE_'))
  ? window.supabase.createClient(window.LINKKI_SUPABASE_URL, window.LINKKI_SUPABASE_ANON_KEY)
  : null;

// O loading da página pública é controlado por loadPublicRoute(),
// exclusivamente durante a obtenção dos dados necessários à navegação.
// Não interceptar window.fetch: buscas, cliques, menus, edições e salvamentos
// em segundo plano não devem bloquear a interface com uma tela de loading.

function requireAuthClient(form) {
  if (authClient) return true;
  const error = form?.querySelector('.form-error');
  if (error) error.textContent = 'Falta configurar a URL e a chave pública do Supabase em supabase-config.js.';
  return false;
}
function authError(error) {
  const message = String(error?.message || '');
  if (/hook|username|nickname|already.*(use|taken)/i.test(message)) return 'Não foi possível cadastrar este nome de usuário. Volte e escolha outro.';
  return message || 'Não foi possível concluir. Tente novamente.';
}
async function checkUsernameAvailability(username) {
  if (!authClient) throw new Error('Não foi possível verificar o nome de usuário agora.');
  const { data, error } = await authClient.rpc('linkki_username_available', { requested_username: username });
  if (error) throw new Error('Não foi possível verificar o nome de usuário agora. Tente novamente.');
  return data === true;
}
const fontPresets = {
  system: { name: "Moderna", css: "Inter, ui-sans-serif, system-ui, sans-serif" },
  serif: { name: "Editorial", css: "Georgia, 'Times New Roman', serif" },
  mono: { name: "Mono", css: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  humanist: { name: "Humanista", css: "'Trebuchet MS', Candara, Calibri, sans-serif" },
};

function makeTemplateAppearance(background, text, buttonBackground, buttonText, buttonStyle = "rounded", titleFont = "system", bodyFont = "system", extras = {}) {
  return {
    customColors: { background, text, buttonBackground, buttonText },
    buttonStyle,
    titleFont,
    bodyFont,
    buttonBorder: extras.buttonBorder || { enabled: false, color: text },
    buttonShadow: extras.buttonShadow || { enabled: false, distance: 10, blur: 24, opacity: 20, angle: 90 },
  };
}

function seedCommunityTemplates() {
  return [
    {
      id: "template-verde-essencial", ownerId: "lia", author: "Lia Mendes", initials: "LM",
      title: "Verde essencial", category: "Criadores", likes: 284, uses: 1402, liked: false, published: true,
      appearance: makeTemplateAppearance("#CAD593", "#2A3C24", "#2A3C24", "#CAD593", "rounded"),
    },
    {
      id: "template-noite-editorial", ownerId: "caio", author: "Caio Studio", initials: "CS",
      title: "Noite editorial", category: "Portfólio", likes: 198, uses: 876, liked: false, published: true,
      appearance: makeTemplateAppearance("#172018", "#F1EEDD", "#F1EEDD", "#172018", "square", "serif", "serif", {
        buttonBorder: { enabled: true, color: "#F1EEDD" },
      }),
    },
    {
      id: "template-pop-criador", ownerId: "nina", author: "Nina Lima", initials: "NL",
      title: "Pop creator", category: "Influencer", likes: 521, uses: 2387, liked: true, published: true,
      appearance: makeTemplateAppearance("#FFB4D9", "#4B1740", "#A1FF5E", "#26331C", "pill", "humanist", "system", {
        buttonBorder: { enabled: true, color: "#4B1740" },
        buttonShadow: { enabled: true, distance: 8, blur: 0, opacity: 55, angle: 90 },
      }),
    },
    {
      id: "template-minimal-claro", ownerId: "mateus", author: "Mateus Rocha", initials: "MR",
      title: "Minimal claro", category: "Profissional", likes: 142, uses: 653, liked: false, published: true,
      appearance: makeTemplateAppearance("#F7F7F2", "#20231E", "#20231E", "#FFFFFF", "pill", "system", "system"),
    },
    {
      id: "template-menu-solar", ownerId: "sol", author: "Bistrô Sol", initials: "BS",
      title: "Menu solar", category: "Restaurante", likes: 337, uses: 1194, liked: false, published: true,
      appearance: makeTemplateAppearance("#FFD56A", "#5A2E16", "#E5662E", "#FFF8E9", "rounded", "serif", "system", {
        buttonShadow: { enabled: true, distance: 9, blur: 18, opacity: 22, angle: 90 },
      }),
    },
    {
      id: "template-lilas-portfolio", ownerId: "mari", author: "Mari Design", initials: "MD",
      title: "Portfólio lilás", category: "Designer", likes: 419, uses: 1688, liked: false, published: true,
      appearance: makeTemplateAppearance("#E8DFFF", "#382A59", "#7454D6", "#FFFFFF", "rounded", "humanist", "system", {
        buttonBorder: { enabled: true, color: "#382A59" },
      }),
    },
  ];
}

const defaultState = {
  activeSection: "editor",
  activeTab: "content",
  currentPageId: "page-principal",
  communityView: "discover",
  signupStep: 1,
  loginCodeSent: false,
  passwordResetMode: false,
  account: {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    category: "",
    accountPhoto: "",
    verified: false,
    loggedIn: false,
  },
  profile: {
    name: "Marina Costa",
    username: "marina",
    bio: "Criatividade, rotina e tudo que inspira meu caminho.",
    avatar: "",
    avatarLayout: "classic",
    bannerImage: "",
    heroPhotoZoom: 100,
    heroPhotoX: 50,
    heroPhotoY: 50,
    avatarBorder: { enabled: false, color: "#2A3C24" },
    background: "custom",
    backgroundMode: "solid",
    gradientSecondColor: "#F2F5DF",
    backgroundImage: "",
    stickers: [],
    elementAnimation: "none",
    buttonStyle: "rounded",
    titleFont: "system",
    bodyFont: "system",
    customColors: {
      background: "#CAD593",
      text: "#2A3C24",
      buttonBackground: "#2A3C24",
      buttonText: "#CAD593",
    },
    buttonBorder: {
      enabled: false,
      color: "#2A3C24",
    },
    buttonShadow: {
      enabled: false,
      distance: 10,
      blur: 24,
      opacity: 20,
      angle: 90,
    },
    customFonts: [],
    recentFonts: ["system"],
    fontViews: {
      titleFont: "models",
      bodyFont: "models",
    },
    published: true,
  },
  links: [
    { id: crypto.randomUUID(), title: "Meu portfólio", url: "https://example.com", visible: true, clicks: 32 },
    { id: crypto.randomUUID(), title: "Vídeo novo no canal", url: "https://youtube.com", visible: true, clicks: 21 },
    { id: crypto.randomUUID(), title: "Fale comigo", url: "mailto:oi@example.com", visible: true, clicks: 12 },
  ],
  analytics: {
    views: 128,
    shares: 7,
  },
  communityTemplates: [],
  userPages: [],
};

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}


// Fundos oficiais locais e imagens enviadas pelo usuario (sem URLs arbitrarias).
const linkkiBackgroundPresets = [
  { id: 'aurora', name: 'Aurora', file: './fundos/aurora.svg' },
  { id: 'ondas', name: 'Ondas', file: './fundos/ondas.svg' },
  { id: 'dunas', name: 'Dunas', file: './fundos/dunas.svg' },
  { id: 'noite', name: 'Noite', file: './fundos/noite.svg' }
];

// Catálogo de adesivos de origem local. Adicione novos itens em adesivos/catalogo.json.
const linkkiBuiltinStickerCollections = [{"id":"pop","nome":"Pop & divertido","adesivos":[{"id":"coracao","nome":"Coração pop","arquivo":"./adesivos/pop/coracao.svg"},{"id":"estrela","nome":"Estrela","arquivo":"./adesivos/pop/estrela.svg"},{"id":"raio","nome":"Raio","arquivo":"./adesivos/pop/raio.svg"},{"id":"smile","nome":"Smiley","arquivo":"./adesivos/pop/smile.svg"}]},{"id":"y2k","nome":"Y2K & retrô","adesivos":[{"id":"seta","nome":"Seta 3D","arquivo":"./adesivos/y2k/seta.svg"},{"id":"chama","nome":"Chama","arquivo":"./adesivos/y2k/chama.svg"},{"id":"disco","nome":"Disco","arquivo":"./adesivos/y2k/disco.svg"},{"id":"arcoiris","nome":"Arco-íris","arquivo":"./adesivos/y2k/arcoiris.svg"}]},{"id":"natureza","nome":"Natureza","adesivos":[{"id":"flor","nome":"Flor","arquivo":"./adesivos/natureza/flor.svg"},{"id":"borboleta","nome":"Borboleta","arquivo":"./adesivos/natureza/borboleta.svg"},{"id":"cerejas","nome":"Cerejas","arquivo":"./adesivos/natureza/cerejas.svg"},{"id":"nuvem","nome":"Nuvem","arquivo":"./adesivos/natureza/nuvem.svg"}]},{"id":"formas","nome":"Formas & detalhes","adesivos":[{"id":"sparkle","nome":"Brilho","arquivo":"./adesivos/formas/sparkle.svg"},{"id":"planeta","nome":"Planeta","arquivo":"./adesivos/formas/planeta.svg"},{"id":"fitinha","nome":"Fita","arquivo":"./adesivos/formas/fitinha.svg"},{"id":"sol","nome":"Sol","arquivo":"./adesivos/formas/sol.svg"}]}];
let linkkiStickerCollections = linkkiBuiltinStickerCollections;
let linkkiStickerCategory = 'pop';
let linkkiSelectedStickerId = null;
let linkkiStickerPreviewController = null;
function linkkiStickerSafeSrc(src) {
  const value = String(src || '');
  return value.length <= 140 && /^\.\/adesivos\/(?:[a-z0-9_-]+\/)*[a-z0-9_! -]+\.(svg|png|webp)$/.test(value)
    ? value : '';
}
function linkkiNormalizeStickers(value) {
  if (!Array.isArray(value)) return [];
  const limit = (n, a, b, fallback) => { const v = Number(n); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : fallback; };
  return value.slice(0, 40).flatMap(raw => {
    if (!raw || !linkkiStickerSafeSrc(raw.src)) return [];
    return [{
      id: /^[a-zA-Z0-9-]{1,64}$/.test(raw.id || '') ? raw.id : crypto.randomUUID(),
      src: linkkiStickerSafeSrc(raw.src),
      x: limit(raw.x, 0, 100, 50),
      y: limit(raw.y, 0, 100, 42),
      size: limit(raw.size, 8, 65, 24),
      rotation: limit(raw.rotation, -360, 360, 0)
    }];
  });
}
function linkkiStickerCollectionMarkup() {
  const group = linkkiStickerCollections.find(x => x.id === linkkiStickerCategory) || linkkiStickerCollections[0];
  return `<div class="linkki-sticker-collections" aria-label="Coleções de adesivos">
    ${linkkiStickerCollections.map(c => `<button type="button" class="linkki-sticker-tab ${c.id === group?.id ? 'is-active' : ''}" data-sticker-collection="${escapeHtml(c.id)}" aria-pressed="${c.id === group?.id}">${escapeHtml(c.nome)}</button>`).join('')}
  </div>
  <div class="linkki-sticker-picker" aria-label="Escolher adesivo">
    ${(group?.adesivos || []).map(s => `<button type="button" data-sticker-add="${escapeHtml(s.arquivo)}" title="Adicionar ${escapeHtml(s.nome)}" aria-label="Adicionar ${escapeHtml(s.nome)}"><img loading="lazy" draggable="false" src="${escapeHtml(s.arquivo)}" alt="" /></button>`).join('')}
  </div>`;
}
async function linkkiLoadStickerCatalog() {
  try {
    const response = await fetch('./adesivos/catalogo.json', { cache: 'no-store' });
    if (!response.ok) return;
    const json = await response.json();
    const safe = Array.isArray(json?.colecoes) ? json.colecoes.slice(0, 24).flatMap(c => {
      if (!c || !/^[a-z0-9_-]{1,36}$/.test(c.id || '') || !Array.isArray(c.adesivos)) return [];
      const adesivos = c.adesivos.slice(0, 100).flatMap(s => {
        const arquivo = linkkiStickerSafeSrc(s?.arquivo);
        return arquivo ? [{ id: String(s.id || arquivo).slice(0, 80), nome: String(s.nome || 'Adesivo').slice(0, 60), arquivo }] : [];
      });
      return adesivos.length ? [{ id: c.id, nome: String(c.nome || c.id).slice(0, 60), adesivos }] : [];
    }) : [];
    if (!safe.length) return;
    linkkiStickerCollections = safe;
    const root = document.querySelector('[data-sticker-gallery]');
    if (root) root.innerHTML = linkkiStickerCollectionMarkup();
  } catch (error) { console.warn('Linkki: catálogo de adesivos indisponível, usando os itens padrão.', error); }
}
function linkkiStickersMarkup(stickers, editing = false, compact = false) {
  const list = linkkiNormalizeStickers(stickers);
  if (!list.length) return '';
  return `<div class="linkki-sticker-layer ${editing ? 'linkki-sticker-layer--editing' : ''} ${compact ? 'linkki-sticker-layer--compact' : ''}" ${editing ? 'aria-label="Adesivos editáveis"' : 'aria-hidden="true"'}>
   ${list.map(s => `<div class="linkki-sticker ${editing && s.id === linkkiSelectedStickerId ? 'is-selected' : ''}" data-linkki-sticker="${escapeHtml(s.id)}" style="left:${s.x}%;top:${s.y}%;width:${s.size}%;transform:translate(-50%,-50%) rotate(${s.rotation}deg)">
     <img draggable="false" src="${escapeHtml(s.src)}" alt="" />
     ${editing ? `<span class="linkki-sticker-selection" aria-hidden="true"></span><span class="linkki-sticker-handle linkki-sticker-handle--tl" data-sticker-action="resize"></span><span class="linkki-sticker-handle linkki-sticker-handle--tr" data-sticker-action="resize"></span><span class="linkki-sticker-handle linkki-sticker-handle--bl" data-sticker-action="resize"></span><span class="linkki-sticker-handle linkki-sticker-handle--br" data-sticker-action="resize"></span><button class="linkki-sticker-tool linkki-sticker-tool--rotate" type="button" data-sticker-action="rotate" title="Girar adesivo" aria-label="Girar adesivo">↻</button><button class="linkki-sticker-tool linkki-sticker-tool--remove" type="button" data-sticker-action="delete" title="Excluir adesivo" aria-label="Excluir adesivo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v6m4-6v6" stroke-linejoin="round" stroke-linecap="round"/></svg></button>` : ''}
   </div>`).join('')}</div>`;
}
function linkkiRefreshStickerSelection(preview) {
  preview.querySelectorAll('[data-linkki-sticker]').forEach(element => {
    element.classList.toggle('is-selected', element.dataset.linkkiSticker === linkkiSelectedStickerId);
  });
}
function linkkiBindStickerEditor() {
  linkkiStickerPreviewController?.abort();
  linkkiStickerPreviewController = new AbortController();
  const signal = linkkiStickerPreviewController.signal;
  // Delegação: a galeria e o preview podem mudar sem duplicar listeners.
  document.querySelector('[data-sticker-gallery]')?.addEventListener('click', event => {
    const category = event.target.closest('[data-sticker-collection]');
    if (category) {
      linkkiStickerCategory = category.dataset.stickerCollection;
      event.currentTarget.innerHTML = linkkiStickerCollectionMarkup();
      return;
    }
    const pick = event.target.closest('[data-sticker-add]');
    if (!pick) return;
    const src = linkkiStickerSafeSrc(pick.dataset.stickerAdd);
    if (!src) return;
    const list = linkkiNormalizeStickers(state.profile.stickers);
    if (list.length >= 40) { showToast('Limite de 40 adesivos por página.'); return; }
    const sticker = {id: crypto.randomUUID(),src,x:50,y:42,size:26,rotation:0};
    state.profile.stickers = [...list, sticker];
    linkkiSelectedStickerId = sticker.id;
    saveState();
    const counter = document.querySelector('.linkki-sticker-counter');
    if (counter) counter.textContent = `${state.profile.stickers.length} na página`;
    syncLivePreview();
    if (window.matchMedia('(max-width:820px)').matches && linkkiMobileEditorSheet) {
      linkkiMobileEditorSheet = false;
      linkkiMobileSheetScroll = 0;
      render();
    }
  }, {signal});
  // Um clique fora do adesivo encerra a seleção, inclusive fora do celular.
  document.addEventListener('pointerdown', event => {
    if (linkkiSelectedStickerId && !event.target.closest('.preview-screen [data-linkki-sticker]')) {
      linkkiSelectedStickerId = null;
      const activePreview = document.querySelector('.preview-screen');
      if (activePreview) linkkiRefreshStickerSelection(activePreview);
    }
  }, {signal});
  const preview = document.querySelector('.preview-screen');
  if (!preview) return;
  // Gestos isolados: Safari usa Touch Events; mouse/caneta usam Pointer Events.
  // O listener fica no preview (estável durante atualizações de aparência).
  let activeGesture = null;
  const select = element => {
    linkkiSelectedStickerId = element.dataset.linkkiSticker;
    linkkiRefreshStickerSelection(preview);
  };
  const finish = () => {
    if (!activeGesture) return;
    const g = activeGesture;
    activeGesture = null;
    if (g.changed) {
      saveState();
      // Não recriar o DOM no meio de um gesto; sincronizar somente no fim.
      syncLivePreview();
    }
  };
  const begin = (target, x, y, kind, identifier) => {
    const element = target.closest?.('[data-linkki-sticker]');
    if (!element || !preview.contains(element)) return false;
    const id = element.dataset.linkkiSticker;
    state.profile.stickers = linkkiNormalizeStickers(state.profile.stickers);
    const sticker = state.profile.stickers.find(s => s.id === id);
    if (!sticker) return false;
    select(element);
    const action = target.closest('[data-sticker-action]')?.dataset.stickerAction || 'move';
    if (action === 'delete') {
      state.profile.stickers = state.profile.stickers.filter(s => s.id !== id);
      linkkiSelectedStickerId = null;
      saveState();
      syncLivePreview();
      return true;
    }
    const layer = element.closest('.linkki-sticker-layer');
    if (!layer) return false;
    const rect = layer.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const base = {...sticker};
    const cx = rect.left + rect.width * base.x/100;
    const cy = rect.top + rect.height * base.y/100;
    activeGesture = {
      kind, identifier, element, sticker, action, base, rect, x, y, cx, cy,
      distance: Math.max(10, Math.hypot(x-cx,y-cy)),
      angle: Math.atan2(y-cy,x-cx)*180/Math.PI,
      changed:false
    };
    return true;
  };
  const move = (x,y) => {
    const g = activeGesture;
    if (!g) return;
    const {sticker,base,rect,element,action} = g;
    if (Math.hypot(x-g.x,y-g.y) < 2 && !g.changed) return;
    g.changed = true;
    if (action === 'move') {
      sticker.x = Math.max(0,Math.min(100,base.x+(x-g.x)/rect.width*100));
      sticker.y = Math.max(0,Math.min(100,base.y+(y-g.y)/rect.height*100));
    } else if (action === 'resize') {
      sticker.size = Math.max(8,Math.min(65,Math.round(base.size*Math.hypot(x-g.cx,y-g.cy)/g.distance*10)/10));
    } else if (action === 'rotate') {
      sticker.rotation = Math.round(base.rotation+Math.atan2(y-g.cy,x-g.cx)*180/Math.PI-g.angle);
    }
    element.style.left = sticker.x+'%';
    element.style.top = sticker.y+'%';
    element.style.width = sticker.size+'%';
    element.style.transform = `translate(-50%,-50%) rotate(${sticker.rotation}deg)`;
  };
  preview.addEventListener('touchstart', e => {
    if (activeGesture || !e.changedTouches.length) return;
    const t=e.changedTouches[0];
    if (begin(e.target,t.clientX,t.clientY,'touch',t.identifier)) e.preventDefault();
  },{signal,passive:false});
  preview.addEventListener('touchmove',e=>{
    if (!activeGesture || activeGesture.kind!=='touch') return;
    const t=Array.from(e.changedTouches).find(t=>t.identifier===activeGesture.identifier);
    if (!t) return;
    e.preventDefault();
    move(t.clientX,t.clientY);
  },{signal,passive:false});
  const endTouch=e=>{
    if (!activeGesture || activeGesture.kind!=='touch') return;
    if (Array.from(e.changedTouches).some(t=>t.identifier===activeGesture.identifier)) {
      e.preventDefault();
      finish();
    }
  };
  preview.addEventListener('touchend',endTouch,{signal,passive:false});
  preview.addEventListener('touchcancel',endTouch,{signal,passive:false});
  preview.addEventListener('pointerdown',e=>{
    if (e.pointerType==='touch') return; // Evita dois gestos no Safari.
    if (begin(e.target,e.clientX,e.clientY,'pointer',e.pointerId)) {
      e.preventDefault();
      try { preview.setPointerCapture(e.pointerId); } catch (_) {}
    }
  },{signal});
  preview.addEventListener('pointermove',e=>{
    if (activeGesture?.kind==='pointer' && activeGesture.identifier===e.pointerId) move(e.clientX,e.clientY);
  },{signal});
  const endPointer=e=>{
    if (activeGesture?.kind!=='pointer'||activeGesture.identifier!==e.pointerId) return;
    finish();
    try { if (preview.hasPointerCapture(e.pointerId)) preview.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  preview.addEventListener('pointerup',endPointer,{signal});
  preview.addEventListener('pointercancel',endPointer,{signal});
  // Seleção apenas ao tocar fora; não interfere no início do arrasto.
  preview.addEventListener('click',e=>{
    if (e.target.closest('[data-linkki-sticker]')) return;
    linkkiSelectedStickerId=null;
    linkkiRefreshStickerSelection(preview);
  },{signal});

}

function appearanceSnapshot(profile) {
  return {
    customColors: JSON.parse(JSON.stringify(profile.customColors)),
    backgroundMode: profile.backgroundMode || "solid",
    gradientSecondColor: profile.gradientSecondColor || "#F2F5DF",
    backgroundImage: linkkiSafeBackgroundImage(profile.backgroundImage),
    stickers: linkkiNormalizeStickers(profile.stickers),
    elementAnimation: profile.elementAnimation || "none",
    heroPhotoZoom: profile.heroPhotoZoom ?? 100,
    heroPhotoX: profile.heroPhotoX ?? 50,
    heroPhotoY: profile.heroPhotoY ?? 50,
    buttonStyle: profile.buttonStyle,
    titleFont: fontPresets[profile.titleFont] ? profile.titleFont : "system",
    bodyFont: fontPresets[profile.bodyFont] ? profile.bodyFont : "system",
    buttonBorder: JSON.parse(JSON.stringify(profile.buttonBorder)),
    buttonShadow: JSON.parse(JSON.stringify(profile.buttonShadow)),
  };
}

function seedUserPages(profile) {
  return [
    {
      id: "page-principal",
      title: "Página principal",
      profileName: profile.name || "Seu nome",
      username: profile.username || "minhapagina",
      active: Boolean(profile.published),
      appearance: appearanceSnapshot(profile),
    },
    {
      id: "page-portfolio",
      title: "Portfólio criativo",
      profileName: "Meu portfólio",
      username: "meuportfolio",
      active: false,
      appearance: makeTemplateAppearance("#E8DFFF", "#382A59", "#7454D6", "#FFFFFF", "rounded", "humanist", "system"),
    },
    {
      id: "page-contato",
      title: "Links profissionais",
      profileName: "Contato profissional",
      username: "contato",
      active: true,
      appearance: makeTemplateAppearance("#F7F7F2", "#20231E", "#20231E", "#FFFFFF", "pill", "system", "system"),
    },
  ];
}

// Um nickname possui apenas uma página pública. Normaliza estados antigos
// que ainda guardavam mais de uma página marcada como ativa.
function enforceSingleActivePage(preferredId = null) {
  const pages = Array.isArray(state.userPages) ? state.userPages : [];
  const chosen = pages.find(page => page.id === preferredId && page.active)
    || pages.find(page => page.id === state.currentPageId && page.active)
    || pages.find(page => page.active);
  pages.forEach(page => { page.active = Boolean(chosen && page.id === chosen.id); });
  if (chosen && state.currentPageId === chosen.id) state.profile.published = true;
  else if (!chosen) state.profile.published = false;
}

function syncCurrentPageSnapshot() {
  const current = state.userPages.find((page) => page.id === state.currentPageId) || state.userPages[0];
  if (!current) return;
  current.profileName = state.profile.name || current.profileName || "Seu nome";
  current.username = state.profile.username || "minhapagina";
  current.active = Boolean(state.profile.published);
  current.appearance = appearanceSnapshot(state.profile);
  current.profileAvatar = state.profile.avatar || "";
  current.avatarLayout = state.profile.avatarLayout || "classic";
  current.bannerImage = state.profile.bannerImage || "";
  current.previewLinks = state.links.filter(link => link.visible).map(link => ({ title: link.title }));
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneDefaultState();
    const parsed = JSON.parse(stored);
    const base = cloneDefaultState();
    const profile = {
      ...base.profile,
      ...(parsed.profile || {}),
      customColors: {
        ...base.profile.customColors,
        ...(parsed.profile?.customColors || {}),
      },
      avatarBorder: {
        ...base.profile.avatarBorder,
        ...(parsed.profile?.avatarBorder || {}),
      },
      buttonBorder: {
        ...base.profile.buttonBorder,
        ...(parsed.profile?.buttonBorder || {}),
      },
      buttonShadow: {
        ...base.profile.buttonShadow,
        ...(parsed.profile?.buttonShadow || {}),
      },
      stickers: linkkiNormalizeStickers(parsed.profile?.stickers),
      customFonts: Array.isArray(parsed.profile?.customFonts) ? parsed.profile.customFonts : [],
      recentFonts: Array.isArray(parsed.profile?.recentFonts) ? parsed.profile.recentFonts : base.profile.recentFonts,
      fontViews: {
        ...base.profile.fontViews,
        ...(parsed.profile?.fontViews || {}),
      },
    };

    const backgroundMap = {
      light: ["#CAD593", "#2A3C24", "#2A3C24", "#CAD593"],
      bright: ["#A1C349", "#2A3C24", "#2A3C24", "#CAD593"],
      dark: ["#2A3C24", "#FFFFFF", "#A1C349", "#2A3C24"],
      white: ["#FFFFFF", "#2A3C24", "#2A3C24", "#CAD593"],
    };
    if (backgroundMap[profile.background]) {
      const [background, text, buttonBackground, buttonText] = backgroundMap[profile.background];
      profile.customColors = { background, text, buttonBackground, buttonText };
      profile.background = "custom";
    }

    const legacyFont = parsed.profile?.font || "system";
    profile.titleFont = parsed.profile?.titleFont || legacyFont;
    profile.bodyFont = parsed.profile?.bodyFont || legacyFont;
    if (parsed.profile?.customFont?.dataUrl && !profile.customFonts.length) {
      const legacyCustom = {
        id: "custom-legacy",
        name: parsed.profile.customFont.name || "Minha fonte",
        dataUrl: parsed.profile.customFont.dataUrl,
      };
      profile.customFonts.push(legacyCustom);
      if (legacyFont === "custom") {
        profile.titleFont = legacyCustom.id;
        profile.bodyFont = legacyCustom.id;
      }
    }
    profile.recentFonts = [...new Set([profile.titleFont, profile.bodyFont, ...profile.recentFonts])].slice(0, 5);
    if (profile.buttonStyle === "outline") {
      profile.buttonStyle = "rounded";
      profile.buttonBorder.enabled = true;
    }

    return {
      ...base,
      ...parsed,
      account: { ...base.account, ...(parsed.account || {}) },
      profile,
      analytics: { ...base.analytics, ...(parsed.analytics || {}) },
      links: Array.isArray(parsed.links) ? parsed.links : base.links,
      communityTemplates: [],
      userPages: Array.isArray(parsed.userPages) ? parsed.userPages : base.userPages,
    };
  } catch {
    return cloneDefaultState();
  }
}

// v0.2: estado de cada conta no Supabase (tabela linkki_user_data).
// Nunca envie dados de login, OTP ou sessao para o banco.
const legacyLocalState = loadState();
let cloudUserId = null;
let cloudSaveTimer = null;
let cloudSaveChain = Promise.resolve();
let cloudRevision = 0;
let cloudReady = false;
let cloudErrorShown = false;
let publishedFingerprint = null;
let publishInProgress = false;

function editableSnapshot() {
  return {
    profile: state.profile,
    accountPhoto: state.account.accountPhoto || "",
    links: state.links,
    analytics: { views: 0, shares: 0 },
    userPages: state.userPages,
    currentPageId: state.currentPageId,
    communityTemplates: [],
  };
}

function applyCloudSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return;
  // Reutiliza o normalizador existente sem sobrescrever o estado de autenticacao.
  const previous = localStorage.getItem(STORAGE_KEY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    const normalized = loadState();
    state.profile = normalized.profile;
    // Foto da conta pertence ao usuário, não à foto de nenhuma página.
    state.account.accountPhoto = safeImageSrc(snapshot.accountPhoto || snapshot.account?.accountPhoto || "");
    state.links = normalized.links;
    state.analytics = { views: 0, shares: 0 };
    state.userPages = normalized.userPages;
    state.currentPageId = normalized.currentPageId;
    state.communityTemplates = [];
    if (!state.userPages.length) state.userPages = seedUserPages(state.profile);
    enforceSingleActivePage();
  } finally {
    if (previous === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, previous);
  }
}

function reportCloudError(error) {
  console.error('Linkki: falha na sincronizacao', error);
  const status = document.querySelector('.save-status');
  if (status) status.textContent = 'Nao sincronizado';
  if (!cloudErrorShown) {
    cloudErrorShown = true;
    showToast('Nao foi possivel sincronizar. Seus dados continuam neste navegador.');
  }
}

// Apenas os campos destinados à página pública são enviados para esta tabela.
function publicPageSnapshot() {
  const profile = structuredClone(state.profile);
  const allowed = ['name','username','bio','avatar','avatarLayout','bannerImage','heroPhotoZoom','heroPhotoX','heroPhotoY','avatarBorder','customColors','backgroundMode','gradientSecondColor','backgroundImage','stickers','elementAnimation','buttonStyle','buttonBorder','buttonShadow','titleFont','bodyFont','customFonts'];
  const safeProfile = Object.fromEntries(allowed.filter(k => Object.hasOwn(profile,k)).map(k => [k,profile[k]]));
  return { profile: safeProfile, links: state.links.filter(link => link.visible).map(link => ({ id: link.id, title: link.title, url: link.url, visible: true })) };
}

async function syncPublicPage(owner, snapshot) {
  if (!authClient || owner !== cloudUserId) return;
  const username = String(state.account.username || '').toLowerCase().trim();
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) return;
  if (!snapshot.profile.published) {
    const { error } = await authClient.from('linkki_public_pages').delete().eq('user_id', owner);
    if (error) throw error;
    return;
  }
  const { error } = await authClient.from('linkki_public_pages').upsert({
    user_id: owner, username, public_data: { profile: Object.fromEntries(['name','username','bio','avatar','avatarLayout','bannerImage','heroPhotoZoom','heroPhotoX','heroPhotoY','avatarBorder','customColors','backgroundMode','gradientSecondColor','backgroundImage','stickers','elementAnimation','buttonStyle','buttonBorder','buttonShadow','titleFont','bodyFont','customFonts'].filter(k => Object.hasOwn(snapshot.profile,k)).map(k => [k,snapshot.profile[k]])), links: snapshot.links.filter(link => link.visible).map(link => ({ id: link.id, title: link.title, url: link.url, visible: true })) }, updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

function publicPublishPayload() {
  const snapshot = editableSnapshot();
  const profile = snapshot.profile;
  const allowed = ['name','username','bio','avatar','avatarLayout','bannerImage','heroPhotoZoom','heroPhotoX','heroPhotoY','avatarBorder','customColors','backgroundMode','gradientSecondColor','backgroundImage','stickers','elementAnimation','buttonStyle','buttonBorder','buttonShadow','titleFont','bodyFont','customFonts'];
  return {
    profile: Object.fromEntries(allowed.filter(k => Object.hasOwn(profile,k)).map(k => [k,profile[k]])),
    links: snapshot.links.filter(link => link.visible).map(link => ({ id: link.id, title: link.title, url: link.url, visible: true }))
  };
}
function hasUnpublishedChanges() {
  return Boolean(state.profile.published && publishedFingerprint !== JSON.stringify(publicPublishPayload()));
}

function queueCloudSave() {
  if (!cloudReady || !cloudUserId || !authClient) return;
  const owner = cloudUserId;
  const revision = ++cloudRevision;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    const payload = structuredClone(editableSnapshot());
    cloudSaveChain = cloudSaveChain.then(async () => {
      if (owner !== cloudUserId || !cloudReady || revision !== cloudRevision) return;
      const { error } = await authClient.from('linkki_user_data').upsert({
        user_id: owner, data: payload, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) throw error;
      cloudErrorShown = false;
      const status = document.querySelector('.save-status');
      if (status && owner === cloudUserId) status.textContent = 'Salvo na nuvem';
    }).catch(reportCloudError);
  }, 650);
}

async function initializeCloudForUser(user) {
  if (!user?.id || !authClient) return;
  clearTimeout(cloudSaveTimer);
  cloudReady = false;
  cloudUserId = user.id;
  cloudRevision++;
  const { data, error } = await authClient.from('linkki_user_data')
    .select('data').eq('user_id', user.id).maybeSingle();
  if (error) { reportCloudError(error); return; }
  if (data?.data) {
    applyCloudSnapshot(data.data);
  } else {
    const sameAccount = legacyLocalState.account?.verified &&
      legacyLocalState.account?.email?.toLowerCase() === user.email?.toLowerCase();
    const importOld = sameAccount && window.confirm(
      'Encontramos dados salvos neste navegador para esta conta. Deseja importa-los para a nuvem?'
    );
    if (importOld) applyCloudSnapshot(legacyLocalState);
    else {
      const fresh = cloneDefaultState();
      applyCloudSnapshot(fresh);
      state.profile.name = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(' ') || state.profile.name;
      state.profile.username = user.user_metadata?.username || state.profile.username;
      state.profile.published = false;
    }
  }
  // Recupera a foto também em outro navegador/guia anônima após o login.
  state.account.accountPhoto = safeImageSrc(state.account.accountPhoto || user.user_metadata?.linkki_account_photo || "");
  state.account.email = user.email || state.account.email;
  state.account.firstName = user.user_metadata?.first_name || state.account.firstName;
  state.account.lastName = user.user_metadata?.last_name || state.account.lastName;
  // A tabela de nicknames é a fonte oficial; metadados do Auth podem estar desatualizados.
  const { data: officialNickname, error: nicknameLoadError } = await authClient.from('linkki_usernames')
    .select('username').eq('user_id', user.id).maybeSingle();
  if (nicknameLoadError) console.warn('Linkki: nickname oficial indisponível', nicknameLoadError);
  const currentNickname = officialNickname?.username || user.user_metadata?.username || state.account.username;
  state.account.username = currentNickname;
  state.profile.username = currentNickname;
  state.userPages.forEach(page => { if (page.id === 'page-principal') page.username = currentNickname; });
  state.account.verified = true;
  state.account.loggedIn = true;
  cloudReady = true;
  linkkiResetHistory();
  void loadCommunityTemplates();
  publishedFingerprint = null;
  try {
    const { data: publishedPage } = await authClient.from('linkki_public_pages')
      .select('public_data').eq('user_id', user.id).maybeSingle();
    if (publishedPage?.public_data) {
      publishedFingerprint = JSON.stringify(publishedPage.public_data);
      state.profile.published = true;
    } else {
      state.profile.published = false;
    }
  } catch (error) { console.warn('Linkki: estado da publicação indisponível', error); }
  enforceSingleActivePage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!data?.data) queueCloudSave();
}

async function restoreSupabaseSession() {
  // O estado de login local nao e prova de autenticacao.
  state.account.loggedIn = false;
  state.account.verified = false;
  if (!authClient) { render(); return; }
  try {
    const { data, error } = await authClient.auth.getUser();
    if (error || !data?.user) { render(); return; }
    await initializeCloudForUser(data.user);
  } catch (error) { reportCloudError(error); }
  render();
  if (state.account.loggedIn && state.activeTab === "analytics") void loadRealAnalytics();
}

let pendingSignupPassword = "";
let state = loadState();
if (state.activeTab === "community") {
  state.activeSection = "community";
  state.activeTab = "content";
}
if (!state.userPages.length) state.userPages = seedUserPages(state.profile);
let toastTimer;
let pendingFontTarget = "titleFont";
let menuOpen = false;

function refreshPublishButton() {
  const button = document.querySelector('[data-action="publish"]');
  if (!button || publishInProgress) return;
  const published = Boolean(state.profile.published);
  button.textContent = published ? (hasUnpublishedChanges() ? "Publicar alterações" : "Publicado") : "Publicar";
  button.classList.toggle("button--accent", published);
  button.classList.toggle("button--primary", !published);
}

// Histórico isolado do editor: nunca inclui credenciais, sessão ou analytics.
const linkkiUndoStack = [];
const linkkiRedoStack = [];
let linkkiHistoryBaseline = null;
let linkkiHistoryRestoring = false;
let linkkiHistoryLastEdit = 0;
let linkkiHistoryLastField = "";
function linkkiEditableHistorySnapshot() {
  return JSON.stringify({ profile: state.profile, links: state.links,
    userPages: state.userPages, currentPageId: state.currentPageId });
}
function linkkiResetHistory() {
  linkkiUndoStack.length = 0;
  linkkiRedoStack.length = 0;
  linkkiHistoryBaseline = linkkiEditableHistorySnapshot();
  linkkiHistoryLastEdit = 0;
  linkkiHistoryLastField = "";
}
function linkkiCaptureHistory() {
  const next = linkkiEditableHistorySnapshot();
  if (linkkiHistoryBaseline === null) { linkkiHistoryBaseline = next; return; }
  if (linkkiHistoryRestoring || next === linkkiHistoryBaseline) return;
  const focused = document.activeElement;
  const field = focused?.matches?.('input, textarea') &&
    focused.closest('.editor-layout, .editor-main, .link-editor, .card')
    ? (focused.name || focused.dataset.linkField || focused.id || '') : '';
  const now = Date.now();
  const groupTyping = field && field === linkkiHistoryLastField && now - linkkiHistoryLastEdit < 900;
  if (!groupTyping) {
    linkkiUndoStack.push(linkkiHistoryBaseline);
    if (linkkiUndoStack.length > 60) linkkiUndoStack.shift();
  }
  linkkiRedoStack.length = 0;
  linkkiHistoryBaseline = next;
  linkkiHistoryLastEdit = now;
  linkkiHistoryLastField = field;
  linkkiRefreshHistoryButtons();
}
function linkkiRefreshHistoryButtons() {
  document.querySelectorAll('[data-linkki-history]').forEach(button => {
    button.disabled = button.dataset.linkkiHistory === 'undo'
      ? !linkkiUndoStack.length : !linkkiRedoStack.length;
    button.style.opacity = button.disabled ? '0.38' : '1';
    button.style.cursor = button.disabled ? 'default' : 'pointer';
  });
}
function linkkiHistoryAction(direction) {
  if (!state.account.loggedIn || !state.account.verified) return;
  const from = direction === 'undo' ? linkkiUndoStack : linkkiRedoStack;
  const to = direction === 'undo' ? linkkiRedoStack : linkkiUndoStack;
  if (!from.length) return;
  const previous = from.pop();
  to.push(linkkiEditableHistorySnapshot());
  const restored = JSON.parse(previous);
  linkkiHistoryRestoring = true;
  try {
    state.profile = restored.profile;
    state.links = restored.links;
    state.userPages = restored.userPages;
    state.currentPageId = restored.currentPageId;
    linkkiHistoryBaseline = previous;
    linkkiHistoryLastField = '';
    saveState();
    render();
  } finally { linkkiHistoryRestoring = false; }
  linkkiRefreshHistoryButtons();
}
function linkkiHistoryControls() {
  const iconStyle = 'width:25px;height:25px;display:block;stroke:currentColor;stroke-width:2.8;fill:none;stroke-linecap:round;stroke-linejoin:round';
  const buttonStyle = 'appearance:none;border:0;background:transparent;box-shadow:none;padding:5px;min-width:36px;min-height:36px;display:inline-flex;align-items:center;justify-content:center;color:inherit;cursor:pointer';
  return `<div style="display:inline-flex;gap:5px;align-items:center;margin-right:8px" aria-label="Histórico de edição">
    <button type="button" style="${buttonStyle};opacity:${linkkiUndoStack.length ? 1 : .38}" data-linkki-history="undo" title="Desfazer (Ctrl+Z)" aria-label="Desfazer" ${linkkiUndoStack.length ? '' : 'disabled'}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="${iconStyle}" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/></svg></button>
    <button type="button" style="${buttonStyle};opacity:${linkkiRedoStack.length ? 1 : .38}" data-linkki-history="redo" title="Refazer (Ctrl+Shift+Z ou Ctrl+Y)" aria-label="Refazer" ${linkkiRedoStack.length ? '' : 'disabled'}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="${iconStyle}" aria-hidden="true"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h2"/></svg></button>
  </div>`;
}
window.addEventListener('keydown', event => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  const key = event.key.toLowerCase();
  const redo = (key === 'z' && event.shiftKey) || (key === 'y' && !event.shiftKey);
  const undo = key === 'z' && !event.shiftKey;
  if (!redo && !undo) return;
  if (location.hash.replace(/^#\/?/, '') !== 'editor') return;
  // Preserva desfazer nativo dentro de campos de texto.
  if (document.activeElement?.matches?.('input, textarea, [contenteditable="true"]')) return;
  event.preventDefault();
  linkkiHistoryAction(redo ? 'redo' : 'undo');
});

function saveState() {
  linkkiCaptureHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueCloudSave();
  refreshPublishButton();
  const status = document.querySelector(".save-status");
  if (status) {
    status.textContent = cloudReady ? "Salvando..." : "Salvo neste navegador";
  }
}

// Atualiza a prévia sem recriar os elementos que já existem.
// Assim as animações não reiniciam a cada alteração no editor.
function patchPreviewNode(current, next) {
  if (!current || !next || current.nodeType !== next.nodeType ||
      (current.nodeType === 1 && current.tagName !== next.tagName)) {
    current?.replaceWith(next.cloneNode(true));
    return;
  }
  if (current.nodeType === Node.TEXT_NODE) {
    if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
    return;
  }
  if (current.nodeType !== Node.ELEMENT_NODE) return;
  for (const attribute of Array.from(current.attributes)) {
    if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  }
  for (const attribute of Array.from(next.attributes)) {
    if (current.getAttribute(attribute.name) !== attribute.value)
      current.setAttribute(attribute.name, attribute.value);
  }
  const oldChildren = Array.from(current.childNodes);
  const newChildren = Array.from(next.childNodes);
  for (let i = 0; i < newChildren.length; i++) {
    if (!oldChildren[i]) current.appendChild(newChildren[i].cloneNode(true));
    else patchPreviewNode(oldChildren[i], newChildren[i]);
  }
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) oldChildren[i].remove();
}

function syncLivePreview() {
  const preview = document.querySelector(".preview-screen");
  if (preview) {
    const next = document.createElement("div");
    next.innerHTML = publicProfileMarkup(undefined, true);
    const currentCanvas = preview.firstElementChild;
    const nextCanvas = next.firstElementChild;
    if (currentCanvas && nextCanvas) patchPreviewNode(currentCanvas, nextCanvas);
    else preview.replaceChildren(...Array.from(next.childNodes));
  }

  const sidebarName = document.querySelector(".sidebar-profile strong");
  const sidebarUrl = document.querySelector(".sidebar-profile [data-sidebar-short-url]");
  if (sidebarName) sidebarName.textContent = state.profile.name || "Seu nome";
  if (sidebarUrl) sidebarUrl.textContent = `linkki.com/${state.account.username || state.profile.username || "usuario"}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validHex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}

function safeUrl(value = "") {
  const input = String(value ?? "").trim();
  if (!input || /[\u0000-\u001f\u007f\\<>"'`]/.test(input)) return "#";
  // Não transforme protocolos desconhecidos em links clicáveis.
  if (/^[a-z][a-z0-9+.-]*:/i.test(input) && !/^(https?:|mailto:|tel:)/i.test(input)) return "#";
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (url.protocol === "http:" || url.protocol === "https:") {
      if (!url.hostname || url.username || url.password) return "#";
      return url.href;
    }
    if (url.protocol === "mailto:" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.slice(7))) return candidate;
    if (url.protocol === "tel:" && /^\+?[0-9(). -]{3,25}$/.test(candidate.slice(4))) return candidate;
  } catch { /* Endereço inválido. */ }
  return "#";
}

function safeImageSrc(value = "") {
  const input = String(value ?? "");
  if (/^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(input)) return input;
  try {
    const url = new URL(input);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* Imagem inválida. */ }
  return "";
}

function safeFontData(value = "") {
  const input = String(value ?? "");
  return /^data:(?:font\/(?:woff2?|ttf|otf)|application\/(?:font-woff|font-woff2|x-font-ttf|x-font-opentype|octet-stream));base64,[a-z0-9+/=]+$/i.test(input) ? input : "";
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "L";
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function brand(light = false) {
  return `
    <span class="brand ${light ? "brand--light" : ""}" aria-label="Linkki">
      <img class="brand-image" src="./logo-linkki.png" alt="" />
    </span>
  `;
}

// Em navegadores móveis, o vídeo pode ser pausado após sair da área visível
// ou depois de um ciclo. Reativa apenas quando a mídia estiver visível.
let linkkiLandingVideoObserver = null;
function linkkiBindLandingVideos() {
  linkkiLandingVideoObserver?.disconnect();
  const videos = [...document.querySelectorAll('.hero-intro-video, .landing-feature__video')];
  if (!videos.length) return;
  const start = (video) => {
    if (!video.isConnected || document.hidden) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {});
  };
  videos.forEach(video => {
    video.addEventListener('ended', () => { video.currentTime = 0; start(video); }, { passive: true });
    video.addEventListener('pause', () => {
      if (video.dataset.linkkiVisible === 'true' && !document.hidden && !video.ended) start(video);
    }, { passive: true });
  });
  if ('IntersectionObserver' in window) {
    linkkiLandingVideoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        video.dataset.linkkiVisible = String(entry.isIntersecting);
        if (entry.isIntersecting) start(video);
      });
    }, { threshold: 0.01 });
    videos.forEach(video => linkkiLandingVideoObserver.observe(video));
  } else videos.forEach(start);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) document.querySelectorAll('.hero-intro-video, .landing-feature__video').forEach(video => {
    if (video.dataset.linkkiVisible !== 'false' && video.paused) {
      const attempt = video.play();
      if (attempt?.catch) attempt.catch(() => {});
    }
  });
});

function landingPage() {
  return `
    <main class="landing">
      <nav class="landing-nav" aria-label="Navegação principal">
        <a href="#home">${brand()}</a>
        <div class="nav-actions">
          <a class="button button--ghost" href="#login">Entrar</a>
          <a class="button button--primary" href="#signup">Criar minha Linkki</a>
        </div>
      </nav>

      <section class="hero">
        <div class="hero-copy">
          <h1>Conecte tudo <span>que é seu.</span></h1>
          <p>
            Reúna seus links, projetos, redes e conteúdos em uma página única,
            bonita e completamente sua
          </p>
          <div class="hero-actions">
            <a class="button button--primary" href="#signup">Criar minha página <span aria-hidden="true">→</span></a>
          </div>
          <div class="hero-note">Grátis para começar · Sem cartão</div>
        </div>

        <div class="hero-visual hero-visual--animated" aria-label="Animação de apresentação da Linkki">
          <video class="hero-intro-video" autoplay muted loop playsinline preload="metadata" aria-label="Animação principal da Linkki">
            <source src="./principal.webm" type="video/webm" />
          </video>
        </div>
      </section>

      <section class="landing-feature landing-feature--stickers" aria-labelledby="feature-stickers-title">
        <div class="landing-feature__inner">
          <div class="landing-feature__media">
            <video class="landing-feature__video" autoplay muted loop playsinline preload="metadata" aria-label="Animação de adesivos para personalizar sua página">
              <source src="./stickers-linkki.webm" type="video/webm" />
            </video>
          </div>
          <div class="landing-feature__copy">
            <h2 id="feature-stickers-title">Uma página com a sua cara.</h2>
            <p>Adicione stickers, combine cores e crie uma identidade que é só sua</p>
            <a class="landing-feature__button" href="#signup">Criar minha Linkki</a>
          </div>
        </div>
      </section>

      <section class="landing-feature landing-feature--analytics" aria-labelledby="feature-analytics-title">
        <div class="landing-feature__inner">
          <div class="landing-feature__copy">
            <h2 id="feature-analytics-title">Entenda cada clique.</h2>
            <p>Acompanhe as visitas e descubra quais links recebem mais atenção</p>
            <a class="landing-feature__button" href="#signup">Começar gratuitamente</a>
          </div>
          <div class="landing-feature__media">
            <video class="landing-feature__video" autoplay muted loop playsinline preload="metadata" aria-label="Animação das métricas e análises de cliques">
              <source src="./analises.webm" type="video/webm" />
            </video>
          </div>
        </div>
      </section>



      <footer class="landing-footer">
        ${brand(true)}
        <span>Linkki — Conecte tudo que é seu.</span>
      </footer>
    </main>
  `;
}

const accountCategories = [
  ["influencer", "✦", "Influencer"],
  ["designer", "◇", "Designer"],
  ["salao", "✂", "Salão de beleza"],
  ["restaurante", "⌁", "Restaurante"],
  ["youtuber", "▶", "YouTuber"],
  ["artista", "♪", "Artista / músico"],
  ["fotografo", "◉", "Fotógrafo"],
  ["negocio", "▦", "Negócio / empresa"],
  ["freelancer", "↗", "Freelancer"],
  ["outro", "+", "Outro"],
];

function authShell(content, title, description) {
  return `
    <main class="auth-page">
      <a class="auth-brand" href="#home">${brand()}</a>
      <section class="auth-layout">
        <aside class="auth-aside">
          <img class="auth-kanji auth-kanji-image" src="./logo-linkki.png" alt="" aria-hidden="true" />
          <h1>${title}</h1>
          <p>${description}</p>
        </aside>
        <section class="auth-card">${content}</section>
      </section>
    </main>
  `;
}

function signupProgress() {
  return `
    <div class="signup-progress" aria-label="Progresso do cadastro">
      ${[1, 2, 3].map((step) => `
        <span class="progress-step ${state.signupStep >= step ? "is-active" : ""}">
          <b>${state.signupStep > step ? "✓" : step}</b>
          ${step === 1 ? "Seus dados" : step === 2 ? "Seu perfil" : "Verificação"}
        </span>
      `).join("")}
    </div>
  `;
}

function signupPage() {
  let content = "";

  if (state.signupStep === 1) {
    content = `
      ${signupProgress()}
      <div class="auth-heading">
        <h2>Crie sua conta</h2>
        <p>Esses dados serão usados para identificar e proteger sua página.</p>
      </div>
      <form class="auth-form" data-form="signup-details">
        <div class="field-grid">
          <label class="field">
            <span class="field-label">Nome</span>
            <input class="input" name="firstName" autocomplete="given-name" required maxlength="40" value="${escapeHtml(state.account.firstName)}" placeholder="Seu nome" />
          </label>
          <label class="field">
            <span class="field-label">Sobrenome</span>
            <input class="input" name="lastName" autocomplete="family-name" required maxlength="60" value="${escapeHtml(state.account.lastName)}" placeholder="Seu sobrenome" />
          </label>
          <label class="field field--wide">
            <span class="field-label">Nome de usuário</span>
            <div class="input-prefix"><span>linkki.com/</span><input name="username" autocomplete="username" required maxlength="30" value="${escapeHtml(state.account.username)}" placeholder="seunome" /></div>
            <small class="field-help">Use letras minúsculas, números, ponto, hífen ou underline.</small>
            <small class="field-help" data-username-status role="status" aria-live="polite"></small>
          </label>
          <label class="field field--wide">
            <span class="field-label">E-mail</span>
            <input class="input" name="email" type="email" autocomplete="email" required value="${escapeHtml(state.account.email)}" placeholder="voce@email.com" />
          </label>
          <label class="field field--wide">
            <span class="field-label">Crie uma senha</span>
            <input class="input" name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo de 8 caracteres" />
          </label>
          <label class="field field--wide">
            <span class="field-label">Confirme sua senha</span>
            <input class="input" name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" required placeholder="Digite a senha novamente" />
          </label>
        </div>
        <p class="form-error" role="alert"></p>
        <button class="button button--primary auth-submit" type="submit">Continuar <span aria-hidden="true">→</span></button>
      </form>
      <p class="auth-switch">Já possui uma conta? <a href="#login">Entrar</a></p>
    `;
  } else if (state.signupStep === 2) {
    content = `
      ${signupProgress()}
      <div class="auth-heading">
        <h2>O que melhor descreve você?</h2>
        <p>Isso ajudará a Linkki a sugerir recursos e modelos mais úteis.</p>
      </div>
      <form class="auth-form" data-form="signup-category">
        <div class="category-grid" role="radiogroup" aria-label="Tipo de perfil">
          ${accountCategories.map(([id, icon, label]) => `
            <button class="category-option ${state.account.category === id ? "is-selected" : ""}" type="button" role="radio" aria-checked="${state.account.category === id}" data-category="${id}">
              <span>${icon}</span>${label}
            </button>
          `).join("")}
        </div>
        <div class="linkki-captcha" data-linkki-turnstile></div>
        <p class="form-error" role="alert"></p>
        <div class="auth-form-actions">
          <button class="button button--ghost" type="button" data-action="signup-back">Voltar</button>
          <button class="button button--primary" type="submit">Enviar código <span aria-hidden="true">→</span></button>
        </div>
      </form>
    `;
  } else {
    content = `
      ${signupProgress()}
      <div class="auth-heading">
        <span class="mail-icon" aria-hidden="true">✉</span>
        <h2>Confira seu e-mail</h2>
        <p>Enviamos um código de 6 dígitos para <strong>${escapeHtml(state.account.email)}</strong>.</p>
      </div>
      <form class="auth-form" data-form="signup-verify">
        <label class="field">
          <span class="field-label">Código de verificação</span>
          <input class="input verification-input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" required />
        </label>

        <p class="form-error" role="alert"></p>
        <button class="button button--primary auth-submit" type="submit">Verificar e criar página</button>
        <div class="linkki-captcha" data-linkki-turnstile></div>
        <button class="text-button" type="button" data-action="resend-code">Reenviar código</button>
        <button class="text-button" type="button" data-action="signup-back">Alterar dados</button>
      </form>
    `;
  }

  return authShell(content, "Sua Linkki começa com você.", "Crie sua conta, diga o que você faz e transforme seus caminhos em uma página única");
}

function loginPage() {
  const hasAccount = true;
  const content = `
    <div class="auth-heading">
      <h2>Entre na sua Linkki</h2>
      <p>${state.passwordResetMode ? "Defina uma senha para sua conta usando um código enviado por e-mail." : "Entre com seu e-mail e sua senha."}</p>
    </div>
    ${hasAccount ? `
      <form class="auth-form" data-form="login">
        <label class="field">
          <span class="field-label">E-mail</span>
          <input class="input" name="loginEmail" type="email" autocomplete="email" required value="${escapeHtml(state.account.email)}" />
        </label>
        ${state.passwordResetMode ? `
          ${state.loginCodeSent ? `<label class="field"><span class="field-label">Código recebido por e-mail</span><input class="input verification-input" name="loginCode" inputmode="numeric" maxlength="6" placeholder="000000" required /></label>
          <label class="field"><span class="field-label">Nova senha</span><input class="input" name="newPassword" type="password" autocomplete="new-password" minlength="8" required /></label>
          <label class="field"><span class="field-label">Confirme a nova senha</span><input class="input" name="newPasswordConfirm" type="password" autocomplete="new-password" minlength="8" required /></label>` : ""}
        ` : `<label class="field"><span class="field-label">Senha</span><input class="input" name="loginPassword" type="password" autocomplete="current-password" required /></label>`}
        <div class="linkki-captcha" data-linkki-turnstile></div>
        <p class="form-error" role="alert"></p>
        <button class="button button--primary auth-submit" type="submit">${state.passwordResetMode ? (state.loginCodeSent ? "Salvar senha e entrar" : "Enviar código para definir senha") : "Entrar"}</button>
      </form>
      <p class="auth-switch"><button class="text-button" type="button" data-action="toggle-password-reset">${state.passwordResetMode ? "Voltar ao login com senha" : "Esqueci minha senha / Primeiro acesso com código"}</button></p>
    ` : `<a class="button button--primary auth-submit" href="#signup">Criar minha conta</a>`}
    <p class="auth-switch"><a href="#home">← Voltar para o início</a></p>
  `;
  return authShell(content, "Bom ter você de volta.", "Acesse sua conta para editar, personalizar e acompanhar sua página");
}

function avatarMarkup(className = "profile-avatar", profile = state.profile) {
  const avatarBorder = profile.avatarBorder || { enabled: false, color: "#2A3C24" };
  const borderStyle = `style="--avatar-border-width:${avatarBorder.enabled ? "3px" : "0px"};--avatar-border-color:${validHex(avatarBorder.color, "#2A3C24")}"`;
  if (safeImageSrc(profile.avatar)) {
    return `<div class="${className} linkki-avatar-border" ${borderStyle}><img src="${escapeHtml(safeImageSrc(profile.avatar))}" alt="Foto de ${escapeHtml(profile.name)}" /></div>`;
  }
  return `<div class="${className} linkki-avatar-border" ${borderStyle} aria-label="Avatar de ${escapeHtml(profile.name)}">${escapeHtml(initials(profile.name))}</div>`;
}

function fontName(fontId) {
  return fontPresets[fontId]?.name
    || state.profile.customFonts.find((font) => font.id === fontId)?.name
    || "Moderna";
}

function customFontFamily(fontId) {
  return `LinkkiFont-${String(fontId).replace(/[^a-z0-9_-]/gi, "")}`;
}

function fontCssValue(fontId, profile = state.profile) {
  if (fontPresets[fontId]) return fontPresets[fontId].css;
  if (profile.customFonts.some((font) => font.id === fontId)) return `"${customFontFamily(fontId)}", sans-serif`;
  return fontPresets.system.css;
}

function buttonShadowValue(shadow = state.profile.buttonShadow) {
  if (!shadow.enabled) return "none";
  const angle = Math.max(0, Math.min(360, Number(shadow.angle) || 0));
  const distance = Math.max(0, Math.min(50, Number(shadow.distance) || 0));
  const blur = Math.max(0, Math.min(80, Number(shadow.blur) || 0));
  const opacity = Math.max(0, Math.min(100, Number(shadow.opacity) || 0)) / 100;
  const radians = angle * Math.PI / 180;
  const x = Math.round(Math.cos(radians) * distance * 10) / 10;
  const y = Math.round(Math.sin(radians) * distance * 10) / 10;
  return `${x}px ${y}px ${blur}px rgba(0,0,0,${opacity})`;
}


function linkkiSafeBackgroundImage(value) {
  const image = String(value || '');
  if (linkkiBackgroundPresets.some(p => p.file === image)) return image;
  if (/^data:image\/jpeg;base64,[a-z0-9+/=]+$/i.test(image) && image.length < 600000) return image;
  return '';
}
function linkkiBackgroundCss(profile) {
  const first = validHex(profile?.customColors?.background, '#CAD593');
  const second = validHex(profile?.gradientSecondColor, '#F2F5DF');
  if (profile?.backgroundMode === 'image') {
    const image = linkkiSafeBackgroundImage(profile.backgroundImage);
    if (image) return `url("${image}") center center / cover no-repeat`;
  }
  return profile?.backgroundMode === 'gradient'
    ? `linear-gradient(180deg, ${first} 0%, ${second} 100%)` : first;
}

function publicProfileMarkup(page = { profile: state.profile, links: state.links }, editing = false) {
  const profile = page.profile;
  const visibleLinks = page.links.filter((link) => link.visible);
  const custom = profile.customColors || { background: "#CAD593", text: "#2A3C24", buttonBackground: "#2A3C24", buttonText: "#CAD593" };
  const border = profile.buttonBorder || { enabled: false, color: "#2A3C24" };
  const mode = profile.backgroundMode === "gradient" ? "gradient" : "solid";
  const avatarLayout = ["classic", "hero", "banner"].includes(profile.avatarLayout) ? profile.avatarLayout : "classic";
  const heroImage = safeImageSrc(profile.avatar);
  const heroZoom = Math.max(100, Math.min(250, Number(profile.heroPhotoZoom) || 100));
  const heroX = Math.max(0, Math.min(100, Number(profile.heroPhotoX ?? 50)));
  const heroY = Math.max(0, Math.min(100, Number(profile.heroPhotoY ?? 50)));
  const bannerImage = safeImageSrc(profile.bannerImage);
  const animation = ["fade-top", "bounce", "fade-bottom"].includes(profile.elementAnimation) ? profile.elementAnimation : "none";
  const bg = validHex(custom.background, "#CAD593");
  const second = validHex(profile.gradientSecondColor, "#F2F5DF");
  const colorStyle = [
    `--profile-bg:${validHex(custom.background, "#CAD593")}`,
    `--profile-text:${validHex(custom.text, "#2A3C24")}`,
    `--button-bg:${validHex(custom.buttonBackground, "#2A3C24")}`,
    `--button-text:${validHex(custom.buttonText, "#CAD593")}`,
    `--button-border-width:${border.enabled ? "2px" : "0px"}`,
    `--button-border-color:${validHex(border.color, "#2A3C24")}`,
    `--button-shadow:${buttonShadowValue(profile.buttonShadow)}`,
    `--title-font:${fontCssValue(profile.titleFont, profile)}`,
    `--body-font:${fontCssValue(profile.bodyFont, profile)}`,
    `background:${linkkiBackgroundCss(profile)}`,
  ].join(";");
  const customFontStyle = (profile.customFonts || []).length
    ? `<style>${(profile.customFonts || []).filter((font) => safeFontData(font.dataUrl)).map((font) => `@font-face{font-family:"${customFontFamily(font.id)}";src:url("${safeFontData(font.dataUrl)}")}`).join("")}</style>`
    : "";
  return `
    ${customFontStyle}
    <div class="profile-canvas bg-custom profile-layout-${avatarLayout} profile-motion-${animation} buttons-${escapeHtml(profile.buttonStyle)}" style="${escapeHtml(colorStyle)}">
      ${avatarLayout === "hero" && heroImage ? `<div class="linkki-profile-cover linkki-profile-cover--hero" style="background-image:url('${escapeHtml(heroImage)}');background-position:${heroX}% ${heroY}%;background-size:${heroZoom}% auto" aria-hidden="true"></div>` : ""}
      ${avatarLayout === "banner" && bannerImage ? `<div class="linkki-profile-cover linkki-profile-cover--banner" style="background-image:url('${escapeHtml(bannerImage)}')" aria-hidden="true"></div>` : ""}
      <div class="profile-inner">
        ${avatarLayout === "hero" && heroImage ? "" : avatarMarkup("public-avatar", profile)}
        <h1 class="public-name">${escapeHtml(profile.name || "Seu nome")}</h1>
        <p class="public-handle">@${escapeHtml(profile.username || "seuusuario")}</p>
        <p class="public-bio">${escapeHtml(profile.bio || "Conte um pouco sobre você.")}</p>
        <div class="public-links">
          ${visibleLinks.length ? visibleLinks.map((link) => `
            <a
              class="link-button"
              href="${escapeHtml(safeUrl(link.url))}"
              data-public-link="${escapeHtml(link.id)}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(link.title || "Novo link")}</a>
          `).join("") : `<div class="empty-state"><strong>Nenhum link visível</strong>Ative um link no editor.</div>`}
        </div>
        <a class="profile-brand" href="#home" aria-label="Linkki"><img class="profile-brand-image" src="./logo-linkki.png" alt="" /></a>
      </div>
      ${linkkiStickersMarkup(profile.stickers, editing)}
    </div>
  `;
}

function sidebar() {
  const tabs = [
    ["content", "✦", "Conteúdo"],
    ["appearance", "◐", "Aparência"],
    ["analytics", "↗", "Analytics"],
  ];
  return `
    <aside class="sidebar" aria-label="Seções do editor">
      <div class="sidebar-label">Sua página</div>
      ${tabs.map(([id, icon, label]) => `
        <button class="tab-button ${state.activeTab === id ? "is-active" : ""}" data-tab="${id}">
          <span class="tab-icon" aria-hidden="true">${icon}</span>${label}
        </button>
      `).join("")}
      <div class="sidebar-profile">
        <strong>${escapeHtml(state.profile.name || "Seu nome")}</strong>
        <span data-sidebar-short-url>linkki.com/${escapeHtml(state.account.username || state.profile.username || "usuario")}</span>
        <button type="button" class="sidebar-share-button" data-action="sidebar-share" aria-label="Copiar link público da página">↗ Compartilhar página</button>
      </div>
    </aside>
  `;
}

function contentPanel() {
  return `
    <div class="panel-header">
      <div>
        <h1>Seu conteúdo</h1>
        <p>Edite seu perfil e organize os caminhos que você quer compartilhar.</p>
      </div>
      <button class="button button--accent" data-action="add-link">+ Adicionar link</button>
    </div>

    <section class="card">
      <div class="card-title"><h2>Perfil</h2></div>
      <div class="profile-row">
        ${avatarMarkup()}
        <div class="avatar-actions">
          <label class="button button--ghost button--small" for="avatar-input">Enviar foto</label>
          <input id="avatar-input" type="file" accept="image/*" hidden />
          ${state.profile.avatar ? `<button class="button button--ghost button--small" data-action="remove-avatar">Remover</button>` : ""}
        </div>
      </div>
      <div class="field-grid">
        <label class="field">
          <span class="field-label">Nome</span>
          <input class="input" name="profile-name" maxlength="50" value="${escapeHtml(state.profile.name)}" />
        </label>
        <div class="field">
          <span class="field-label">Nome de usuário</span>
          <div class="input" style="display:flex;align-items:center;opacity:.75">@${escapeHtml(state.account.username || state.profile.username)}</div>
          <small class="field-help">Para alterar, acesse Minha conta.</small>
        </div>
        <label class="field field--wide">
          <span class="field-label">Bio <small>${state.profile.bio.length}/160</small></span>
          <textarea class="textarea" name="profile-bio" maxlength="160">${escapeHtml(state.profile.bio)}</textarea>
        </label>
      </div>
    </section>

    <section class="card">
      <div class="card-title">
        <h2>Links</h2>
        <span class="save-status">Salvo</span>
      </div>
      <div class="link-list">
        ${state.links.length ? state.links.map((link, index) => linkEditor(link, index)).join("") : `
          <div class="empty-state">
            <strong>Sua árvore está pronta para crescer</strong>
            Adicione o primeiro link da sua página.
          </div>
        `}
      </div>
    </section>
  `;
}

function linkEditor(link, index) {
  return `
    <article class="link-editor" data-link-id="${escapeHtml(link.id)}">
      <span class="drag-handle" draggable="true" title="Segure para reorganizar" aria-label="Arraste para reorganizar">☰</span>
      <div class="link-fields">
        <input class="input" data-link-field="title" value="${escapeHtml(link.title)}" maxlength="70" aria-label="Título do link ${index + 1}" placeholder="Título do link" />
        <input class="input" data-link-field="url" value="${escapeHtml(link.url)}" aria-label="Endereço do link ${index + 1}" placeholder="https://..." />
      </div>
      <div class="link-actions">
        <button class="icon-button" data-action="move-up" title="Mover para cima" aria-label="Mover link para cima">↑</button>
        <button class="icon-button" data-action="move-down" title="Mover para baixo" aria-label="Mover link para baixo">↓</button>
        <button class="switch ${link.visible ? "is-on" : ""}" data-action="toggle-link" title="${link.visible ? "Ocultar link" : "Mostrar link"}" aria-label="${link.visible ? "Ocultar link" : "Mostrar link"}" aria-pressed="${link.visible}"></button>
        <button class="icon-button icon-button--delete" data-action="delete-link" title="Excluir link" aria-label="Excluir link">×</button>
      </div>
    </article>
  `;
}

function fontPickerMarkup(target, label, description) {
  const selected = state.profile[target];
  const view = state.profile.fontViews[target] || "models";
  const recent = [...new Set(state.profile.recentFonts)]
    .filter((fontId) => fontPresets[fontId] || state.profile.customFonts.some((font) => font.id === fontId))
    .slice(0, 5);
  const models = Object.keys(fontPresets);
  const ownFonts = state.profile.customFonts.map((font) => font.id);
  const visibleFonts = view === "recent" ? recent : view === "owned" ? ownFonts : models;
  return `
    <div class="font-picker-card">
      <div class="font-picker-header">
        <div><strong>${label}</strong><span>${description}</span></div>
        <div class="font-view-tabs" role="tablist" aria-label="Coleções de fontes para ${label}">
          ${[
            ["models", "Modelos"],
            ["recent", "Recentes"],
            ["owned", "Suas fontes"],
          ].map(([id, tabLabel]) => `
            <button type="button" class="font-view-tab ${view === id ? "is-active" : ""}" data-font-view="${id}" data-font-target="${target}" role="tab" aria-selected="${view === id}">${tabLabel}</button>
          `).join("")}
        </div>
      </div>
      <button class="button button--ghost button--small font-install-button" type="button" data-action="install-font" data-font-target="${target}">Instalar fonte</button>
      ${visibleFonts.length ? `
        <div class="font-choice-grid">
          ${visibleFonts.map((fontId) => `
            <button
              type="button"
              class="font-tile ${selected === fontId ? "is-active" : ""}"
              data-font-quick="${escapeHtml(fontId)}"
              data-font-target="${target}"
              style="font-family:${escapeHtml(fontCssValue(fontId))}"
            >
              <span>Aa</span>
              <strong>${escapeHtml(fontName(fontId))}</strong>
            </button>
          `).join("")}
        </div>
      ` : `
        <div class="font-empty-panel">
          <strong>${view === "owned" ? "Nenhuma fonte instalada" : "Nenhuma fonte recente"}</strong>
          <span>${view === "owned" ? "Use o botão “Instalar fonte” para adicionar uma." : "As fontes escolhidas aparecerão aqui."}</span>
        </div>
      `}
    </div>
  `;
}

function appearancePanel() {
  const buttons = [
    ["rounded", "rounded", "Arredondado"],
    ["pill", "pill", "Pílula"],
    ["square", "square", "Reto"],
  ];
  const colorFields = [
    ["background", "Fundo", "Cor da página"],
    ["text", "Textos", "Nome, bio e informações"],
    ["buttonBackground", "Botões", "Preenchimento dos links"],
    ["buttonText", "Texto dos botões", "Títulos dos links"],
  ];
  const shadow = state.profile.buttonShadow;
  const border = state.profile.buttonBorder;

  return `
    <div class="panel-header">
      <div>
        <h1>Aparência</h1>
        <p>Personalize cada parte da página e acompanhe o resultado na prévia.</p>
      </div>
    </div>

    <section class="card linkki-layout-card">
      <div class="card-title"><h2>Layout da foto de perfil</h2></div>
      <p class="linkki-setting-description">Escolha como sua foto aparece no topo da página.</p>
      <div class="linkki-layout-options" role="group" aria-label="Layout da foto de perfil">
        ${[["classic","Clássico"],["hero","Hero"],["banner","Banner"]].map(([id,label]) => `<button type="button" class="linkki-layout-option ${((state.profile.avatarLayout || "classic") === id) ? "is-active" : ""}" data-avatar-layout="${id}" aria-pressed="${(state.profile.avatarLayout || "classic") === id}"><span class="linkki-layout-mini linkki-layout-mini--${id}"><span></span></span><strong>${label}</strong></button>`).join("")}
      </div>
      ${state.profile.avatarLayout === "hero" && safeImageSrc(state.profile.avatar) ? `<div class="linkki-hero-size-control">
        <label class="range-control">
          <span><strong>Tamanho da foto</strong><output data-hero-output="heroPhotoZoom">${Math.max(100,Math.min(250,Number(state.profile.heroPhotoZoom ?? 100)))}%</output></span>
          <input type="range" min="100" max="250" step="5" value="${Math.max(100,Math.min(250,Number(state.profile.heroPhotoZoom ?? 100)))}" data-hero-field="heroPhotoZoom" data-suffix="%" aria-label="Tamanho da foto Hero" />
        </label>
      </div>` : ""}
      ${state.profile.avatarLayout === "banner" ? `<div class="linkki-banner-upload"><strong>Imagem do banner</strong><span>Escolha uma imagem horizontal para ficar atrás da foto de perfil.</span><div class="linkki-banner-actions">${safeImageSrc(state.profile.bannerImage) ? `<img class="linkki-banner-thumbnail" src="${escapeHtml(safeImageSrc(state.profile.bannerImage))}" alt="Prévia do banner" />` : ""}<label class="button button--ghost button--small" for="linkki-banner-input">${state.profile.bannerImage ? "Trocar banner" : "Enviar banner"}</label>${state.profile.bannerImage ? `<button type="button" class="button button--ghost button--small" data-action="remove-banner">Remover</button>` : ""}</div></div>` : ""}
      <input id="linkki-banner-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
    </section>

    <section class="card">
      <div class="card-title"><h2>Cores</h2></div>
      <div class="direct-color-list">
        ${colorFields.map(([field, label, description]) => field === "background" ? `
          <div class="direct-color-row linkki-background-row">
            <div class="direct-color-label"><strong>Fundo</strong><span>Cor da página</span></div>
            <div class="linkki-background-options" role="group" aria-label="Tipo de fundo">
              <label class="linkki-background-option linkki-background-option--gradient">
                <span class="linkki-background-heading"><input type="radio" name="linkki-background-mode" value="gradient" data-background-radio ${state.profile.backgroundMode === "gradient" ? "checked" : ""} /><strong>Gradiente</strong></span>
                <span class="linkki-background-swatches">
                  <span class="direct-color-control"><input type="color" data-color-picker="background" value="${validHex(state.profile.customColors.background, "#CAD593")}" aria-label="Primeira cor do gradiente" /><input class="hex-input" data-color-field="background" value="${escapeHtml(state.profile.customColors.background)}" maxlength="7" aria-label="Código da primeira cor" /></span>
                  <span class="direct-color-control"><input type="color" data-gradient-picker value="${validHex(state.profile.gradientSecondColor, "#F2F5DF")}" aria-label="Segunda cor do gradiente" /><input class="hex-input" data-gradient-field value="${escapeHtml(state.profile.gradientSecondColor || "#F2F5DF")}" maxlength="7" aria-label="Código da segunda cor" /></span>
                </span>
              </label>
              <label class="linkki-background-option linkki-background-option--solid">
                <span class="linkki-background-heading"><input type="radio" name="linkki-background-mode" value="solid" data-background-radio ${state.profile.backgroundMode === "solid" ? "checked" : ""} /><strong>Cor sólida</strong></span>
                <span class="linkki-background-swatches">
                  <span class="direct-color-control"><input type="color" data-solid-color-picker value="${validHex(state.profile.customColors.background, "#CAD593")}" aria-label="Cor sólida do fundo" /><input class="hex-input" data-solid-color-field value="${escapeHtml(state.profile.customColors.background)}" maxlength="7" aria-label="Código da cor sólida" /></span>
                </span>
              </label>
            </div>
          </div>` : `
          <div class="direct-color-row">
            <div class="direct-color-label"><strong>${label}</strong><span>${description}</span></div>
            <label class="direct-color-control">
              <input type="color" data-color-picker="${field}" value="${validHex(state.profile.customColors[field], "#2A3C24")}" aria-label="Seletor de cor para ${label}" />
              <input class="hex-input" data-color-field="${field}" value="${escapeHtml(state.profile.customColors[field])}" maxlength="7" aria-label="Código da cor para ${label}" />
            </label>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="card linkki-background-image-card">
      <div class="card-title"><h2>Imagem de fundo</h2></div>
      <label class="linkki-background-image-toggle"><input type="radio" name="linkki-background-mode" value="image" data-background-radio ${state.profile.backgroundMode === "image" ? "checked" : ""} /><span>Usar imagem como fundo da página</span></label>
            <div class="linkki-background-gallery">
              <div class="linkki-background-gallery-title">Imagens do Linkki</div>
              <div class="linkki-background-gallery-grid">${linkkiBackgroundPresets.map(p => `<button type="button" class="linkki-background-preset ${state.profile.backgroundMode === 'image' && state.profile.backgroundImage === p.file ? 'is-selected' : ''}" data-background-preset="${p.id}" aria-label="Usar fundo ${p.name}" title="${p.name}"><img src="${p.file}" alt="" loading="lazy"/><span>${p.name}</span></button>`).join('')}</div>
              <div class="linkki-background-upload-actions"><label class="button button--ghost button--small" for="linkki-background-upload">Enviar minha imagem</label><input id="linkki-background-upload" type="file" accept="image/jpeg,image/png,image/webp" hidden />${state.profile.backgroundImage ? `<button type="button" class="button button--ghost button--small" data-action="remove-background-image">Remover imagem</button>` : ''}</div>
              <small>Imagem vertical ou horizontal. A foto será ajustada para preencher o fundo.</small>
            </div>
    </section>

    <section class="card linkki-stickers-card">
      <div class="card-title"><h2>Adesivos</h2><span class="linkki-sticker-counter">${linkkiNormalizeStickers(state.profile.stickers).length} na página</span></div>
      <div data-sticker-gallery>${linkkiStickerCollectionMarkup()}</div>
    </section>

    <section class="card">
      <div class="card-title"><h2>Foto de perfil</h2></div>
      <div class="effect-block">
        <div class="effect-heading">
          <div><strong>Borda da foto</strong><span>Escolha se a foto de perfil terá contorno.</span></div>
          <button class="switch ${state.profile.avatarBorder?.enabled ? "is-on" : ""}" data-action="toggle-avatar-border" aria-label="${state.profile.avatarBorder?.enabled ? "Remover borda da foto" : "Adicionar borda à foto"}" aria-pressed="${Boolean(state.profile.avatarBorder?.enabled)}"></button>
        </div>
        ${state.profile.avatarBorder?.enabled ? `<div class="effect-content"><div class="direct-color-row compact"><div class="direct-color-label"><strong>Cor da borda</strong></div><label class="direct-color-control"><input type="color" data-avatar-border-picker value="${validHex(state.profile.avatarBorder?.color, "#2A3C24")}" aria-label="Cor da borda da foto" /><input class="hex-input" data-avatar-border-color value="${escapeHtml(state.profile.avatarBorder?.color || "#2A3C24")}" maxlength="7" aria-label="Código da cor da borda da foto" /></label></div></div>` : ""}
      </div>
    </section>

    <section class="card">
      <div class="card-title"><h2>Animação dos elementos</h2></div>
      <p class="linkki-setting-description">Escolha como os elementos entram quando alguém abre sua página.</p>
      <div class="linkki-setting-options linkki-animation-options">
        ${[["none","Sem animação"],["fade-top","Fade-in de cima"],["bounce","Pop-up Bounce"],["fade-bottom","Fade-in de baixo"]].map(([value,label]) => `<button type="button" class="choice ${((state.profile.elementAnimation || "none") === value) ? "is-active" : ""}" data-element-animation="${value}"><span class="linkki-animation-label">${label}</span></button>`).join("")}
      </div>
    </section>

    <section class="card">
      <div class="card-title"><h2>Botões</h2></div>
      <span class="option-label">Formato</span>
      <div class="appearance-grid appearance-grid--three">
        ${buttons.map(([id, styleClass, label]) => `
          <button class="choice ${state.profile.buttonStyle === id ? "is-active" : ""}" data-choice="buttonStyle" data-value="${id}">
            <span class="button-demo ${styleClass}"></span>${label}
          </button>
        `).join("")}
      </div>

      <div class="effect-settings">
        <div class="effect-block">
          <div class="effect-heading">
            <div><strong>Borda</strong><span>Adicione um contorno aos botões.</span></div>
            <button class="switch ${border.enabled ? "is-on" : ""}" data-action="toggle-border" aria-label="${border.enabled ? "Desativar borda" : "Ativar borda"}" aria-pressed="${border.enabled}"></button>
          </div>
          ${border.enabled ? `
            <div class="effect-content">
              <div class="direct-color-row compact">
                <div class="direct-color-label"><strong>Cor da borda</strong></div>
                <label class="direct-color-control">
                  <input type="color" data-border-picker value="${validHex(border.color, "#2A3C24")}" aria-label="Seletor da cor da borda" />
                  <input class="hex-input" data-border-color value="${escapeHtml(border.color)}" maxlength="7" aria-label="Código da cor da borda" />
                </label>
              </div>
            </div>
          ` : ""}
        </div>

        <div class="effect-block linkki-shadow-block">
          <div class="effect-heading">
            <div><strong>Sombra</strong><span>Controle direção, distância e suavidade.</span></div>
            <button class="switch ${shadow.enabled ? "is-on" : ""}" data-action="toggle-shadow" aria-label="${shadow.enabled ? "Desativar sombra" : "Ativar sombra"}" aria-pressed="${shadow.enabled}"></button>
          </div>
          ${shadow.enabled ? `
            <div class="effect-content range-grid">
              ${[
                ["distance", "Distância", 0, 50, 1, "px"],
                ["blur", "Suavidade", 0, 80, 1, "px"],
                ["opacity", "Opacidade", 0, 100, 1, "%"],
                ["angle", "Ângulo", 0, 360, 1, "°"],
              ].map(([field, label, min, max, step, suffix]) => `
                <label class="range-control">
                  <span><strong>${label}</strong><output data-shadow-output="${field}">${shadow[field]}${suffix}</output></span>
                  <input type="range" min="${min}" max="${max}" step="${step}" value="${shadow[field]}" data-shadow-field="${field}" data-suffix="${suffix}" />
                </label>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-title"><h2>Tipografia</h2></div>
      <p class="section-description">Escolha fontes diferentes para dar hierarquia à sua página.</p>
      <div class="font-picker-list">
        ${fontPickerMarkup("titleFont", "Títulos principais", "Nome do perfil e títulos dos links")}
        ${fontPickerMarkup("bodyFont", "Textos", "Bio, usuário e informações auxiliares")}
      </div>
      <input id="font-file-input" type="file" accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf" hidden />
      <p class="font-license-note">Instale apenas fontes que você tem permissão para usar. Formatos aceitos: WOFF, WOFF2, TTF e OTF, até 1,5 MB.</p>
    </section>
  `;
}

function formatCount(value) {
  const number = Number(value) || 0;
  if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1).replace(".", ",")} mi`;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace(".", ",")} mil`;
  return String(number);
}

function templatePreviewMarkup(item) {
  const appearance = item.appearance;
  const colors = appearance.customColors;
  const border = appearance.buttonBorder || { enabled: false, color: colors.text };
  const shadow = appearance.buttonShadow || { enabled: false, distance: 0, blur: 0, opacity: 0, angle: 90 };
  const style = [
    `--template-bg:${validHex(colors.background, "#CAD593")}`,
    `background:${linkkiBackgroundCss(appearance)}`,
    `--template-text:${validHex(colors.text, "#2A3C24")}`,
    `--template-button:${validHex(colors.buttonBackground, "#2A3C24")}`,
    `--template-button-text:${validHex(colors.buttonText, "#CAD593")}`,
    `--template-border-width:${border.enabled ? "2px" : "0px"}`,
    `--template-border-color:${validHex(border.color, colors.text)}`,
    `--template-shadow:${buttonShadowValue(shadow)}`,
    `--template-title-font:${fontCssValue(appearance.titleFont || "system")}`,
    `--template-body-font:${fontCssValue(appearance.bodyFont || "system")}`,
  ].join(";");
  const shape = appearance.buttonStyle || "rounded";
  const preview = appearance.previewSnapshot || {};
  // A mesma prévia é utilizada em Minhas páginas e na Comunidade.
  // O layout do autor e a imagem publicada têm precedência sobre o fallback.
  const previewLayout = preview.avatarLayout || item.avatarLayout || appearance.avatarLayout || 'classic';
  const previewPhoto = safeImageSrc(preview.avatar || item.profileAvatar || '');
  const heroPhoto = previewLayout === 'hero' ? previewPhoto : '';
  const heroPreviewStyle = `background-position:${Math.max(0,Math.min(100,Number(preview.heroPhotoX ?? appearance.heroPhotoX ?? 50)))}% ${Math.max(0,Math.min(100,Number(preview.heroPhotoY ?? appearance.heroPhotoY ?? 50)))}%;background-size:${Math.max(100,Math.min(250,Number(preview.heroPhotoZoom ?? appearance.heroPhotoZoom ?? 100)))}% auto`;
  const bannerPhoto = previewLayout === 'banner' ? safeImageSrc(preview.bannerImage || item.bannerImage || '') : '';
  const avatar = previewPhoto;
  const miniLinks = Array.isArray(item.previewLinks || preview.links)
    ? (item.previewLinks || preview.links).filter(link => link && typeof link.title === "string").slice(0, 5).map(link => `<span>${escapeHtml(link.title)}</span>`).join("")
    : "<span>Meu destaque</span><span>Conteúdo novo</span><span>Fale comigo</span>";
  return `
    <div class="template-preview template-shape-${escapeHtml(shape)} ${heroPhoto ? 'template-preview--hero' : ''}" style="${escapeHtml(style)}">
      ${heroPhoto ? `<div class="template-mini-cover template-mini-cover--hero" style="background-image:url('${escapeHtml(heroPhoto)}');${heroPreviewStyle}"></div>` : ''}
      ${bannerPhoto ? `<div class="template-mini-cover template-mini-cover--banner" style="background-image:url('${escapeHtml(bannerPhoto)}')"></div>` : ''}
      <div class="template-mini-content">
      ${heroPhoto ? '' : `<div class="template-mini-avatar">${avatar ? `<img src="${escapeHtml(avatar)}" alt="Foto do perfil" />` : escapeHtml(item.initials || initials(item.title))}</div>`}
      <strong class="template-mini-name">${escapeHtml(item.previewName || preview.name || item.author || item.title)}</strong>
      <span class="template-mini-handle">@${escapeHtml(item.username || preview.username || "seulinkki")}</span>
      <div class="template-mini-links">
        ${miniLinks}
      </div>
      <small><img class="template-brand-image" src="./logo-linkki.png" alt="Linkki" /></small>
      </div>
      ${linkkiStickersMarkup(Array.isArray(appearance.stickers) ? appearance.stickers : preview.stickers, false, true)}
    </div>
  `;
}

// Fotos das prévias: a comunidade recebe uma versão leve da imagem do criador.
// A foto é exclusiva da apresentação do modelo e nunca é aplicada à conta de terceiros.
async function linkkiTemplatePreviewImage(value) {
  const src = safeImageSrc(value);
  if (!src || !src.startsWith('data:image/')) return src;
  return new Promise(resolve => {
    const picture = new Image();
    picture.onload = () => {
      try {
        const maximum = 560;
        const ratio = Math.min(1, maximum / Math.max(picture.naturalWidth, picture.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(picture.naturalWidth * ratio));
        canvas.height = Math.max(1, Math.round(picture.naturalHeight * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(src); return; }
        ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .76));
      } catch { resolve(src); }
    };
    picture.onerror = () => resolve(src);
    picture.src = src;
  });
}

// O mesmo retrato/layout é gravado no metadado público e usado no cartão local.
function linkkiLocalPagePreview(page) {
  const current = page.id === state.currentPageId;
  const p = current ? state.profile : {};
  const a = page.appearance || {};
  return {
    avatar: (current ? p.avatar : '') || page.profileAvatar || '',
    bannerImage: (current ? p.bannerImage : '') || page.bannerImage || '',
    avatarLayout: (current ? p.avatarLayout : '') || page.avatarLayout || 'classic',
    heroPhotoZoom: a.heroPhotoZoom ?? p.heroPhotoZoom ?? 100,
    heroPhotoX: a.heroPhotoX ?? p.heroPhotoX ?? 50,
    heroPhotoY: a.heroPhotoY ?? p.heroPhotoY ?? 50,
    stickers: linkkiNormalizeStickers(current ? p.stickers : a.stickers),
    name: page.profileName || p.name || page.title || '',
    username: page.username || state.account.username || '',
    links: (Array.isArray(page.previewLinks) ? page.previewLinks : state.links.filter(l => l.visible))
      .slice(0, 5).map(link => ({title: String(link.title || '')}))
  };
}

async function linkkiCompactPagePreview(page) {
  const preview = linkkiLocalPagePreview(page);
  const [avatar, banner] = await Promise.all([
    linkkiTemplatePreviewImage(preview.avatar),
    linkkiTemplatePreviewImage(preview.bannerImage)
  ]);
  return { ...preview, avatar, bannerImage: banner, authorPhoto: await linkkiTemplatePreviewImage(state.account.accountPhoto || "") };
}

// Sincroniza a foto do AUTOR dos modelos existentes, sem alterar a imagem de cada página.
async function linkkiRefreshAccountPhotoInTemplates(photo) {
  if (!authClient || !cloudReady || !cloudUserId) return;
  const owner = cloudUserId;
  const { data: rows, error } = await authClient.from(LINKKI_TEMPLATE_PREVIEW_TABLE)
    .select('template_id,snapshot').eq('owner_id', owner);
  if (error) { console.warn('Linkki: foto dos modelos não sincronizada', error); return; }
  for (const row of rows || []) {
    if (owner !== cloudUserId) return;
    const { error: updateError } = await authClient.from(LINKKI_TEMPLATE_PREVIEW_TABLE)
      .update({ snapshot: { ...(row.snapshot || {}), authorPhoto: photo } })
      .eq('template_id', row.template_id).eq('owner_id', owner);
    if (updateError) console.warn('Linkki: erro ao atualizar foto do autor', updateError);
  }
  state.communityTemplates.forEach(t => { if (t.ownerId === 'self') t.authorPhoto = photo; });
  if (state.activeSection === 'community') render();
}

// Identidade do modelo publicada separadamente, pois a função RPC antiga
// pode descartar campos de imagem e não atualiza títulos após renomear página.
const LINKKI_TEMPLATE_PREVIEW_TABLE = 'linkki_community_preview_metadata';
async function linkkiSaveTemplateMetadata(templateId, page, preview) {
  if (!authClient || !cloudReady || !cloudUserId || !templateId) return false;
  const snapshot = preview || await linkkiCompactPagePreview(page);
  const { error } = await authClient.from(LINKKI_TEMPLATE_PREVIEW_TABLE).upsert({
    template_id: String(templateId), owner_id: cloudUserId,
    source_page_id: String(page.id), title: String(page.title).slice(0, 80),
    snapshot
  }, { onConflict: 'template_id,owner_id' });
  if (error) {
    console.warn('Linkki: metadados do modelo não sincronizados. Execute o SQL incluso no ZIP.', error);
    return false;
  }
  const template = state.communityTemplates.find(item => String(item.id) === String(templateId) && item.ownerId === 'self');
  if (template) {
    template.title = page.title;
    template.appearance = { ...template.appearance, previewSnapshot: snapshot };
    template.profileAvatar = snapshot.avatar;
    template.previewName = snapshot.name;
    template.username = snapshot.username;
    template.previewLinks = snapshot.links;
  }
  return true;
}

async function linkkiUpdatePublishedModelForPage(page) {
  if (!authClient || !cloudReady || !cloudUserId) return true;
  let mine = state.communityTemplates.filter(t => t.ownerId === 'self' && t.sourcePageId === page.id && t.published);
  if (!mine.length) {
    // Não depende do usuário ter visitado a Comunidade antes de renomear.
    const { data, error } = await authClient.rpc('linkki_community_list');
    if (error) { console.warn('Linkki: não foi possível consultar modelos publicados', error); return false; }
    mine = (Array.isArray(data) ? data : []).filter(t => t.owner_id === cloudUserId && t.source_page_id === page.id)
      .map(t => ({id:t.id}));
  }
  if (!mine.length) return true;
  const preview = await linkkiCompactPagePreview(page);
  const results = await Promise.all(mine.map(t => linkkiSaveTemplateMetadata(t.id, page, preview)));
  return results.every(Boolean);
}

function communityNav() {
  return `
    <div class="community-nav" role="tablist" aria-label="Seções da comunidade" data-community-current="${state.communityView}">
      <span class="community-nav-indicator" aria-hidden="true"></span>
      <button class="community-nav-button ${state.communityView === "discover" ? "is-active" : ""}" data-community-view="discover" role="tab" aria-selected="${state.communityView === "discover"}">Descobrir</button>
      <button class="community-nav-button ${state.communityView === "mine" ? "is-active" : ""}" data-community-view="mine" role="tab" aria-selected="${state.communityView === "mine"}">Meus modelos</button>
    </div>
  `;
}

function communityTemplateCard(template, mine = false) {
  return `
    <article class="community-template-card">
      ${templatePreviewMarkup(template)}
      <div class="template-card-body">
        <div class="template-card-title">
          <div><strong>${escapeHtml(template.title)}</strong><span>${escapeHtml(template.category)}</span></div>
          ${mine ? `<span class="published-badge">Publicado</span>` : ""}
        </div>
        <div class="template-author"><span>${safeImageSrc(template.authorPhoto) ? `<img src="${escapeHtml(safeImageSrc(template.authorPhoto))}" alt="Foto de ${escapeHtml(template.author)}" />` : escapeHtml(template.initials || initials(template.author))}</span><strong>${escapeHtml(template.official ? "Linkki" : template.author)}</strong>${template.official ? `<span class="linkki-official-badge" title="Conta oficial do Linkki" aria-label="Oficial">✓ Oficial</span>` : ""}</div>
        <div class="template-stats">
          <button class="template-stat ${template.liked ? "is-liked" : ""}" data-action="like-template" data-template-id="${escapeHtml(template.id)}" aria-label="${template.liked ? "Remover curtida" : "Curtir modelo"}">${template.liked ? "♥" : "♡"} <span>${formatCount(template.likes)}</span></button>
          <span class="template-stat">◎ <span>${formatCount(template.uses)} usos</span></span>
        </div>
        ${mine ? `
          <button class="button button--ghost template-action" data-action="unpublish-template" data-template-id="${escapeHtml(template.id)}">Remover publicação</button>
        ` : `
          <button class="button button--primary template-action" data-action="apply-template" data-template-id="${escapeHtml(template.id)}">Usar este modelo</button>
        `}
      </div>
    </article>
  `;
}

let communityBusy = false;
let communityRequest = 0;
async function loadCommunityTemplates() {
  if (!authClient || !cloudUserId || !cloudReady) return;
  const owner = cloudUserId;
  const request = ++communityRequest;
  const { data, error } = await authClient.rpc('linkki_community_list');
  if (owner !== cloudUserId || request !== communityRequest) return;
  if (error) { console.error('Comunidade:', error); showToast('Não foi possível carregar os modelos.'); return; }
  const raw = Array.isArray(data) ? data : [];
  const previewMeta = new Map();
  let metadataTableReady = true;
  if (raw.length) {
    const { data: rows, error: metaError } = await authClient.from(LINKKI_TEMPLATE_PREVIEW_TABLE)
      .select('template_id,owner_id,title,snapshot').in('template_id', raw.map(t => String(t.id)));
    if (owner !== cloudUserId || request !== communityRequest) return;
    if (!metaError && Array.isArray(rows)) {
      for (const row of rows) previewMeta.set(`${row.template_id}:${row.owner_id}`, row);
    } else if (metaError) {
      // A comunidade continua carregando caso o SQL ainda não tenha sido instalado.
      metadataTableReady = false;
      console.warn('Linkki: metadados visuais da comunidade indisponíveis.', metaError.message);
    }
  }
  const missingOwnerPreview = [];
  state.communityTemplates = raw.map(item => {
    const saved = previewMeta.get(`${item.id}:${item.owner_id}`);
    const localPage = item.owner_id === owner
      ? state.userPages.find(page => page.id === item.source_page_id) : null;
    const localPreview = localPage ? linkkiLocalPagePreview(localPage) : null;
    const embedded = item.appearance?.previewSnapshot || null;
    const preview = saved?.snapshot || localPreview || embedded || {};
    // O autor sempre enxerga o enquadramento salvo da própria página antiga;
    // outros usuários veem somente o que foi efetivamente publicado no banco.
    const usablePreview = (safeImageSrc(preview.avatar) || safeImageSrc(preview.bannerImage))
      ? preview : (localPreview && (safeImageSrc(localPreview.avatar) || safeImageSrc(localPreview.bannerImage)) ? localPreview : (embedded || preview));
    if (localPage && !saved) missingOwnerPreview.push({id: item.id, page: localPage});
    return {
      id: item.id, ownerId: item.owner_id === owner ? 'self' : item.owner_id,
      sourcePageId: item.source_page_id, official: item.owner_id === LINKKI_OFFICIAL_USER_ID,
      author: item.owner_id === LINKKI_OFFICIAL_USER_ID ? 'Linkki' : item.author,
      initials: item.owner_id === LINKKI_OFFICIAL_USER_ID ? 'LK' : initials(item.author || ''),
      title: saved?.title || (localPage?.title && !saved ? localPage.title : item.title),
      category: item.category, likes: Number(item.likes) || 0,
      uses: Number(item.uses) || 0, liked: item.liked === true, published: true,
      appearance: { ...(item.appearance || {}), previewSnapshot: usablePreview },
      authorPhoto: safeImageSrc(item.owner_id === owner ? state.account.accountPhoto : (saved?.snapshot?.authorPhoto || embedded?.authorPhoto || '')),
      profileAvatar: usablePreview.avatar || '',
      previewName: usablePreview.name || '',
      username: usablePreview.username || '',
      previewLinks: usablePreview.links || null
    };
  });
  // Ao atualizar a conta, preenche também os modelos antigos sem metadados.
  // Falhas na tabela não impedem a navegação nem alteram a RPC existente.
  if (missingOwnerPreview.length && metadataTableReady) {
    void (async () => {
      for (const record of missingOwnerPreview) {
        if (owner !== cloudUserId) return;
        await linkkiSaveTemplateMetadata(record.id, record.page);
      }
    })();
  }
  if (location.hash.replace(/^#\/?/, '') === 'editor' && state.activeSection === 'community') {
    if (document.querySelector('#linkki-community-results')) linkkiRefreshCommunityResults();
    else render();
  }
}
async function communityAction(action, payload, successMessage) {
  if (communityBusy || !authClient || !cloudUserId || !cloudReady) return;
  communityBusy = true;
  try {
    const { data, error } = await authClient.rpc(action, payload);
    if (error) throw error;
    await loadCommunityTemplates();
    if (successMessage) showToast(successMessage);
    return data;
  } catch (error) {
    console.error('Comunidade:', error);
    showToast('Não foi possível concluir. Tente novamente.');
    return null;
  } finally { communityBusy = false; }
}

// Troca apenas os resultados das abas. Cabeçalho, banner e seleção permanecem montados.
function communityTabResultsMarkup(publishedTemplates, myPublishedTemplates) {
  if (state.communityView === 'mine') {
    return myPublishedTemplates.length
      ? `<div class="community-section-title"><div><h2>Meus modelos</h2><p>Modelos que você publicou.</p></div></div><div class="community-grid">${myPublishedTemplates.map(template => communityTemplateCard(template, true)).join('')}</div>`
      : `<div class="community-empty"><span>木</span><strong>Nenhum modelo publicado</strong><p>Transforme uma das suas páginas em inspiração para a comunidade.</p><button class="button button--primary" data-community-view="publish">Publicar meu primeiro modelo</button></div>`;
  }
  return `<div class="community-section-title"><div><h2>Em destaque</h2></div></div>
    ${publishedTemplates.length ? `<div class="community-grid">${publishedTemplates.map(template => communityTemplateCard(template)).join('')}</div>` : `<div class="community-empty"><span>木</span><strong>A comunidade está começando!</strong><p>Seja uma das primeiras pessoas a publicar um modelo.</p><button class="button button--primary" data-community-view="publish">Publicar modelo</button></div>`}`;
}

// Alinha o indicador às dimensões reais da aba selecionada, sem saltar de posição.
function linkkiMoveCommunityIndicator(animate = true) {
  const nav = document.querySelector('.editor-panel--community .community-nav');
  if (!nav) return;
  const selected = nav.querySelector(`[data-community-view="${state.communityView}"]`);
  const indicator = nav.querySelector('.community-nav-indicator');
  if (!selected || !indicator) return;

  const targetLeft = selected.offsetLeft;
  const targetWidth = selected.offsetWidth;
  const wasReady = indicator.dataset.ready === '1';

  // Captura a posicao realmente VISIVEL, inclusive em trocas rapidas de aba.
  const navRect = nav.getBoundingClientRect();
  const oldRect = indicator.getBoundingClientRect();
  const oldLeft = oldRect.left - navRect.left - nav.clientLeft;
  const oldWidth = oldRect.width;
  if (indicator._linkkiSlideAnimation) {
    indicator._linkkiSlideAnimation.cancel();
    indicator._linkkiSlideAnimation = null;
  }

  // Posição final é aplicada sem transição CSS: o movimento é controlado
  // explicitamente por Web Animations para não travar em mudanças de estado.
  indicator.style.transition = 'none';
  indicator.style.left = `${targetLeft}px`;
  indicator.style.width = `${targetWidth}px`;
  indicator.dataset.ready = '1';

  if (!animate || !wasReady || (Math.abs(oldLeft - targetLeft) < 0.5 && Math.abs(oldWidth - targetWidth) < 0.5)) return;

  if (typeof indicator.animate === 'function') {
    const animation = indicator.animate([
      { left: `${oldLeft}px`, width: `${oldWidth}px` },
      { left: `${targetLeft}px`, width: `${targetWidth}px` }
    ], {
      duration: 480,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    });
    indicator._linkkiSlideAnimation = animation;
    animation.addEventListener('finish', () => {
      if (indicator._linkkiSlideAnimation === animation) {
        animation.cancel();
        indicator._linkkiSlideAnimation = null;
      }
    }, { once: true });
  } else {
    // Fallback para navegadores sem Web Animations.
    indicator.style.transition = 'left 480ms cubic-bezier(.22,1,.36,1), width 480ms cubic-bezier(.22,1,.36,1)';
    indicator.style.left = `${oldLeft}px`;
    indicator.style.width = `${oldWidth}px`;
    void indicator.offsetWidth;
    indicator.style.left = `${targetLeft}px`;
    indicator.style.width = `${targetWidth}px`;
  }
}

function linkkiAnimateCommunityResults(results) {
  const items = [...results.querySelectorAll('.community-section-title, .community-grid > *, .community-empty')];
  // Anima apenas os conteúdos que mudaram; os elementos acima ficam intactos.
  items.forEach((item, index) => {
    if (typeof item.animate !== 'function') return;
    item.animate([
      { opacity: 0, transform: 'translateY(-18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 580,
      delay: Math.min(index * 65, 280),
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both'
    });
  });
}

function linkkiRefreshCommunityResults() {
  const results = document.querySelector('#linkki-community-results');
  if (!results) return;
  const published = state.communityTemplates.filter(item => item.published);
  const mine = published.filter(item => item.ownerId === 'self');
  results.innerHTML = communityTabResultsMarkup(published, mine);
  document.querySelectorAll('.community-nav-button').forEach(button => {
    const active = button.dataset.communityView === state.communityView;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  linkkiMoveCommunityIndicator(true);
  linkkiBindCommunityResults(results);
  linkkiAnimateCommunityResults(results);
}

function linkkiBindCommunityResults(results) {
  results.querySelectorAll('[data-community-view]').forEach(button => {
    button.addEventListener('click', () => { state.communityView = button.dataset.communityView; saveState(); render(); });
  });
  results.querySelectorAll('[data-action="like-template"]').forEach(button => {
    button.addEventListener('click', async () => {
      await communityAction('linkki_community_toggle_like', { p_template_id: button.dataset.templateId });
    });
  });
  results.querySelectorAll('[data-action="apply-template"]').forEach(button => {
    button.addEventListener('click', async () => {
      const template = state.communityTemplates.find(item => item.id === button.dataset.templateId && item.published);
      if (!template) return;
      const applied = await communityAction('linkki_community_apply', { p_template_id: template.id });
      if (!applied) return;
      // Cria uma página nova; a página anterior continua intacta.
      syncCurrentPageSnapshot();
      const appearance = JSON.parse(JSON.stringify(template.appearance));
      const previous = state.userPages.find(p => p.active) || state.userPages.find(p => p.id === state.currentPageId);
      const pageId = `page-${crypto.randomUUID()}`;
      const newPage = {
        id: pageId, title: `${template.title || 'Modelo'} (cópia)`.slice(0,80),
        profileName: previous?.profileName || state.profile.name,
        username: previous?.username || state.profile.username,
        active: false,
        appearance,
        profileAvatar: previous?.profileAvatar ?? state.profile.avatar,
        avatarLayout: previous?.avatarLayout || state.profile.avatarLayout,
        bannerImage: previous?.bannerImage || state.profile.bannerImage,
        previewLinks: previous?.previewLinks || state.links.filter(l => l.visible).map(l => ({title:l.title})),
      };
      state.userPages.push(newPage);
      state.currentPageId = pageId;
      Object.assign(state.profile, appearance);
      state.profile.stickers = linkkiNormalizeStickers(appearance.stickers || appearance.previewSnapshot?.stickers);
      state.profile.name = newPage.profileName;
      state.profile.username = newPage.username;
      state.profile.avatar = newPage.profileAvatar;
      state.profile.avatarLayout = newPage.avatarLayout;
      state.profile.bannerImage = newPage.bannerImage;
      state.profile.published = false;
      state.activeSection = 'editor'; state.activeTab = 'appearance';
      saveState(); render();
      showToast('Modelo aplicado a uma nova página. A página anterior foi preservada.');
    });
  });
  results.querySelectorAll('[data-action="unpublish-template"]').forEach(button => {
    button.addEventListener('click', async () => {
      const templateId = button.dataset.templateId;
      await communityAction('linkki_community_remove', { p_template_id: templateId }, 'Publicação removida. Sua página continua salva.');
      // A foto da prévia também é apagada da tabela auxiliar quando o modelo
      // deixa de existir publicamente. Não afeta a foto da página original.
      if (!state.communityTemplates.some(t => String(t.id) === templateId && t.ownerId === 'self' && t.published) && cloudUserId) {
        const { error } = await authClient.from(LINKKI_TEMPLATE_PREVIEW_TABLE)
          .delete().eq('template_id', templateId).eq('owner_id', cloudUserId);
        if (error) console.warn('Linkki: limpeza da prévia não concluída', error);
      }
    });
  });
}

function communityPanel() {
  syncCurrentPageSnapshot();
  const publishedTemplates = state.communityTemplates.filter((template) => template.published);
  const myPublishedTemplates = publishedTemplates.filter((template) => template.ownerId === "self");

  if (state.communityView === "publish") {
    return `
      <div class="panel-header community-panel-header">
        <div>
          <button class="back-link" data-community-view="discover">← Voltar para a comunidade</button>
          <h1>Publicar um modelo</h1>
          <p>Escolha uma das suas páginas. Ela continuará existindo mesmo se o modelo for removido da comunidade.</p>
        </div>
      </div>
      <div class="publish-info"><span>✦</span><p>Você pode publicar páginas ativas ou desativadas. Apenas a aparência vira modelo; seus links e dados pessoais não são copiados.</p></div>
      <div class="user-pages-grid">
        ${state.userPages.map((page) => {
          const existing = state.communityTemplates.find((template) => template.ownerId === "self" && template.sourcePageId === page.id && template.published);
          return `
            <article class="user-page-card">
              ${templatePreviewMarkup({ ...page, author: state.profile.name, initials: initials(state.profile.name), previewName: page.profileName || page.title })}
              <div class="user-page-info">
                <div>
                  <strong>${escapeHtml(page.title)}</strong>
                  <span>linkki.com/${escapeHtml(page.username)}</span>
                </div>
                <span class="page-status ${page.active ? "is-active" : ""}">${page.active ? "Ativa" : "Desativada"}</span>
              </div>
              <button class="button ${existing ? "button--ghost" : "button--primary"} template-action" data-action="publish-page-template" data-page-id="${escapeHtml(page.id)}" ${existing ? "disabled" : ""}>${existing ? "Modelo publicado" : "Publicar como modelo"}</button>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  return `
    <div class="panel-header community-panel-header">
      <div><h1>Comunidade</h1><p>Descubra modelos criados por pessoas da Linkki e adapte ao seu conteúdo.</p></div>
      <button class="button button--accent" data-community-view="publish">+ Publicar modelo</button>
    </div>
    ${communityNav()}
    <section class="community-hero">
      <div><span>MODELOS DA COMUNIDADE</span><h2>Encontre um ponto de partida e deixe com a sua cara.</h2></div>
      <strong>${formatCount(publishedTemplates.reduce((sum, template) => sum + template.uses, 0))}<small>aplicações</small></strong>
    </section>
    <div class="community-dynamic-results" id="linkki-community-results">${communityTabResultsMarkup(publishedTemplates, myPublishedTemplates)}</div>
  `;
}

let analyticsMetrics = { views: 0, clicks: 0, byLink: {} };
let analyticsLoading = false;
async function loadRealAnalytics() {
  if (!authClient || !cloudUserId || !cloudReady) return;
  const owner = cloudUserId;
  analyticsLoading = true;
  try {
    const { data, error } = await authClient.rpc('linkki_analytics_summary');
    if (error) throw error;
    if (owner !== cloudUserId) return;
    const result = data || {};
    analyticsMetrics = {
      views: Number(result.views) || 0,
      clicks: Number(result.clicks) || 0,
      byLink: result.by_link && typeof result.by_link === 'object' ? result.by_link : {}
    };
    // Atualiza os cartões diretamente: não depende do hash da URL nem recria o editor.
    const panel = document.querySelector('[data-analytics-panel]');
    if (panel && state.activeSection === 'editor' && state.activeTab === 'analytics') {
      panel.outerHTML = analyticsPanel();
    }
  } catch (error) {
    console.warn('Linkki: não foi possível carregar as métricas reais', error);
    const note = document.querySelector('[data-analytics-status]');
    if (note) note.textContent = 'Não foi possível carregar os dados reais. Confira a instalação do SQL.';
  } finally { analyticsLoading = false; }
}

function analyticsPanel() {
  const views = analyticsMetrics.views;
  const clicks = analyticsMetrics.clicks;
  const clickRate = views ? Math.round(clicks / views * 100) : 0;
  const rows = state.links.map(link => ({ title: link.title || 'Sem título', clicks: Number(analyticsMetrics.byLink[link.id]) || 0 }));
  const maxClicks = Math.max(1, ...rows.map(link => link.clicks));
  return `
    <div data-analytics-panel>
    <div class="panel-header"><div><h1>Analytics</h1><p>Dados reais de acessos e cliques na sua página pública.</p></div></div>
    <div class="stats-grid">
      <article class="stat-card"><span>Visualizações</span><strong>${views}</strong></article>
      <article class="stat-card"><span>Cliques</span><strong>${clicks}</strong></article>
      <article class="stat-card"><span>Taxa de clique</span><strong>${clickRate}%</strong></article>
    </div>
    <section class="card"><div class="card-title"><h2>Cliques por link</h2></div>
      ${rows.length ? rows.map(link => `
        <div class="chart-row">
          <span class="chart-label" title="${escapeHtml(link.title)}">${escapeHtml(link.title)}</span>
          <span class="chart-track"><span class="chart-bar" style="width:${link.clicks ? Math.max(3, Math.round(link.clicks / maxClicks * 100)) : 0}%"></span></span>
          <span class="chart-value">${link.clicks}</span>
        </div>`).join('') : '<div class="empty-state"><strong>Sem links ainda</strong>Adicione links para acompanhar os cliques.</div>'}
    </section>
    <p data-analytics-status style="color:var(--muted);font-size:12px" aria-live="polite"></p>
    </div>
  `;
}

function appMenuMarkup() {
  const items = [
    ["account", "●", "Minha conta", "Dados e preferências"],
    ["pages", "▤", "Minhas páginas", "Gerencie suas Linkkis"],
    ["community", "◎", "Comunidade", "Modelos compartilhados"],
    ["support", "?", "Suporte", "Ajuda e atendimento"],
  ];
  const accountName = `${state.account.firstName || ""} ${state.account.lastName || ""}`.trim() || state.profile.name || "Sua conta";
  return `
    <div class="menu-overlay ${menuOpen ? "is-open" : ""}" data-action="close-menu" aria-hidden="${!menuOpen}"></div>
    <aside class="app-drawer ${menuOpen ? "is-open" : ""}" aria-label="Menu principal" aria-hidden="${!menuOpen}">
      <div class="drawer-header">
        ${brand()}
        <button class="drawer-close" data-action="close-menu" aria-label="Fechar menu">×</button>
      </div>
      <div class="drawer-label">Navegação</div>
      <nav class="drawer-nav">
        ${items.map(([id, icon, label, description]) => `
          <button class="drawer-item ${state.activeSection === id ? "is-active" : ""}" data-app-section="${id}">
            <span class="drawer-item-icon">${icon}</span>
            <span><strong>${label}</strong><small>${description}</small></span>
            <b aria-hidden="true">›</b>
          </button>
        `).join("")}
      </nav>
      <div class="drawer-account">
        <span>${safeImageSrc(state.account.accountPhoto) ? `<img src="${escapeHtml(safeImageSrc(state.account.accountPhoto))}" alt="Foto da conta" />` : escapeHtml(initials(accountName))}</span>
        <div><strong>${escapeHtml(accountName)}</strong><small>${escapeHtml(state.account.email || `@${state.profile.username}`)}</small></div>
      </div>
      <div style="padding:12px 20px 22px">
        <button type="button" class="button" data-action="logout" style="width:100%">Sair da conta</button>
      </div>
    </aside>
  `;
}

function accountPanel() {
  const accountName = `${state.account.firstName || ""} ${state.account.lastName || ""}`.trim() || state.profile.name || "Sua conta";
  const category = accountCategories.find(([id]) => id === state.account.category)?.[2] || "Não informado";
  return `
    <div class="panel-header section-panel-header">
      <div><h1>Minha conta</h1></div>
    </div>
    <div class="account-overview">
      <section class="account-identity-card">
        <label class="linkki-account-photo-control" title="Alterar foto da conta">
          <span class="account-avatar">${safeImageSrc(state.account.accountPhoto) ? `<img src="${escapeHtml(safeImageSrc(state.account.accountPhoto))}" alt="Foto da conta" />` : escapeHtml(initials(accountName))}</span>
          <span class="linkki-account-photo-hint">${state.account.accountPhoto ? 'Trocar foto' : 'Adicionar foto'}</span>
          <input id="linkki-account-photo-input" type="file" accept="image/jpeg,image/png,image/webp" hidden />
        </label>
        <h2>${escapeHtml(accountName)}</h2>
        <p>@${escapeHtml(state.account.username || state.profile.username)}</p>
        <span class="verified-pill">✓ E-mail verificado</span>
        <button class="button button--primary" data-app-section="pages">Minhas páginas</button>
        <button type="button" class="button" data-action="logout" style="margin-top:10px">Sair da conta</button>
      </section>
      <div class="account-details-column">
        <section class="card account-card">
          <div class="card-title"><h2>Informações pessoais</h2></div>
          <div class="account-detail-list linkki-inline-account">
            <div class="linkki-account-line"><span>Nome completo</span><div class="linkki-account-value"><button type="button" class="linkki-inline-edit" data-account-edit="name" aria-label="Editar nome completo">${escapeHtml(accountName)} <span aria-hidden="true">✎</span></button><form data-form="change-account-details" class="linkki-inline-form" hidden><input class="input" name="fullName" maxlength="100" required value="${escapeHtml(accountName)}" aria-label="Nome completo"><input type="hidden" name="category" value="${escapeHtml(state.account.category || 'outro')}"><button class="linkki-inline-save" type="submit">Salvar</button><button type="button" class="linkki-inline-cancel" data-account-cancel="name">Cancelar</button><small data-account-details-status role="status"></small></form></div></div>
            <div class="linkki-account-line"><span>E-mail</span><strong>${escapeHtml(state.account.email || "E-mail ainda não informado")}</strong></div>
            <div class="linkki-account-line"><span>Nome de usuário</span><div class="linkki-account-value"><button type="button" class="linkki-inline-edit" data-account-edit="username" aria-label="Editar nome de usuário">@${escapeHtml(state.account.username || state.profile.username)} <span aria-hidden="true">✎</span></button><form data-form="change-username" class="linkki-inline-form" hidden><input class="input" name="newUsername" autocomplete="off" spellcheck="false" maxlength="30" value="${escapeHtml(state.account.username || state.profile.username)}" aria-label="Nome de usuário"><button class="linkki-inline-save" type="submit">Salvar</button><button type="button" class="linkki-inline-cancel" data-account-cancel="username">Cancelar</button><small class="field-help" data-account-username-status role="status" aria-live="polite"></small></form></div></div>
            <div class="linkki-account-line"><span>Tipo de perfil</span><div class="linkki-account-value"><button type="button" class="linkki-inline-edit" data-account-edit="category" aria-label="Alterar tipo de perfil">${escapeHtml(category)} <span aria-hidden="true">⌄</span></button><div class="linkki-category-popover" data-category-popover hidden role="group" aria-label="Escolha o tipo de perfil">${accountCategories.map(([id,icon,label]) => `<button type="button" class="linkki-category-choice ${state.account.category === id ? 'is-current' : ''}" data-account-category="${escapeHtml(id)}"><span>${escapeHtml(icon)}</span>${escapeHtml(label)}</button>`).join('')}<small data-category-status role="status"></small></div></div></div>
          </div>
        </section>
        <section class="card account-card">
          <div class="card-title"><h2>Segurança</h2></div>
          <div class="account-security-row"><div><strong>Verificação por e-mail</strong><span>Sua conta está protegida por código de acesso.</span></div><span class="status-ok">Ativa</span></div>
        </section>
      </div>
    </div>
  `;
}

let linkkiPageDeleteMode = false;
const linkkiSelectedPageIds = new Set();

function myPagesPanel() {
  syncCurrentPageSnapshot();
  return `
    <div class="panel-header section-panel-header">
      <div><h1>Minhas páginas</h1></div>
      <div class="linkki-page-header-actions">
        <button class="linkki-page-trash" type="button" data-action="page-trash-mode" aria-label="Selecionar páginas para excluir" title="Selecionar páginas para excluir">${linkkiPageDeleteMode ? 'Cancelar' : '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7"/></svg>'}</button>
        ${linkkiPageDeleteMode ? `<button class="linkki-select-all" type="button" data-action="page-select-all">Selecionar tudo</button><button class="linkki-delete-pill" type="button" data-action="page-delete-selected" ${linkkiSelectedPageIds.size ? '' : 'disabled'}>Apagar permanentemente${linkkiSelectedPageIds.size ? ` (${linkkiSelectedPageIds.size})` : ''}</button>` : `<button class="button button--accent" data-action="create-page">+ Nova página</button>`}
      </div>
    </div>
    <div class="managed-pages-grid">
      ${state.userPages.map((page) => `
        <article class="managed-page-card ${state.currentPageId === page.id ? "is-current" : ""}">
          ${linkkiPageDeleteMode ? `<label class="linkki-page-selection" title="Selecionar página"><input type="checkbox" data-page-select="${escapeHtml(page.id)}" ${linkkiSelectedPageIds.has(page.id) ? 'checked' : ''}><span></span></label>` : `<div class="linkki-page-menu-wrap"><button class="linkki-page-dots" type="button" data-page-menu="${escapeHtml(page.id)}" aria-label="Opções da página" aria-expanded="false">⋮</button><div class="linkki-page-popover" hidden><button type="button" data-page-option="rename" data-page-id="${escapeHtml(page.id)}">Renomear página</button><button type="button" data-page-option="duplicate" data-page-id="${escapeHtml(page.id)}">Duplicar página</button><button type="button" data-page-option="deactivate" data-page-id="${escapeHtml(page.id)}">${page.active ? 'Desativar página' : 'Ativar página'}</button><button type="button" class="danger" data-page-option="delete" data-page-id="${escapeHtml(page.id)}">Apagar página</button></div></div>`}
          ${templatePreviewMarkup({ ...page, author: page.profileName || page.title, initials: initials(page.profileName || page.title), previewName: page.profileName || page.title })}
          <div class="managed-page-body">
            <div class="user-page-info">
              <div><strong>${escapeHtml(page.title)}</strong><span>linkki.com/${escapeHtml(page.username)}</span></div>
              <span class="page-status ${page.active ? "is-active" : ""}">${page.active ? "Ativa" : "Desativada"}</span>
            </div>
            <div class="managed-page-actions">
              <button class="button button--primary button--small" data-action="open-page" data-page-id="${escapeHtml(page.id)}">Editar página</button>
              <button class="button button--ghost button--small" data-action="toggle-page-status" data-page-id="${escapeHtml(page.id)}">${page.active ? "Desativar" : "Ativar"}</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}


const LINKKI_SUPPORT_ANSWERS = [["O que é o Linkki?", "Plataforma para reunir links, redes sociais e conteúdos em uma página personalizada."], ["O Linkki é gratuito?", "As funcionalidades atuais não exigem pagamento; eventuais planos futuros serão informados."], ["Como criar minha conta?", "Escolha Cadastrar, informe seus dados e crie uma senha."], ["Preciso confirmar meu e-mail?", "Se a verificação for solicitada, siga as instruções enviadas ao seu e-mail."], ["Como criar minha primeira página?", "Abra o editor, personalize as informações e clique em Publicar."], ["Preciso saber programar?", "Não. Você pode criar sua página pelo editor visual."], ["Posso criar minha página pelo celular?", "Sim, pelo navegador do celular ou computador."], ["Preciso instalar aplicativo?", "Não. O Linkki funciona pelo navegador."], ["Como faço login?", "Informe o e-mail cadastrado e a senha."], ["Esqueci minha senha. O que faço?", "Use a opção de recuperação de senha na tela de acesso."], ["Não recebi o e-mail de recuperação.", "Confira spam, endereço informado e aguarde antes de solicitar novamente."], ["Minha senha não funciona.", "Confira o e-mail e a senha ou solicite recuperação."], ["Posso alterar meu nome de usuário?", "Sim, nas configurações da conta."], ["Por que um nome de usuário está indisponível?", "Ele pode já estar em uso. Tente outro nickname."], ["O que acontece com meu link ao alterar o nickname?", "O endereço público muda. Atualize os links compartilhados anteriormente."], ["Posso usar a mesma conta em outro dispositivo?", "Sim, entrando com suas credenciais."], ["Como sair da minha conta?", "Utilize a opção Sair."], ["Como excluir minha conta?", "O procedimento ainda precisa ser confirmado. Solicite orientação ao suporte."], ["Como publico minha página?", "Conclua as informações no editor e clique em Publicar."], ["Minha página é publicada automaticamente?", "Não. É necessário publicar as alterações."], ["Como atualizar uma página publicada?", "Edite a página e publique novamente."], ["Por que minhas alterações não aparecem?", "Confira se publicou a última versão e atualize o navegador."], ["Onde encontro o link da minha página?", "No Linkki, acesse o endereço público associado ao seu nickname."], ["Posso compartilhar minha página no Instagram?", "Sim. Copie o link público e adicione à biografia."], ["Posso compartilhar no TikTok e WhatsApp?", "Sim, em aplicativos que aceitam links."], ["Por que minha página muda no computador?", "O layout se adapta ao tamanho da tela e usa formato vertical no desktop."], ["Minha página funciona quando estou desconectado?", "Sim, visitantes acessam a página publicada sem seu login."], ["Posso ter mais de uma página?", "A área Minhas páginas permite gerenciar páginas; confira os limites vigentes."], ["Como adiciono um link?", "Na seção de links, informe título e endereço."], ["Posso adicionar links para qualquer site?", "Use URLs válidas, respeitando as regras e os limites de segurança."], ["Meu botão não abre o site.", "Confira o endereço e se o site de destino está disponível."], ["Posso mudar o nome de um botão?", "Sim. Edite o título e publique novamente."], ["Posso reorganizar meus links?", "Use os controles de organização do editor."], ["Como remover um link?", "Exclua o item no editor e publique a atualização."], ["Posso mudar as cores dos botões?", "Sim, nas opções de aparência."], ["Por que meu link não aparece na página pública?", "Verifique se salvou e publicou as mudanças."], ["Como altero a cor de fundo?", "Abra Aparência e escolha a cor."], ["Posso usar fundo em degradê?", "Sim. Combine duas cores nas opções de gradiente."], ["Posso colocar imagem de fundo?", "Sim. Ative imagem de fundo e escolha ou envie uma imagem."], ["Posso enviar minha própria imagem?", "Sim, usando Enviar minha imagem."], ["Como remover a imagem de fundo?", "Use Remover imagem ou desative a opção."], ["Posso mudar a fonte?", "Sim, nas opções de tipografia."], ["Posso colocar foto de perfil?", "Sim, na seção de perfil."], ["Quais layouts de foto existem?", "Clássico, Hero e Banner."], ["O que é o layout Hero?", "Uma apresentação com fotografia destacada na parte superior."], ["Posso remover a borda da foto?", "Sim, nas configurações de aparência."], ["Por que a foto fica cortada?", "O layout ajusta a imagem ao espaço. Tente outro enquadramento."], ["Como visualizar antes de publicar?", "Use a prévia do editor."], ["O que são os adesivos?", "Elementos gráficos decorativos para personalizar a página."], ["Como adiciono um adesivo?", "Abra Adesivos, selecione uma coleção e clique no adesivo."], ["Posso mover um adesivo?", "Sim, arrastando na prévia do editor."], ["Como redimensiono um adesivo?", "Selecione-o e arraste as alças de tamanho."], ["Posso girar um adesivo?", "Sim, pelo controle de rotação."], ["Como excluo um adesivo?", "Selecione o adesivo e use o controle de exclusão."], ["Como escondo os controles do adesivo?", "Clique em uma área vazia da prévia."], ["Qual o limite de adesivos?", "A implementação atual prevê até 40 por página."], ["Os controles de edição aparecem aos visitantes?", "Não. Apenas os adesivos aparecem na página pública."], ["Quais coleções de adesivos existem?", "Atualmente Paper e Retrô; outras podem ser adicionadas."], ["Posso animar minha página?", "Sim, nas opções de animação dos elementos."], ["Quais animações existem?", "Sem animação, Fade-in de cima, Pop-up Bounce e Fade-in de baixo."], ["Como pré-visualizo uma animação?", "Passe o mouse sobre a opção, em dispositivos compatíveis."], ["Como desativo animações?", "Selecione Sem animação e publique."], ["O que são modelos?", "Configurações visuais reutilizáveis para páginas."], ["Como aplicar um modelo?", "Escolha o modelo e use a opção de aplicação."], ["Aplicar um modelo remove meus links?", "Não. O modelo altera a aparência, preservando as informações e links da página."], ["Posso criar meu próprio modelo?", "Sim, usando os recursos de criação e salvamento de modelos."], ["O que é a comunidade de modelos?", "Área para descobrir e utilizar modelos compartilhados."], ["Posso editar um modelo aplicado?", "Sim, continue personalizando no editor."], ["O que acontece se um modelo sair da comunidade?", "Ele deixa de estar disponível para novas aplicações; páginas já criadas permanecem."], ["Por que a prévia do modelo é diferente da minha página?", "Alguns elementos usam informações e imagens do seu perfil. Confira a prévia final."]];
function linkkiSupportSearchText(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function linkkiSupportSearch(query) {
 const results = document.querySelector("[data-support-results]");
 if (!results) return;
 const q = linkkiSupportSearchText(query);
 if (!q) { results.hidden = true; results.innerHTML = ""; return; }
 const words = q.split(/\s+/).filter(Boolean);
 const matches = LINKKI_SUPPORT_ANSWERS.filter(([question,answer]) => words.every(w => linkkiSupportSearchText(question + " " + answer).includes(w))).slice(0, 12);
 results.hidden = false;
 results.innerHTML = matches.length ? `<p class="support-results-count">${matches.length} resultado(s)${matches.length === 12 ? " (exibindo os primeiros)" : ""}</p>` + matches.map(([question,answer]) => `<article class="support-result"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("") : `<p class="support-results-empty">Nenhuma resposta encontrada. Tente outras palavras.</p>`;
}
function supportPanel() {
  return `
    <div class="panel-header section-panel-header">
      <div><h1>Suporte</h1><p>Encontre respostas e os caminhos para falar com a Linkki.</p></div>
    </div>
    <section class="support-hero">
      <span>?</span><div><h2>Como podemos ajudar?</h2><p>Pesquise sua dúvida para encontrar uma resposta.</p></div>
      <label class="support-search"><span>⌕</span><input type="search" data-support-search placeholder="Buscar uma dúvida..." aria-label="Buscar no suporte" autocomplete="off" /></label>
    </section>
    <section class="card support-results" data-support-results hidden aria-live="polite"></section>
    <section class="card support-faq">
      <div class="card-title"><h2>Perguntas frequentes</h2></div>
      <details><summary>Como publico minha página?</summary><p>Abra o editor, conclua as informações e use o botão Publicar no topo.</p></details>
      <details><summary>Aplicar um modelo remove meus links?</summary><p>Não. O modelo altera apenas a aparência; nome, bio e links são preservados.</p></details>
      <details><summary>O que acontece se eu remover um modelo da comunidade?</summary><p>A publicação pública é removida, mas sua página original continua salva.</p></details>
    </section>
    <section class="card support-ticket-entry">
      <div><h2>Não encontrou sua resposta?</h2><p>Envie uma solicitação para nossa equipe.</p></div>
      <button type="button" class="button button--primary" data-app-section="ticket">Enviar ticket</button>
    </section>
  `;
}

function ticketPanel() {
  return `
    <div class="panel-header section-panel-header">
      <div><h1>Enviar ticket</h1></div>
      <button type="button" class="button button--ghost" data-app-section="support">← Voltar ao suporte</button>
    </div>
    <section class="card support-ticket">
      <div class="card-title"><h2>Solicitação de suporte</h2></div>
      
      <form data-support-ticket>
        <div class="support-ticket-row">
          <label>Seu nome<input name="name" type="text" maxlength="100" autocomplete="name" required placeholder="Como podemos chamar você?" /></label>
          <label>E-mail para resposta<input name="email" type="email" maxlength="180" autocomplete="email" required placeholder="voce@exemplo.com" /></label>
        </div>
        <div class="support-ticket-row">
          <label>Categoria<select name="category" class="linkki-ticket-category" required><option value="">Selecione</option><option>Conta e acesso</option><option>Páginas e publicação</option><option>Personalização e adesivos</option><option>Modelos e comunidade</option><option>Erro ou problema técnico</option><option>Outro assunto</option></select></label>
          <label>Assunto<input name="subject" type="text" maxlength="140" required placeholder="Resuma sua dúvida" /></label>
        </div>
        <label>Descreva sua solicitação<textarea name="message" rows="5" minlength="10" maxlength="5000" required placeholder="Conte o que aconteceu e como podemos ajudar..."></textarea></label>
        <input class="support-ticket-honeypot" name="_honey" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="support-ticket-footer"><span>Responderemos pelo e-mail informado.</span><button type="submit" class="primary-button" data-ticket-submit>Enviar ticket</button></div>
        <p data-ticket-status role="status" aria-live="polite"></p>
      </form>
    </section>
  `;
}

let linkkiMobileEditorSheet = false;
let linkkiMobileEditorTool = 'content';
let linkkiMobileSheetScroll = 0;
const linkkiMobileToolInfo = {
  content: ['Conteúdo','✎','content'], colors: ['Cores','◉','appearance'],
  fonts: ['Fontes','Aa','appearance'], stickers: ['Stickers','✦','appearance'],
  background: ['Fundo','▧','appearance'], animation: ['Animação','◌','appearance'],
  buttons: ['Botões','▢','appearance'], photo: ['Foto','◉','appearance'],
  analytics: ['Analytics','↗','analytics']
};
function linkkiPrepareMobileToolPanel() {
  // Os filtros das ferramentas são exclusivos do editor mobile.
  // No desktop, todas as seções de Aparência precisam permanecer visíveis.
  if (!window.matchMedia('(max-width:820px)').matches) return;
  const workspace = document.querySelector('.workspace--mobile-editor');
  if (!workspace) return;
  const panel = workspace.querySelector(':scope > .editor-panel');
  if (!panel) return;
  panel.dataset.mobileTool = linkkiMobileEditorTool;
  const appearance = state.activeTab === 'appearance';
  const groups = {
    'Layout da foto de perfil':'photo', 'Cores':'colors', 'Imagem de fundo':'background',
    'Adesivos':'stickers', 'Foto de perfil':'photo', 'Animação dos elementos':'animation',
    'Botões':'buttons', 'Tipografia':'fonts'
  };
  if (appearance) {
    panel.querySelectorAll(':scope > .card').forEach(card => {
      const heading = card.querySelector('.card-title h2')?.textContent?.trim();
      const group = groups[heading];
      card.hidden = Boolean(group && group !== linkkiMobileEditorTool);
    });
    const header = panel.querySelector(':scope > .panel-header');
    if (header) header.hidden = true;
  }
  const sheet = workspace.querySelector('.mobile-editor-sheet-header strong');
  if (sheet) sheet.textContent = linkkiMobileToolInfo[linkkiMobileEditorTool]?.[0] || 'Editar';
  // Mantém a posição da folha ao atualizar um campo, sem salto para o início.
  if (linkkiMobileEditorSheet) panel.scrollTop = linkkiMobileSheetScroll;
  panel.addEventListener('scroll', () => { linkkiMobileSheetScroll = panel.scrollTop; }, {passive:true});
}


function editorPage() {
  const panels = {
    content: contentPanel,
    appearance: appearancePanel,
    analytics: analyticsPanel,
  };
  const sections = {
    account: accountPanel,
    pages: myPagesPanel,
    community: communityPanel,
    support: supportPanel,
    ticket: ticketPanel,
  };
  const isEditor = state.activeSection === "editor";
  if (!isEditor) linkkiMobileEditorSheet = false;
  const panel = isEditor ? (panels[state.activeTab] || contentPanel) : (sections[state.activeSection] || accountPanel);
  return `
    <main class="app-shell">
      <header class="app-topbar">
        <div class="topbar-brand-group">
          <button class="menu-button" data-action="open-menu" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>
          <button class="topbar-logo" data-app-section="editor" aria-label="Abrir editor">${brand()}</button>
        </div>
        <div class="topbar-actions">
          ${isEditor ? `
          <span class="save-status">Salvo neste navegador</span>
          <a class="button button--ghost button--small" href="#public">Prévia da página</a>
          <button class="button ${state.profile.published ? "button--accent" : "button--primary"} button--small" data-action="publish">
            ${state.profile.published ? (hasUnpublishedChanges() ? "Publicar alterações" : "Publicado") : "Publicar"}
          </button>` : ""}
        </div>
      </header>
      ${appMenuMarkup()}
      <div class="workspace ${isEditor ? "workspace--mobile-editor" : "workspace--section"} ${isEditor && linkkiMobileEditorSheet ? "mobile-sheet-open" : ""}">
        ${isEditor ? sidebar() : ""}
        ${isEditor ? `<nav class="mobile-editor-dock" aria-label="Ferramentas de edição">
          ${Object.entries(linkkiMobileToolInfo).map(([id,info]) => `<button type="button" data-mobile-editor-tool="${id}" class="${linkkiMobileEditorTool === id && linkkiMobileEditorSheet ? 'is-active' : ''}"><span>${info[1]}</span>${info[0]}</button>`).join('')}
        </nav>
        <button type="button" class="mobile-editor-sheet-backdrop" data-mobile-editor-close aria-label="Fechar ferramentas"></button>
        <div class="mobile-editor-sheet-header"><strong>${linkkiMobileToolInfo[linkkiMobileEditorTool]?.[0] || 'Editar'}</strong><button type="button" data-mobile-editor-close aria-label="Fechar painel">✕</button></div>` : ""}
        <section class="editor-panel ${isEditor ? "" : "editor-panel--section"} ${state.activeSection === "community" && !isEditor ? "editor-panel--community" : ""}">${panel()}</section>
        ${isEditor ? `<aside class="preview-panel" aria-label="Prévia da sua página">
          <div class="preview-wrap">
            <div class="preview-label"><span></span><span class="preview-history-controls">${linkkiHistoryControls()}</span></div>
            <div class="preview-phone"><div class="preview-screen">${publicProfileMarkup(undefined, true)}</div></div>
          </div>
        </aside>` : ""}
      </div>
    </main>
  `;
}

function publicPage() {
  return `
    <main class="public-page" style="background:${escapeHtml(linkkiBackgroundCss(state.profile))}">
      <div class="public-actions">
        <button class="public-action" data-action="share" aria-label="Copiar ou compartilhar link público" title="Copiar ou compartilhar link público">↗</button>
        <a class="public-action" href="#editor" aria-label="Editar página" title="Editar">✎</a>
      </div>
      ${publicProfileMarkup()}
    </main>
  `;
}

// Apenas a rota pública registra eventos. Nenhum evento é contado no editor ou na prévia.
function analyticsVisitorKey() {
  const key = 'linkki_analytics_visitor';
  try {
    let id = sessionStorage.getItem(key);
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
    return id;
  } catch { return crypto.randomUUID(); }
}
async function trackPublicEvent(username, eventType, linkId = null) {
  if (!authClient || !username) return;
  try {
    const { error } = await authClient.rpc('linkki_track_public_event', {
      p_username: username, p_event_type: eventType, p_link_id: linkId,
      p_visitor_key: analyticsVisitorKey()
    });
    if (error) console.warn('Linkki: métrica não registrada', error);
  } catch (error) { console.warn('Linkki: métrica não registrada', error); }
}

// Compatibilidade com Instagram: links públicos sem fragmento (#).
// A rota com hash continua funcionando para links antigos e navegação interna.
function linkkiPublicUsernameFromLocation() {
  const hashRoute = location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hashRoute) return /^[a-z0-9_.-]{3,30}$/.test(hashRoute) && !['home', 'login', 'signup', 'editor', 'public'].includes(hashRoute) ? hashRoute : null;
  const queryUsername = new URLSearchParams(location.search).get('perfil');
  return queryUsername && /^[a-z0-9_.-]{3,30}$/i.test(queryUsername) ? queryUsername.toLowerCase() : null;
}
function linkkiPublicShareUrl(username) {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('perfil', String(username).toLowerCase());
  return url.href;
}

// Fundo idêntico ao publicado, incluindo degradê; valida as cores antes de aplicar.
function linkkiPublicBackground(profile) {
  const first = validHex(profile?.customColors?.background, '#F7F8F3');
  const second = validHex(profile?.gradientSecondColor, '#F2F5DF');
  return linkkiBackgroundCss(profile);
}
function linkkiReadPublicBackground(username) {
  try {
    const saved = JSON.parse(localStorage.getItem('linkki-public-backgrounds') || '{}')[username];
    if (saved && (/^#[0-9a-f]{6}$/i.test(saved) || /^linear-gradient\(180deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 100%\)$/i.test(saved) || linkkiBackgroundPresets.some(p => saved === `url(\"${p.file}\") center center / cover no-repeat`))) return saved;
  } catch (_) {}
  return '#F7F8F3'; // Primeira visita: cor neutra até chegar a aparência publicada.
}
function linkkiSavePublicBackground(username, background) {
  try {
    const backgrounds = JSON.parse(localStorage.getItem('linkki-public-backgrounds') || '{}');
    if (background.length > 500) return; // Nao guardar imagens enviadas no armazenamento local.
    backgrounds[username] = background;
    const names = Object.keys(backgrounds);
    if (names.length > 30) delete backgrounds[names[0]];
    localStorage.setItem('linkki-public-backgrounds', JSON.stringify(backgrounds));
  } catch (_) {}
}

let publicRouteToken = 0;
async function loadPublicRoute(username) {
  const token = ++publicRouteToken;
  const app = document.querySelector('#app');
  // O último fundo publicado conhecido evita mudanças bruscas em visitas seguintes.
  const cachedBackground = linkkiReadPublicBackground(username);
  app.innerHTML = `<main class="public-page linkki-public-loading-page"><div class="linkki-public-loading" role="status" aria-label="Carregando página" style="background:${cachedBackground}"><video class="linkki-public-loading-video" src="./linkki-loading.webm" autoplay muted playsinline loop aria-hidden="true"></video></div></main>`;
  if (!authClient) { app.innerHTML = publicNotFound('Não foi possível carregar esta página.'); return; }
  let data, error;
  try { ({ data, error } = await authClient.from('linkki_public_pages').select('public_data').eq('username',username).maybeSingle()); }
  catch (cause) { error = cause; }
  if (token !== publicRouteToken || linkkiPublicUsernameFromLocation() !== username) return;
  if (error || !data?.public_data?.profile || !Array.isArray(data.public_data.links)) {
    app.innerHTML = publicNotFound(error ? 'Não foi possível carregar esta página.' : 'Esta página não está publicada.');
  } else {
    const background = linkkiPublicBackground(data.public_data.profile);
    linkkiSavePublicBackground(username, background);
    const loading = app.querySelector('.linkki-public-loading');
    if (loading) loading.style.background = background;
    // Insere o perfil sob o loading e só inicia suas animações na revelação.
    app.querySelector('.linkki-public-loading-page').insertAdjacentHTML('afterbegin', publicProfileMarkup(data.public_data));
    app.querySelector('.linkki-public-loading-page').classList.add('linkki-public-content--waiting');
    requestAnimationFrame(() => {
      if (token !== publicRouteToken || !loading.isConnected) return;
      const content = app.querySelector('.linkki-public-loading-page');
      if (content) content.classList.remove('linkki-public-content--waiting');
      loading.classList.add('linkki-public-loading--leaving');
      loading.addEventListener('transitionend', () => loading.remove(), { once: true });
      setTimeout(() => { if (loading.isConnected) loading.remove(); }, 650);
    });
    void trackPublicEvent(username, 'view');
  }
  bindEvents();
}
function publicNotFound(message) {
  return `<main class="public-page"><div class="profile-canvas bg-light"><div class="profile-inner"><div class="public-avatar">木</div><h1 class="public-name">${escapeHtml(message)}</h1><a class="button button--primary" href="#home">Voltar ao Linkki</a></div></div></main>`;
}

let lastRenderedRoute = null;
function render() {
  const app = document.querySelector("#app");
  const route = location.hash.replace(/^#\/?/, "") || linkkiPublicUsernameFromLocation() || "home";
  const sameRoute = lastRenderedRoute === route;
  const previousScroll = window.scrollY;
  const oldPreview = sameRoute ? app.querySelector(".preview-screen") : null;
  // Guarda a prévia existente durante a reconstrução do editor.
  if (oldPreview) oldPreview.remove();
  if (route === "signup") {
    app.innerHTML = state.account.loggedIn ? editorPage() : signupPage();
  } else if (route === "login") {
    app.innerHTML = state.account.loggedIn ? editorPage() : loginPage();
  } else if (route === "editor") {
    if (!state.account.verified) app.innerHTML = signupPage();
    else if (!state.account.loggedIn) app.innerHTML = loginPage();
    else app.innerHTML = editorPage();
  } else if (route === "public") {
    app.innerHTML = publicPage();
  } else if (/^[a-z0-9_.-]{3,30}$/i.test(route) && route !== "home") {
    loadPublicRoute(route.toLowerCase());
    return;
  } else {
    app.innerHTML = landingPage();
  }
  if (oldPreview) {
    const newPreview = app.querySelector(".preview-screen");
    if (newPreview) {
      newPreview.replaceWith(oldPreview);
      syncLivePreview();
    }
  }
  bindEvents();
  linkkiPrepareMobileToolPanel();
  initializeTurnstile();
  if (route === "home") linkkiBindLandingVideos();
  else linkkiLandingVideoObserver?.disconnect();
  lastRenderedRoute = route;
  // Ao voltar ao editor com Analytics já selecionado, consulta os números atuais.
  if (route === 'editor' && !sameRoute && state.account.loggedIn &&
      state.activeSection === 'editor' && state.activeTab === 'analytics' && !analyticsLoading) {
    void loadRealAnalytics();
  }
  // Só volta ao topo ao trocar de página; ajustes na mesma tela preservam a posição.
  if (sameRoute) window.scrollTo({ top: previousScroll, behavior: "instant" });
  else window.scrollTo({ top: 0, behavior: "instant" });
}

function refreshEditorViews() {
  saveState();
  render();
}

function updateProfileField(field, value, shouldRender = true) {
  state.profile[field] = value;
  saveState();
  if (shouldRender) render();
}

function addLink() {
  state.links.push({
    id: crypto.randomUUID(),
    title: "Novo link",
    url: "https://",
    visible: true,
    clicks: 0,
  });
  refreshEditorViews();
  requestAnimationFrame(() => {
    const cards = document.querySelectorAll(".link-editor");
    const last = cards[cards.length - 1];
    last?.querySelector('[data-link-field="title"]')?.select();
    last?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function moveLink(id, direction) {
  const index = state.links.findIndex((link) => link.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= state.links.length) return;
  [state.links[index], state.links[next]] = [state.links[next], state.links[index]];
  refreshEditorViews();
}

let menuKeydownController = new AbortController();
function bindEvents() {
  document.querySelector("[data-support-search]")?.addEventListener("input", event => linkkiSupportSearch(event.target.value));
  document.querySelector("[data-support-ticket]")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const status = form.querySelector("[data-ticket-status]");
    const button = form.querySelector("[data-ticket-submit]");
    const data = new FormData(form);
    if (String(data.get("_honey") || "").trim()) return;
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const category = String(data.get("category") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !category || !subject || message.length < 10) return;
    button.disabled = true;
    status.textContent = "Enviando solicitação...";
    try {
      const payload = new FormData();
      payload.append("name", name);
      payload.append("email", email);
      payload.append("category", category);
      payload.append("subject", `[Linkki] ${category} — ${subject}`);
      payload.append("message", message);
      payload.append("_replyto", email);
      payload.append("_captcha", "true");
      payload.append("_template", "table");
      const response = await fetch("https://formsubmit.co/ajax/linkkicontato@gmail.com", {
        method: "POST", body: payload, headers: { Accept: "application/json" }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || result.success === false || result.success === "false") {
        throw new Error("Falha no envio");
      }
      form.reset();
      status.textContent = "Solicitação enviada ao serviço de atendimento. Se for o primeiro envio, o destinatário precisa ativar o recebimento pelo e-mail de confirmação.";
    } catch (error) {
      status.textContent = "Não foi possível enviar agora. Tente novamente em instantes.";
    } finally {
      button.disabled = false;
    }
  });

  document.querySelectorAll('[data-linkki-history]').forEach(button => {
    button.addEventListener('click', () => linkkiHistoryAction(button.dataset.linkkiHistory));
  });
  linkkiBindStickerEditor();
  menuKeydownController.abort();
  menuKeydownController = new AbortController();
  const setFormError = (form, message) => {
    const error = form?.querySelector(".form-error");
    if (error) error.textContent = message;
  };

  document.querySelector('#linkki-account-photo-input')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showToast('Escolha JPG, PNG ou WebP de até 5 MB.'); return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const side = Math.min(bitmap.width, bitmap.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, (bitmap.width-side)/2, (bitmap.height-side)/2, side, side, 0, 0, 160, 160);
      bitmap.close?.();
      const photo = canvas.toDataURL('image/jpeg', .7);
      if (!authClient || !cloudReady || !cloudUserId) {
        showToast('Aguarde a conexão com sua conta para salvar a foto.'); return;
      }
      const previous = state.account.accountPhoto;
      state.account.accountPhoto = photo;
      saveState(); render();
      // Grava no Auth para recuperação entre dispositivos, e no snapshot da conta.
      const { error: photoError } = await authClient.auth.updateUser({ data: { linkki_account_photo: photo } });
      if (photoError) {
        state.account.accountPhoto = previous;
        saveState(); render();
        showToast('Não foi possível salvar a foto na conta. Tente novamente.');
        console.warn('Linkki: falha ao salvar foto da conta', photoError);
        return;
      }
      queueCloudSave();
      // Atualiza a identidade do autor em modelos publicados, sem tocar nas fotos das páginas.
      void linkkiRefreshAccountPhotoInTemplates(photo);
      showToast('Foto da conta atualizada.');
    } catch (error) { console.warn(error); showToast('Não foi possível carregar a foto.'); }
  });
  document.querySelectorAll('[data-account-edit]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.accountEdit;
    const parent = button.closest('.linkki-account-value');
    const panel = type === 'category' ? parent?.querySelector('[data-category-popover]') : parent?.querySelector('form');
    if (!panel) return;
    document.querySelectorAll('.linkki-inline-form, [data-category-popover]').forEach(other => { if (other !== panel) other.hidden = true; });
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.querySelector('input')?.focus();
  }));
  document.querySelectorAll('[data-account-cancel]').forEach(button => button.addEventListener('click', () => {
    button.closest('form').hidden = true;
  }));
  document.querySelectorAll('[data-account-category]').forEach(button => button.addEventListener('click', async () => {
    const category = button.dataset.accountCategory;
    const status = button.closest('[data-category-popover]').querySelector('[data-category-status]');
    if (!authClient || !cloudReady || !cloudUserId) { status.textContent = 'Aguarde a conexão com sua conta.'; return; }
    button.disabled = true;
    try {
      const { error } = await authClient.auth.updateUser({ data: { category } });
      if (error) throw error;
      state.account.category = category; saveState(); render(); showToast('Tipo de perfil atualizado.');
    } catch (error) { status.textContent = 'Não foi possível salvar. Tente novamente.'; button.disabled = false; }
  }));
  document.querySelector('[data-form="change-account-details"]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fullName = String(new FormData(form).get('fullName') || '').trim().replace(/\s+/g,' ');
    const category = String(new FormData(form).get('category') || '');
    const status = form.querySelector('[data-account-details-status]');
    if (!fullName || fullName.length > 100 || !accountCategories.some(([id]) => id === category)) {
      status.textContent = 'Informe um nome e um tipo de perfil válidos.'; return;
    }
    if (!authClient || !cloudReady || !cloudUserId) { status.textContent = 'Aguarde a conexão com sua conta.'; return; }
    const [firstName, ...remaining] = fullName.split(' ');
    const lastName = remaining.join(' ');
    const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
    try {
      const { error } = await authClient.auth.updateUser({ data: { first_name:firstName, last_name:lastName, category } });
      if (error) throw error;
      state.account.firstName = firstName; state.account.lastName = lastName; state.account.category = category;
      saveState(); render(); showToast('Informações da conta atualizadas.');
    } catch(error) { status.textContent = 'Não foi possível salvar. Tente novamente.'; submit.disabled = false; }
  });

  const nicknameForm = document.querySelector('[data-form="change-username"]');
  const nicknameInput = nicknameForm?.querySelector('[name="newUsername"]');
  const nicknameStatus = nicknameForm?.querySelector('[data-account-username-status]');
  let nicknameSequence = 0;
  const nicknamePattern = /^[a-z0-9._-]{3,30}$/;
  async function validateNewNickname() {
    if (!nicknameInput) return false;
    const candidate = nicknameInput.value.trim().toLowerCase();
    const sequence = ++nicknameSequence;
    if (!nicknamePattern.test(candidate)) {
      nicknameStatus.textContent = 'Use de 3 a 30 caracteres: letras, números, ponto, hífen ou underline.';
      return false;
    }
    if (candidate === state.account.username.toLowerCase()) {
      nicknameStatus.textContent = 'Esse já é seu nome de usuário.';
      return false;
    }
    nicknameStatus.textContent = 'Verificando disponibilidade...';
    try {
      const available = await checkUsernameAvailability(candidate);
      if (sequence !== nicknameSequence || candidate !== nicknameInput.value.trim().toLowerCase()) return false;
      nicknameStatus.textContent = available ? 'Nome de usuário disponível ✓' : 'Esse nome de usuário não está disponível.';
      return available;
    } catch (error) {
      if (sequence === nicknameSequence) nicknameStatus.textContent = error.message;
      return false;
    }
  }
  nicknameInput?.addEventListener('input', () => {
    nicknameSequence++;
    nicknameStatus.textContent = '';
  });
  nicknameInput?.addEventListener('blur', validateNewNickname);
  nicknameForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!cloudReady || !cloudUserId || !authClient) {
      nicknameStatus.textContent = 'Aguarde sua conta conectar.';
      return;
    }
    const candidate = nicknameInput.value.trim().toLowerCase();
    const submit = nicknameForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      if (!(await validateNewNickname())) return;
      // Uma única transação no banco muda a reserva e a página pública.
      const { data, error } = await authClient.rpc('linkki_change_username', { new_username: candidate });
      if (error) {
        if (/dispon[ií]vel|unique|duplicate|23505|already|taken/i.test(error.message || ''))
          throw new Error('Esse nome de usuário não está disponível.');
        throw error;
      }
      if (data !== candidate) throw new Error('Não foi possível confirmar a alteração.');
      state.account.username = candidate;
      state.profile.username = candidate;
      state.userPages.forEach(page => { if (page.id === 'page-principal') page.username = candidate; });
      // O conteúdo publicado já foi atualizado na transação.
      if (publishedFingerprint) {
        const published = JSON.parse(publishedFingerprint);
        if (published.profile) published.profile.username = candidate;
        publishedFingerprint = JSON.stringify(published);
      }
      saveState();
      render();
      showToast('Nome de usuário e link atualizados!');
    } catch (error) {
      console.error('Linkki: erro ao alterar nickname', error);
      nicknameStatus.textContent = error.message === 'Esse nome de usuário não está disponível.'
        ? error.message : 'Não foi possível alterar agora. Tente novamente.';
    } finally { submit.disabled = false; }
  });

  const detailsForm = document.querySelector('[data-form="signup-details"]');
  const usernameField = detailsForm?.querySelector('[name="username"]');
  const usernameStatus = detailsForm?.querySelector('[data-username-status]');
  let usernameCheckSequence = 0;
  async function checkUsernameInForm() {
    const nickname = String(usernameField?.value || '').trim().toLowerCase();
    const sequence = ++usernameCheckSequence;
    if (!nickname) { if (usernameStatus) usernameStatus.textContent = ''; return false; }
    if (!/^[a-z0-9._-]{3,30}$/.test(nickname)) {
      if (usernameStatus) usernameStatus.textContent = 'Use de 3 a 30 caracteres: letras, números, ponto, hífen ou underline.';
      return false;
    }
    if (usernameStatus) usernameStatus.textContent = 'Verificando disponibilidade...';
    try {
      const available = await checkUsernameAvailability(nickname);
      if (sequence !== usernameCheckSequence || nickname !== String(usernameField?.value || '').trim().toLowerCase()) return false;
      if (usernameStatus) usernameStatus.textContent = available ? 'Nome de usuário disponível ✓' : 'Esse nome de usuário já está em uso.';
      return available;
    } catch (error) {
      if (usernameStatus && sequence === usernameCheckSequence) usernameStatus.textContent = error.message;
      return false;
    }
  }
  usernameField?.addEventListener('blur', checkUsernameInForm);
  usernameField?.addEventListener('input', () => { usernameCheckSequence++; if (usernameStatus) usernameStatus.textContent = ''; });
  detailsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(detailsForm);
    const firstName = String(data.get("firstName") || "").trim();
    const lastName = String(data.get("lastName") || "").trim();
    const username = String(data.get("username") || "").toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const passwordConfirm = String(data.get("passwordConfirm") || "");
    if (password.length < 8 || password !== passwordConfirm) {
      setFormError(detailsForm, "A senha deve ter pelo menos 8 caracteres e ser igual nos dois campos."); return;
    }

    if (!firstName || !lastName || !username || !email) {
      setFormError(detailsForm, "Preencha todos os campos para continuar.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(detailsForm, "Digite um endereço de e-mail válido.");
      return;
    }

    if (!requireAuthClient(detailsForm)) return;
    const continueButton = detailsForm.querySelector('[type="submit"]');
    continueButton.disabled = true;
    const available = await checkUsernameInForm();
    continueButton.disabled = false;
    if (!available) {
      setFormError(detailsForm, 'Escolha um nome de usuário disponível antes de continuar.');
      return;
    }
    state.account = { ...state.account, firstName, lastName, username, email };
    pendingSignupPassword = password;
    state.signupStep = 2;
    saveState();
    render();
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.account.category = button.dataset.category;
      saveState();
      render();
    });
  });

  const categoryForm = document.querySelector('[data-form="signup-category"]');
  categoryForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.account.category) { setFormError(categoryForm, "Selecione a opção que melhor descreve você."); return; }
    if (!requireAuthClient(categoryForm)) return;
    const button = categoryForm.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const captchaToken = captchaTokenFor(categoryForm);
      const { error } = await authClient.auth.signUp({
        email: state.account.email,
        password: pendingSignupPassword,
        options: { captchaToken, data: {
          first_name: state.account.firstName, last_name: state.account.lastName,
          username: state.account.username, category: state.account.category
        } }
      });
      if (error) throw error;
      state.signupStep = 3; saveState(); render(); showToast("Código enviado para seu e-mail.");
    } catch (error) { setFormError(categoryForm, authError(error)); resetCaptcha(categoryForm); }
    finally { button.disabled = false; }
  });

  document.querySelectorAll('[data-action="signup-back"]').forEach((button) => {
    button.addEventListener("click", () => {
      state.signupStep = Math.max(1, state.signupStep - 1);
      saveState();
      render();
    });
  });

  document.querySelector('[data-action="resend-code"]')?.addEventListener("click", async (event) => {
    if (!requireAuthClient(verifyForm)) return;
    const button = event.currentTarget; button.disabled = true;
    try {
      const captchaToken = captchaTokenFor(verifyForm);
      const { error } = await authClient.auth.resend({ type: "signup", email: state.account.email, options: { captchaToken } });
      if (error) throw error;
      showToast("Novo código enviado.");
    } catch (error) { setFormError(verifyForm, authError(error)); }
    finally { resetCaptcha(verifyForm); button.disabled = false; }
  });

  const verifyForm = document.querySelector('[data-form="signup-verify"]');
  verifyForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireAuthClient(verifyForm)) return;
    const code = String(new FormData(verifyForm).get("code") || "").replace(/\D/g, "");
    if (code.length !== 6) { setFormError(verifyForm, "Digite os seis números do código."); return; }
    const button = verifyForm.querySelector('[type="submit"]'); button.disabled = true;
    try {
      const { data, error } = await authClient.auth.verifyOtp({ email: state.account.email, token: code, type: "signup" });
      if (error) throw error;
      if (!data.session) throw new Error('Não foi possível iniciar a sessão.');
      state.account.verified = true; state.account.loggedIn = true;
      pendingSignupPassword = "";
      state.profile.name = `${state.account.firstName} ${state.account.lastName}`.trim();
      state.profile.username = state.account.username; state.profile.published = false;
      await initializeCloudForUser(data.user);
      state.activeTab = "content"; saveState(); location.hash = "#editor"; render();
      showToast("Conta verificada! Sua Linkki está pronta.");
    } catch (error) { setFormError(verifyForm, authError(error)); }
    finally { button.disabled = false; }
  });

  document.querySelector('[data-action="toggle-password-reset"]')?.addEventListener("click", () => {
    state.passwordResetMode = !state.passwordResetMode;
    state.loginCodeSent = false;
    render();
  });

  const loginForm = document.querySelector('[data-form="login"]');
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireAuthClient(loginForm)) return;
    const data = new FormData(loginForm);
    const email = String(data.get("loginEmail") || "").trim().toLowerCase();
    const button = loginForm.querySelector('[type="submit"]'); button.disabled = true;
    try {
      if (state.passwordResetMode && !state.loginCodeSent) {
        const captchaToken = captchaTokenFor(loginForm);
        const { error } = await authClient.auth.signInWithOtp({ email, options: { shouldCreateUser: false, captchaToken } });
        if (error) throw error;
        state.account.email = email; state.loginCodeSent = true; render();
        showToast("Confira seu e-mail para definir a senha.");
        return;
      }
      let result;
      if (state.passwordResetMode) {
        const code = String(data.get("loginCode") || "").replace(/\D/g, "");
        const password = String(data.get("newPassword") || "");
        if (code.length !== 6) throw new Error("Digite os seis números do código.");
        if (password.length < 8 || password !== String(data.get("newPasswordConfirm") || "")) throw new Error("Use uma senha de 8 caracteres ou mais, igual nos dois campos.");
        const verified = await authClient.auth.verifyOtp({ email, token: code, type: "email" });
        if (verified.error) throw verified.error;
        if (!verified.data.session) throw new Error("Não foi possível verificar o código.");
        const updated = await authClient.auth.updateUser({ password });
        if (updated.error) throw updated.error;
        result = verified.data;
      } else {
        const captchaToken = captchaTokenFor(loginForm);
        const signed = await authClient.auth.signInWithPassword({ email, password: String(data.get("loginPassword") || ""), options: { captchaToken } });
        if (signed.error) throw signed.error;
        result = signed.data;
      }
      if (!result.session) throw new Error("Não foi possível iniciar a sessão.");
      state.account.verified = true; state.account.loggedIn = true;
      state.loginCodeSent = false; state.passwordResetMode = false;
      state.account.email = email;
      const metadata = result.user?.user_metadata || {};
      state.account.firstName = metadata.first_name || state.account.firstName;
      state.account.lastName = metadata.last_name || state.account.lastName;
      state.account.username = metadata.username || state.account.username;
      state.profile.name = `${state.account.firstName} ${state.account.lastName}`.trim() || state.profile.name;
      state.profile.username = state.account.username || state.profile.username;
      await initializeCloudForUser(result.user);
      saveState(); location.hash = "#editor"; render();
    } catch (error) { setFormError(loginForm, authError(error)); resetCaptcha(loginForm); }
    finally { button.disabled = false; }
  });

  document.querySelectorAll('[data-action="logout"]').forEach((button) => {
    button.addEventListener("click", async () => {
      if (!authClient) { showToast("Conexão com o Supabase indisponível."); return; }
      button.disabled = true;
      try {
        // Aguarda o salvamento automático pendente antes de encerrar a sessão.
        if (cloudSaveTimer) await new Promise((resolve) => setTimeout(resolve, 750));
        await cloudSaveChain;
        const { error } = await authClient.auth.signOut();
        if (error) throw error;
        clearTimeout(cloudSaveTimer);
        cloudSaveTimer = null;
        cloudReady = false;
        cloudUserId = null;
        cloudRevision++;
        cloudErrorShown = false;
        menuOpen = false;
        pendingSignupPassword = "";
        state = cloneDefaultState();
        localStorage.removeItem(STORAGE_KEY);
        location.hash = "#login";
        render();
      } catch (error) {
        showToast("Não foi possível sair: " + authError(error));
        button.disabled = false;
      }
    });
  });

  // Atualiza o menu no DOM, sem reconstruir a página: assim a transição CSS
  // pode acontecer tanto na abertura quanto no fechamento.
  const setMenuOpen = (open) => {
    menuOpen = open;
    const drawer = document.querySelector(".app-drawer");
    const overlay = document.querySelector(".menu-overlay");
    drawer?.classList.toggle("is-open", open);
    overlay?.classList.toggle("is-open", open);
    drawer?.setAttribute("aria-hidden", String(!open));
    overlay?.setAttribute("aria-hidden", String(!open));
    document.querySelector('[data-action="open-menu"]')?.setAttribute("aria-expanded", String(open));
    if (open) drawer?.querySelector(".drawer-close")?.focus({ preventScroll: true });
    else document.querySelector('[data-action="open-menu"]')?.focus({ preventScroll: true });
  };

  document.querySelector('[data-action="open-menu"]')?.addEventListener("click", () => setMenuOpen(true));
  document.querySelectorAll('[data-action="close-menu"]').forEach((button) => {
    button.addEventListener("click", () => setMenuOpen(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen && document.querySelector(".app-drawer")) {
      setMenuOpen(false);
    }
  }, { signal: menuKeydownController.signal });

  document.querySelectorAll("[data-app-section]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextSection = button.dataset.appSection;
      const fromDrawer = Boolean(button.closest(".app-drawer"));
      const navigate = () => {
        state.activeSection = nextSection;
        if (state.activeSection === "community" && !["discover", "mine", "publish"].includes(state.communityView)) {
          state.communityView = "discover";
        }
        menuOpen = false;
        saveState();
        render();
      };
      if (fromDrawer && menuOpen) {
        // Deixa o menu terminar a animação de saída antes de trocar a tela.
        setMenuOpen(false);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.setTimeout(navigate, reducedMotion ? 0 : 320);
      } else {
        navigate();
      }
    });
  });


// Modal próprio do Linkki para gerenciamento de páginas.
function linkkiPageModal({ title, message = '', value, danger = false, confirmLabel = 'Confirmar' }) {
  return new Promise(resolve => {
    const existing = document.querySelector('.linkki-page-dialog-backdrop');
    if (existing) existing.remove();
    const previousFocus = document.activeElement;
    const backdrop = document.createElement('div');
    backdrop.className = 'linkki-page-dialog-backdrop';
    const dialog = document.createElement('div');
    dialog.className = 'linkki-page-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'linkki-page-dialog-title');

    const heading = document.createElement('h2');
    heading.id = 'linkki-page-dialog-title';
    heading.textContent = title;
    dialog.append(heading);

    if (message) {
      const description = document.createElement('p');
      description.className = 'linkki-page-dialog-description';
      description.textContent = message;
      dialog.append(description);
    }

    let input = null;
    if (value !== undefined) {
      const label = document.createElement('label');
      label.className = 'linkki-page-dialog-label';
      label.textContent = 'Novo nome da página';
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'linkki-page-dialog-input';
      input.maxLength = 80;
      input.value = value;
      label.append(input);
      dialog.append(label);
    }

    const actions = document.createElement('div');
    actions.className = 'linkki-page-dialog-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'linkki-page-dialog-cancel';
    cancel.textContent = 'Cancelar';
    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'linkki-page-dialog-accept' + (danger ? ' is-danger' : '');
    accept.textContent = confirmLabel;
    actions.append(cancel, accept);
    dialog.append(actions);
    backdrop.append(dialog);
    document.body.append(backdrop);
    const handleKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(null);
      } else if (event.key === 'Tab') {
        const focusable = [input, cancel, accept].filter(Boolean);
        const index = focusable.indexOf(document.activeElement);
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          focusable.at(-1).focus();
        } else if (!event.shiftKey && index === focusable.length - 1) {
          event.preventDefault();
          focusable[0].focus();
        }
      } else if (event.key === 'Enter' && input && document.activeElement === input) {
        event.preventDefault();
        finish(input.value.trim());
      }
    };
    let finished = false;
    function finish(result) {
      if (finished) return;
      finished = true;
      document.removeEventListener('keydown', handleKey, true);
      backdrop.classList.remove('is-visible');
      window.setTimeout(() => backdrop.remove(), 180);
      if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
      resolve(result);
    }
    cancel.addEventListener('click', () => finish(null));
    accept.addEventListener('click', () => finish(input ? input.value.trim() : true));
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) finish(null);
    });
    document.addEventListener('keydown', handleKey, true);
    requestAnimationFrame(() => backdrop.classList.add('is-visible'));
    (input || cancel).focus({ preventScroll: true });
    if (input) input.select();
  });
}

  // Gerenciamento de páginas: menu contextual e seleção múltipla.
  const pageTrash = document.querySelector('[data-action="page-trash-mode"]');
  pageTrash?.addEventListener('click', () => {
    linkkiPageDeleteMode = !linkkiPageDeleteMode;
    linkkiSelectedPageIds.clear();
    render();
  });
  document.querySelector('[data-action="page-select-all"]')?.addEventListener('click', () => {
    if (linkkiSelectedPageIds.size === state.userPages.length) linkkiSelectedPageIds.clear();
    else state.userPages.forEach(page => linkkiSelectedPageIds.add(page.id));
    render();
  });
  document.querySelectorAll('[data-page-select]').forEach(input => input.addEventListener('change', () => {
    if (input.checked) linkkiSelectedPageIds.add(input.dataset.pageSelect);
    else linkkiSelectedPageIds.delete(input.dataset.pageSelect);
    const button = document.querySelector('[data-action="page-delete-selected"]');
    if (button) {
      button.disabled = !linkkiSelectedPageIds.size;
      button.textContent = `Apagar permanentemente${linkkiSelectedPageIds.size ? ` (${linkkiSelectedPageIds.size})` : ''}`;
    }
  }));
  async function linkkiDeletePages(ids) {
    const pages = state.userPages.filter(page => ids.includes(page.id));
    if (!pages.length) return;
    if (await linkkiPageModal({ title: 'Apagar página' + (pages.length > 1 ? 's' : '') + '?', message: pages.length === 1 ? 'Esta página será apagada permanentemente. Esta ação não pode ser desfeita.' : `Estas ${pages.length} páginas serão apagadas permanentemente. Esta ação não pode ser desfeita.`, danger: true, confirmLabel: 'Confirmar' }) !== true) return;
    if (pages.some(page => page.active)) {
      if (!cloudReady || !cloudUserId || !authClient) { showToast('Conecte-se para excluir a página publicada.'); return; }
      const { error } = await authClient.from('linkki_public_pages').delete().eq('user_id', cloudUserId);
      if (error) { showToast('Não foi possível remover a publicação.'); return; }
      state.profile.published = false;
      publishedFingerprint = null;
    }
    state.userPages = state.userPages.filter(page => !ids.includes(page.id));
    if (!state.userPages.some(page => page.id === state.currentPageId)) {
      const fallback = state.userPages[0];
      if (fallback) {
        state.currentPageId = fallback.id;
        state.profile.name = fallback.profileName || fallback.title;
        state.profile.published = Boolean(fallback.active);
        if (fallback.appearance) Object.assign(state.profile, structuredClone(fallback.appearance));
      } else {
        const fresh = cloneDefaultState();
        state.profile = fresh.profile;
        state.currentPageId = 'page-principal';
        state.userPages = seedUserPages(state.profile).slice(0, 1);
        state.userPages[0].active = false;
        state.profile.published = false;
      }
    }
    linkkiSelectedPageIds.clear();
    linkkiPageDeleteMode = false;
    saveState(); render(); showToast('Página(s) apagada(s).');
  }
  document.querySelector('[data-action="page-delete-selected"]')?.addEventListener('click', () => void linkkiDeletePages([...linkkiSelectedPageIds]));
  document.querySelectorAll('[data-page-menu]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const menu = button.nextElementSibling;
    const shouldOpen = menu.hidden;
    document.querySelectorAll('.linkki-page-popover').forEach(other => { other.hidden = true; });
    document.querySelectorAll('[data-page-menu]').forEach(other => other.setAttribute('aria-expanded', 'false'));
    menu.hidden = !shouldOpen;
    button.setAttribute('aria-expanded', String(shouldOpen));
  }));
  document.querySelectorAll('[data-page-option]').forEach(button => button.addEventListener('click', async () => {
    const page = state.userPages.find(item => item.id === button.dataset.pageId);
    if (!page) return;
    const option = button.dataset.pageOption;
    if (option === 'delete') { void linkkiDeletePages([page.id]); return; }
    if (option === 'deactivate') {
      document.querySelector(`[data-action="toggle-page-status"][data-page-id="${CSS.escape(page.id)}"]`)?.click();
      return;
    }
    if (option === 'rename') {
      const title = await linkkiPageModal({ title: 'Renomear página', value: page.title, confirmLabel: 'Confirmar' });
      if (title === null) return;
      if (!title.trim()) { showToast('Digite um nome para a página.'); return; }
      const nextTitle = title.trim().slice(0, 80);
      if (page.title === nextTitle) { render(); return; }
      page.title = nextTitle;
      // O nome do perfil é independente do título da página (ex.: "Linkki").
      saveState(); render();
      const synced = await linkkiUpdatePublishedModelForPage(page);
      if (!synced) showToast('Nome salvo na página. Para atualizar o modelo em todos os dispositivos, instale o SQL do ZIP no Supabase.');
      else {
        const visible = document.querySelector('#linkki-community-results');
        if (visible) linkkiRefreshCommunityResults();
        showToast('Nome atualizado na página e no modelo publicado.');
      }
      return;
    }
    if (option === 'duplicate') {
      syncCurrentPageSnapshot();
      const duplicate = structuredClone(page);
      duplicate.id = `page-${crypto.randomUUID()}`;
      duplicate.title = `${page.title} (cópia)`;
      duplicate.active = false;
      state.userPages.push(duplicate);
    }
    saveState(); render();
  }));
  document.querySelector('[data-action="create-page"]')?.addEventListener("click", () => {
    syncCurrentPageSnapshot();
    const number = state.userPages.length + 1;
    const id = `page-${crypto.randomUUID()}`;
    const page = {
      id,
      title: `Nova página ${number}`,
      profileName: state.profile.name || "Sua nova página",
      username: `pagina${number}`,
      active: false,
      appearance: appearanceSnapshot(state.profile),
    };
    state.userPages.push(page);
    state.currentPageId = id;
    state.profile.username = page.username;
    state.profile.published = false;
    state.activeSection = "editor";
    state.activeTab = "content";
    saveState();
    render();
    showToast("Nova página criada. Comece a personalizar!");
  });

  document.querySelectorAll('[data-action="open-page"]').forEach((button) => {
    button.addEventListener("click", () => {
      syncCurrentPageSnapshot();
      const page = state.userPages.find((item) => item.id === button.dataset.pageId);
      if (!page) return;
      const appearance = JSON.parse(JSON.stringify(page.appearance));
      state.currentPageId = page.id;
      state.profile.name = page.profileName || page.title;
      state.profile.username = page.username;
      state.profile.published = page.active;
      state.profile.avatar = page.profileAvatar ?? state.profile.avatar;
      state.profile.avatarLayout = page.avatarLayout || appearance.previewSnapshot?.avatarLayout || 'classic';
      state.profile.bannerImage = page.bannerImage || '';
      state.profile.heroPhotoZoom = appearance.heroPhotoZoom ?? 100;
      state.profile.heroPhotoX = appearance.heroPhotoX ?? 50;
      state.profile.heroPhotoY = appearance.heroPhotoY ?? 50;
      state.profile.customColors = appearance.customColors;
      state.profile.backgroundMode = appearance.backgroundMode || "solid";
      state.profile.gradientSecondColor = appearance.gradientSecondColor || "#F2F5DF";
      state.profile.backgroundImage = linkkiSafeBackgroundImage(appearance.backgroundImage);
      state.profile.stickers = linkkiNormalizeStickers(Array.isArray(appearance.stickers) ? appearance.stickers : appearance.previewSnapshot?.stickers);
      state.profile.elementAnimation = appearance.elementAnimation || "none";
      state.profile.buttonStyle = appearance.buttonStyle;
      state.profile.buttonBorder = appearance.buttonBorder;
      state.profile.buttonShadow = appearance.buttonShadow;
      state.profile.titleFont = appearance.titleFont;
      state.profile.bodyFont = appearance.bodyFont;
      state.activeSection = "editor";
      state.activeTab = "content";
      saveState();
      render();
    });
  });

  document.querySelectorAll('[data-action="toggle-page-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      const page = state.userPages.find((item) => item.id === button.dataset.pageId);
      if (!page) return;
      const activating = !page.active;
      if (activating) {
        // A página pública só muda de fato quando o conteúdo escolhido é publicado.
        // Evita anunciar uma troca que ainda não ocorreu no Supabase.
        state.userPages.forEach(item => { item.active = false; });
        page.active = true;
        state.currentPageId = page.id;
        state.profile.name = page.profileName || page.title;
        state.profile.username = state.account.username || state.profile.username;
        if (page.appearance) {
          const appearance = JSON.parse(JSON.stringify(page.appearance));
          Object.assign(state.profile, appearance);
          state.profile.stickers = linkkiNormalizeStickers(appearance.stickers);
          state.profile.avatar = page.profileAvatar ?? state.profile.avatar;
          state.profile.avatarLayout = page.avatarLayout || appearance.previewSnapshot?.avatarLayout || 'classic';
          state.profile.bannerImage = page.bannerImage || '';
        }
        state.profile.published = false;
        saveState();
        state.activeSection = 'editor';
        state.activeTab = 'content';
        render();
        showToast('Página selecionada. Clique em Publicar para atualizar seu link.');
      } else {
        // Desativar de verdade exige remover a publicação no Supabase.
        if (!cloudReady || !cloudUserId || !authClient) {
          showToast('Conecte-se à sua conta para desativar.');
          return;
        }
        void (async () => {
          const { error } = await authClient.from('linkki_public_pages').delete().eq('user_id', cloudUserId);
          if (error) { showToast('Não foi possível desativar a página.'); return; }
          page.active = false;
          state.profile.published = false;
          publishedFingerprint = null;
          saveState();
          render();
          showToast('Página desativada.');
        })();
      }
    });
  });

  document.querySelectorAll('[data-mobile-editor-tool]').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.mobileEditorTool;
      if (linkkiMobileEditorSheet && linkkiMobileEditorTool === selected) {
        linkkiMobileEditorSheet = false;
      } else {
        linkkiMobileEditorTool = selected;
        state.activeTab = linkkiMobileToolInfo[selected][2];
        linkkiMobileSheetScroll = 0;
        linkkiMobileEditorSheet = true;
      }
      render();
      if (linkkiMobileEditorSheet && selected === 'analytics') void loadRealAnalytics();
    });
  });
  document.querySelectorAll('[data-mobile-editor-close]').forEach(button => {
    button.addEventListener('click', () => { linkkiMobileEditorSheet = false; render(); });
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      refreshEditorViews();
      if (state.activeTab === "analytics") void loadRealAnalytics();
    });
  });

  document.querySelectorAll(".community-nav [data-community-view], .community-panel-header [data-community-view], .back-link[data-community-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.communityView === button.dataset.communityView) return;
      state.communityView = button.dataset.communityView;
      saveState();
      if (['discover', 'mine'].includes(state.communityView) && document.querySelector('#linkki-community-results')) {
        linkkiRefreshCommunityResults();
      } else {
        render();
      }
    });
  });

  const communityResults = document.querySelector('#linkki-community-results');
  if (communityResults) linkkiBindCommunityResults(communityResults);
  if (communityResults) linkkiMoveCommunityIndicator(false);

  document.querySelectorAll('[data-action="publish-page-template"]').forEach(button => {
    button.addEventListener('click', async () => {
      syncCurrentPageSnapshot();
      const page = state.userPages.find(item => item.id === button.dataset.pageId);
      if (!page) return;
      const author = cloudUserId === LINKKI_OFFICIAL_USER_ID ? 'Linkki' : (`${state.account.firstName || ''} ${state.account.lastName || ''}`.trim() || state.profile.name || 'Você');
      const category = accountCategories.find(([id]) => id === state.account.category)?.[2] || 'Criadores';
      const previewAvatar = await linkkiTemplatePreviewImage(page.profileAvatar || state.profile.avatar || '');
      const previewBanner = await linkkiTemplatePreviewImage(page.bannerImage || state.profile.bannerImage || '');
      const previewAppearance = page.appearance ? { ...state.profile, ...page.appearance } : state.profile;
      const previewSnapshot = {
        ...linkkiLocalPagePreview(page),
        avatar: previewAvatar,
        bannerImage: previewBanner
      };
      const result = await communityAction('linkki_community_publish', {
        p_source_page_id: page.id, p_title: page.title, p_author: author,
        p_category: category,
        // A RPC recebe somente a aparência. Foto, links e prévia são
        // persistidos separadamente em linkki_community_preview_metadata.
        p_appearance: appearanceSnapshot(previewAppearance)
      });
      if (result) {
        const saved = state.communityTemplates.find(t =>
          t.ownerId === 'self' && t.sourcePageId === page.id && t.published);
        const synced = saved ? await linkkiSaveTemplateMetadata(saved.id, page, previewSnapshot) : false;
        if (!synced) {
          showToast('Modelo publicado, mas falta instalar o SQL incluso no ZIP para guardar a foto Hero na comunidade.');
        } else {
          showToast('Modelo publicado com foto, layout e título preservados.');
        }
        state.communityView = 'mine'; render();
      }
    });
  });

  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      updateProfileField(button.dataset.choice, button.dataset.value);
    });
  });

  document.querySelectorAll("[data-background-radio]").forEach(radio => radio.addEventListener("change", () => {
    if (!radio.checked) return;
    state.profile.backgroundMode = radio.value;
    saveState(); render();
  }));
  document.querySelectorAll('[data-background-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = linkkiBackgroundPresets.find(p => p.id === button.dataset.backgroundPreset);
    if (!preset) return;
    state.profile.backgroundMode = 'image';
    state.profile.backgroundImage = preset.file;
    saveState(); render();
  }));
  document.querySelector('[data-action="remove-background-image"]')?.addEventListener('click', () => {
    state.profile.backgroundImage = '';
    state.profile.backgroundMode = 'solid';
    saveState(); render();
  });
  document.querySelector('#linkki-background-upload')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      showToast('Use JPG, PNG ou WebP de ate 8 MB.'); return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      bitmap.close?.();
      let data = canvas.toDataURL('image/jpeg', .78);
      if (data.length > 550000) data = canvas.toDataURL('image/jpeg', .55);
      if (!linkkiSafeBackgroundImage(data)) { showToast('Imagem muito grande. Tente outra.'); return; }
      state.profile.backgroundImage = data;
      state.profile.backgroundMode = 'image';
      saveState(); render();
      showToast('Imagem de fundo adicionada.');
    } catch (error) { console.warn(error); showToast('Nao foi possivel abrir esta imagem.'); }
  });
  const syncBackgroundControls = () => {
    const value = validHex(state.profile.customColors.background, "#CAD593");
    document.querySelectorAll('[data-color-picker="background"], [data-solid-color-picker]').forEach(input => { input.value = value; });
    document.querySelectorAll('[data-color-field="background"], [data-solid-color-field]').forEach(input => { input.value = value; });
  };
  document.querySelector('[data-solid-color-picker]')?.addEventListener('input', event => {
    state.profile.customColors.background = event.target.value.toUpperCase();
    syncBackgroundControls(); saveState(); syncLivePreview();
  });
  document.querySelector('[data-solid-color-field]')?.addEventListener('input', event => {
    const raw = event.target.value;
    const value = (raw.startsWith('#') ? raw : `#${raw}`).toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(value)) {
      state.profile.customColors.background = value;
      syncBackgroundControls(); saveState(); syncLivePreview();
    }
  });
  document.querySelector('[data-solid-color-field]')?.addEventListener('change', event => {
    event.target.value = validHex(state.profile.customColors.background, '#CAD593');
  });
  document.querySelectorAll("[data-element-animation]").forEach(button => button.addEventListener("click", () => {
    state.profile.elementAnimation = button.dataset.elementAnimation;
    saveState(); render();
  }));
  document.querySelector("[data-gradient-picker]")?.addEventListener("input", event => {
    state.profile.gradientSecondColor = event.target.value.toUpperCase();
    const field = document.querySelector("[data-gradient-field]");
    if (field) field.value = state.profile.gradientSecondColor;
    saveState(); syncLivePreview();
  });
  document.querySelector("[data-gradient-field]")?.addEventListener("input", event => {
    const raw = event.target.value;
    const value = (raw.startsWith("#") ? raw : `#${raw}`).toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(value)) {
      state.profile.gradientSecondColor = value;
      const picker = document.querySelector("[data-gradient-picker]");
      if (picker) picker.value = value;
      saveState(); syncLivePreview();
    }
  });
  document.querySelector("[data-gradient-field]")?.addEventListener("change", event => {
    event.target.value = validHex(state.profile.gradientSecondColor, "#F2F5DF");
  });

  document.querySelectorAll("[data-color-picker]").forEach((picker) => {
    picker.addEventListener("input", () => {
      const field = picker.dataset.colorPicker;
      state.profile.customColors[field] = picker.value.toUpperCase();
      const codeInput = document.querySelector(`[data-color-field="${field}"]`);
      if (codeInput) codeInput.value = state.profile.customColors[field];
      if (field === "background") syncBackgroundControls();
      saveState();
      syncLivePreview();
    });
  });

  document.querySelectorAll("[data-color-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.dataset.colorField;
      const value = input.value.startsWith("#") ? input.value : `#${input.value}`;
      state.profile.customColors[field] = value.toUpperCase();
      const picker = document.querySelector(`[data-color-picker="${field}"]`);
      if (picker && /^#[0-9a-f]{6}$/i.test(value)) picker.value = value;
      saveState();
      syncLivePreview();
    });
    input.addEventListener("change", () => {
      const field = input.dataset.colorField;
      if (!/^#[0-9a-f]{6}$/i.test(state.profile.customColors[field])) {
        state.profile.customColors[field] = cloneDefaultState().profile.customColors[field];
        input.value = state.profile.customColors[field];
        showToast("Use uma cor hexadecimal com 6 caracteres.");
      }
      saveState();
      render();
    });
  });

  document.querySelector('[data-action="toggle-avatar-border"]')?.addEventListener("click", () => {
    state.profile.avatarBorder = { ...{ enabled: false, color: "#2A3C24" }, ...state.profile.avatarBorder, enabled: !state.profile.avatarBorder?.enabled };
    saveState();
    render();
  });
  document.querySelector('[data-avatar-border-picker]')?.addEventListener("input", (event) => {
    state.profile.avatarBorder.color = event.target.value.toUpperCase();
    const input = document.querySelector('[data-avatar-border-color]');
    if (input) input.value = state.profile.avatarBorder.color;
    saveState();
    syncLivePreview();
  });
  document.querySelector('[data-avatar-border-color]')?.addEventListener("change", (event) => {
    const value = event.target.value.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(value)) {
      event.target.value = state.profile.avatarBorder.color;
      showToast("Use uma cor hexadecimal com 6 caracteres.");
      return;
    }
    state.profile.avatarBorder.color = value;
    saveState();
    render();
  });

  document.querySelector('[data-action="toggle-border"]')?.addEventListener("click", () => {
    state.profile.buttonBorder.enabled = !state.profile.buttonBorder.enabled;
    saveState();
    render();
  });

  document.querySelector('[data-action="toggle-shadow"]')?.addEventListener("click", () => {
    state.profile.buttonShadow.enabled = !state.profile.buttonShadow.enabled;
    saveState();
    render();
  });

  document.querySelector("[data-border-picker]")?.addEventListener("input", (event) => {
    state.profile.buttonBorder.color = event.target.value.toUpperCase();
    const codeInput = document.querySelector("[data-border-color]");
    if (codeInput) codeInput.value = state.profile.buttonBorder.color;
    saveState();
    syncLivePreview();
  });

  document.querySelector("[data-border-color]")?.addEventListener("input", (event) => {
    const value = event.target.value.startsWith("#") ? event.target.value : `#${event.target.value}`;
    state.profile.buttonBorder.color = value.toUpperCase();
    const picker = document.querySelector("[data-border-picker]");
    if (picker && /^#[0-9a-f]{6}$/i.test(value)) picker.value = value;
    saveState();
    syncLivePreview();
  });

  document.querySelector("[data-border-color]")?.addEventListener("change", (event) => {
    if (!/^#[0-9a-f]{6}$/i.test(state.profile.buttonBorder.color)) {
      state.profile.buttonBorder.color = "#2A3C24";
      event.target.value = state.profile.buttonBorder.color;
      showToast("Use uma cor hexadecimal com 6 caracteres.");
    }
    saveState();
    render();
  });

  document.querySelectorAll("[data-shadow-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.dataset.shadowField;
      state.profile.buttonShadow[field] = Number(input.value);
      const output = document.querySelector(`[data-shadow-output="${field}"]`);
      if (output) output.textContent = `${input.value}${input.dataset.suffix}`;
      saveState();
      syncLivePreview();
    });
  });

  const applyFont = (target, fontId) => {
    if (!fontPresets[fontId] && !state.profile.customFonts.some((font) => font.id === fontId)) return;
    state.profile[target] = fontId;
    state.profile.recentFonts = [fontId, ...state.profile.recentFonts.filter((id) => id !== fontId)].slice(0, 5);
    saveState();
    render();
  };

  document.querySelectorAll("[data-font-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.profile.fontViews[button.dataset.fontTarget] = button.dataset.fontView;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-font-quick]").forEach((button) => {
    button.addEventListener("click", () => applyFont(button.dataset.fontTarget, button.dataset.fontQuick));
  });

  document.querySelectorAll('[data-action="install-font"]').forEach((button) => {
    button.addEventListener("click", () => {
      pendingFontTarget = button.dataset.fontTarget;
      document.querySelector("#font-file-input")?.click();
    });
  });

  document.querySelector("#font-file-input")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      showToast("Escolha uma fonte de até 1,5 MB.");
      return;
    }
    if (!/\.(woff2?|ttf|otf)$/i.test(file.name)) {
      showToast("Formato não suportado. Use WOFF, WOFF2, TTF ou OTF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const font = {
        id: `custom-${crypto.randomUUID()}`,
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 40),
        dataUrl: reader.result,
      };
      state.profile.customFonts.push(font);
      state.profile[pendingFontTarget] = font.id;
      state.profile.recentFonts = [font.id, ...state.profile.recentFonts.filter((id) => id !== font.id)].slice(0, 5);
      saveState();
      render();
      showToast("Fonte instalada na sua Linkki.");
    };
    reader.readAsDataURL(file);
  });

  const nameInput = document.querySelector('[name="profile-name"]');
  const bioInput = document.querySelector('[name="profile-bio"]');

  nameInput?.addEventListener("input", (event) => {
    state.profile.name = event.target.value;
    saveState();
    syncLivePreview();
  });
  nameInput?.addEventListener("change", (event) => {
    state.profile.name = event.target.value.trim() || "Seu nome";
    event.target.value = state.profile.name;
    saveState();
    syncLivePreview();
  });

  bioInput?.addEventListener("input", (event) => {
    state.profile.bio = event.target.value;
    const counter = event.target.closest(".field")?.querySelector(".field-label small");
    if (counter) counter.textContent = `${event.target.value.length}/160`;
    saveState();
    syncLivePreview();
  });

  document.querySelector('[data-action="add-link"]')?.addEventListener("click", addLink);
  document.querySelectorAll("[data-avatar-layout]").forEach(button => button.addEventListener("click", () => {
    const layout = button.dataset.avatarLayout;
    if (!["classic", "hero", "banner"].includes(layout)) return;
    state.profile.avatarLayout = layout;
    saveState();
    render();
  }));
  // Sliders de enquadramento: mesmos componentes visuais usados pela sombra.
  document.querySelectorAll('[data-hero-field]').forEach(input => input.addEventListener('input', () => {
    const field = input.dataset.heroField;
    if (!['heroPhotoZoom','heroPhotoX','heroPhotoY'].includes(field)) return;
    state.profile[field] = Number(input.value);
    const output = document.querySelector(`[data-hero-output="${field}"]`);
    if (output) output.textContent = `${input.value}${input.dataset.suffix || '%'}`;
    syncLivePreview();
    saveState();
  }));
  document.querySelector('[data-action="reset-hero-photo"]')?.addEventListener('click', () => {
    state.profile.heroPhotoZoom = 100;
    state.profile.heroPhotoX = 50;
    state.profile.heroPhotoY = 50;
    saveState(); render();
  });
  const previewScreenForHero = document.querySelector('.preview-screen');
  if (previewScreenForHero && !previewScreenForHero.dataset.heroDragBound) {
    previewScreenForHero.dataset.heroDragBound = 'true';
    let drag = null;
    previewScreenForHero.addEventListener('pointerdown', event => {
      const cover = event.target.closest('.linkki-profile-cover--hero');
      if (!cover || !state.profile.avatar || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
        startX: Number(state.profile.heroPhotoX ?? 50), startY: Number(state.profile.heroPhotoY ?? 50),
        width: cover.clientWidth, height: cover.clientHeight };
      cover.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    previewScreenForHero.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const cover = event.target.closest('.linkki-profile-cover--hero');
      if (!cover) return;
      state.profile.heroPhotoX = Math.max(0, Math.min(100, drag.startX - (event.clientX - drag.x) / drag.width * 100));
      state.profile.heroPhotoY = Math.max(0, Math.min(100, drag.startY - (event.clientY - drag.y) / drag.height * 100));
      cover.style.backgroundPosition = `${state.profile.heroPhotoX}% ${state.profile.heroPhotoY}%`;
      for (const field of ['heroPhotoX','heroPhotoY']) {
        const slider = document.querySelector(`[data-hero-field="${field}"]`);
        const output = document.querySelector(`[data-hero-output="${field}"]`);
        if (slider) slider.value = String(Math.round(state.profile[field]));
        if (output) output.textContent = `${Math.round(state.profile[field])}%`;
      }
    });
    const finish = () => { if (drag) { drag = null; saveState(); } };
    previewScreenForHero.addEventListener('pointerup', finish);
    previewScreenForHero.addEventListener('pointercancel', finish);
  }
  document.querySelector('[data-action="remove-banner"]')?.addEventListener("click", () => updateProfileField("bannerImage", ""));
  document.querySelector("#linkki-banner-input")?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Escolha uma imagem de até 2 MB."); return; }
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) { showToast("Use uma imagem PNG, JPG, WEBP ou GIF."); return; }
    const reader = new FileReader();
    reader.onload = () => updateProfileField("bannerImage", reader.result);
    reader.readAsDataURL(file);
  });
  document.querySelector('[data-action="remove-avatar"]')?.addEventListener("click", () => updateProfileField("avatar", ""));

  document.querySelector("#avatar-input")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Escolha uma imagem de até 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateProfileField("avatar", reader.result);
    reader.readAsDataURL(file);
  });

  document.querySelectorAll(".link-editor").forEach((card) => {
    const id = card.dataset.linkId;
    card.querySelectorAll("[data-link-field]").forEach((input) => {
      input.addEventListener("input", () => {
        const link = state.links.find((item) => item.id === id);
        if (!link) return;
        link[input.dataset.linkField] = input.value;
        saveState();
        syncLivePreview();
      });
      input.addEventListener("change", () => {
        const link = state.links.find((item) => item.id === id);
        if (!link) return;
        link[input.dataset.linkField] = input.value.trim();
        input.value = link[input.dataset.linkField];
        saveState();
        syncLivePreview();
      });
    });

    card.querySelector('[data-action="toggle-link"]')?.addEventListener("click", () => {
      const link = state.links.find((item) => item.id === id);
      if (!link) return;
      link.visible = !link.visible;
      refreshEditorViews();
    });

    card.querySelector('[data-action="delete-link"]')?.addEventListener("click", () => {
      state.links = state.links.filter((item) => item.id !== id);
      refreshEditorViews();
      showToast("Link removido.");
    });

    card.querySelector('[data-action="move-up"]')?.addEventListener("click", () => moveLink(id, -1));
    card.querySelector('[data-action="move-down"]')?.addEventListener("click", () => moveLink(id, 1));

    const handle = card.querySelector('.drag-handle');
    handle?.addEventListener('dragstart', event => {
      card.classList.add('is-dragging');
      event.dataTransfer?.setData('text/plain', id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    });
    handle?.addEventListener('dragend', () => card.classList.remove('is-dragging'));
    card.addEventListener("dragover", (event) => event.preventDefault());
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const dragging = document.querySelector(".link-editor.is-dragging");
      if (!dragging || dragging === card) return;
      const from = state.links.findIndex((item) => item.id === dragging.dataset.linkId);
      const to = state.links.findIndex((item) => item.id === id);
      const [moved] = state.links.splice(from, 1);
      state.links.splice(to, 0, moved);
      refreshEditorViews();
    });
  });

  document.querySelector('[data-action="publish"]')?.addEventListener("click", async (event) => {
    if (publishInProgress || !cloudReady || !cloudUserId || !authClient) {
      showToast("Aguarde a conexão com sua conta para publicar.");
      return;
    }
    const owner = cloudUserId;
    const wasPublished = Boolean(state.profile.published);
    if (wasPublished && !hasUnpublishedChanges()) {
      showToast("Sua página já está publicada.");
      return;
    }
    publishInProgress = true;
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Publicando...';
    try {
      const username = String(state.account.username || '').toLowerCase().trim();
      if (!/^[a-z0-9_.-]{3,30}$/.test(username)) throw new Error('Nickname inválido');
      const payload = publicPublishPayload();
      if (payload.links.some((link) => safeUrl(link.url) === "#")) {
        showToast('Corrija os endereços dos links visíveis antes de publicar.');
        button.disabled = false;
        button.textContent = wasPublished ? 'Publicar alterações' : 'Publicar';
        return;
      }
      const { error } = await authClient.from('linkki_public_pages').upsert({
        user_id: owner, username, public_data: payload, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) throw error;
      if (owner !== cloudUserId) return;
      publishedFingerprint = JSON.stringify(payload);
      state.profile.published = true;
      state.userPages.forEach(page => { page.active = page.id === state.currentPageId; });
      saveState();
      render();
      showToast(wasPublished ? 'Alterações publicadas!' : 'Sua Linkki está publicada!');
    } catch (error) {
      console.error('Linkki: erro ao publicar', error);
      showToast('Não foi possível publicar. Tente novamente.');
      button.disabled = false;
      button.textContent = wasPublished ? 'Publicar alterações' : 'Publicar';
    } finally { publishInProgress = false; }
  });

  document.querySelector('[data-action="sidebar-share"]')?.addEventListener("click", async () => {
    const username = (state.account.username || state.profile.username || "").trim();
    if (!username) { showToast("Defina um nome de usuário para compartilhar."); return; }
    const url = linkkiPublicShareUrl(username);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = url;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (!copied) throw new Error("Não foi possível copiar");
      }
      showToast("Link copiado para a área de transferência!");
    } catch (error) {
      showToast("Não foi possível copiar o link.");
    }
  });

  document.querySelector('[data-action="share"]')?.addEventListener("click", async () => {
    const url = linkkiPublicShareUrl(state.account.username || state.profile.username);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    try {
      // On desktop, native share dialogs may briefly flash and disappear.
      // Copy the public URL instead, with visible confirmation.
      if (isMobile && typeof navigator.share === "function") {
        await navigator.share({ title: `${state.profile.name} na Linkki`, text: state.profile.bio, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast("Link copiado!");
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = url;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (!copied) throw new Error("Falha ao copiar link");
        showToast("Link copiado!");
      }
      state.analytics.shares += 1;
      saveState();
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Não foi possível copiar o link.");
    }
  });

  document.querySelectorAll("[data-public-link]").forEach((linkElement) => {
    linkElement.addEventListener("click", () => {
      const route = linkkiPublicUsernameFromLocation();
      if (route && route !== 'public' && /^[a-z0-9_.-]{3,30}$/.test(route)) {
        void trackPublicEvent(route, 'click', linkElement.dataset.publicLink);
      }
    });
  });
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => { linkkiResetHistory(); restoreSupabaseSession(); void linkkiLoadStickerCatalog(); });


// FAQ: animar a altura do cartão e o conteúdo tanto ao abrir quanto ao fechar.
// O listener delegado continua funcionando depois que a tela de suporte é renderizada novamente.
(function linkkiInitFaqAccordion() {
  const active = new WeakMap();
  document.addEventListener('click', (event) => {
    const summary = event.target.closest?.('.support-faq details > summary');
    if (!summary) return;
    const details = summary.parentElement;
    const answer = details.querySelector(':scope > p');
    if (!answer) return;
    event.preventDefault();
    const previous = active.get(details);
    if (previous) { previous.height.cancel(); previous.content?.cancel(); active.delete(details); }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wasOpen = details.open;
    if (reduced) { details.open = !wasOpen; return; }
    const startHeight = details.getBoundingClientRect().height;
    const summaryHeight = summary.getBoundingClientRect().height;
    // Medir o conteúdo aberto antes de iniciar a transição.
    details.open = true;
    const expandedHeight = summaryHeight + answer.getBoundingClientRect().height +
      parseFloat(getComputedStyle(answer).marginTop || 0) +
      parseFloat(getComputedStyle(answer).marginBottom || 0) +
      parseFloat(getComputedStyle(details).borderTopWidth || 0) +
      parseFloat(getComputedStyle(details).borderBottomWidth || 0);
    const targetHeight = wasOpen ? summaryHeight : expandedHeight;
    details.style.height = startHeight + 'px';
    const height = details.animate([
      {height: startHeight + 'px'}, {height: targetHeight + 'px'}
    ], {duration: 340, easing: 'cubic-bezier(.2,.75,.25,1)'});
    const content = answer.animate(wasOpen ? [
      {opacity: 1, transform: 'translateY(0)'},
      {opacity: 0, transform: 'translateY(-7px)'}
    ] : [
      {opacity: 0, transform: 'translateY(-7px)'},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 300, easing: 'ease-out', fill: 'both'});
    active.set(details, {height, content});
    height.onfinish = () => {
      if (active.get(details)?.height !== height) return;
      details.open = !wasOpen;
      details.style.height = '';
      content.cancel();
      active.delete(details);
    };
  });
})();
