'use strict';
var CACHE_NAME='put16-v1';
var ASSETS=['./','./index.html'];
self.addEventListener('install',function(e){
e.waitUntil(caches.open(CACHE_NAME).then(function(c){return Promise.all(ASSETS.map(function(a){return c.add(a).catch(function(){});}));}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('put16-')===0&&k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
var req=e.request;
if(req.method!=='GET') return;
var url=new URL(req.url);
if(!url.protocol.indexOf('http')===0) return;
if(url.origin!==self.location.origin) return;
var isHTML=(req.headers.get('accept')||'').indexOf('text/html')!==-1;
if(isHTML){
e.respondWith(fetch(req).then(function(r){
if(r&&r.status===200){caches.open(CACHE_NAME).then(function(c){c.put(req,r.clone());});}
return r;
}).catch(function(){
return caches.match(req).then(function(c){return c||caches.match('./index.html');});
}));
}else{
e.respondWith(caches.match(req).then(function(c){
if(c) return c;
return fetch(req).then(function(r){
if(r&&r.status===200){caches.open(CACHE_NAME).then(function(ca){ca.put(req,r.clone());});}
return r;
});
}));
}
});
