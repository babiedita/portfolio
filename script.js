/* =========================================
   TELA DE LOADING
========================================= */
const siteLoader = document.getElementById('siteLoader');
const loaderProgress = document.getElementById('loaderProgress');
const loaderText = document.getElementById('loaderText');
const loaderMessages = [
  'carregando vídeos',
  'separando os melhores cortes',
  'ajustando os keyframes',
  'sincronizando os frames',
  'renderizando umas ideias',
  'organizando a timeline',
  'dando aquele último play',
  'quase pronto :P'
];
const LOADER_MIN_TIME = 3200;
const loaderStartTime = performance.now();
let loaderPercent = 0;
let loaderMessageIndex = 0;
let pageFinishedLoading = false;
if (siteLoader) document.body.classList.add('is-loading');
const loaderProgressInterval = setInterval(() => {
  if (!loaderProgress) { clearInterval(loaderProgressInterval); return; }
  if (pageFinishedLoading) return;
  const remaining = 90 - loaderPercent;
  loaderPercent += Math.max(0.4, remaining * 0.045);
  loaderPercent = Math.min(loaderPercent, 90);
  loaderProgress.style.width = `${loaderPercent}%`;
}, 70);
const loaderTextInterval = setInterval(() => {
  if (!loaderText) { clearInterval(loaderTextInterval); return; }
  loaderText.classList.add('is-changing');
  setTimeout(() => {
    loaderMessageIndex = (loaderMessageIndex + 1) % loaderMessages.length;
    loaderText.textContent = loaderMessages[loaderMessageIndex];
    loaderText.classList.remove('is-changing');
  }, 180);
}, 700);
function finishSiteLoading() {
  if (!siteLoader) return;
  clearInterval(loaderProgressInterval);
  clearInterval(loaderTextInterval);
  loaderPercent = 100;
  if (loaderProgress) loaderProgress.style.width = '100%';
  if (loaderText) loaderText.textContent = 'pronto, pode dar o play';
  setTimeout(() => {
    siteLoader.classList.add('is-leaving');
    document.body.classList.remove('is-loading');
    setTimeout(() => siteLoader.classList.add('is-gone'), 900);
  }, 280);
}
window.addEventListener('load', () => {
  pageFinishedLoading = true;
  const elapsed = performance.now() - loaderStartTime;
  const remainingTime = Math.max(0, LOADER_MIN_TIME - elapsed);
  setTimeout(finishSiteLoading, remainingTime);
});



/* =========================================
   BOTÃO CURTIR
========================================= */
const likeButton=document.getElementById('likeButton');
const likeButtonImage=document.getElementById('likeButtonImage');
const LIKE_IMAGES={normal:'curtir-1.png',pressed:'curtir-2.png',liked:'curtir-3.png'};
let portfolioLiked=localStorage.getItem('babiPortfolioLiked')==='true';
let likePointerActive=false;

function renderLikeButton(){
  if(!likeButton||!likeButtonImage)return;
  likeButtonImage.src=portfolioLiked?LIKE_IMAGES.liked:LIKE_IMAGES.normal;
  likeButton.setAttribute('aria-pressed',String(portfolioLiked));
  likeButton.setAttribute('aria-label',portfolioLiked?'Remover curtida do portfólio':'Curtir o portfólio');
}
function showPressedLikeState(){
  if(!likeButton||!likeButtonImage)return;
  likeButton.classList.add('is-pressing');
  likeButtonImage.src=LIKE_IMAGES.pressed;
}
function releaseLikeVisual(){if(likeButton)likeButton.classList.remove('is-pressing')}
function toggleLike(){
  if(!likeButton||!likeButtonImage)return;
  portfolioLiked=!portfolioLiked;
  localStorage.setItem('babiPortfolioLiked',String(portfolioLiked));
  releaseLikeVisual();
  likeButtonImage.src=portfolioLiked?LIKE_IMAGES.liked:LIKE_IMAGES.normal;
  likeButton.setAttribute('aria-pressed',String(portfolioLiked));
  likeButton.setAttribute('aria-label',portfolioLiked?'Remover curtida do portfólio':'Curtir o portfólio');
  if(portfolioLiked){
    likeButton.classList.remove('is-liked');
    void likeButton.offsetWidth;
    likeButton.classList.add('is-liked');
    setTimeout(()=>likeButton.classList.remove('is-liked'),420);
  }
}
likeButton?.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;likePointerActive=true;showPressedLikeState()});
likeButton?.addEventListener('pointerup',()=>releaseLikeVisual());
likeButton?.addEventListener('pointerleave',()=>{releaseLikeVisual();if(likePointerActive)renderLikeButton();likePointerActive=false});
likeButton?.addEventListener('pointercancel',()=>{releaseLikeVisual();renderLikeButton();likePointerActive=false});
likeButton?.addEventListener('click',()=>{toggleLike();likePointerActive=false});
renderLikeButton();

