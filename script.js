<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mood Quote Generator</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f2f2f2;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 500px;
      margin-top: 50px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      opacity: 1;
      transition: opacity 0.5s ease;
    }
    input, select, button {
      margin-top: 10px;
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }
    #quote-container {
      display: none;
      margin-top: 20px;
      background: #eaf7ff;
      padding: 15px;
      border-radius: 8px;
    }
    #loader {
      display: none;
      justify-content: center;
      align-items: center;
      height: 40px;
      color: #555;
    }
    #copy-btn, #new-quote-btn {
      margin-top: 10px;
      width: 49%;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <form id="mood-form">
      <h2>How are you feeling?</h2>
      <select id="mood-select">
        <option value="">-- Select Mood --</option>
        <option value="happy">Happy</option>
        <option value="sad">Sad</option>
        <option value="stressed">Stressed</option>
        <option value="confident">Confident</option>
      </select>
      <input type="text" id="custom-mood" placeholder="Or enter custom mood..." />
      <button id="generate-btn">Generate Quote</button>
    </form>

    <div id="quote-container">
      <div id="loader">Generating...</div>
      <div id="quote-content">
        <p id="quote">Your quote will appear here.</p>
        <button id="copy-btn">Copy</button>
        <button id="new-quote-btn">New Quote</button>
      </div>
    </div>
  </div>

  <script>
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

    const GOOGLE_API_KEY = "AIzaSyD3EPRaxlHvlMGoy0dUIkJ0E2w3ydjIfHQ";
    const GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    let lastMood = '';

    moodForm.addEventListener('submit', handleFormSubmit);
    copyBtn.addEventListener('click', copyQuote);
    newQuoteBtn.addEventListener('click', generateNewQuote);

    async function handleFormSubmit(e) {
      e.preventDefault();
      const mood = (customMood.value.trim() || moodSelect.value).trim();
      if (!mood) return alert('Please select or enter a mood.');
      lastMood = mood;
      await generateQuote(mood);
    }

    async function generateNewQuote() {
      if (!lastMood) return alert('Generate one first!');
      await generateQuote(lastMood);
    }

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
          const errorText = await resp.text();
          console.error('API Error:', errorText);
          throw new Error(`HTTP ${resp.status}: ${errorText}`);
        }

        const data = await resp.json();
        console.log('API Response:', data);

        const quote = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No quote 🫥';
        quoteText.textContent = quote;
      } catch (err) {
        console.error('Error generating quote:', err);
        quoteText.textContent = 'Could not generate a quote. Try again later.';
      } finally {
        hideLoader();
      }
    }

    function copyQuote() {
      const text = `"${quoteText.textContent}"`;
      navigator.clipboard.writeText(text)
        .then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.style.backgroundColor = 'green';
          setTimeout(() => {
            copyBtn.textContent = orig;
            copyBtn.style.backgroundColor = '';
          }, 2000);
        })
        .catch(() => alert('Copy failed'));
    }

    document.addEventListener('DOMContentLoaded', () => {
      const c = document.querySelector('.container');
      c.style.opacity = 0;
      setTimeout(() => {
        c.style.opacity = 1;
      }, 100);
    });
  </script>
</body>
</html>
