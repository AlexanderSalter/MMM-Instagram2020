/* Magic Mirror
 * Module: MMM-Instagram2020
 *
 * By Alexander Salter
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var fs = require('fs');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({
    // subclass start method.
    start: function() {
		var self = this;
        console.log("Starting node_helper for module [" + self.name + "]");
		self.access_token = 'not set';
		self.config = new Array();
		self.AccessTokenFile = self.path + "/accesstoken.cfg";
		self.readAccessToken();
    },
    
    // subclass socketNotificationReceived
    socketNotificationReceived: function(notification, payload){
		var self = this;
        console.log("=========== notification received: " + notification);
        if (notification === 'MMM-Instagram2020-CONFIG') {
			//Get the config.
			 self.config = payload;
		}
        else if (notification === 'INSTAGRAM_AUTH') {
			//Get the auth code.
			self.sendSocketNotification("INSTAGRAM_ACCESS_TOKEN", self.access_token);            
        }
		else if (notification === 'INSTAGRAM_AUTH_NEW') {
			//No Temp Auth Code In Config so Show new auth link.
			self.doNewAuthentication();           
        }
		else if (notification === 'INSTAGRAM_AUTH_EXCHANGE') {
			self.doAuthExchange();
		}
		else if (notification === 'INSTAGRAM_AUTH_REFRESH') {
			self.doRefreshAuthentication();          
        }
		else if (notification === 'INSTAGRAM_MEDIA_REFRESH') {
			self.getImages();
		}
    },
	
	getImages() {
		var self = this;
		var api_url = 'https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp&access_token=' +  self.access_token;
		request({url: api_url, method: 'GET'}, function(error, response, body) 
        {
            if (!error && response.statusCode == 200) 
            {
                // get our authentication token from the response
				var items = JSON.parse(body).data;
				
				var images = {};
                images.photo = new Array();
				
				for (var i in items)
                {
					var id = items[i].id;
					var media_type = items[i].media_type;
					if (media_type == "VIDEO"){
						var media_url = items[i].thumbnail_url;
					}
					else{
						var media_url = items[i].media_url;
					}
					var caption = items[i].caption;
					var timestamp = moment(items[i].timestamp);
					
					images.photo.push( {
                        "type" : media_type,
                        "photolink" : media_url,
						"caption" : caption,
						"timestamp" : timestamp.format('MMMM Do YYYY @ HH:mm'),
                    });
				}
				console.log(images);
				self.sendSocketNotification('INSTAGRAM_IMAGE_ARRAY', images);
            }
            else
            {
                console.log("MMM-Instagram2020 Helper Image Get Error: " + response.statusCode);
            }
        });
	},
	
	
	doRefreshAuthentication: function() {
        var self = this;
		var api_url = 'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + self.access_token;
		request({url: api_url, method: 'GET'}, function(error, response, body) 
        {
            if (!error && response.statusCode == 200) 
            {
                // get our authentication token from the response
                var response_values = JSON.parse(body);
				console.log(response_values['access_token']); 
				self.access_token = response_values['access_token'];
				self.writeAccessToken(self.access_token);
				self.sendSocketNotification("INSTAGRAM_ACCESS_TOKEN_NEW", self.access_token);  				
            }
			else if (!error && response.statusCode == 400) 
			{
				console.log("MMM-Instagram2020 Helper Refresh Auth Token Error: " + response.statusCode);
				console.log(body);
				
			}
            else
            {
                console.log("MMM-Instagram2020 Helper Refresh Auth Token Error: " + response.statusCode);
            }
        });
    },
	
	doAuthExchange: function() {
		var self = this;
		var api_url = 'https://api.instagram.com/oauth/access_token';
		var form_array = [];
		form_array['client_id']=self.config.client_id;
		form_array['client_secret']=self.config.client_secret;
		form_array['grant_type']='authorization_code';
		form_array['redirect_uri']=self.config.redirect_uri;
		form_array['code']=self.config.auth_code;
		console.log(api_url);
		console.log(form_array);
		request({url: api_url, method: 'POST', form: form_array}, function(error, response, body) 
        {
            if (!error && response.statusCode == 200) 
            {
                // get our authentication token from the response
                var response_values = JSON.parse(body);
                console.log(response_values['access_token']);
				var api_url = 'https://graph.instagram.com/access_token';
				api_url += '?grant_type=ig_exchange_token';
				api_url += '&client_secret='+self.config.client_secret;
				api_url += '&access_token='+response_values['access_token'];
				request({url: api_url, method: 'GET'}, function(error, response, body) {
					if (!error && response.statusCode == 200) 
					{
						// get our authentication token from the response
						var response_values = JSON.parse(body);
						console.log(body);
						self.access_token = response_values['access_token'];
						console.log(self.access_token);  
						self.writeAccessToken(self.access_token);
						self.sendSocketNotification("INSTAGRAM_ACCESS_TOKEN_NEW", self.access_token);						
					}
					else if (!error && response.statusCode == 400) 
					{
						console.log("MMM-Instagram2020 Helper Auth Extend Error: " + response.statusCode);
						console.log(body);
						
					}
					else
					{
						console.log("MMM-Instagram2020 Helper Auth Extend Error: " + response.statusCode);
					}
				});
            }
			else if (!error && response.statusCode == 400) 
			{
				console.log("MMM-Instagram2020 Helper Auth Exchange Error: " + response.statusCode);
				console.log(body);				
			}
            else
            {
                console.log("MMM-Instagram2020 Helper Auth Exchange Error: " + response.statusCode);
            }
        });
	},
	
	doNewAuthentication: function() {
		var self = this;
		var api_url = 'https://api.instagram.com/oauth/authorize';
		api_url += '?client_id='+self.config.client_id;
		api_url += '&redirect_uri='+self.config.redirect_uri;
		api_url += '&scope=user_profile,user_media';
		api_url += '&response_type=code';
		self.sendSocketNotification('INSTAGRAM_AUTH_URL', api_url);
	},
	
	readAccessToken: function(){
		var self = this;
		fs.readFile(this.AccessTokenFile, "UTF8", function (err, data) {
			if (err) throw err;
			self.access_token = data;
			//console.log(self.access_token);
		});
	},
	
	writeAccessToken: function(data){
		var self = this;
		fs.writeFile(this.AccessTokenFile, data, function (err) {
			if (err) throw err;
		});
	},
	
 });