const reelVideo = {
  id: 'reel',
  type: 'long',
  title: 'Um pouco do meu universo',
  subtitle: 'REEL DEMONSTRATIVO / 2026',
  youtube: 'COLE_AQUI_O_LINK_DO_YOUTUBE_DO_REEL'
};

const videos = [
  { id:1, order:1, type:'short', title:'A MELHOR IA...', subtitle:'dev.pedroca', youtube:'https://youtu.be/_DPBiqax3RI?si=UziqVa82r_FY4odw' },
  { id:2, order:3, type:'short', title:'Você é o que come...', subtitle:'lyukio', youtube:'https://youtu.be/M8ZeJpR1RlQ?si=3zVcxLhAZHB9MpVW' },
  { id:3, order:6, type:'short', title:'Fingi estar afk e ganhei o round', subtitle:'levikingbr', youtube:'https://youtu.be/87HsdZ6cYPU?si=9ZbS6ZGdh76m8Pp8' },
  { id:4, order:4, type:'short', title:'Pov: você tem refluxo com sons de arroto', subtitle:'levikingbr', youtube:'https://youtu.be/Iu6F89vnrkU?si=ZelhorLrSoMU1h3t' },
  { id:5, order:5, type:'short', title:'Pov: você jogou seu primeiro jogo de terror', subtitle:'levikingbr', youtube:'https://youtube.com/shorts/PEXLdziGxFk' },
  { id:9, order:2, type:'short', title:'Rifa do Pedroca e Camomilla', subtitle:'dev.pedroca', youtube:'https://www.youtube.com/shorts/D3oh7QUdeeE' },

  { id:6, order:1, type:'long', title:'MATEI 20 e PERDI de JETT!', subtitle:'marcafatal', youtube:'https://youtu.be/b_JcHN8aElA?si=Tt7XYVlBXdY5GvJU' },
  { id:7, order:2, type:'long', title:'Não é RESIDENT EVIL... é melhor!', subtitle:'primetek', youtube:'https://www.youtube.com/watch?v=xZt5IvO3b84' },
  { id:8, order:3, type:'long', title:'Levei um golpe: o que fazer agora?', subtitle:'primetek', youtube:'https://www.youtube.com/watch?v=YUgZadIt-sk' },
  { id:12, order:4, type:'long', title:'SEM VENTOINHA e TELA EXPANSÍVEL??', subtitle:'primetek', youtube:'https://www.youtube.com/watch?v=DQRl7wOj_A4&t=3s' },
  { id:10, order:5, type:'long', title:'Realmente vale a pena? Review', subtitle:'primetek', youtube:'https://www.youtube.com/watch?v=Cl_3yK2diMs&t=2s' },
  { id:11, order:6, type:'long', title:'Starlink Mini Vale a Pena?', subtitle:'primetek', youtube:'https://www.youtube.com/watch?v=a0B47M5Lw_M' }
];

