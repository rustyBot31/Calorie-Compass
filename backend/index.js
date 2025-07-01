const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const serviceAccount = require('./serviceAccountKey.json');
const {GEMINI_API_KEY} = require('./envVarBackend')
dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
const PORT = 4000;

// ✅ Firebase Admin Init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ✅ Helper: Get IST date
function getTodayDateIST() {
  return dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
}

// ✅ Gemini API: Estimate calories using direct REST call
async function estimateCaloriesFromGemini(mealDescription, dailyGoal, totalCaloriesSoFar) {
  const prompt = `
You are a helpful nutrition assistant. A user has eaten ${totalCaloriesSoFar} kcal so far today and has a daily goal of ${dailyGoal} kcal.
They are considering this meal: "${mealDescription}"

Your tasks:
1. Estimate the total calories in the meal.
2. Provide a brief tip on whether this meal fits well with their goal and any suggestions for the rest of the day.

Respond in this exact format:
Calories: <number>
Tip: <tip goes here>
  `.trim();

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const res = await axios.post(GEMINI_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const rawText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const caloriesMatch = rawText.match(/Calories:\s*(\d+)/i);
    const tipMatch = rawText.match(/Tip:\s*(.+)/i);

    const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : null;
    const tip = tipMatch ? tipMatch[1].trim() : 'No tip provided.';

    if (calories === null) {
      throw new Error('Could not parse calories from Gemini response.');
    }

    return { calories, tip };
  } catch (err) {
    console.error('[❌] Gemini API error:', err.message);
    throw new Error('Gemini API failed');
  }
}

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Firebase backend is running');
});

// ✅ Save daily goal
app.post('/saveGoal', async (req, res) => {
  const { uid, goal, locked } = req.body;
  if (!uid || goal == null) return res.status(400).json({ error: 'Missing uid or goal' });

  const today = getTodayDateIST();

  try {
    await db
      .collection('users')
      .doc(uid)
      .collection('goals')
      .doc(today)
      .set(
        {
          goal: parseInt(goal),
          locked: Boolean(locked),
          date: today,
        },
        { merge: true }
      );

    return res.status(200).json({ message: 'Goal saved successfully' });
  } catch (err) {
    console.error('Error saving goal:', err);
    return res.status(500).json({ error: 'Failed to save goal' });
  }
});

