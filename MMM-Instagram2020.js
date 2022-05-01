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
		access_token: '',		// Facebook Instagram Access Token
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
			Log.log(self.name + ': Loading Placeholder');
			var imageLink = document.createElement('div');
			imageLink.id = "MMM-Instagram-image";
			imageLink.innerHTML = "<img src='" + self.data.path + "ig_placeholder.png' width='100%'>";
			imageLink.innerHTML += "<p class='light' style='text-align: center;'>Loading Instagram Feed</p>";
			var now = moment();
			imageLink.innerHTML += "<p class='light xsmall' style='text-align: center;'>"+now.format('MMMM Do YYYY @ HH:mm')+"</p>";
		}
		else if(self.stage === "auth_link"){
			Log.log(self.name + ': Loading Pre Auth Page');
			var imageLink = document.createElement('div');
			imageLink.id = "MMM-Instagram-image";
			imageLink.innerHTML += "<p class='light' style='text-align: center;'>Click <A HREF='"+self.authorise_url+"' target='_new'>HERE</A> to authorise access to your instagram account.</p>";
		}
		else if(self.stage === "show_images"){
			Log.log(self.name + ': Loading Images');
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
		Log.log(self.name + ': sending INSTAGRAM_AUTH notification');
		self.sendSocketNotification("INSTAGRAM_AUTH", null);
	},
	scheduleUpdateInterval: function() {
	        var self = this;
        	Log.info(self.name + ': Scheduled update interval set up to' + self.config.animationSpeed);
	        self.updateDom(self.config.animationSpeed);
		setInterval(function() {
			Log.info(self.name + ': incrementing the activeItem and refreshing');
			self.activeItem++;
			self.updateDom(self.config.animationSpeed);
	        }, this.config.updateInterval);
	},
	// override socketNotificationReceived
	socketNotificationReceived: function(notification, payload) {
		var self = this;
	        Log.log(self.name + ': socketNotificationReceived: ' + notification);
        	if (notification === 'INSTAGRAM_ACCESS_TOKEN') {
		        Log.log(self.name + ': received access_token: ' + payload);
			self.config.access_token = payload;
			if(payload != ""){
				//Token Exisits
				Log.log(self.name + ': Token Exists in accesstoken.cfg');
				self.stage = "load_images";
				Log.log(self.name + ': Loading Images');
                                setTimeout(function (){
                                        self.sendSocketNotification("INSTAGRAM_MEDIA_REFRESH", null);
                                },10);
				Log.log(self.name + ' sending INSTAGRAM_AUTH_REFRESH notification');
				self.sendSocketNotification("INSTAGRAM_AUTH_REFRESH", null);
			}
			else{
				//Token Does Not Exisit
				Log.log(self.name + ': Token Does Not Exist in accesstoken.cfg');
				self.stage = "auth_link";
				self.sendSocketNotification('INSTAGRAM_AUTH_NEW', null);
				self.updateDom(self.config.animationSpeed);
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
				Log.log(self.name + ': Token Does Not Exist in accesstoken.cfg');
				//Auth Code Does Not Exisit
				Log.log(self.name + ': Auth Code Does Not Exist in config.js');
				self.stage = "auth_link";
				self.sendSocketNotification('INSTAGRAM_AUTH_NEW', null);
				self.updateDom(self.config.animationSpeed);
				self.sendSocketNotification('MMM-Instagram2020-CONFIG', this.config);
			}
		}
		else if(notification === 'INSTAGRAM_AUTH_URL'){
			self.stage = "auth_link";
			Log.log(self.name + ': received INSTAGRAM_AUTH_URL: ' + payload);
			self.authorise_url = payload;
			self.updateDom(self.config.animationSpeed);
		}
		else if (notification === 'INSTAGRAM_IMAGE_ARRAY'){
			Log.log(self.name + ': received INSTAGRAM_IMAGE_ARRAY: ' + payload);
			self.images = payload;
			self.stage = "show_images";
            		self.scheduleUpdateInterval();
		}
	}
});