const tutorialVideos = [
  { id:'tutorial-1', order:1, type:'short', title:'PLUGIN GRÁTIS para Premiere e After Effects', subtitle:'', youtube:'https://www.youtube.com/shorts/RA87NYhN5AA' },
  { id:'tutorial-2', order:2, type:'short', title:'Como fazer CONTADOR no After Effects', subtitle:'', youtube:'https://www.youtube.com/shorts/4ShuX5iHfX4' },
  { id:'tutorial-3', order:3, type:'short', title:'Como ACHAR CLIENTES!', subtitle:'', youtube:'https://www.youtube.com/shorts/yCBXOEVMx84' },
  { id:'tutorial-4', order:4, type:'short', title:'Como fazer TRACKING', subtitle:'', youtube:'https://www.youtube.com/shorts/eakcI13y8oM' },
  { id:'tutorial-5', order:5, type:'short', title:'Como animar BACKGROUND', subtitle:'', youtube:'https://www.youtube.com/shorts/r2ZJb_BSoME' }
];

const playlist = [
  { title:'Mii Maker Editing Mii', src:'music/miimaker.mp3', cover:'covers/miimaker.png' },
  { title:'Wii Party', src:'music/wiiparty.mp3', cover:'covers/wiiparty.png' },
  { title:'Aquatic Ambience', src:'music/aquatic.mp3', cover:'covers/aquatic.png' }
];

const filterButtons=[...document.querySelectorAll('.filter-button')];
const projectGrid=document.getElementById('projectGrid');
const tutorialGrid=document.getElementById('tutorialGrid');
const reelFrame=document.getElementById('reelFrame');
const reelYoutube=document.getElementById('reelYoutube');
const backgroundAudio=document.getElementById('backgroundAudio');
const musicPlayer=document.getElementById('musicPlayer');
const musicPlayerMini=document.getElementById('musicPlayerMini');
const musicCover=document.getElementById('musicCover');
const musicTitle=document.getElementById('musicTitle');
const musicPrev=document.getElementById('musicPrev');
const musicPlay=document.getElementById('musicPlay');
const musicNext=document.getElementById('musicNext');
const musicClose=document.getElementById('musicClose');
const musicMiniPrev=document.getElementById('musicMiniPrev');
const musicMiniPlay=document.getElementById('musicMiniPlay');
const musicMiniNext=document.getElementById('musicMiniNext');
const musicVolume=document.getElementById('musicVolume');

let currentTrack=parseInt(localStorage.getItem('babiMusicTrackV2')||'0',10);
if(!Number.isFinite(currentTrack)||currentTrack<0||currentTrack>=playlist.length) currentTrack=0;
const storedMusicState=localStorage.getItem('babiMusicWantedV2');
let musicDesiredPlaying=storedMusicState===null?true:storedMusicState==='true';
const savedVolume=localStorage.getItem('babiMusicVolumeV2');
let currentVolume=savedVolume!==null?Math.min(1,Math.max(0,parseFloat(savedVolume))):0.5;
let musicWasPlayingBeforeVideo=false;
let currentFilter='short';

