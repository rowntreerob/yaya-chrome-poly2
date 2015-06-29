(function () {

  /**
   * Default values
   * @type {{action: string, password: string, email: string, password-min-length: number, failed: boolean}}
   */
  var defaults = {
    handler: "#",
    password: "",
    "email-placeholder": "email@site.com",
    email: "",
    "password_min_length": 6,
    failed: false
  };
  /**
   * Utility function for validating email
   * @param {[type]} email [description]
   */
  function isEmail(email) {
return true;
  }

  function isPasswordValid(pwd, pwd_min_length) {
    return pwd.length >= parseInt(pwd_min_length)
  }

  /**
   * Get Attribute from element, if attribute non specified return default value if available, otherwise ""
   * @param  {[type]} element [description]
   * @param  {[type]} att     [description]
   * @return {[type]}         [description]
   */
  function getAttribute(element, att) {
    return element.getAttribute(att) ? element.getAttribute(att) : (typeof defaults[att] !== "undefined" ? defaults[att] : "");
  }

  /**
   * Add class to DOM element
   * @param {[type]} element   [description]
   * @param {[type]} className [description]
   */
  function addClass(element, className) {
    var regex = new RegExp('\\b' + className + '\\b', 'g');
    element.className = element.className.replace(regex, '');
    element.className = element.className + " " + className;
  }

  /**
   * Remove class from DOM element
   * @param  {[type]} element   [description]
   * @param  {[type]} className [description]
   * @return {[type]}           [description]
   */
  function removeClass(element, className) {
    var regex = new RegExp('\\b' + className + '\\b', 'g');
    element.className = element.className.replace(regex, '');
  }

  Polymer({
	  is: "login-form",
    ready: function () {
      var myself = this;

      var email = myself.$.email;
      var password = myself.$.password;
      var submit = myself.$.submit;
      var form = myself.$.form;
      var msg = myself.$.msg;
      var password_min_length = getAttribute(myself, "password_min_length");

      //initializing element
      form.action = getAttribute(myself, "handler");
      password.value = getAttribute(myself, "password");
      if (getAttribute(myself, "failed")) {
        msg.innerHTML = "No user with this username/password";
        msg.style.display = "block";
      }

      //validating email
      email.onkeyup = function (e) {
        if (isEmail(this.value)) {
          removeClass(myself.$.email_status, "invalid");
          addClass(myself.$.email_status, "valid");
        } else {
          removeClass(myself.$.email_status, "valid");
          addClass(myself.$.email_status, "invalid");
        }
      };

      //validating password
      password.onkeyup = function (e) {
        if (isPasswordValid(this.value, password_min_length)) {
          removeClass(myself.$.password_status, "invalid");
          addClass(myself.$.password_status, "valid");
        } else {
          removeClass(myself.$.password_status, "valid");
          addClass(myself.$.password_status, "invalid");
        }
      };

      //onclick
      submit.onclick = function (e) {

	     if(Parse.User.current()) {
			 Parse.User.logOut();
			 return true;}  
         if (isEmail(email.value) && isPasswordValid(password.value, password_min_length)) {
			 parseLogin(email.value, password.value);			 
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
  function parseLogin(user, password) {
		var event;  
		var _user = user;
	    var _pass = password;
	    
		Parse.User.logIn(_user, _pass).then(function(user) {	  
			console.log("created new user ");
		//fire js event for  index to change sections
			if (document.createEvent) {
				event = document.createEvent("HTMLEvents");
				event.initEvent("login", true, true);
			  } else {
				event = document.createEventObject();
				event.eventType = "login";
			  }
			event.eventName = "login";
			if (document.createEvent) {
				form.dispatchEvent(event);
			} else {
				form.fireEvent("on" + event.eventType, event);
			}
		//end-of
			return true;
	
//		myself.$.form.hide();
//		return newuser;
		}, function(error) {
//			 self.$(".section .error").html(error.message).show();
			console.log("DNF user " +error.message);
//			return null;
		});	    	  
	  }      
    }
  });
}())
