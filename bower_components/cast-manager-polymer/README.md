Copyright 2014 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# cast-manager-polymer
The `cast-manager` Polymer element is the controller for the other Cast Polymer elements.  It 
exposes a number of properties which define the current state, it also handles events and 
routes them to the subscribed elements.

The goal of `cast-manager` is to provide a simpler wrapper for the Cast SDK and local media 
playback.  It handles all of Cast integration and state management for you and simplifies interaction down to a 
few calls.  Instead of integration taking weeks it can take a few minutes.

[Here](http://googlecast.github.io/CastVideos-chrome-material/) is a demo of `cast-manager` being 
used along with the [source](https://github.com/googlecast/CastVideos-chrome-material).

`cast-manager` can be used with any other Polymer element.  Several are provided to use out of 
the box:

* [cast-video](https://github.com/googlecast/cast-video-polymer) - Handles displaying and 
controlling video
* [cast-controller-bar](https://github.com/googlecast/cast-controller-bar-polymer) - Controller for
 the
 Chromecast when standard video controls aren't on screen.  Also displays the queue UI.
* [cast-dialog](https://github.com/googlecast/cast-dialog-polymer) - Notifies users that the page
 is cast enabled.  Also handles the upcoming video notification and count down.

You can find a codelab for using all of the elements together [here](http://www.code-labs.io/codelabs/polymer-cast-elements/index.html?index=..%2F..%2Fpolymer-summit&viewga=UA-39334307-12#0).

You can find an overview of how to create a Polymer element [here](https://www.polymer-project.org/).

## Setup
This section covers including the `cast-manager` element in your project

###Prerequisites

* [Bower](http://bower.io/)

### Installation
In your project directory install `cast-manager` using bower.  You may need to first `bower init`.

    bower install --save googlecast/cast-manager-polymer
    
## Integration
This section covers adding the `cast-manager` element to your page 

### Include dependencies
As part of head, you want to include Polymer JS and `cast-manager`.

    <script src="bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>
    
    <link rel="import" href="bower_components/cast-manager-polymer/cast-manager.html">

### Define elements    
If you're defining this outside of a Polymer element, you'll need to wrap `cast-manager` in an 
auto binding template in the `<body>` to leverage property binding.

    <template id="t" is="dom-bind">
      ...
    </template>
    
Add the `cast-manager` element as a child of the auto binding template

    <template id="t" is="dom-bind">
      <cast-manager ...>
      </cast-manager>
    </template>

### Get a reference to `cast-manager`
If you've used an auto binding template you'll need to wait until the `cast-manager` element has 
been added to the dom.  The auto binding template fires a `dom-change` event that you can listen 
for.

    var t = document.querySelector('#t');
    t.addEventListener('dom-change', function () {
      castManager = document.querySelector('cast-manager');
    });
      
### Define `app-id`
The `app-id` is an attribute of `cast-manager`.  You need to specify the `app-id` of your 
receiver app.  A demo receiver `app-id` is 4F8B3483. To create your own appId refer to the Cast 
Registration [documentation](https://developers.google.com/cast/docs/registration).

### Define bindable attributes
`cast-manager` provides a number of properties to bind to.  You can choose to expose the properties
your app needs.  The sample exposes the following:

    <cast-manager app-id="4F8B3483"
                  cast-available="{{castAvailable}}"
                  connection-status="{{connectionStatus}}"
                  local-media="{{localMedia}}"
                  queue="{{queue}}"
                  volume="{{volume}}"
                  has-cast-media="{{hasCastMedia}}"
                  is-queue-shown="{{isQueueShown}}"
                  cast-device-name="{{castDeviceName}}"
                  current-time="{{currentTime}}"
                  is-fullscreen="{{isFullscreen}}"
                  show-spinner="{{showSpinner}}"
                  next-queue-media-item="{{nextQueueMediaItem}}"
                  countdown-to-next-media-item="{{countdownToNextMediaItem}}">
    </cast-manager>
    
Definitions for each of the properties can be found in `cast-manager.html`.

### Loading video
`cast-manager` uses `cast.MediaItem` to represent media locally.  Details on the object can be 
found in `media-item.html`.
 It manages conversion between the local `cast.MediaItem` and the cast `chrome.cast.media
 .QueueItem` using helper methods `_castMediaToLocalMedia` and `_localMediaToCastMedia`.  
 `cast-manager` provides a few ways to load media and provides a single call for both local 
 playback and cast playback.

#### Single Video 
There are two ways to load a single video.  It's recommended to use the `cast-video` element for 
playback since it simplifies integration to a few steps.

##### Method One: setLocalMedia
Get a reference to the `cast-manager`

    var castManager = document.querySelector('cast-manager');
    
Use the `setLocalMedia` and pass in a `cast.MediaItem` as the parameter.
    
    castManager.setLocalMedia(media);
    
##### Method Two: `cast-video` src
When using `cast-video` you can load an element when defining the attributes of `cast-video`.

    <cast-video id="video"
        local-media="{{localMedia}}"
        volume="{{volume}}"
        current-time="{{currentTime}}"
        is-fullscreen="{{isFullscreen}}"
        queue="[[queue]]"
        cast-available="[[castAvailable]]"
        connection-status="[[connectionStatus]]"
        show-spinner="[[showSpinner]]"
        cast-device-name="[[castDeviceName]]"
        src="[VIDEO_URL]"></cast-video>
    </cast-video>

#### Queue
Loading a queue is similar to loading a single video method one.  You'll need to get a reference 
to `cast-video` and call `addItemsToQueue` with an array of `cast.MediaItem`s.

    castManager.addItemsToQueue(mediaItems);

### Playback control
Most playback controls are handled by the elements.  They fire events up to `cast-manager` which 
then route the events to subscribed elements.

If you want to handle playback control externally, you first need to get a reference to 
`cast-manager`.  Then call one of the playback control methods such as `play`, `pause`, `seek` or
 `setVolume`.
 
    var castManager = document.querySelector('cast-manager'); 
    castManager.play();
    castManager.pause();
    castManager.seek(10); // Time in seconds to seek to from the beginning
    castManager.volume(1); // Volume from 0 - 1

## Browser Support
Cast support
* Chrome

The elements will work in browsers that support [Polymer](https://www.polymer-project.org/1.0/resources/compatibility.html) with out cast functionality.
* Firefox
* IE 10+
* Safari 8+