function getYoutubeId(value){if(!value)return null;const clean=value.trim();if(!clean||clean.startsWith('COLE_AQUI'))return null;if(/^[a-zA-Z0-9_-]{11}$/.test(clean))return clean;try{const url=new URL(clean);if(url.hostname==='youtu.be'||url.hostname==='www.youtu.be')return url.pathname.split('/').filter(Boolean)[0]||null;const watchId=url.searchParams.get('v');if(watchId)return watchId;const parts=url.pathname.split('/').filter(Boolean);for(const segment of['shorts','embed','live']){const index=parts.indexOf(segment);if(index!==-1&&parts[index+1])return parts[index+1]}}catch(_){return null}return null}
function applyYoutubeThumbnail(image,youtube,fallback=''){if(!image)return;const id=getYoutubeId(youtube);if(!id){if(fallback)image.src=fallback;return}image.dataset.fallbackStage='maxres';image.src=`https://img.youtube.com/vi/${id}/maxresdefault.jpg`;image.addEventListener('error',()=>{if(image.dataset.fallbackStage==='maxres'){image.dataset.fallbackStage='hq';image.src=`https://img.youtube.com/vi/${id}/hqdefault.jpg`;return}if(fallback&&image.dataset.fallbackStage==='hq'){image.dataset.fallbackStage='local';image.src=fallback}})}
function getYoutubeEmbedUrl(value){const id=getYoutubeId(value);if(!id)return null;const params=new URLSearchParams({autoplay:'1',rel:'0',playsinline:'1',controls:'1',fs:'1',iv_load_policy:'3'});return`https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`}
function getVideoByKey(key){if(String(key)==='reel')return reelVideo;return[...videos,...tutorialVideos].find(video=>String(video.id)===String(key))||null}
function getPlaceholderThumbnail(title='Vídeo'){const safeTitle=String(title).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#2b2b2b" font-family="Arial, sans-serif" font-size="42">${safeTitle}</text></svg>`;return`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`}
function createProjectCard(video){const article=document.createElement('article');article.className=`project ${video.type==='short'?'project-short':'project-long'}`;const button=document.createElement('button');button.className='project-cover js-video';button.dataset.videoKey=video.id;button.setAttribute('aria-label',`Reproduzir ${video.title}`);const image=document.createElement('img');image.alt=video.title;image.loading='lazy';applyYoutubeThumbnail(image,video.youtube,getPlaceholderThumbnail(video.title));const play=document.createElement('span');play.className='project-play';play.textContent='▶';button.append(image,play);const details=document.createElement('div');details.className='project-details';details.innerHTML=`<div><h3>${video.title}</h3><p>${video.subtitle||''}</p></div>`;article.append(button,details);return article}
function renderProjects(){if(!projectGrid)return;const visible=videos.filter(video=>video.type===currentFilter).sort((a,b)=>(a.order??999)-(b.order??999));projectGrid.innerHTML='';visible.forEach(video=>projectGrid.appendChild(createProjectCard(video)));projectGrid.classList.toggle('short-grid',currentFilter==='short');projectGrid.classList.toggle('long-grid',currentFilter==='long')}
function renderTutorials(){if(!tutorialGrid)return;const ordered=[...tutorialVideos].sort((a,b)=>(a.order??999)-(b.order??999));tutorialGrid.innerHTML='';ordered.forEach(video=>tutorialGrid.appendChild(createProjectCard(video)))}
filterButtons.forEach(button=>button.addEventListener('click',()=>{currentFilter=button.dataset.filter||'short';filterButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));renderProjects()}));

