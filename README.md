# 📱 Calorie Compass

**Calorie Compass** is a mobile health companion app that helps users track their meals, monitor calorie intake, and stay informed with helpful health tips — all with the power of AI!

## ✨ Features

- 🔐 Firebase-based authentication  
- 🧠 AI-powered meal analysis using Gemini (estimates calories + gives contextual advice)  
- 🎯 Daily goal setting and smart progress tracking  
- 📈 Visual progress bar with color-coded calorie zones  
- 📅 Recent meals and 7-day goal history  
- 💡 General health tips rotated every 5 minutes  
- 🌙 Optional dark mode UI (WIP)  
- 🔁 Seamless backend connection via Express.js  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rustyBot31/Calorie-Compass.git
cd Calorie-Compass
```

### 2. Install Dependencies

```bash
cd mobile
npm install

# (Optional) Setup backend
cd ../backend
npm install
```

### 3. Configure Your Environment

- Set the `BASE_URL` in `utils/geminiApi.ts` to your backend IP, e.g.:

```ts
const BASE_URL = 'http://192.168.0.xxx:4000';
```

- Set up Firebase SDK in `firebaseAuthApi.ts`.

### 4. Run the App

```bash
# Start backend
cd backend
npm start

# Start frontend
cd ../mobile
expo start
```

---

## 🧠 Tech Stack

| Layer       | Technology                            |
|-------------|----------------------------------------|
| Frontend    | React Native + Expo                    |
| Backend     | Node.js + Express                      |
| Auth        | Firebase Auth                          |
| AI/ML       | Gemini API (AI-generated tips & calories) |
| Storage     | Firebase or local DB (TBD)             |

---

## 📂 Folder Structure (Simplified)

```
Calorie-Compass/
├── mobile/             # React Native frontend
│   ├── components/
│   ├── screens/
│   ├── utils/
│   └── ...
├── backend/            # Express server (optional)
│   └── routes/
└── README.md
```

---

## 🧪 In Progress

- [ ] Dark mode toggle system-wide  
- [ ] Export meal history  
- [ ] Improved caching & offline support  

---

## 🤝 Contributions

Contributions and feedback are welcome! Feel free to open issues or submit PRs.

---

## 🪪 License

MIT License © 2025 [rustyBot31](https://github.com/rustyBot31)
