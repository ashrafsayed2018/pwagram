importScripts('./src/js/idb.js')
importScripts('./src/js/utlity.js')

let CACHE_STATIC = 'static-v13';
let CACHE_DAYNAMIC = "daynamic-v1";
let STATIC_FILES = [
    '/',
    '/index.html',
    '/fallback.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/js/promise.js', 
    '/src/js/fetch.js',
    '/src/js/idb.js',
    '/src/css/app.css', 
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'

];


// function trimCache(cacheName,cacheLimit) {
//     caches.open(cacheName)
//     .then(cache => {
//         return cache.keys()
//         .then(keys => {
//             if(keys.length > cacheLimit) {
//                 cache.delete(keys[0])
//                 .then(trimCache(cacheName,cacheLimit))
//             }
//         })
//     })
// }
// install the service worker 
self.addEventListener('install', event => {
    console.log('service worker is installed ', event)

    // caching the static assets
    event.waitUntil(
        caches.open(CACHE_STATIC)
              .then(cache => {
                  // [service workers] pre caching app chell
                  console.log('[service workers] pre caching app chell')
                  cache.addAll(STATIC_FILES)
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
                      if(key != CACHE_STATIC && key != CACHE_DAYNAMIC) {
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

// self.addEventListener('fetch', event => {
// // console.log('fetching something .... ', event)  

//   // check if request is made by chrome extensions or web page
//   // if request is made for web page url must contains http.
//   if (!(event.request.url.includes('http'))) return; // skip the request. if request is not made with http pro

// event.respondWith(
//     // check if there is any caches 
//    caches.match(event.request)
//            .then(response => {
//                // check if we have a valid response 
//                if(response) {
//                    return response
//                } else {
//                    return fetch(event.request)
//                    .then(res => {
//                        // dynamic caching 
//                     return  caches.open(CACHE_DAYNAMIC)
//                      .then(cache => {
                         
//                           cache.put(event.request.url,res.clone()) 
//                         return res;

//                      })
//                    }).catch(err => {
//                        return caches.open(CACHE_STATIC)
//                              .then(cache => {
//                               return cache.match('/fallback.html')
//                             })
//                    })

//                }
//            })
// )  
// })

// cache then network stratgy 

function isinArray(string,array) {
    for(let i = 0; i < array.length; i++) {
        if(array[i] === string) {
            return true
        }
    }
    return false;
}

self.addEventListener('fetch', event => {
    // console.log('fetching something .... ', event)  
    
      // check if request is made by chrome extensions or web page
      // if request is made for web page url must contains http.
      if (!(event.request.url.includes('http'))) return; // skip the request. if request is not made with http pro
     
      let url = 'https://pwagram-9b3e9.firebaseio.com/posts';
      if(event.request.url.indexOf(url) > -1) {
        event.respondWith( fetch(event.request)
                .then(res => {
                        // creating a clone of res
                        var clonedRes = res.clone();

                        clearAllData('posts')
                      .then(() => {
                          
                       return  clonedRes.json()

                      })
                      .then(data => {
                        for(var key in data) {
                           writeData('posts',data[key])
                        }
                    })
                            
                          return res;
                        })
                 
         ) 
      } else if (isinArray(event.request.url,STATIC_FILES)) {

        event.respondWith(
                // check if there is any caches 
                caches.match(event.request)
            ) 
      }
      else {

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
                    return  caches.open(CACHE_DAYNAMIC)
                     .then(cache => {
                        // trimCache(CACHE_DAYNAMIC,4)
                          cache.put(event.request.url,res.clone()) 
                        return res;

                     })
                   }).catch(err => {
                       return caches.open(CACHE_STATIC)
                             .then(cache => {
                                 if(event.request.headers.get('accept').includes('text/html')) {
                                    return cache.match('/fallback.html')
                                 }
                                 
                            })
                   })

               }
           })
)  
      }
 
    })

// cache only stratgy 

// self.addEventListener('fetch', event => {
// // console.log('fetching something .... ', event)  

//   // check if request is made by chrome extensions or web page
//   // if request is made for web page url must contains http.
//   if (!(event.request.url.includes('http'))) return; // skip the request. if request is not made with http pro

// event.respondWith(
//     // check if there is any caches 
//    caches.match(event.request)
// )  
// })

//  network only stratgy
// self.addEventListener('fetch', event => {
//     // console.log('fetching something .... ', event)  
    
//       // check if request is made by chrome extensions or web page
//       // if request is made for web page url must contains http.
//       if (!(event.request.url.includes('http'))) return; // skip the request. if request is not made with http pro
    
//     event.respondWith(
//         // request the assets from the network
//        fetch(event.request)
//     )  
//     })

// network with cache fallback startgy
 
// self.addEventListener('fetch', event => {
// // console.log('fetching something .... ', event)  

//   // check if request is made by chrome extensions or web page
//   // if request is made for web page url must contains http.
//   if (!(event.request.url.includes('http'))) return; // skip the request. if request is not made with http pro

// event.respondWith(

//     // fetch the assets from the network 
//     fetch(event.request)
//      .then(res => {
 
//         // dynamic caching 
//         return  caches.open(CACHE_DAYNAMIC)
//             .then(cache => {
                         
//             cache.put(event.request.url,res.clone()) 
//              return res;

//         })

//      })
//     .catch(err => {
//     // check if there is any caches 
//      return caches.match(event.request) 
//     })

// )  
// })

self.addEventListener('sync', event => {
    console.log('service worker background syncing ' , event)
    if(event.tag === "sync-new-post") {
        console.log('syncing new post')
        event.waitUntil(
            readAllData('sync-posts')
            .then(data => {
                for (var dt of data ) {
                    fetch("https://us-central1-pwagram-9b3e9.cloudfunctions.net/storePostDat", {
                        method : "POST",
                         headers : {
                          "Content-type" : "application/json",
                          "Accept" : "application/json"
                        },
                        body : JSON.stringify({
                          id : dt.id,
                          title : dt.title,
                          location : dt.location,
                          image : "https://firebasestorage.googleapis.com/v0/b/pwagram-9b3e9.appspot.com/o/sf-boat.jpg?alt=media&token=e6ef80b9-fc2f-47f7-ab96-b9097e9419d9"
                        })
                      })
                      .then(res => {
                        console.log('sent data' , res)
                           if(res.ok) {
                               res.json()
                               .then(resData => {
                                deleteSingleData('sync-posts', resData.id) 
                               })
                           
                           }
                      })
                      .catch(err => {
                          console.log(`error while sending data ${err}`)
                      })
                }
             
            })
        )
    }
})
