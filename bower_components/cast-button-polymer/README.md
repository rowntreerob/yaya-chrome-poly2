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

#cast-button-polymer
[Demo](http://googlecast.github.io/cast-button-polymer/demo.html)

This element renders the cast button and manages it's states.  This button uses Polymer for data 
binding and rendering, to find out more about Polymer take a look at the 
[Polymer documentation](https://www.polymer-project.org).

#Overview
`cast-button` requires [`cast-manager`](http://github.com/googlecast/cast-manager-polymer).  It 
uses `cast-manager` properties `cast-available` and 
`connection-status` to determine if a receiver exists and if it should display as connected.

Clicking the button to initiate the cast selection process and the connection animation.

Once a cast connection is established the button is overlayed in blue.

When connected, you can use the `cast-manager` methods to control the casting content.

For a sample of the cast button, take a look at the 
[CastVideos-chrome-material](https://github.com/googlecast/CastVideos-chrome-material) sample.

#Setup
Use [Bower](http://bower.io/) to include the cast-button in your web app.  The following command 
will add the cast-button and it's dependencies to your project.

    bower install --save googlecast/cast-button-polymer

#Integration
The easiest way to integrate is to use one of the already provided elements which contain 
`cast-button` such as `cast-video`.  The instructions below cover a custom integration.  You'll need to 
first include 
[Polymer](https://www.polymer-project.org/).

##Including the element
In your html include the element.

    <link rel="import"
        href="bower_components/cast-button-polymer/cast-button.html">


Add the element to your HTML as a child of `cast-manager` binding the `castAvailable` and 
`connectionStatus` properties.

    <cast-manager app-id="4F8B3483"
                      cast-available="{{castAvailable}}"
                      connection-status="{{connectionStatus}}">
      ...
      <cast-button id="button_cast"
                       cast-available="[[castAvailable]]"
                       connection-status="[[connectionStatus]]"
                       color="black"></cast-button>
    </cast-manager>

##Options

### Size
The element uses SVG to render so it can scale to any size.  To specify a size, define 
`--cast-button-width` and `--cast-button-height`.  If you're defining style in the main document,
 you can use the [`custom-style`](https://www.polymer-project.org/1.0/docs/devguide/styling.html#custom-style) element

    <style>
      cast-button {
        --cast-button-width: 34px;
        --cast-button-height: 25px;
      }
    </style>  

### Color
The available foreground colors are black or white.  Color is defined as a 
property of cast-button.

    <cast-button color="black"></cast-button>
    