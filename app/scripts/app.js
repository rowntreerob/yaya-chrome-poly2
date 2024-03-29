/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
    document.querySelector('body').removeAttribute('unresolved');

    // Ensure the drawer is hidden on desktop/tablet
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    drawerPanel.forceNarrow = true;
    /*global Parse */

    document.getElementById('tbProfile').addEventListener('click', function(e) {
       console.log(e.target.tagName); // logs FOO-Bar
        e.preventDefault();
       var currentUser = Parse.User.current();
        if (currentUser) {
            Parse.User.logOut();
        }
     });
  });

  window.addEventListener('login', function() {
		app.route = 'contact';
		page('/#!/contact');
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };
/*jshint -W117 */
   // Initialize Parse
  Parse.initialize('dDgpCbCGWqIojuPcym19Ov6vEkmBH8Nk90P3qovv',
                   'fZM8Qu34SBChH1wnr0hkkp6MkyRAxlhPaOBWltSb');

  if(Parse.User.current()) {
//	  todoModel.myusername = Parse.User.current().getUsername();
	  page('/#!/contact');
  } else {
	  page('/#!/logon');
	  }

})(document);
