// gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {GEMINI_API_KEY} = require('./envVarBackend')
// 🔑 Replace this with your Gemini API key (store securely in production)
const API_KEY = GEMINI_API_KEY; //Add your gemini api key //import from your own created envVar file

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

// Main function to estimate calories from a meal description
async function estimateCalories(mealDescription) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Estimate the total calories in the following meal:
"${mealDescription}"

Respond ONLY with a number representing the estimated total calories. Do not add units, explanation, or any extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse number from text
    const calories = parseInt(text.match(/\d+/)?.[0]);

    if (isNaN(calories)) {
      throw new Error('Could not parse calorie estimate from Gemini response');
    }

    return calories;
  } catch (err) {
    console.error('Gemini error:', err);
    throw new Error('Failed to estimate calories');
  }
}

module.exports = { estimateCalories };
