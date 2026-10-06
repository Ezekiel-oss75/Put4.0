'use strict';
const CACHE_VERSION='put16-v1.0.0';
const CACHE_STATIC=CACHE_VERSION+'-static';
const STATIC_ASSETS=['./','./index.html','./manifest.json','./sw.js'];

self.addEventListener('install',e=>{
e.waitUntil(caches.open(CACHE_STATIC).then(c=>Promise.all(STATIC_ASSETS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('put16-')&&k!==CACHE_STATIC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
const req=e.request;
if(req.method!=='GET') return;
const url=new URL(req.url);
if(!url.protocol.startsWith('http')) return;
if(url.origin!==self.location.origin) return;
if(req.headers.get('accept')&&req.headers.get('accept').includes('text/html')){
e.respondWith(networkFirst(req));
return;
}
e.respondWith(cacheFirst(req));
});

async function networkFirst(req){
try{
const r=await fetch(req);
if(r&&r.status===200){ const c=await caches.open(CACHE_STATIC); c.put(req,r.clone()); }
return r;
}catch(err){
const cached=await caches.match(req);
if(cached) return cached;
const fb=await caches.match('./index.html');
if(fb) return fb;
return new Response('Офлайн',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
}
}

async function cacheFirst(req){
const cached=await caches.match(req);
if(cached) return cached;
try{
const r=await fetch(req);
if(r&&r.status===200){ const c=await caches.open(CACHE_STATIC); c.put(req,r.clone()); }
return r;
}catch(err){
return new Response('Офлайн',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
}
}

self.addEventListener('message',e=>{
const data=e.data||{};
if(data.type==='SKIP_WAITING') self.skipWaiting();
if(data.type==='CLEAR_CACHE') caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('put16-')).map(k=>caches.delete(k)))).then(()=>{ if(e.source) e.source.postMessage({type:'CACHE_CLEARED'}); });
});
