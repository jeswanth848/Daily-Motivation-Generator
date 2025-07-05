// DOM Elements
const moodForm = document.getElementById('mood-form');
const moodSelect = document.getElementById('mood-select');
const customMood = document.getElementById('custom-mood');
const generateBtn = document.getElementById('generate-btn');
const quoteContainer = document.getElementById('quote-container');
const quoteContent = document.getElementById('quote-content');
const quoteText = document.getElementById('quote');
const copyBtn = document.getElementById('copy-btn');
const newQuoteBtn = document.getElementById('new-quote-btn');
const loader = document.getElementById('loader');

// Gemini API Configuration - No token required for client-side requests with proper restrictions
const GOOGLE_API_KEY = "AIzaSyAbvbD5WDswpbPOWYlT1VBQdecerUz9atA"; // Your API key from Google AI Studio
const GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Event Listeners
moodForm.addEventListener('submit', handleFormSubmit);
copyBtn.addEventListener('click', copyQuote);
newQuoteBtn.addEventListener('click', generateNewQuote);

// Store last mood
let lastMood = '';

// Handle form submit
async function handleFormSubmit(e) {
  e.preventDefault();
  const mood = (customMood.value.trim() || moodSelect.value).trim();
  if (!mood) return alert('Please select or enter a mood.');
  lastMood = mood;
  await generateQuote(mood);
}

// New quote on same mood
async function generateNewQuote() {
  return lastMood ? generateQuote(lastMood) : alert('Generate one first!');
}

// UI Helpers
function showLoader() {
  loader.style.display = 'flex';
  quoteContent.style.display = 'none';
  copyBtn.style.display = 'none';
  newQuoteBtn.style.display = 'none';
}
function hideLoader() {
  loader.style.display = 'none';
  quoteContent.style.display = 'block';
  copyBtn.style.display = newQuoteBtn.style.display = 'inline-block';
}

// Fetch quote
async function generateQuote(mood) {
  quoteContainer.style.display = 'block';
  showLoader();
  try {
    const prompt = `Create a short motivational quote for someone feeling ${mood}. Format: "Quote"`;

    const resp = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          candidateCount: 1
        }
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    const raw = data.candidates[0].content.parts[0].text;
    const [quote] = raw.split('|').map(x => x.trim());

    quoteText.textContent = quote || raw || 'No quote 🫥';
  } catch (err) {
    console.error('Error generating quote:', err);
    quoteText.textContent = 'Could not generate a quote. Try again later.';
  } finally {
    hideLoader();
  }
}

// Copy functionality
function copyQuote() {
  const text = `"${quoteText.textContent}"`;
  navigator.clipboard.writeText(text)
    .then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.style.backgroundColor = 'var(--success-color)';
      setTimeout(() => {
        copyBtn.textContent = orig;
        copyBtn.style.backgroundColor = 'var(--secondary-color)';
      }, 2000);
    })
    .catch(() => alert('Copy failed'));
}

// Page load fade-in
document.addEventListener('DOMContentLoaded', () => {
  const c = document.querySelector('.container');
  c.style.opacity = 0;
  setTimeout(() => {
    c.style.transition = 'opacity 0.5s ease';
    c.style.opacity = 1;
  }, 100);
});
