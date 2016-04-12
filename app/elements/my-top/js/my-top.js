 var cast = window.cast || {};

(function () {
  var castManager, playButton;

    var media = {};
    var mediaList = [];
    // why both button.castMgr and this.castMgr  ONLY 1 needed

/*jshint -W117 */
//hit play b4 hit cast ??
 window.addEventListener('WebComponentsReady', function() {
   castManager = document.querySelector('cast-manager');
	 playButton = document.getElementById('button_play_pause');
   if(playButton){
     playButton.addEventListener('click', function() {
       console.log('EVE playBut');
      if (castManager.isCasting()){
        castManager.setLocalMedia(media);
        castManager.addItemsToQueue(mediaList);
    //    castManager.play();
      }
    });  //end PlayButtn1
   }
 });	// end of window eventListen

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
      media = mediaList[0];
			//media = new cast.Media(mediaList[0]);

			console.log('called query n set media');
		},function(error) {
		  console.error('Request failed with response code ' +JSON.stringify(error));
		}); // END query
	} // END getParseMedia

  function setMedia(content){
    var lMedia = {};
    var p1;
    lMedia.title = content.get('msg').substring(0, 32);
    lMedia.description = content.get('msg');
    p1 = content.get('media3');
    if(typeof p1 !== 'undefined'){
        lMedia.url = p1.url();
    }

    lMedia.studio = 'borneo';
    p1 = content.get('media4');
    if(typeof p1 !== 'undefined'){
        lMedia.thumbnailImageUrl = p1.url();
    }
    p1 = content.get('media1');
    if(typeof p1 !== 'undefined'){
        lMedia.largeImageUrl = p1.url();
    }
    if (typeof lMedia.url === 'undefined'){
       lMedia = {};
    }
    return lMedia;
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
      var nMedia;
      var contentArray = content;
      for (var i = 0; i < contentArray.length; i++) {
		  //myArray.push(new chrome.cast.media.MediaInfo(contentArray[i].get('media3').url(), 'video/mp4'));
        nMedia = setMedia(contentArray[i]) || {};
        if(typeof nMedia.url !== 'undefined'){
          myArray.push(nMedia);

          console.log('FND ' + nMedia.url);
        }
      }
      return myArray;
    }

   // Initialize Parse PROD
  Parse.initialize('dDgpCbCGWqIojuPcym19Ov6vEkmBH8Nk90P3qovv',
                   'fZM8Qu34SBChH1wnr0hkkp6MkyRAxlhPaOBWltSb');
    if(Parse.User.current()){
		getParseMedia();
	}

  Polymer({
     is: 'my-top',
     properties: {
       localMedia: {
   			type: Object,
   			observer: '_localMediaObserver'
         },
       _playerState: {
         type: Number,
         observer: '_playerStateObserver'
       },
       connectionStatus: {
        type: Number,
        notify: true,
        value: 0 //CastManager.CONNECTION_STATUS
      },
     },
     behaviors: [cast.HelperBehavior],
     listeners: {
        'login': 'myMethod',
	     },
    ready: function () {
      this.$.button_play_pause.addEventListener('click', function () {  // jshint ignore:line
        if (this._playerState !== cast.MediaItem.STATE.PLAYING) {
          this._play(cast.CastManager.SENDER.CASTCONTROLLER);
        } else {
          this._pause(cast.CastManager.SENDER.CASTCONTROLLER);
        }
      }.bind(this));


      // Prevent clicks in this element from bubbling up
//      this.addEventListener('click', function (event) {
//        event.stopPropagation();
//      });
	},
  _notifyStateChanged: function () {
    this.set('_playerState', this.localMedia.state);
  },

  _playerStateObserver: function (newVal) {
    if (newVal === cast.MediaItem.STATE.PLAYING) {
      this.$.button_play_pause.setAttribute('icon', 'av:pause');  // jshint ignore:line
    } else { //If no media is loaded hide the player bar
      this.$.button_play_pause.setAttribute('icon', 'av:play-arrow');  // jshint ignore:line
    }
  },

_localMediaObserver: function (newVal, oldVal) {
    if (newVal) {
      this.listen(this.localMedia, 'state-changed', '_notifyStateChanged');
      this.listen(this.localMedia, 'duration-changed', '_notifyDurationChanged');
    }
    if (oldVal) {
      this.unlisten(oldVal, 'state-changed', '_notifyStateChanged');
      this.unlisten(oldVal, 'duration-changed', '_notifyDurationChanged');
    }
    //Update play button state since the listners only fire when state changes
    this._notifyStateChanged();
  }
  });
}());
