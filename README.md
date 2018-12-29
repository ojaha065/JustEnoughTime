# Just Enough Time
Simple appointment scheduling system made using Node.js

## Settings
There's a file called `settings.json` in the root of the file structure. Currently it allows you to modify following settings:
_(Please note that settings are not updated when the server is running)_

### yearsToFuture (Required)
Type: Number
Default: 2
Supported values: Any number larger or equal than zero
When this is set to zero, it means that users can only make appointmests to current year. Setting it to one means that appointments can be made to current year or next your. You get the idea.

### session_encryption_key (Optional)
Type: String  
Supported values: Any string  
This is used by [`express-session`](https://github.com/expressjs/session) to encrypt the session cookie. Using too short or simple encryption key can lead to session hijacking. **It's highly recommended to change this setting as using the default one is very dangerous.**  

### moment_language (Optional)
Type: String  
Default: "fi"  
Supported values: Currently only "fi" (Finnish) is officially supported. You can try other options.  
Allows you to change Moment.js's locale which sets the format dates are displayed in.

### port (Optional)
Type: Number  
Default: 8000  
Supported values: Any valid port number that is not in use.  
The server starts listening to this port.  

### company_name (Optional)
Type: String  
Default: "Just Enough Time"  
Supported values: Any string. Can be empty.  
This string is shown in browser's title bar.

## Starting the server
`node server.js`