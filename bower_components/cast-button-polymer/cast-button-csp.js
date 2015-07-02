
    var cast = window.cast || {};

    /**
     * CastManager is used as the glue for all of polymer elements.  It stores the current state
     * of the app and has some utility functions.
     *
     * It leverages core signals for to fire pubsub events.  Also many elements observe
     * it's elements.
     */
    (function() {
      'use strict';
      //load core signal if it isn't already included for pubsub events
      var loadCoreSignal = function() {
        var coreSignalImport = document.createElement('link');
        coreSignalImport.setAttribute('rel', 'import');
        coreSignalImport.setAttribute('href', 'bower_components/iron-signals/iron-signals.html');
//        coreSignalImport.setAttribute('href', 'bower_components/core-signals/core-signals.html');
        document.body.appendChild(coreSignalImport);
      };

      if (document.readyState === "complete") {
        loadCoreSignal();
      } else {
        document.addEventListener("DOMContentLoaded", function() {
          loadCoreSignal();
        });
      }

      /**
       * Defines the sender of the request
       *
       * @type {{LOCAL: number, CHROMECAST: number}}
       */
      CastManager.SENDER = {
        'LOCAL': 0, //local video
        'CHROMECAST': 1, //chromecast events ie. for multiple senders
        'CASTCONTROLLER': 2 //cast controller bar
      };

      /**
       * Class to glue together video player UI
       *
       * @param media {cast.Media} initial media
       * @constructor
       */
      function CastManager(media) {

        /**
         * Local media object reference
         *
         * @type {cast.Media}
         */
        this.localMedia = media;

        /**
         * Chromecast media object reference
         *
         * @type {chrome.cast.media.Media}
         */
        this.castMedia = {};

        /**
         * Chromecast session object reference
         *
         * @type {chrome.cast.Session}
         */
        this.session = {};

        /**
         * Tracks whether cast is connected
         * @type {boolean}
         */
        this.isCasting = false;

        this.showSpinner = false;
      }

      CastManager.prototype = {
        /**
         * Fire a play core signals event
         *
         * @param sender {CastManager.SENDER}
         */
        play: function(sender) {
          var playEvent = new CustomEvent('iron-signal',
              {
                'detail': {
                  'name': 'media-action',
                  'data': {
                    'action': 'play',
                    'sender': sender
                  }
                }
              });
          document.dispatchEvent(playEvent);
        },
        /**
         * Fire a pause core signals event
         *
         * @param sender {CastManager.SENDER}
         */
        pause: function(sender) {
          var pauseEvent = new CustomEvent('iron-signal',
              {
                'detail': {
                  'name': 'media-action',
                  'data': {
                    'action': 'pause',
                    'sender': sender
                  }
                }
              });
          document.dispatchEvent(pauseEvent);
        },
        /**
         * Fire a seek core signals event
         *
         * @param time {number} time in seconds to seek to
         * @param sender {CastManager.SENDER}
         */
        seek: function(time, sender) {
          //Fire a core-signal event
          var seekEvent = new CustomEvent('iron-signal',
              {
                'detail': {
                  'name': 'media-action',
                  'data': {
                    'action': 'seek',
                    'currentTime': time,
                    'sender': sender
                  }
                }
              });
          document.dispatchEvent(seekEvent);
        },
        volume: function(sender, volume) {
          var volumeEvent = new CustomEvent('iron-signal',
              {
                'detail': {
                  'name': 'media-action',
                  'data': {
                    'action': 'volume',
                    'volume': volume,
                    'sender': sender
                  }
                }
              });
          document.dispatchEvent(volumeEvent);
        },
        fullScreen: function() {
          var fullscreenEvent = new CustomEvent('iron-signal',
              {
                'detail': {
                  'name': 'media-action',
                  'data': {
                    'action': 'fullscreen'
                  }
                }
              });
          document.dispatchEvent(fullscreenEvent);
        },
        exitFullScreen: function() {
          var fullscreenEvent = new CustomEvent('iron-signal',
              {
                'detail': {
                  'name': 'media-action',
                  'data': {
                    'action': 'exitFullscreen'
                  }
                }
              });
          document.dispatchEvent(fullscreenEvent);
        },
        /**
         * Stores a reference to the cast media element
         *
         * @param media
         */
        setCastMedia: function(media) {
          this.castMedia = media;
        },
        /**
         * Sets the local media
         *
         * @param media
         */
        setLocalMedia: function(media) {
          this.localMedia = media;
          this.localMedia.state = cast.Media.STATE.PAUSE;
        },
        /**
         * Returns true if castMedia is not an empty object and
         * if the cast player state isn't idle.
         *
         * @returns {boolean}
         */
        hasCastMedia: function() {
          return (Object.keys(this.castMedia).length > 0
          && this.castMedia.playerState !== chrome.cast.media.PlayerState.IDLE);
        },
        /**
         * Returns true if the current local media matches cast media or if the cast media isn't loaded
         *
         * @returns {boolean}
         */
        isMediaMatch: function() {
          return (this.castMedia.media === null || this.castMedia.media === undefined
          || this.localMedia.url === this.castMedia.media.contentId);
        },
        hasCastSession: function() {
			console.log("hasCastSession");
          return (Object.keys(this.session).length > 0
          && this.session.status === chrome.cast.SessionStatus.CONNECTED);
        }
      };
      cast.CastManager = CastManager;
    })();

    /**
     * Object to represent a local castable media content
     */
    (function() {
      'use strict';

      Media.STATE = {
        'PAUSE': 0, //has started playing but is currently paused
        'PLAY': 1, //currently playing
        'STOP': 2, //has never started playing
        'BUFFERING': 3 //buffering
      };

      function Media(media) {
        this.title = media.title;
        this.url = media.url;
        this.thumbnailImageUrl = media.thumbnailImageUrl;
        this.studio = media.studio;
        this.description = media.description;

        /**
         * Current media state
         *
         * @type {number}
         */
        this.state = Media.STATE.STOP;

        /**
         * Volume of media
         * @type {number}
         */
        this.volume = 50;

        /**
         * Current time in video in seconds
         * @type {number}
         */
        this.currentTime = 0;

        /**
         * Video duration in seconds
         * @type {number}
         */
        this.duration = 0;

        /**
         * String to display for time remaining
         * @type {string}
         */
        this.timeRemainingString = "0:00:00";

        this.volume = .5;
      }

      /**
       * Converts time in seconds to HH:MM:SS
       *
       * @param seconds {number}
       * @returns {string}
       */
      Media.secondsToHHMMSS = function(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var seconds = Math.floor(seconds % 60);

        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
      };

      Media.prototype = {
        /**
         * Sets the content duration
         *
         * @param duration {number}
         */
        setDuration: function(duration) {
          this.duration = duration;
        },
        /**
         * Sets the content currentTime and updates the time remaining string
         *
         * @param time {number}
         */
        setCurrentTime: function(time) {
          this.currentTime = time;
          this.timeRemainingString = Media.secondsToHHMMSS(this.duration - time);
        },
        /**
         * Returns the current percentage of completion for the content
         *
         * @returns {number}
         */
        getCurrentPercentageComplete: function() {
          return this.currentTime / this.duration;
        },
        /**
         * Converts a percentage to duration of video content time
         *
         * @param floatVal {number}
         * @returns {number}
         */
        floatToTime: function(floatVal) {
          return floatVal * this.duration;
        }
      };
      cast.Media = Media;
    })();


    Polymer({
		is: "cast-button",
      display: false,
      // Autoplay at all times ie. when local video is paused then casted
      autoplay: false,
      // Counter representing which arc to overlay when connecting
      connectingCounter: -1,
      // Interval Id to animate the arc during connection
      intervalId: null,
      // Interval Id to update currentTime on castMedia
      timerId: null,
      // Previous time to update currentTime
      prevTime: null,
      // Time to display the click here to connect message
      tooltipDisplayTime: 2000,
      
 //     castManager.castMedia.playerState :{
//		  type: String,
//		  value: '',
//		  observer: 'castPlayerStateObserver'
		
//		},

hostAttributes: {
  appid: 0,
  id:"cast_button",
  color:"black",
  animationinterval: 0,
  mediaList: "l",
},

  properties: {
    appid: String,
    id: String,  
    color: String,
    castManager: {type: Object, observer: 'castPlayerStateObserver'},
    media: Object,
    animationinterval: Number,
    mediaList: Array, 
  },
      
      ready: function() {
        if (this.appId !== null
            && window.chrome !== null
            && window.chrome !== undefined
            && window.navigator.vendor === 'Google Inc.') {
          var castScript = document.createElement('script');
          castScript.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js';
          document.getElementsByTagName('head')[0].appendChild(castScript);

          // Inits cast
          var initializeCastApi = function() {
            if (!chrome.cast || !chrome.cast.isAvailable) {
              setTimeout(initializeCastApi.bind(this), 1000);
            } else {
              var sessionRequest = new chrome.cast.SessionRequest(this.appid);
              var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                  this.sessionListener.bind(this),
                  this.receiverListener.bind(this));
              chrome.cast.initialize(apiConfig, 
				this.initSuccess.bind(this), 
//				this.errorHandler);
				this.initFail.bind(this));
				  
				//TODO is this legal in 1.0
              // Add an event listener to try and connect when clicked
              this.$.button_cast.addEventListener('click', function() {
				  //TODO new media from list, new CMgr(media) : castManager =  new cast.CastManager(media);	
                if (this.castManager.session === chrome.cast.SessionStatus.CONNECTED) {
                  this.stopCasting();
                } else {
                  if (this.intervalId === null) {
                    this.intervalId = window.setInterval(function() {
                      this.connectingCounter = (this.connectingCounter + 1) % 3;
                    }.bind(this), this.animationinterval);
                  }
                  this.castManager.exitFullScreen();
                  this.startCasting();
                }
              }.bind(this));
            }
          };
          initializeCastApi.call(this);
          if(typeof this.mediaList !== "undefined") {
			  
			  console.log("init medialst sz " );
		  }else{
			  console.log("init inner ELE NO LIST");
			  }
          //cast.Media(mediaList[Object.keys(mediaList)[0]]);
        } else {
          console.log('No receiver app id defined');
        }
      },
      /**
       * Handles when new sessions are connected.
       */
      sessionListener: function(session) {
        console.log('Session listener');
        this.setMediaSession(session);
        // Check if the session has existing media
        if (session.media.length > 0
            && session.media[0].playerState !== chrome.cast.media.PlayerState.IDLE) {
          // If the session has existing media update local info with media details
          this.onMediaDiscovered(session.media[0]);
        }
      },
      /**
       * Handles receiver update events
       */
      receiverListener: function(e) {
        console.log('receiver listener');
        if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
          // If a receiver is available display the button
          this.display = true;
 //         this.$.tooltip.show = true;
          window.setTimeout(function() {
//            this.$.tooltip.show = false;
          }.bind(this), this.tooltipDisplayTime);
        } else {
          // If no receiver is available, hide the button
          this.display = false;
        }
      },
      initSuccess: function(e) {
        console.log('Chromecast init success');
      },
      initFail: function(e) {
        console.log('Chromecast init fail ' +e.code);
      },      
      
      /**
       * Start a casting session
       */
      startCasting: function() {
		  console.log("startCasting IN");
        chrome.cast.requestSession(this.onRequestSessionSuccess.bind(this),
            this.onLaunchError.bind(this));
      },
      /**
       * Stop a casting session
       */
      stopCasting: function() {
        this.castManager.session.stop(this.onStopSuccess.bind(this),
            this.onStopFailure.bind(this));
      },
      /**
       * Loads media onto the Chromecast
       *
       * TODO : queueLoad (queueLoadRequest, successCallback, errorCallback)
       *  TODO : new QueueLoadRequest (items) :: arrayOf [] new QueueItem (mediaInfo)
       * @param media {cast.Media} media content to load
       */
      loadMedia: function(media, autoplay) {
        this.castManager.showSpinner = true;

        var mediaInfo = new chrome.cast.media.MediaInfo(media.url);
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
        mediaInfo.contentType = 'video/mp4';

        mediaInfo.metadata.title = media.title;
        mediaInfo.metadata.subtitle = media.studio;
        mediaInfo.metadata.images = [{'url': media.thumbnailImageUrl}];

        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = autoplay;

        this.castManager.session.loadMedia(request, this.onMediaDiscovered.bind(this),
            this.onMediaError.bind(this));
      },
      /**
       * Called when a new session has been successfully connected
       *
       * @param session {chrome.cast.Session} Chromecast session
       */
      onRequestSessionSuccess: function(session) {
        console.log('Launch success');
        this.setMediaSession(session);  
        //session.queueLoad (queueLoadRequest, successCallback, errorCallback)        
        //this.loadMedia(this.castManager.localMedia, this.autoplay);
      },
      onLaunchError: function(e) {
        console.log('Launch error: ' + JSON.stringify(e));
        this.stopAnimation();
      },
      /**
       * Updates castManager when media is loaded on Chromecast
       *
       * @param media {chrome.cast.media.Media} media loaded on Chromecast
       */
      onMediaDiscovered: function(media) {
        console.log('Media loaded ' +JSON.stringify(media));
        this.castManager.showSpinner = false;

        // Adds a listener for any changes to media
        media.addUpdateListener(this.onCastManagerUpdate.bind(this));
        this.castManager.setCastMedia(media);

        // Sync local media state with the chromecast state
        if (media.playerState === chrome.cast.media.PlayerState.PAUSED) {
          // If media is paused at the beginning
          if (media.currentTime === 0) {
            // If the local media time is not at the beginning and the media matches
            if (this.castManager.localMedia.currentTime !== 0
                && this.castManager.isMediaMatch()
                && this.castManager.hasCastMedia()) {
              // Match time in local media
              this.seek(this.castManager.localMedia.currentTime);
            }
            // If the current local state is play and the user starts casting
            // auto play the content
            if (this.castManager.localMedia.state === cast.Media.STATE.PLAY) {
              this.play();
            }
          } else {
            // If the Chromecast media isn't at the beginning,
            // sync local state with existing video
            this.castManager.seek(media.currentTime, cast.CastManager.SENDER.CHROMECAST);
            this.castManager.pause(cast.CastManager.SENDER.CHROMECAST);
          }
        } else if (media.playerState === chrome.cast.media.PlayerState.PLAYING) {
          // If the current media state is playing send a play event
          this.castManager.seek(media.currentTime, cast.CastManager.SENDER.CHROMECAST);
          this.castManager.play(cast.CastManager.SENDER.CHROMECAST);
        }
      },
      /**
       * Called anytime the media status on Chromecast changes
       */
      onCastManagerUpdate: function(media) {
        console.log('Media changed' + JSON.stringify(this.castManager.castMedia));
      },
      onMediaError: function(e) {
        console.log('Media error: ' + JSON.stringify(e));
      },
      onStopSuccess: function() {
        console.log('Disconnecting succeeded');
      },
      onStopFailure: function(e) {
        console.log('Disconnecting failed: ' + JSON.stringify(e));
      },
      /**
       * Generic on success
       */
      onSuccess: function(e) {
        console.log('Success:' + JSON.stringify(e));
      },
      /**
       * Generic on failure
       */
      onFailure: function(e) {
        console.log('Failure: ' + JSON.stringify(e));
      },
      /**
       * Observes session status and updates the button UI to reflect current session status
       */
      castManagerSessionObserver: function() {
        
        // If a session status exists and if session is connected
        if (this.castManager.session.status
            && this.castManager.session.status === chrome.cast.SessionStatus.CONNECTED) {
          // If it is set casting to true and stop the connecting animation
          this.castManager.isCasting = true;
 //         this.$.tooltip.label = 'Click to disconnect';
          this.stopAnimation();
          console.log('Chromecast session content changed ONE');
        } else {
          // Otherwise casting remains false;
          this.castManager.isCasting = false;
          console.log('Chromecast session content changed END');
 //         this.$.tooltip.label = 'Click to cast videos to your TV';
        }
      },
      /**
       * Handles core signal events for Chromecast
       */
      mediaActionHandler: function(e, data, sender) {
        // If media is loaded on cast and the action sender isn't chromecast
        switch (data.action) {
          case 'seek':
            if (this.isCastActionable(data)) {
              this.castManager.showSpinner = true;
              this.seek(data.currentTime);
              // Clear the timer so it doesn't update during buffering.
              window.clearInterval(this.timerId);
            }
            break;
          case 'play':
            if (this.isCastActionable(data)) {
              this.showSpinner = true;
              this.play();
            } else if (this.castManager.isCasting && data.sender
                != cast.CastManager.SENDER.CHROMECAST) {
              this.showSpinner = true;
              this.loadMedia(this.castManager.localMedia, true);
            }
            break;
          case 'pause':
            if (this.isCastActionable(data)) {
              this.pause();
            }
            break;
          case 'volume':
            if (this.isCastActionable(data)) {
              this.volume(data.volume);
            }
        }
      },
      /**
       * Helper function that returns true if the request is actionable by cast.
       */
      isCastActionable: function(data) {
        return !!((this.castManager.hasCastSession()
        && this.castManager.hasCastMedia()
        && (this.castManager.isMediaMatch()
        && data.sender !== cast.CastManager.SENDER.CHROMECAST))
        || data.sender === cast.CastManager.SENDER.CASTCONTROLLER);
      },
      /**
       * Stores the session data in local Media status and starts observing changes to
       * session status.
       */
      setMediaSession: function(session) {
        this.castManager.session = session;
        Object.observe(this.castManager.session, this.castManagerSessionObserver.bind(this));
        this.castManagerSessionObserver();
      },
      /**
       * Stops the connection animation
       */
      stopAnimation: function() {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
        this.connectingCounter = -1;
      },
      /**
       * Local helper function to play the video on cast.
       */
      play: function() {
        this.castManager.castMedia.play(null, this.onSuccess.bind(this), this.onFailure.bind(this));
      },
      /**
       * Local helper function to seek the video on cast.
       *
       * @param time {number} time in seconds to seek to
       */
      seek: function(time) {
        var request = new chrome.cast.media.SeekRequest();
        request.currentTime = Math.round(time);
        this.castManager.castMedia.seek(request,
            this.onSuccess.bind(this), this.onFailure.bind(this));
      },
      /**
       * Local helper function to pause the video on cast.
       */
      pause: function() {
        this.castManager.castMedia.pause(null,
            this.onSuccess.bind(this), this.onFailure.bind(this));
      },
      /**
       * Local helper to change the volume on cast.
       *
       * @param volume {number} 0-1 defining the volume
       */
      volume: function(volume) {
        var vol = new chrome.cast.Volume(volume, false);
        var request = new chrome.cast.media.VolumeRequest(vol);
        this.castManager.castMedia.setVolume(request, this.onSuccess.bind(this),
            this.onFailure.bind(this));
      },
      /**
       * State observer that updates currentTime when casting and stops the spinner when media is
       * playing
       *
       * @param oldVal {chrome.cast.media.PlayerState} previous player state
       * @param newVal {chrome.cast.media.PlayerState} current player state
       */
//      castPlayerStateObserver: function(oldVal, newVal) {
castPlayerStateObserver: function(newVal, oldVal ) {
	console.log('castPlayerState changed ');
        if (this.castManager.isCasting) {
          if (newVal === chrome.cast.media.PlayerState.PLAYING) {
            this.castManager.showSpinner = false;
            // If the media is playing, set an interval to calculate elapsed time
            if (this.timerId === null) {
              this.timerId = window.setInterval(function() {
                var currTime = new Date();
                if (this.prevTime == null) {
                  this.prevTime = new Date();
                }
                var deltaS = (currTime - this.prevTime) / 1000;
                this.castManager.castMedia.currentTime += deltaS;
                this.prevTime = currTime;
              }.bind(this), 1000);
            }
          } else {
            // Otherwise clear the interval and reset previous time
            window.clearInterval(this.timerId);
            this.timerId = null;
            this.prevTime = null;
          }
        }
      }
    });
  