# MMM-Instagram2020
This is a module for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) for displaying your Instagram photos and comments on your MagicMirror2.
It makes use of the new Facebook Instagram Graph API.

![Example Module Loading Image](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Example1.png)
![Example Module Image](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Example2.png)

## Prerequisites

### A) This module requires that Magic Mirror is setup for https/ssl access instead of the default http.

### B) This module requires a Facebook Developer App in "Development" mode. 

[This Getting Started guide](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started) from Facebook will show you how to setup the App for instagram access.
Just follow steps 1, 2 and 3 to get the variables you need.
- Valid OAuth Redirect URI would be "https://[IP Of Your Magic Mirror]:8080/MMM-Instagram2020/auth"
- Deauthorize Callback URL would be "https://[IP Of Your Magic Mirror]:8080/MMM-Instagram2020/deauth"
- Data Deletion Requests URL would be "https://[IP Of Your Magic Mirror]:8080/MMM-Instagram2020/datadelete"

From the app settings you will need:
- client_id > This will be a number generated for you
- client_secret > This will be a secret generated for you
- redirect_uri > This should be set to "https://[IP Of Your Magic Mirror]:8080/MMM-Instagram2020/auth" (Same as the Valid OAuth Redirect URI)
  
## Installation
### Setup Magic Mirror for HTTPS/SSL access.

Install openssl:
```
sudo apt-get install openssl
```

Create Certs:
```
cd ~/MagicMirror/config
mkdir ssl
openssl req -new -x509 -days 365 -nodes -out ./ssl/magicmirror.pem -keyout ./ssl/magicmirror.key
```

Update Config File:
```
nano config.js
```

Update the following:
```
useHttps: true,                                                         // Support HTTPS or not, default "false" will use HTTP
httpsPrivateKey: "/home/pi/MagicMirror/config/ssl/magicmirror.key",     // HTTPS private key path, only require when useHttps is true
httpsCertificate: "/home/pi/MagicMirror/config/ssl/magicmirror.pem",    // HTTPS Certificate path, only require when useHttps is true
```
  
### Install MMM-Instagram2020
1. Navigate to the `modules` folder and execute `git clone https://github.com/AlexanderSalter/MMM-Instagram2020.git`. A new folder with the name 'MMM-Instagram2020 will be created, navigate into it.
2. Execute `npm install` to install the node dependencies.
3. Confiugre as per below.
4. Follow the Authorisation Process.

## Configuration

|Option|Description|
|---|---|
|`client_id`|Facebook Instagram App ID required for the Facebook Instagram APP. <br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`client_secret`|Client Secret required for the Facebook Instagram APP.<br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`redirect_uri`|Valid OAuth Redirect URI required for the Facebook Instagram APP.<BR><BR>This should be set to https://[IP Of Your Magic Mirror]:8080/MMM-Instagram2020/auth<br><br>**Type:** `string`<br>This value is **REQUIRED** and neets HTTPS to be active on your Magic Mirror Installation|
|`animationSpeed`|How long for the animation to last when moving to the next image.<br><br>**Type:** `integer`|
|`updateInterval`|How long before refreshing image.<br><br>**Type:** `integer`|
Example `config.js` entry:
```
{
module: 'MMM-Instagram2020',
position: 'top_left',
header: 'MMM-Instagram2020',
config: {
  client_id: '<YOUR FACBOOK INSTAGRAM APP ID>', // Facebook Instagram App ID
  client_secret: '<YOUR FACBOOK INSTAGRAM APP SECRET>', // Facebook Instagram App Secret
  redirect_uri: '<YOUR FACEBOOK INSTAGRAM APP OAUTH REDIRECT URL', // Facebook Instagram App oauth_redirect_uri
  animationSpeed: 1000,
  updateInterval: 30000,
}}
```

## Authorisation Process
1. Ensure that the Magic Mirror installation is https/ssl enabled.
2. Ensure that client_id, client_secret and redirect_uri are all configured in config.js and that they match your settings in the Facebook Develloper App.
4. Start MagicMirror2 and wait for the authorisation link to show, you will need to either VNC into your MagicMirror2 or access the MagicMirror2 interface remotely 'https://[IP Of Your Magic Mirror]:8080/'
5. Look for the Message defined below and click the "Here" link

![Image of Authorisation Process Step 4](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Auth%20Step%204.png)

```diff
+ Note: The mouse pointer may be hidden, just right-click to locate your pointer.
```

6. Click the Authorise Button and the form will send you to your redirect_uri and give you an auth_code in the url.

![Image of Authorisation Process Step 5](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Auth%20Step%205.png)

7. DONT PANIC! If the url contains a string like ?code=ABCDE...........123SDG0129#_ all is good.

![Image of Authorisation Process Step 6](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Auth%20Step6.png)

7. Copy the auth_code from the url, removing the "#_" at the end
```
?code= <<<auth_code>>> #_
```
8. Add the auth_code to your config.js file.
9. Restart MagicMirror2 and enjoy your instagram feed.

![Image of Module after Authorisation Process is complete](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Example.png)

Note: The authorisation process uses a key stored in `accesstoken.cfg` under the module directory.
This allows access to the account for 60 days.
There is a mechanism in place to renew the key every time MagicMirror2 is restarted.
If the access token gets to old, just repeat the authorisation process.

# License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# To Do
- [ ] Tidy up the code 
- [ ] Comment the code more clearly
- [ ] Add display config options to hide comments and time
- [ ] redirect_uri support and instructions, required inbound access from internet to communicate
- [ ] video support
- [ ] automated authrisation (not sure if this is possible with the new API)
- [ ] investigate possible use of the `?__a=1`
- [ ] investigate scraping public profiles to make the process simpler [ref ](https://dev.to/teroauralinna/how-to-fetch-your-public-photos-from-instagram-without-the-api-3m50)


# Acknowledgments
* [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
* [Dimitrios Kapsalis](https://github.com/kapsolas) for creating the original [MMM-Instagram](https://github.com/kapsolas/MMM-Instagram) module that was used as guidance in creating this module.
* [@bigmanstudios.co.uk](https://www.instagram.com/bigmanstudios.co.uk/) for the 28mm wargaming and hobby content.
