self.window=self;importScripts('content.js');
var M=self.APP.meta,SC=M.id+'-shell-v'+M.version,AC=M.id+'-audio-v1';
var SHELL=['./','index.html','content.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(SC).then(function(c){return Promise.allSettled(SHELL.map(function(u){return c.add(u)}))}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf(M.id+'-shell-')===0&&k!==SC}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('message',function(e){if(e.data==='SKIP_WAITING')self.skipWaiting()});
function slice(m,req){var h=req.headers.get('range');if(!h)return Promise.resolve(m);return m.arrayBuffer().then(function(b){var n=b.byteLength,r=/^bytes=(\d*)-(\d*)$/.exec(h.trim()),s,e;
if(!r||(r[1]===''&&r[2]==='')){return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+n}})}
if(r[1]===''){s=Math.max(0,n-+r[2]);e=n-1}else{s=+r[1];e=r[2]===''?n-1:Math.min(+r[2],n-1)}
if(s>e||s>=n)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+n}});
return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':m.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+s+'-'+e+'/'+n,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})})}
function audio(req){return caches.open(AC).then(function(c){return c.match(req.url).then(function(m){if(m)return slice(m,req);return fetch(req.url).then(function(r){if(!r.ok)return r;c.put(req.url,r.clone());return slice(r,req)})})})}
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);if(u.origin!==location.origin)return;
if(u.pathname.indexOf('/audio/')>-1){e.respondWith(audio(r));return}
e.respondWith(caches.open(SC).then(function(c){return c.match(r,{ignoreSearch:true}).then(function(m){var n=fetch(r).then(function(x){if(x.ok)c.put(r,x.clone());return x}).catch(function(){return m||(r.mode==='navigate'?c.match('index.html'):Response.error())});return m||n})}))});
