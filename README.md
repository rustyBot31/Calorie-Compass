# 📱 Calorie Compass

**Calorie Compass** is a mobile health companion app that helps users track their meals, monitor calorie intake, and stay informed with helpful health tips — all with the power of AI!

## ✨ Features

- 🔐 Firebase-based authentication  
- 🧠 AI-powered meal analysis using Gemini (estimates calories + gives contextual advice)  
- 🎯 Daily goal setting and smart progress tracking  
- 📈 Visual progress bar with color-coded calorie zones  
- 📅 Recent meals and 7-day goal history    
- 🔁 Seamless backend connection via Express.js  

---

## 🧠 Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React Native + Expo Go                    |
| Backend     | Node.js + Express                         |
| Auth        | Firebase Auth                             |
| Storage     | Firebase Firestore                        |

---

## 🧰 Prerequisites

To run this project locally, ensure you have the following installed or set up:

1. **Node.js** – Install the latest LTS version.
2. **Expo Go app** – Available on [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779).
3. **Git** – To clone the repository.
4. **Firebase Project**:
   - Enable **Email/Password Authentication**
   - Set up **Cloud Firestore**
   - Generate a **Service Account Key** (for backend)
5. **Gemini API Key** – Create one from [Google AI Studio](https://aistudio.google.com/app).
6. **Optional**: **Android Studio** – Only required if you want to run the app on an emulator or build a standalone APK.
7. **Optional**: **Expo CLI** – You can install it globally (`npm install -g expo-cli`) or use `npx` for local commands.

---

## 🚀 Setup Instructions

Follow these steps to run the project locally:

1. **Clone the repository**  
   ```bash
   git clone https://github.com/rustyBot31/Calorie-Compass.git
   cd Calorie-Compass

2. **Install dependencies**
   ```bash
   npm install

3. **Configure Firebase and Gemini keys**
   - Create a file at the root named envVar.ts and populate it with your Firebase API key (structure given below)
   - Create a file in backend folder named envVarBackend.js and populate it with your Gemini API key (structure given below)
   - Make sure the backend has a valid serviceAccountKey.json inside the backend/ folder. (instruction  given below)

4. **Start the backend server**
   ```bash
   cd backend
   node index.js

5. **Start expo app**
   ```bash
   npx expo start --clear
   ```
   Scan the QR code with the Expo Go app on your mobile device.
   
--- 

## Environment setup

```bash
//envVar.ts
export const FIREBASE_API_KEY
export const PROJECT_ID
export const BASE_URL
export const FIRESTORE_URL
export const BACKEND_URL //this is your common ip address. all devices including your mobile and pc on which app and server is running should be connected to this!
```
```bash
//envVarBackend.js
const GEMINI_API_KEY
module.exports = {
    GEMINI_API_KEY
}
```

# How to get your serviceAccountKey
1. Go to Firebase console
2. Select your project
3. Navigate to Project Settings (⚙️ gear icon in the top left)
4. Go to the Service Accounts tab.
5. Click "Generate new private key"
6. Confirm and download the JSON file — this is your serviceAccountKey.json

---

## 🤝 Contributions

Contributions and feedback are welcome! Feel free to open issues or submit PRs.

---
