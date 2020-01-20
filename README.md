# MMM-Instagram2020
This is a module for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) for displaying your Instagram photos and comments on your MagicMirror2.
It makes use of the new Facebook Instagram Graph API.

![Example Module Loading Image](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Example1.png)
![Example Module Image](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Example2.png)

### Prerequisites
This module requires a Facebook Developer App in "Development" mode.
[This Getting Started guide](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started) from Facebook will show you how to setup the App for instagram access.
From the app settings you will need:
1. client_id
2. client_secret
3. redirect_uri

### Installing
1. Navigate to the `modules` folder and execute `git clone https://github.com/AlexanderSalter/MMM-Instagram2020.git`. A new folder with the name 'MMM-Instagram2020 will be created, navigate into it.
2. Execute `npm install` to install the node dependencies.
3. Confiugre as per below.
4. Follow the Authorisation Process.

### Configuration

|Option|Description|
|---|---|
|`client_id`|Facebook Instagram App ID required for the Facebook Instagram APP. <br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`client_secret`|Client Secret required for the Facebook Instagram APP.<br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`redirect_uri`|OAuth Redirect URIs required for the Facebook Instagram APP.<br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`auth_code`|Used to input a temporary authorisation code as part of the authorisation process<br><br>**Type:** `string`|
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
  redirect_uri: '<YOUR FACEBOOK INSTAGRAM APP REDIRECT URL', // Facebook Instagram App redirect_uri
  auth_code: '', // Temporary authorisation code as part of the Facebook Instagram Authorisation Process
  animationSpeed: 1000,
  updateInterval: 30000,
}
```

### Authorisation Process
1. Ensure that client_id, client_secret and redirect_uri are all configured in config.js and that they match your settings in the Facebook Develloper App.
2. Ensure the auth_code configuration varibale is set to nothing or ''.
3. Ensure the `accesstoken.cfg` file does not contain an access token and is completely blank.
4. Start MagicMirror2 and wait for the authorisation link to show, you will need to either VNC into your MagicMirror2 or access the MagicMirror2 interface remotely 'http://magic_mirror_ip:8080/'

![Image of Authorisation Process Step 4](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Auth%20Step%204.png)

5. Click the Authorise Button and the form will send you to your redirect_uri and give you an auth_code in the url.

![Image of Authorisation Process Step 5](https://github.com/AlexanderSalter/MMM-Instagram2020/blob/master/readme_images/Auth%20Step%205.png)

6. DONT PANIC! If the url contains a string like ?code=ABCDE...........123SDG0129#_ all is good.

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
- [ ] redirect_uri support and instructions as required inbound access from internet.
- [ ] video support
- [ ] automated authrisation (not sure if this is possible wiht the new API)
- [ ] investigate possible use of the `?__a=1`
- [ ] investigate scraping public profiles to make the process simpler [ref ](https://dev.to/teroauralinna/how-to-fetch-your-public-photos-from-instagram-without-the-api-3m50)


# Acknowledgments
* [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
* [Dimitrios Kapsalis](https://github.com/kapsolas) for creating the original [MMM-Instagram](https://github.com/kapsolas/MMM-Instagram) module that was used as guidance in creating this module.
* [@bigmanstudios.co.uk](https://www.instagram.com/bigmanstudios.co.uk/) for the 28mm wargaming and hobby content.
