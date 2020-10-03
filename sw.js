let CACHE_STATIC = 'static-v2';
let CACHE_DAYNAMIC = "daynamic-v1";
// install the service worker 
self.addEventListener('install', event => {
    console.log('service worker is installed ', event)

    // caching the static assets
    event.waitUntil(
        caches.open('CACHE_STATIC')
              .then(cache => {
                  // [service workers] precaching app chell
                  console.log('[service workers] precaching app chell')
                  cache.addAll([
                    '/',
                    '/index.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/js/promise.js', 
                    '/src/js/fetch.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'

                  ])
              })
        )
    
})

// activate the service worker 
self.addEventListener('activate', event => {
    console.log('service worker is activated  ', event)

    // deleting the old versions of caches 

    event.waitUntil(
        caches.keys()
              .then(keyList => {
                  return Promise.all(keyList.map(key => {
                      if(key != 'CACHE_STATIC' && key != "CACHE_DAYNAMIC") {
                          // removing the old cache vesions
                         return caches.delete(key)
                      }
                  }))
              })
    )

   // to make sure the service worker are activated correcty
    event.waitUntil(self.clients.claim());
})

// fetch event 

self.addEventListener('fetch', event => {
// console.log('fetching something .... ', event)  

  // check if request is made by chrome extensions or web page
  // if request is made for web page url must contains http.
  if (!(event.request.url.includes('http'))) return; // skip the request. if request is not made with http pro

event.respondWith(
    // check if there is any caches 
   caches.match(event.request)
           .then(response => {
               // check if we have a valid response 
               if(response) {
                   return response
               } else {
                   return fetch(event.request)
                   .then(res => {
                       // dynamic caching 
                    return  caches.open('CACHE_DAYNAMIC')
                     .then(cache => {
                         
                         cache.put(event.request.url,res.clone())
                        return res;

                     })
                   }).catch(err => {

                   })

               }
           })
)  
})