function updateVolumeVisual(){if(!musicVolume)return;const percent=Math.round(currentVolume*100);musicVolume.value=String(percent);musicVolume.style.setProperty('--volume-fill',`${percent}%`)}
function setMusicVolume(value){currentVolume=Math.min(1,Math.max(0,Number(value)));if(backgroundAudio)backgroundAudio.volume=currentVolume;localStorage.setItem('babiMusicVolumeV2',String(currentVolume));updateVolumeVisual()}
musicVolume?.addEventListener('input',event=>setMusicVolume(Number(event.target.value)/100));
function updateMusicButton(){if(!backgroundAudio)return;const symbol=backgroundAudio.paused?'▶':'❚❚';if(musicPlay)musicPlay.textContent=symbol;if(musicMiniPlay)musicMiniPlay.textContent=symbol}
function saveMusicState(){if(!backgroundAudio)return;localStorage.setItem('babiMusicTrackV2',String(currentTrack));localStorage.setItem('babiMusicTimeV2',String(backgroundAudio.currentTime||0));localStorage.setItem('babiMusicWantedV2',musicDesiredPlaying?'true':'false');localStorage.setItem('babiMusicVolumeV2',String(currentVolume))}
function loadMusic(index,restoreTime=false){if(!backgroundAudio)return;currentTrack=(index+playlist.length)%playlist.length;const track=playlist[currentTrack];backgroundAudio.pause();backgroundAudio.src=track.src;backgroundAudio.preload='auto';backgroundAudio.volume=currentVolume;if(musicCover)musicCover.src=track.cover;if(musicTitle)musicTitle.textContent=track.title;localStorage.setItem('babiMusicTrackV2',String(currentTrack));if(restoreTime){const savedTime=parseFloat(localStorage.getItem('babiMusicTimeV2')||'0');backgroundAudio.addEventListener('loadedmetadata',()=>{if(savedTime>0&&savedTime<backgroundAudio.duration)backgroundAudio.currentTime=savedTime},{once:true})}else localStorage.setItem('babiMusicTimeV2','0');backgroundAudio.load();updateMusicButton()}
async function playMusic(){if(!backgroundAudio)return;musicDesiredPlaying=true;localStorage.setItem('babiMusicWantedV2','true');try{await backgroundAudio.play()}catch(_){}updateMusicButton()}
function pauseMusic(){if(!backgroundAudio)return;musicDesiredPlaying=false;localStorage.setItem('babiMusicWantedV2','false');backgroundAudio.pause();updateMusicButton()}
function toggleMusic(){if(!backgroundAudio)return;backgroundAudio.paused?playMusic():pauseMusic()}
function changeTrack(direction){const shouldPlay=musicDesiredPlaying;loadMusic(currentTrack+direction,false);if(shouldPlay)backgroundAudio?.addEventListener('canplay',()=>playMusic(),{once:true})}
function nextMusic(){changeTrack(1)}function previousMusic(){changeTrack(-1)}
function showMiniPlayer(){if(!musicPlayer||!musicPlayerMini)return;localStorage.setItem('babiMusicMinimizedV2','true');musicPlayer.classList.add('is-fading-out');setTimeout(()=>{musicPlayer.classList.add('is-hidden');musicPlayer.classList.remove('is-fading-out');musicPlayerMini.classList.remove('is-hidden','is-rising');musicPlayerMini.classList.add('is-dropping');setTimeout(()=>musicPlayerMini.classList.remove('is-dropping'),350)},180)}
function showMainPlayer(){if(!musicPlayer||!musicPlayerMini)return;localStorage.setItem('babiMusicMinimizedV2','false');musicPlayerMini.classList.remove('is-dropping');musicPlayerMini.classList.add('is-rising');setTimeout(()=>{musicPlayerMini.classList.add('is-hidden');musicPlayerMini.classList.remove('is-rising');musicPlayer.classList.remove('is-hidden');musicPlayer.classList.add('is-fading-in');setTimeout(()=>musicPlayer.classList.remove('is-fading-in'),300)},230)}
musicPlay?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleMusic()});musicMiniPlay?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleMusic()});musicNext?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();nextMusic()});musicMiniNext?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();nextMusic()});musicPrev?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();previousMusic()});musicMiniPrev?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();previousMusic()});musicClose?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showMiniPlayer()});musicPlayerMini?.addEventListener('click',e=>{if(e.target.closest('button'))return;showMainPlayer()});backgroundAudio?.addEventListener('ended',()=>{const shouldPlay=musicDesiredPlaying;loadMusic(currentTrack+1,false);if(shouldPlay)backgroundAudio?.addEventListener('canplay',()=>playMusic(),{once:true})});backgroundAudio?.addEventListener('play',updateMusicButton);backgroundAudio?.addEventListener('pause',updateMusicButton);backgroundAudio?.addEventListener('timeupdate',saveMusicState);

