# MMM-Instagram2020
This a module for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) for displaying your Instagram photos and comments on your Magic Mirror.
It makes use of the new Facebook Instagram Graph API.

### Prerequisites

### Installing
1. Navigate to the `modules` folder and execute `git clone https://github.com/kapsolas/MMM-Instagram.git`. A new folder with the name 'MMM-Instagram2020 will be created, navigate into it.
2. Execute `npm install` to install the node dependencies.

### Configuration

|Option|Description|
|---|---|
|`client_id`|Facebook Instagram App ID required for the Facebook Instagram APP. <br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`client_secret`|Client Secret required for the Facebook Instagram APP.<br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`redirect_uri`|OAuth Redirect URIs required for the Facebook Instagram APP.<br><br>**Type:** `string`<br>This value is **REQUIRED**|
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
  updateInterval: 30000,
}
```

# License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# Acknowledgments
[Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
[Dimitrios Kapsalis](https://github.com/kapsolas) for creating the original [MMM-Instagram](https://github.com/kapsolas/MMM-Instagram) module that was used as guidance in creating this module.

