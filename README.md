# Just Enough Time
Simple appointment scheduling system made using Node.js

## Settings
There's a file named `settings.json` in the root of the file structure. You can delete any optional settings from the JSON file to use default values.  
_(Please note that settings are not updated when the server is running)_

### yearsToFuture (Required)
Type: Number  
Default: 2  
Supported values: Any number larger or equal than zero  
Description: When this is set to zero, it means that users can only make appointmests to current year. Setting it to one means that appointments can be made to current year or next your. You get the idea.

### session_secret (Optional)
Type: String  
Supported values: Any string  
Description: This is used by [`express-session`](https://github.com/expressjs/session) to sign the session cookie to prevent tampering. Using too short or simple encryption key can be a security issue. **It's highly recommended to change this setting as using the default one is very dangerous.** 

### moment_language (Optional)
Type: String  
Default: "en"  
Supported values: Any Moment.js language code.   
Description: Allows you to change [Moment.js's](https://github.com/moment/moment/) locale which sets the format dates are displayed in. Please note that this setting only changes the way dates are displayed. The dates are always calculated using [Finnish calendar](https://www.timeanddate.com/calendar/?country=24). E.g. first day of the week is always Monday.

### port (Optional)
Type: Number  
Default: 8000  
Supported values: Any valid port number that is not in use.  
Description: The server starts listening to this port. Please note that `process.env.PORT` overrides this value.

### company_name (Optional)
Type: String  
Default: "Just Enough Time"  
Supported values: Any string. Can be empty.  
Description: This string is shown in browser's title bar.

### noInteractiveConsole (Optional)
Type: Boolean  
Default: false 
Supported values: Boolean  
Description: Set this to true if you want to skip the admin account creation during server startup. If you do, you need to create the account by editing `data.json` file by hand after the server has started. More information about this below.

## Admin Access
Currently the only way to add or modify accounts is to edit `data.json` file by hand. To add a new account, add following object to users array:

```javascript
{
    "username": "Unique username here",
    "password": "sha-256 hash of the password here"
}
```

## Starting the server
```
    npm install
    node server.js
```  
**Do not use Nodemon or similar tools unless you enable noInteractiveConsole**