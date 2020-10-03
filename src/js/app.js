if(!window.Promise) {
    window.Promise = Promise
}
var deferredPrompt;
// check if service worker in the browser [navigator]

if('serviceWorker' in navigator) {
   navigator.serviceWorker.register('/sw.js')
   .then(() => {
       console.log('service worker is registered')
   })
}

// add event lister to beforeinstallprompt 

window.addEventListener('beforeinstallprompt', function (event) {
    console.log('beforeinstallprompt fired ...!')
    event.preventDefault()
    deferredPrompt = event;
    return false;
    
})




