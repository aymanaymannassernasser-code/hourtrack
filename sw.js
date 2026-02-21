self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open('hourtrack-v1').then(function(c){
      return c.addAll(['./','/index.html']);
    }).catch(function(){})
  );
});
self.addEventListener('fetch', function(e){
  e.respondWith(
    fetch(e.request).catch(function(){
      return caches.match(e.request);
    })
  );
});
