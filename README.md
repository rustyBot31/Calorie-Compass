# 📱 Calorie Compass

**Calorie Compass** is a mobile health companion app that helps users track their meals, monitor calorie intake, and stay informed with helpful health tips — all powered by AI!

---

## ✨ Features

- 🔐 Firebase-based authentication  
- 🧠 AI-powered meal analysis using Gemini (estimates calories + provides contextual advice)  
- 🎯 Daily goal setting and smart progress tracking  
- 📈 Visual progress bar with color-coded calorie zones  
- 📅 Recent meals and 7-day goal history  
- 🔁 Seamless backend integration via Express.js  

---

## 🧠 Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React Native + Expo Go                    |
| Backend     | Node.js + Express                         |
| Auth        | Firebase Authentication                   |
| Storage     | Firebase Firestore                        |
| AI          | Gemini API (for tips & calorie estimates) |

---

## 🧰 Prerequisites

To run this project locally, ensure you have the following:

1. **Node.js** – Latest LTS version recommended.  
2. **Expo Go** – Available on [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779).  
3. **Git** – For cloning the repository.  
4. **Firebase Project**:
   - Enable **Email/Password Authentication**
   - Set up **Cloud Firestore**
   - Generate a **Service Account Key** (used in backend)
5. **Gemini API Key** – Obtain from [Google AI Studio](https://aistudio.google.com/app).
6. **Optional**: **Android Studio** – Required only for running on an emulator or building a standalone APK.
7. **Optional**: **Expo CLI** – Can be installed globally (`npm install -g expo-cli`) or used via `npx`.

---

## 🚀 Setup Instructions

Follow these steps to run the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/rustyBot31/Calorie-Compass.git
   cd Calorie-Compass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase and Gemini keys**
   - Create a file at the root named `envVar.ts` and populate it with your Firebase API config (structure shown below).
   - Inside the `backend/` folder, create a file named `envVarBackend.js` and add your Gemini API key (structure shown below).
   - Ensure `backend/` contains a valid `serviceAccountKey.json`. (Instructions below)

4. **Start the backend server**
   ```bash
   cd backend
   node index.js
   ```

5. **Start the Expo app**
   ```bash
   npx expo start --clear
   ```
   Then scan the QR code using the Expo Go app on your mobile device.

---

## 🌐 Environment Setup

### `envVar.ts` (root folder)

```ts
export const FIREBASE_API_KEY = 'your-firebase-api-key';
export const PROJECT_ID = 'your-firebase-project-id';
export const BASE_URL = 'https://identitytoolkit.googleapis.com/v1';
export const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects';
export const BACKEND_URL = 'http://your-local-ip:4000'; // must be accessible by both phone and computer
```

### `envVarBackend.js` (in `backend/`)

```js
const GEMINI_API_KEY = 'your-gemini-api-key';
module.exports = { GEMINI_API_KEY };
```

---

### 🔑 How to Generate `serviceAccountKey.json`

1. Go to the [Firebase Console](https://console.firebase.google.com/).  
2. Select your project.  
3. Click the **gear icon ⚙️** → **Project Settings**.  
4. Navigate to the **Service Accounts** tab.  
5. Click **"Generate new private key"**.  
6. Confirm and download the file — this is your `serviceAccountKey.json`.

> Place this file inside the `backend/` folder.

---

## 🤝 Contributions

Contributions and feedback are welcome!  
Feel free to open issues or submit pull requests.
