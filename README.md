# 💬 Whischat

## 📃 Overview

This is a chat app built with Next.js, Pusher, MongoDB, and Firebase Cloud Storage.

### 🚀 Features

- User Authentication
- Text, image, video, and audio sharing
- Realtime voice chat through [WebRTC]("https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- Friend system
- User-created servers
- Direct messages
- Group chats

## 👉 Getting Started

Currently, this project is not hosted, so you must clone this repository and run the dev server locally.

### 🛠️ Services Used

#### MongoDB

This project uses MongoDB to store data. To run it locally, you must have an available cluster.

#### Google Authentication

For Google Authentication to work, you must have a project in your [Google Cloud Console]("http://console.cloud.google.com"). To learn how to set up authentication, read [this guide](https://developers.google.com/identity/protocols/oauth2)

#### Pusher

Pusher provides websocket connections separate from the Next.js server. You will need to create an account and retrieve necessary app keys required in the environment variables. Click [here](https://pusher.com/docs/channels/getting_started/javascript/#get-your-free-api-keys) to learn more.

#### Firebase Cloud Storage

To store non-text media, Firebase Cloud Storage is used. To learn how to set up Cloud Storage, read [this guide](https://firebase.google.com/docs/storage/web/start).

### 🔧 Environment Variables

In a .env file, add the following variables:

- `BASE_URL` = The root URL of your dev server
- `MONGODB_URI` = The URI of the MongoDB cluster you wish to connect to
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = The client ID provided by Google's OAuth service
- `GOOGLE_CLIENT_SECRET` = The client secret provided by Google's OAuth service
- `NEXT_PUBLIC_GOOGLE_REDIRECT_URL` = Must be set to `"<base url>/api/auth/callback/google"`
  - Whatever URL is provided here also must be added as an authorized redirect URL in your Google Cloud Console
- `PUSHER_APP_ID` = The app ID provided by Pusher
- `NEXT_PUBLIC_PUSHER_KEY` = The key provided by Pusher
- `PUSHER_SECRET` = The secret provided by Pusher
- `NEXT_PUBLIC_PUSHER_CLUSTER` = The cluster provided by Pusher

The following variables are found by going into your Firebase project settings, where they are listed in the `firebaseConfig` object.

- `FIREBASE_API_KEY` = Value of `apiKey` in config
- `FIREBASE_AUTH_DOMAIN` = Value of `authDomain` in config
- `FIREBASE_PROJECT_ID` = Value of `projectId` in config
- `FIREBASE_STORAGE_BUCKET` = Value of `storageBucket` in config
- `FIREBASE_MESSAGING_SENDER_ID` = Value of `messagingSenderId` in config
- `FIREBASE_APP_ID` = Value of `appId` in config
- `FIREBASE_MEASUREMENT_ID` = Value of `measurementId` in config

### ▶️ Running the Project

To run the project, simply start the dev server and access the port on your browser.

```bash
npm run dev
```