// ✅ Get today's goal
app.get('/getGoal/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });

  const today = getTodayDateIST();

  try {
    const doc = await db.collection('users').doc(uid).collection('goals').doc(today).get();

    if (!doc.exists) return res.status(404).json({ error: 'Goal not found for today' });

    return res.status(200).json(doc.data());
  } catch (err) {
    console.error('Error fetching goal:', err);
    return res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

app.get('/getRecentMeals/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const mealsSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('meals')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const meals = mealsSnapshot.docs.map(doc => doc.data());
    res.status(200).json({ meals });
  } catch (error) {
    console.error('Failed to fetch recent meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});


// ✅ Estimate + Save meal and update totalCalories in transaction
app.post('/logMeal', async (req, res) => {
  const { uid, meal, calories, tip } = req.body;

  if (!uid || !meal || calories == null || !tip) {
    return res.status(400).json({ error: 'Missing uid, meal, calories, or tip' });
  }

  try {
    const now = dayjs().tz('Asia/Kolkata');
    const todayStr = now.format('YYYY-MM-DD');

    const userRef = db.collection('users').doc(uid);
    const mealRef = userRef.collection('meals').doc();
    const statusRef = userRef.collection('status').doc(todayStr);
    const goalRef = userRef.collection('goals').doc(todayStr);

    await db.runTransaction(async (t) => {
      const goalDoc = await t.get(goalRef);
      const goal = goalDoc.exists ? goalDoc.data().goal : 2000;

      const statusDoc = await t.get(statusRef);
      const prevTotal = statusDoc.exists ? statusDoc.data().totalCalories || 0 : 0;
      const newTotal = prevTotal + calories;

      // 1. Save meal
      t.set(mealRef, {
        meal,
        calories,
        tip,
        createdAt: now.toISOString(),
        date: todayStr,
      });

      // 2. Update totalCalories for today
      t.set(statusRef, {
        totalCalories: newTotal,
        updatedAt: now.toISOString(),
        date: todayStr,
      }, { merge: true });
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('[🔥] Failed to log meal:', err);
    return res.status(500).json({ error: 'Failed to log meal' });
  }
});



// ✅ Get today's totalCalories from status/{today}
app.get('/getStatus/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });

  const today = getTodayDateIST();

  try {
    const statusDoc = await db
      .collection('users')
      .doc(uid)
      .collection('status')
      .doc(today)
      .get();

    if (!statusDoc.exists) {
      return res.status(200).json({ totalCalories: 0, date: today });
    }

    return res.status(200).json(statusDoc.data());
  } catch (err) {
    console.error('[❌] Error fetching status:', err.message);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
});

app.post('/estimateCaloriesOnly', async (req, res) => {
  try {
    const { uid, meal } = req.body;

    if (!uid || !meal) {
      return res.status(400).json({ error: 'uid and meal are required' });
    }

    // Fetch daily goal
    const goalDoc = await db
      .collection('users')
      .doc(uid)
      .collection('goals')
      .doc(dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD'))
      .get();

    const dailyGoal = goalDoc.exists ? goalDoc.data().goal : 2000; // fallback

    // Fetch today's total
    const statusDoc = await db
      .collection('users')
      .doc(uid)
      .collection('status')
      .doc(dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD'))
      .get();

    const totalCalories = statusDoc.exists ? statusDoc.data().totalCalories : 0;

    // Call Gemini with full context
    const { calories, tip } = await estimateCaloriesFromGemini(meal, dailyGoal, totalCalories);

    return res.json({ calories, tip });
  } catch (err) {
    console.error('Error estimating calories:', err.message);
    res.status(500).json({ error: 'Gemini API failed' });
  }
});

app.get('/getLockedGoalsWithStatus/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });

  try {
    const goalsSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('goals')
      .where('locked', '==', true)
      .orderBy('date', 'desc')
      .limit(7)
      .get();

    const lockedGoals = [];

    for (const doc of goalsSnapshot.docs) {
      const goalData = doc.data();
      const date = goalData.date;

      const statusDoc = await db
        .collection('users')
        .doc(uid)
        .collection('status')
        .doc(date)
        .get();

      const totalCalories = statusDoc.exists ? statusDoc.data().totalCalories || 0 : 0;

      lockedGoals.push({
        date,
        goal: goalData.goal,
        totalCalories,
      });
    }

    return res.json({ lockedGoals });
  } catch (err) {
    console.error('Error fetching locked goals with status:', err);
    return res.status(500).json({ error: 'Failed to fetch locked goals' });
  }
});

app.get('/getLast7LockedGoals/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });

  const today = dayjs().tz('Asia/Kolkata');
  const userRef = db.collection('users').doc(uid);

  const results = [];

  try {
    for (let i = 0; i < 7; i++) {
      const date = today.subtract(i, 'day').format('YYYY-MM-DD');
      const goalRef = userRef.collection('goals');
      const lockedQuery = await goalRef.where('date', '==', date).where('locked', '==', true).limit(1).get();

      if (!lockedQuery.empty) {
        // Use locked goal
        const doc = lockedQuery.docs[0];
        const goalData = doc.data();
        results.push({ ...goalData, date });
      } else {
        // No locked goal → get most recent goal of the day
        const fallbackQuery = await goalRef
          .where('date', '==', date)
          .orderBy('updatedAt', 'desc') // make sure you store updatedAt
          .limit(1)
          .get();

        if (!fallbackQuery.empty) {
          const doc = fallbackQuery.docs[0];
          const goalData = doc.data();
          results.push({
            ...goalData,
            locked: false, // fallback
            date,
            fallback: true, // optional flag to show this was auto-chosen
          });
        }
      }
    }

    return res.json({ goals: results });
  } catch (err) {
    console.error('Failed to fetch last 7 goals:', err);
    return res.status(500).json({ error: 'Failed to fetch goal history' });
  }
});



// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
