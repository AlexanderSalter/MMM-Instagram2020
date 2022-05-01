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
var url = require("url");

module.exports = NodeHelper.create({
	// subclass start method.
	start: function() {
		var self = this;
	        console.log("Starting node_helper for module [" + self.name + "]");
		self.config = new Array();
		self.AccessTokenFile = self.path + "/accesstoken.cfg";
		self.readAccessToken();
		this.createRoutes();
	},
	// subclass socketNotificationReceived
	socketNotificationReceived: function(notification, payload){
		var self = this;
	        console.log("=========== notification received: " + notification);
	        if (notification === 'MMM-Instagram2020-CONFIG') {
			console.log("MMM-Instagram2020 : Reading Config");
			 self.config = payload;
		}
	        else if (notification === 'INSTAGRAM_AUTH') {
			self.readAccessToken();
	        }
		else if (notification === 'INSTAGRAM_AUTH_NEW') {
			self.doNewAuthentication();           
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
		var api_url = 'https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp&access_token=' +  self.config.access_token;
		request({url: api_url, method: 'GET'}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
	        	        // get our authentication token from the response
				var items = JSON.parse(body).data;
				var images = {};
		                images.photo = new Array();
				for (var i in items) {
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
				//console.log(images);
				self.sendSocketNotification('INSTAGRAM_IMAGE_ARRAY', images);
			}
		        else {
		                console.log("MMM-Instagram2020 : Image Get Error: " + response.statusCode);
	        	}
	        });
	},
	doRefreshAuthentication: function() {
        var self = this;
		var api_url = 'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + self.config.access_token;
		request({url: api_url, method: 'GET'}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
		                // get our authentication token from the response
                		var response_values = JSON.parse(body);
				console.log("MMM-Instagram2020 : Refreshed access_token: " + response_values['access_token']);
				self.config.access_token = response_values['access_token'];
				self.writeAccessToken(self.config.access_token);
				self.sendSocketNotification("INSTAGRAM_ACCESS_TOKEN_NEW", self.config.access_token);
			}
			else if (!error && response.statusCode == 400) {
				console.log("MMM-Instagram2020 : Refresh access_token Error: " + response.statusCode);
				console.log(body);
				console.log("MMM-Instagram2020 : Resetting authentication");
				self.doNewAuthentication();
			}
			else {
		                console.log("MMM-Instagram2020 : Refresh access_token Error: " + response.statusCode);
				console.log("MMM-Instagram2020 : Resetting authentication");
                                self.doNewAuthentication();
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
		console.log("MMM-Instagram2020 : Access Token Request Url" + api_url);
		console.log("MMM-Instagram2020 : Access Token details" + form_array);
		request({url: api_url, method: 'POST', form: form_array}, function(error, response, body) {
		        if (!error && response.statusCode == 200) {
		                // get our authentication token from the response
		                var response_values = JSON.parse(body);
		                console.log("MMM-Instagram2020 : Recieved new  access_token:" + response_values['access_token']);
				var api_url = 'https://graph.instagram.com/access_token';
				api_url += '?grant_type=ig_exchange_token';
				api_url += '&client_secret='+self.config.client_secret;
				api_url += '&access_token='+response_values['access_token'];
				request({url: api_url, method: 'GET'}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						// get our authentication token from the response
						var response_values = JSON.parse(body);
						console.log("MMM-Instagram2020 : Error getting new access_token:" + body);
						self.config.access_token = response_values['access_token'];
						console.log(self.config.access_token);
						self.writeAccessToken(self.config.access_token);
						self.sendSocketNotification("INSTAGRAM_ACCESS_TOKEN_NEW", self.config.access_token);
					}
					else if (!error && response.statusCode == 400) {
						console.log("MMM-Instagram2020 : Error getting new access_token: " + response.statusCode);
						console.log(body);
						console.log("MMM-Instagram2020 : Resetting authentication");
		                                self.doNewAuthentication();
					}
					else {
						console.log("MMM-Instagram2020 : Error getting new access_token: " + response.statusCode);
						console.log("MMM-Instagram2020 : Resetting authentication");
		                                self.doNewAuthentication();
					}
				});
			}
			else if (!error && response.statusCode == 400) {
				console.log("MMM-Instagram2020 : Auth Exchange Error: " + response.statusCode);
				console.log(body);
			}
			else {
	                	console.log("MMM-Instagram2020 : Auth Exchange Error: " + response.statusCode);
	        	}
	        });
	},
	doNewAuthentication: function() {
		var self = this;
		var api_url = 'https://api.instagram.com/oauth/authorize';
		console.log("MMM-Instagram2020 : Creating OAuth URL for Instagram");
		api_url += '?client_id='+self.config.client_id;
		api_url += '&redirect_uri='+self.config.redirect_uri;
		api_url += '&scope=user_profile,user_media';
		api_url += '&response_type=code';
		self.sendSocketNotification('INSTAGRAM_AUTH_URL', api_url);
	},
	readAccessToken: function(){
		var self = this;
		console.log("MMM-Instagram2020 : Reading accesstoken.cfg");
		fs.readFile(this.AccessTokenFile, "UTF8", function (err, data) {
			if (err) throw err;
			self.config.access_token = data;
			console.log("MMM-Instagram2020 : Read accesstoken.cfg: "+self.config.access_token);
			self.sendSocketNotification("INSTAGRAM_ACCESS_TOKEN", self.config.access_token);
		});
	},
	writeAccessToken: function(data){
		var self = this;
		console.log("MMM-Instagram2020 : Writing accesstoken.cfg");
		fs.writeFile(this.AccessTokenFile, data, function (err) {
			if (err) throw err;
			console.log("MMM-Instagram2020 : Wrote accesstoken.cfg: "+data);
		});
	},
	createRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-Instagram2020/auth", function(req, res) {
			var query = url.parse(req.url, true).query;
			if(query.code != ""){
				//Recieved Auth Code
				console.log("MMM-Instagram2020 : Auth Code Recieved:" + query.code);
				self.config.auth_code = query.code;
				console.log("MMM-Instagram2020 : Exchange Auth Code for Short Lived Tken:");
				self.doAuthExchange();
				res.send("MMM-Instagram2020 : Auth Code Received: " + query.code + "<BR><BR>You can Now close this window.");
			}
			else{
				console.log("No Auth Code Returned");
				res.send("MMM-Instagram2020 : Auth Code Not Received!");
			}
		});
	},
 });
