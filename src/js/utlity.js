var dbPromise = idb.open('posts-store',2,function (db) {

    // create object store or the table 

    // check if the object srore names is not contains the post object store

    if(!db.objectStoreNames.contains('posts')) {        
        

        db.createObjectStore('posts', {keyPath : "id"})
    }
})

// insert data into indexedDB
function writeData(st,data) {
   return  dbPromise.then(db => {
        // create transaction operation 
        var tx = db.transaction(st,'readwrite')
        var store = tx.objectStore(st)
        store.put(data)
        return tx.complete;

    })
}

// read the data from indexedDB 

function readAllData(st) {
     return dbPromise.then(db => {
        var tx = db.transaction(st,'readonly')
        var store = tx.objectStore(st)
        return store.getAll()
     })
}

// clear all data

function clearAllData(st) {
    return dbPromise.then(db => {
       var tx = db.transaction(st,'readwrite')
       var store = tx.objectStore(st)
        store.clear()
       return tx.complete;
    })
}

function deleteSingleData(st, id) {
      dbPromise.then(db => {
         var tx = db.transaction(st,'readwrite')
         var store = tx.objectStore(st)
         store.delete(id)
         return tx.complete;
     })
     .then(() => {
         console.log(`iemm with id ${id} was deleted successfuly `)
     })
}