const videoDialog=document.getElementById('videoDialog');const videoDialogTitle=document.getElementById('videoDialogTitle');const youtubePlayer=document.getElementById('youtubePlayer');
function openVideo(video){if(!videoDialog||!youtubePlayer||!video)return;const embedUrl=getYoutubeEmbedUrl(video.youtube);if(!embedUrl)return;musicWasPlayingBeforeVideo=Boolean(backgroundAudio&&!backgroundAudio.paused);if(musicWasPlayingBeforeVideo&&backgroundAudio){backgroundAudio.pause();updateMusicButton()}if(videoDialogTitle)videoDialogTitle.textContent=video.title;youtubePlayer.src=embedUrl;videoDialog.classList.add('open');videoDialog.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
document.addEventListener('click',e=>{const trigger=e.target.closest('.js-video');if(!trigger)return;openVideo(getVideoByKey(trigger.dataset.videoKey))});
function closeDialog(dialog){if(!dialog)return;dialog.classList.remove('open');dialog.setAttribute('aria-hidden','true');if(dialog===videoDialog&&youtubePlayer){youtubePlayer.src='';document.body.style.overflow='';if(musicWasPlayingBeforeVideo&&musicDesiredPlaying)playMusic();musicWasPlayingBeforeVideo=false}}
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(document.getElementById(button.dataset.close))));videoDialog?.addEventListener('click',e=>{if(e.target===videoDialog)closeDialog(videoDialog)});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog(videoDialog)});

loadMusic(currentTrack,true);setMusicVolume(currentVolume);const isMusicMinimized=localStorage.getItem('babiMusicMinimizedV2')==='true';if(isMusicMinimized){musicPlayer?.classList.add('is-hidden');musicPlayerMini?.classList.remove('is-hidden')}else{musicPlayer?.classList.remove('is-hidden');musicPlayerMini?.classList.add('is-hidden')}
async function tryAutoplayMusic(){if(!musicDesiredPlaying||!backgroundAudio)return;try{await backgroundAudio.play()}catch(_){}updateMusicButton()}backgroundAudio?.addEventListener('canplay',tryAutoplayMusic,{once:true});tryAutoplayMusic();
async function unlockMusicOnFirstInteraction(){if(!musicDesiredPlaying||!backgroundAudio||!backgroundAudio.paused)return;try{await backgroundAudio.play();updateMusicButton();document.removeEventListener('pointerdown',unlockMusicOnFirstInteraction);document.removeEventListener('keydown',unlockMusicOnFirstInteraction)}catch(_){}}document.addEventListener('pointerdown',unlockMusicOnFirstInteraction);document.addEventListener('keydown',unlockMusicOnFirstInteraction);window.addEventListener('beforeunload',saveMusicState);window.addEventListener('pagehide',saveMusicState);

let reelPlayer=null;let reelPlayerReady=false;let reelVisible=true;
function setupReelPlayer(){const reelId=getYoutubeId(reelVideo.youtube);if(!reelId||!reelYoutube)return;const startPlayer=()=>{reelPlayer=new YT.Player('reelYoutube',{videoId:reelId,playerVars:{autoplay:1,controls:0,disablekb:1,fs:0,loop:1,playlist:reelId,modestbranding:1,playsinline:1,rel:0},events:{onReady(event){reelPlayerReady=true;event.target.mute();reelVisible?event.target.playVideo():event.target.pauseVideo()}}})};if(window.YT&&window.YT.Player)startPlayer();else{window.onYouTubeIframeAPIReady=startPlayer;if(!document.querySelector('script[data-youtube-api]')){const tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';tag.dataset.youtubeApi='true';document.head.appendChild(tag)}}if(reelFrame){const observer=new IntersectionObserver(entries=>{const entry=entries[0];reelVisible=entry.isIntersecting&&entry.intersectionRatio>=.25;if(!reelPlayerReady||!reelPlayer)return;if(reelVisible){reelPlayer.mute();reelPlayer.playVideo()}else reelPlayer.pauseVideo()},{threshold:[0,.25,.5,1]});observer.observe(reelFrame)}}
setupReelPlayer();renderProjects();renderTutorials();
