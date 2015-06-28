 var cast = window.cast || {};	
	
(function () {
    var media = {};
    var mediaList = [];
    var castManager;

/*jshint -W117 */	

 window.addEventListener('WebComponentsReady', function() {
	   var playButton = document.getElementById('play_button');
	   
      playButton.addEventListener('click', function() {
		var myQueIm;
		var myQue = [];
		var myQReq;
		if (castManager.hasCastSession()){
       //query -> mediaList asModle Collection from a FETCH
        for (var i in mediaList) {
			myQueIm = new chrome.cast.media.QueueItem(mediaList[i]);
			myQue.autoplay = true;
			myQue.push(myQueIm);
		}
        myQReq =  new chrome.cast.media.QueueLoadRequest (myQue);
        console.log('Launch success loading MediaQ ' +myQue.length);                
        castManager.session.queueLoad(myQReq, 
			function(media) {
				console.log('Media loaded ' +JSON.stringify(media));
//				document.querySelector('#toast1').show();
				},
			function(e) {
				console.log('Media error: ' + JSON.stringify(e));
			}); 
        }
      });	   
	   
	 });			
			
 //TODO separate concerns get Model /Collection from UI buttons 
     function getParseMedia(){
		
		// the query callback is too late a place to provide mediaList to the child
		var Items = Parse.Object.extend('MediaItem');
		var query = new Parse.Query(Items);
		//query.equalTo("createdBy", Parse.User.current());
		query.limit(20);
		query.descending('createdAt');
/*jshint +W117 */		
/*jshint -W098 */		
		query.find().then(function(content) {
			mediaList = processMediaList(content);																
			media = new cast.Media(mediaList[0]);
			var castButton = document.querySelector('#cast_button');
			castButton.castManager = new cast.CastManager(media);
			castManager = castButton.castManager;
//			castButton.castManager = castManager;
//			castButton.mediaList = mediaList; // sync to other element
//			castButton.media = media;			   // Initialize Parse 

//			castManager =  new cast.CastManager(media);		
//		castManager.setCastMedia(media); //how to get this over to button 
//			castButton.castManager = castManager; //this should raise an event over there in button			
			console.log('called query n set media');		   
		},function(error) {
		  console.error('Request failed with response code ' +JSON.stringify(error));
		}); // END query
		}
		
    // should really instantiate a Model instance and add it to collection
    //model
 //         'title': contentArray[i].get("msg").substring(0, 32),
 //         'description': contentArray[i].get("msg"),
 //         'url': contentArray[i].get("media3").url(),
 //         'studio': 'borneo',
//          'thumbnailImageUrl': contentArray[i].get("media4").url(),
//          'largeImageUrl': contentArray[i].get("media1").url()
    function processMediaList(content) {
      var myArray =[];
      var contentArray = content;
      for (var i = 0; i < contentArray.length; i++) {
		  myArray.push(new chrome.cast.media.MediaInfo(contentArray[i].get('media3').url(), 'video/mp4'));		  
      }
      return myArray;
    }
     
   // Initialize Parse 
  Parse.initialize('dDgpCbCGWqIojuPcym19Ov6vEkmBH8Nk90P3qovv',
                   'fZM8Qu34SBChH1wnr0hkkp6MkyRAxlhPaOBWltSb');   
    if(Parse.User.current()){
		getParseMedia();
	} 

  Polymer({
     is: 'my-top',
      listeners: {
        'login': 'myMethod',
	},
    ready: function () {

		// Prevent clicks in this element from cascading
		this.addEventListener('click', function(e) {
		var t = e.target.classList[1];
        if (t === 'cast-button') {
			console.log('click', t);
        } else {
           console.log('click', t);
          }
        }.bind(this));            
	}
  }); 
 
}());
