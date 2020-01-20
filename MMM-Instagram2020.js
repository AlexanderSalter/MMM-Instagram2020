/* Magic Mirror
 * Module: MMM-Instagram2020
 *
 * By Alexander Salter
 * MIT Licensed.
 */


Module.register("MMM-Instagram2020",{
	// Default module config.
	defaults: {
		format: 'json',
        lang: 'en-us',
		client_id: '',			// Facebook Instagram App ID
		client_secret: '',		// Facebook Instagram App Secret 
		redirect_uri: '',		// Facebook Instagram App redirect_uri
		auth_code: '',
		access_token: '',	//
		animationSpeed: 1000,	//1 second
        updateInterval: 10000,	// 10 seconds
	},
	
	// Start Module
	start: function() {
		var self = this;
		Log.log('Starting module: ' + this.name);
		self.stage = "load";
		self.images = {};
		self.authorise_url = '';
		self.activeItem = 0;
		self.sendSocketNotification('MMM-Instagram2020-CONFIG', this.config);
		setTimeout(function (){
			self.doAuthentication();
		},10);
	},	

	// Override dom generator.
	getDom: function() {
		var self = this;
		var wrapper = document.createElement("div");
		wrapper.classList.add("small");
		var imageDisplay = document.createElement('div');
		
		if(self.stage === "load" || self.stage === "load_images"){
			Log.log("Loading Placeholder");
			var imageLink = document.createElement('div');
			imageLink.id = "MMM-Instagram-image";
			imageLink.innerHTML = "<img src='" + self.data.path + "ig_placeholder.png' width='100%'>";
			imageLink.innerHTML += "<p class='light' style='text-align: center;'>Loading Instagram Feed</p>";
			var now = moment();
			imageLink.innerHTML += "<p class='light xsmall' style='text-align: center;'>"+now.format('MMMM Do YYYY @ hh:mm')+"</p>";
		}
		else if(self.stage === "auth_link"){
			Log.log("Loading Pre Auth Page");
			var imageLink = document.createElement('div');
			imageLink.id = "MMM-Instagram-image";
			imageLink.innerHTML += "<p class='light' style='text-align: center;'>Click <A HREF='"+self.authorise_url+"' target='_new'>HERE</A> to authorise access to your instagram account.</p>";
		}
		else if(self.stage === "show_images"){
			Log.log("Loading Images");
			if (self.activeItem >= self.images.photo.length) {
				self.activeItem = 0;
			}
			var tempimage = self.images.photo[self.activeItem];
			var imageLink = document.createElement('div');
			imageLink.id = "MMM-Instagram-image";
			imageLink.innerHTML = "<img src='" + tempimage.photolink + "' width='100%'>";
			imageLink.innerHTML += "<p class='light' style='text-align: center;'>"+tempimage.caption+"</p>";
			imageLink.innerHTML += "<p class='light xsmall' style='text-align: center;'>"+tempimage.timestamp+"</p>";
		}
		imageDisplay.appendChild(imageLink);
        wrapper.appendChild(imageDisplay);
        return wrapper;
	},
	
	getStyles: function() {
        return ['instagram.css', 'font-awesome.css'];
    },
	
	doAuthentication: function() {
		var self = this;
		Log.log(self.name + ' sending INSTAGRAM_AUTH notification');
		self.sendSocketNotification("INSTAGRAM_AUTH", null);
	},
	 
	scheduleUpdateInterval: function() {
        var self = this;
        Log.info("Scheduled update interval set up...");
        self.updateDom(self.config.animationSpeed);
        setInterval(function() {
            Log.info("incrementing the activeItem and refreshing");
            self.activeItem++;
            self.updateDom(self.config.animationSpeed);
        }, this.config.updateInterval);
    },

	// override socketNotificationReceived
    socketNotificationReceived: function(notification, payload) {
		var self = this;
        Log.log('socketNotificationReceived: ' + notification);
        if (notification === 'INSTAGRAM_ACCESS_TOKEN')
        {
            Log.log('received INSTAGRAM_ACCESS_TOKEN: ' + payload);
			self.config.access_token = payload;
			if(payload != ""){
				//Token Exisits
				Log.log('Token Exists in accesstoken.cfg');
				self.stage = "load_images";
				self.config.access_token = payload;
				Log.log(self.name + ' sending INSTAGRAM_AUTH_REFRESH notification');
				self.sendSocketNotification("INSTAGRAM_AUTH_REFRESH", null);
			}
			else{
				//Token Does Not Exisit
				Log.log('Token Does Not Exist in accesstoken.cfg');
				if(self.config.auth_code != ""){
					//Auth Code Exisits
					Log.log('Auth Code Exists in config.js');
					self.stage = "auth_exchange";
					self.sendSocketNotification('INSTAGRAM_AUTH_EXCHANGE', null);
				}
				else{
					//Auth Code Does Not Exisit
					Log.log('Auth Code Does Not Exist in config.js');
					self.stage = "auth_link";
					self.sendSocketNotification('INSTAGRAM_AUTH_NEW', null);
					self.updateDom(self.config.animationSpeed);
				}
				self.sendSocketNotification('MMM-Instagram2020-CONFIG', this.config);
			}
        }
		else if (notification === 'INSTAGRAM_ACCESS_TOKEN_NEW'){
			Log.log('received INSTAGRAM_ACCESS_TOKEN_NEW: ' + payload);
			if(payload != ""){
				//Token Exisits
				Log.log('Token Exists in accesstoken.cfg');
				self.stage = "load_images";
				self.config.access_token = payload;
				setTimeout(function (){
					self.sendSocketNotification("INSTAGRAM_MEDIA_REFRESH", null);
				},10);
			}
			else{
				//Token Does Not Exisit
				Log.log('Token Does Not Exist in accesstoken.cfg');
				if(self.config.auth_code != ""){
					//Auth Code Exisits
					Log.log('Auth Code Exists in config.js');
					self.stage = "auth_exchange";
					self.sendSocketNotification('INSTAGRAM_AUTH_EXCHANGE', null);
				}
				else{
					//Auth Code Does Not Exisit
					Log.log('Auth Code Does Not Exist in config.js');
					self.stage = "auth_link";
					self.sendSocketNotification('INSTAGRAM_AUTH_NEW', null);
					self.updateDom(self.config.animationSpeed);
				}
				self.sendSocketNotification('MMM-Instagram2020-CONFIG', this.config);
			}
		}
		else if(notification === 'INSTAGRAM_AUTH_URL'){
			Log.log('received INSTAGRAM_AUTH_URL: ' + payload);
			self.authorise_url = payload;
			self.updateDom(self.config.animationSpeed);
		}
		else if (notification === 'INSTAGRAM_IMAGE_ARRAY'){
			Log.log('received INSTAGRAM_IMAGE_ARRAY: ' + payload);
			self.images = payload;
			self.stage = "show_images";
            self.scheduleUpdateInterval();
		}
    }
});