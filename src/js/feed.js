var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form')
var titleInput = document.querySelector('#title')
var locationInput = document.querySelector('#location')


function openCreatePostModal() {
  createPostArea.style.display = 'block';

  // check if deferredprompt is set

  if(deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(choiceResult => {
      console.log(choiceResult.outcome)
      if(choiceResult.outcome == "dismissed") {
        console.log('user cancelled installtion ')
      } else {
        console.log('user add the app to home screen')
      }
    })
    deferredPrompt = null;
  } else {
    console.log('there is no deferred prompt here')
  }


}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCard() {
  while(sharedMomentsArea.hasChildNodes()) {
          sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {

  // currently not in use , function which cache the assets on user demand
  // function onSaveButtonClicked() {
  //   console.log('save button clicked')
  //   if('caches' in window) {
      
  //     caches.open('user-requested')
  //     .then(cache =>  {
  //         cache.add('https://httpbin.org/get')
  //         cache.add('/src/images/sf-boat.jpg')
  //     })
  //   }
  // }
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  cardWrapper.style.margin = "0 auto";
  cardWrapper.style.display = "block";
  cardWrapper.style.width = "60vw";
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = "red";
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSavBtn = document.createElement('button')
  // cardSavBtn.textContent = "save"
  // cardSavBtn.addEventListener('click',onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSavBtn)
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}


function updateUi(data) {
  clearCard()
  for(let i = 0 ; i < data.length; i++) {
       createCard(data[i])
  }
}

let url = 'https://us-central1-pwagram-9b3e9.cloudfunctions.net/storePostDat';
let networkdatareceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkdatareceived = true;
    console.log('from web' ,data)
     let dataArray = [];
    for(key in data) {
      dataArray.push(data[key])
    }
    updateUi(dataArray)
  });


// check if caches api in the browser 

if('indexedDB' in window) {
     readAllData('posts')
     .then(data => {
       if(!networkdatareceived) {
         console.log('from cache' ,data)
         updateUi(data)
       }
     })
}

// function to send data to the backend if the SyncManager not support in the browser

function sendData() {
  fetch(url, {
    method : "POST",
    headers : {
      "Content-type" : "application/json",
      "Accept" : "application/json"
    },
    body : JSON.stringify({
      id : new Date().toLocaleString(),
      title : titleInput.value,
      location : locationInput.value,
      image : "https://firebasestorage.googleapis.com/v0/b/pwagram-9b3e9.appspot.com/o/sf-boat.jpg?alt=media&token=e6ef80b9-fc2f-47f7-ab96-b9097e9419d9"
    })
  })
  .then(res => {
    console.log('sent data' , res)
    updateUi(res)
  })
}
form.addEventListener('submit', event=> {
  event.preventDefault();

  if(titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert('please insert a valid data ')
    return
  }

  closeCreatePostModal()

  if('serviceWorker' in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
    .then(sw => {

      var post = {
        id : new Date().toDateString(),
        title : titleInput.value,
        location : locationInput.value
      }

      writeData('sync-posts', post)
      .then(() => {
        return sw.sync.register('sync-new-post');
      })
      .then(() => {
        var snackbarContainer = document.querySelector('#confirmation-toast');
        var data = {message : 'your post save till the internet connected syning'}
        snackbarContainer.MaterialSnackbar.showSnackbar(data)
      })
      .catch(err => {
             console.log(err)
      })
      
    })
  } else {
      sendData()
  }
 
})