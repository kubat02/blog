'use strict';
(()=>{
 const content=window.GPJ_CONTENT,renderer=window.GPJ_RENDER,page=document.body.dataset.page;
 const params=new URLSearchParams(location.search);let lang=content.defaultLocale;
 try{if(content.locales[localStorage.getItem('gpj-language')])lang=localStorage.getItem('gpj-language');}catch{}
 if(content.locales[params.get('lang')]){lang=params.get('lang');try{localStorage.setItem('gpj-language',lang);}catch{}}
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let effectsPaused=false;try{effectsPaused=localStorage.getItem('gpj-effects-paused')==='true';}catch{}
 function syncEffects(){const a=content.appearance.locales[lang],paused=motion.matches||effectsPaused;document.documentElement.dataset.motionPaused=String(paused);const button=document.querySelector('[data-motion-toggle]');if(button){const label=motion.matches?a.reducedMotion:paused?a.resumeEffects:a.pauseEffects;button.disabled=motion.matches;button.setAttribute('aria-label',label);button.title=label;button.querySelector('use').setAttribute('href',paused?'#i-play':'#i-pause');}}
 motion.addEventListener('change',syncEffects);
 document.addEventListener('visibilitychange',()=>{document.documentElement.dataset.pageHidden=String(document.hidden);});
 document.documentElement.dataset.pageHidden=String(document.hidden);
 function bindGallery(){const dialog=document.getElementById('photo-dialog'),a=content.appearance.locales[lang],escape=renderer.escape;let currentId,currentIndex=0,opener;
  function paint(){const items=content.photos.destinations[currentId],p=items[currentIndex];dialog.querySelector('.lightbox-media').innerHTML=`<figure><img src="${content.basePath||''}/${p.asset}" alt="${escape(p.alt[lang])}" width="${p.width}" height="${p.height}"><figcaption class="photo-credit"><span class="photo-caption-text">${escape(p.caption[lang])}</span><span class="photo-attribution"><a href="${escape(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escape(p.photographer)} · ${escape(a.source)}</a><a href="${escape(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(a.license)}: ${escape(p.license)}</a><span>${escape(a.resized)}</span></span></figcaption></figure>`;dialog.querySelector('[data-photo-position]').textContent=a.photoPosition.replace('{current}',new Intl.NumberFormat(lang).format(currentIndex+1)).replace('{total}',new Intl.NumberFormat(lang).format(items.length));}
  function step(direction){currentIndex=(currentIndex+direction+content.photos.destinations[currentId].length)%content.photos.destinations[currentId].length;paint();}
  document.querySelectorAll('[data-photo-id]').forEach(button=>button.addEventListener('click',()=>{opener=button;currentId=button.dataset.photoId;currentIndex=Number(button.dataset.photoIndex);paint();dialog.showModal();document.body.classList.add('photo-is-open');dialog.querySelector('[data-photo-close]').focus();}));
  dialog.querySelector('[data-photo-close]').addEventListener('click',()=>dialog.close());
  dialog.querySelector('[data-photo-next]').addEventListener('click',()=>step(1));dialog.querySelector('[data-photo-previous]').addEventListener('click',()=>step(-1));
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('photo-is-open');dialog.querySelector('.lightbox-media').replaceChildren();opener?.focus({preventScroll:true});});
 }
 function filter(){const search=document.getElementById('portfolio-search');if(!search)return;const query=search.value.toLocaleLowerCase(lang).normalize('NFKD').replace(/\p{M}/gu,'').trim(),category=document.getElementById('portfolio-category').value;let count=0;document.querySelectorAll('.destination-card').forEach(card=>{const hay=card.dataset.search.normalize('NFKD').replace(/\p{M}/gu,'');card.hidden=!((category==='all'||card.dataset.category===category)&&hay.includes(query));if(!card.hidden)count++;});document.getElementById('portfolio-empty').hidden=count>0;document.getElementById('portfolio-count').textContent=content.locales[lang].ui[count===1?'oneResult':'manyResults'].replace('{count}',new Intl.NumberFormat(lang).format(count));}
 function apply(){
  const focus=document.activeElement?.id,scroll=scrollY,previousQuery=document.getElementById('portfolio-search')?.value||'',previousCategory=document.getElementById('portfolio-category')?.value||'all';document.getElementById('app').innerHTML=renderer.render(content,page,lang);
  document.documentElement.lang=lang;document.documentElement.dataset.locale=lang;document.documentElement.dataset.authoring=params.get('fields')==='1'?'review':'content';
  const p=content.pages.locales[lang].pages[page];document.title=page==='home'?content.locales[lang].ui.metaTitle:p.title+' | '+content.brand;
  document.querySelector('meta[name="description"]').content=p.intro;document.querySelector('meta[property="og:title"]').content=document.title;document.querySelector('meta[property="og:description"]').content=p.intro;
  document.getElementById('language').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('gpj-language',lang);}catch{}const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);apply();});
  document.querySelector('[data-top]')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'}));
  document.querySelector('[data-motion-toggle]').addEventListener('click',()=>{effectsPaused=!effectsPaused;try{localStorage.setItem('gpj-effects-paused',String(effectsPaused));}catch{}syncEffects();});syncEffects();bindGallery();
  const search=document.getElementById('portfolio-search'),select=document.getElementById('portfolio-category');
  if(search){search.value=previousQuery;select.value=previousCategory;search.addEventListener('input',filter);select.addEventListener('change',filter);document.getElementById('reset-portfolio').addEventListener('click',()=>{search.value='';select.value='all';filter();search.focus();});filter();}
  const hero=document.querySelector('.hero'),art=document.querySelector('.hero-art');if(hero){hero.addEventListener('pointermove',e=>{if(motion.matches||effectsPaused||e.pointerType!=='mouse')return;const b=hero.getBoundingClientRect();art.style.setProperty('--art-x',((e.clientX-b.left)/b.width-.5)*5+'px');art.style.setProperty('--art-y',((e.clientY-b.top)/b.height-.5)*4+'px');});hero.addEventListener('pointerleave',()=>{art.style.setProperty('--art-x','0px');art.style.setProperty('--art-y','0px');});}
  if(focus==='language')document.getElementById('language').focus({preventScroll:true});window.scrollTo({top:scroll,behavior:'instant'});
 }
 apply();
 if(location.hash){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{}const target=id&&document.getElementById(id);if(target)requestAnimationFrame(()=>{target.scrollIntoView({behavior:'instant',block:'start'});target.focus({preventScroll:true});});}
})();
