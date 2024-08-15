# Syncing Google Calendar with OAuth2.0 using JavaScript and HTML

This guide provides step-by-step instructions on how to sync your Google Calendar using OAuth2.0 with a simple HTML and JavaScript-based web application. The provided code displays a calendar interface that pulls events from your Google Calendar once authenticated.

## Prerequisites

Before you begin, make sure you have:

- A Google account.
- Access to the Google Cloud Console.
- Basic understanding of HTML, CSS, and JavaScript.

## Setting Up Your Google Cloud Project

1. **Create a Project in Google Cloud Console:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.

2. **Enable the Google Calendar API:**
   - In the Google Cloud Console, navigate to **APIs & Services** > **Library**.
   - Search for "Google Calendar API" and enable it.

3. **Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services** > **Credentials**.
   - Click on **Create Credentials** and select **OAuth 2.0 Client IDs**.
   - Configure the OAuth consent screen by filling in the necessary details.
   - Set the application type to "Web application" and add your application URL in the authorized redirect URIs.
   - After creating the credentials, you will get a `CLIENT_ID`.
   - Copy this value in app.js file.

```js
    // Google API related code
    const CLIENT_ID = 'CLIENT_ID.apps.googleusercontent.com';
```

4. **Get Your API Key:**
   - Still in **APIs & Services** > **Credentials**, create an `API_KEY`.
   - Copy this value in app.js file.
```js
    // Google API related code
    const API_KEY = 'API_KEY';
```

## HTML Structure

The HTML structure provided creates a basic layout for the calendar application. It includes a title, buttons for calendar navigation, and elements for displaying calendar events.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Calendar Google</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="app.css"> 
</head>
<body>
<main class="p-4 xl:p-8 ml-4 lg:ml-4 mx-auto min-w-[320px] w-full flex flex-col lg:flex-row">
  <div class="flex-grow flex flex-col space-y-2 w-full lg:w-10/12 mx-auto my-10 p-6 bg-white rounded-lg">
        <div class="w-full mt-10 grid grid-cols-1 gap-6">
            <!-- Calendar -->
            <div class="w-full">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Calendario</h3>
                <div class="calendar w-full">
                    <div class="calendar-header w-full flex justify-between items-center">
                        <button id="prev-month" class="text-gray-800">Prev</button>
                        <div>
                            <span id="month"></span> <span id="year"></span>
                        </div>
                        <button id="next-month" class="text-gray-800">Next</button>
                    </div>
                    <div class="calendar-body" id="calendar-body">
                        <!-- Days will be populated here -->
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <button id="authorize_google_calendar_button" style="display: block;" class="bg-blue-500 text-white py-2 px-4 rounded-lg">Sync google calendar</button>
            <button id="signout_button" style="display: none;" class="bg-red-500 text-white py-2 px-4 rounded-lg">Sign Out</button>
            <div id="events"></div>
        </div>
    </div>
</main>
</body>
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script type="module" src="app.js"></script>
</html>
