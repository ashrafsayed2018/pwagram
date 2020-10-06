var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');


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

let url = 'https://pwagram-9b3e9.firebaseio.com/posts.json';
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
