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

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React Native + Expo Dev Client                  |
| Backend     | Node.js + Express                               |
| Auth        | Firebase Authentication (via REST API)          |
| Storage     | Firebase Firestore (via REST API)               |
| AI          | Gemini API (for tips & calorie estimates)       |

---

## 🧰 Prerequisites

To run this project locally, ensure you have the following:

1. **Node.js** – Latest LTS version recommended.  
2. **Expo CLI** – Install globally (`npm install -g expo-cli`) or use via `npx`.  
3. **Git** – For cloning the repository.  
4. **Firebase Project**:
   - Enable **Email/Password Authentication**
   - Set up **Cloud Firestore**
   - Generate a **Service Account Key** (used in backend)
5. **Gemini API Key** – Obtain from [Google AI Studio](https://aistudio.google.com/app).
6. **Android Studio or Xcode** – Required for building and installing the custom Expo Dev Client on your device.
7. **Expo Dev Client (Custom Build)** – See instructions below.

> 📌 **Note:** This app now uses a **custom Expo Dev Client**, not Expo Go. You’ll need to build the development client once using `eas build`.

---

## 🚀 Setup Instructions

> 📌 **Note:** This current build is compatible with Android only. For iOS devices, check [Expo Docs](https://docs.expo.dev/develop/development-builds/create-a-build/) <br>

### 1. Clone the Repository
```bash
git clone https://github.com/rustyBot31/Calorie-Compass.git
cd Calorie-Compass
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

#### `envVar.ts` (root)
```ts
export const FIREBASE_API_KEY = 'your-firebase-api-key';
export const PROJECT_ID = 'your-firebase-project-id';
export const BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';
export const FIRESTORE_URL =  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
export const BACKEND_URL = 'http://your-local-ip:4000';
```

#### `envVarBackend.js` (inside `backend/`)
```js
const GEMINI_API_KEY = 'your-gemini-api-key';
module.exports = { GEMINI_API_KEY };
```

### 4. Add Firebase Service Account
Download your service account key JSON from Firebase and place it in the `backend/` folder as `serviceAccountKey.json`.

### 5. Start the Backend Server
```bash
cd backend
node index.js
```

### 6. Build & Install Expo Dev Client
This app requires a custom development build.

#### If not already built:
```bash
npx expo install expo-dev-client
npx eas build --profile development --platform android
```

> 💡 After the build completes, install the generated `.apk` on your device manually or use `eas build:run`.

### 7. Start the App
Once the Dev Client is installed:

```bash
npx expo start --dev-client
```

Scan the QR code from your terminal with the custom Dev Client installed on your device.

---

## 🚢 Releases

| Version | Description                      | Notes                          |
|---------|----------------------------------|--------------------------------|
| 1.0.0   | Expo Go Initial Release          | Deprecated                     |
| 1.1.0   | Switched to Expo Dev Build (Android only (for now))     | Deprecated     |
| 1.1.1   | Minor bug fixes                  | Custom Dev Client required     |
---

## 🔑 How to Generate `serviceAccountKey.json`

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project  
3. Click ⚙️ → **Project Settings**  
4. Navigate to **Service Accounts**  
5. Click **“Generate new private key”**  
6. Save it as `serviceAccountKey.json` inside `backend/`

---

## 🤝 Contributions

Contributions and feedback are welcome!  
Feel free to open issues or submit pull requests.

---

## 📝 License
This project is licensed under the [MIT License](./LICENSE.txt).

---
