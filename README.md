# VisualBoard AI

**Team:** VyomTech  
**Project:** VisualBoard AI

VisualBoard AI is an intelligent mathematical problem-solving and visualization tool. It accepts both typed math equations and handwritten canvas inputs, uses Gemini AI to understand the question structure, and executes all calculations deterministically using MathJS. It then renders interactive mathematical visualizations (dynamic 2D graphs and 3D geometric solids) with live parameter exploration and voice-assisted step narration.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **2D Visualizations:** SVG (dynamic coordinate scaling, 4-quadrant symmetric plotting)
- **3D Visualizations:** Three.js
- **Mathematical Computation:** MathJS (symbolic and numerical verification)
- **AI & NLP:** Google Gemini API (`gemini-3.8-flash`)
- **Backend:** Node.js, Express, Cors, Dotenv
- **Voice Narration:** Web Speech API

---

## Setup & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akshayareddy0306/visualboard-ai.git
   cd visualboard-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure API Keys:**
   Copy `.env.example` to `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
   Add your Gemini API key in `server/.env`:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_key_here
   ```

4. **Start the backend server:**
   ```bash
   cd server
   node server.js
   ```

5. **Start the frontend application:**
   In a separate terminal:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
