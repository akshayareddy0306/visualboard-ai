# VisualBoard AI

An AI-assisted tool that turns typed math questions into live, correct, interactive visualizations — built for Smart India Hackathon 2026 (SIH26207), Smart Education track.

## What it does

A teacher or student types a math question in plain language or standard notation. The system:
1. Uses Gemini AI to understand the question and extract its mathematical structure
2. Uses MathJS (a real computation engine) to solve it — the AI never computes the final answer itself, only Gemini's language understanding is used, ensuring correctness
3. Renders a matching diagram (SVG for 2D, Three.js for 3D)
4. Lets the student explore by adjusting parameters live
5. Optionally narrates the solution steps aloud via the browser's Web Speech API

## Current Scope & Limitations

**Working reliably:**
- Single-concept questions across Algebra, Geometry, and Trigonometry
- Quadratic equations, circles, rectangles, cubes, cuboids, triangles, sine/cosine/tangent graphs
- Live parameter sliders with real-time visual updates
- Voice narration of solution steps

**Still in progress:**
- Compound, multi-step JEE problems requiring an intermediate derivation before the main computation
- 3D vector/line problems needing multi-stage solving
- Free-form text-based "what if" exploration (currently slider-based only)

**Design principle:** the system is built to explicitly say "not supported yet" when it cannot confidently solve or classify a question, rather than fabricate a plausible-looking but incorrect answer. We treat an honest failure as safer than a confident wrong answer in an education tool.

## Tech stack

- **Frontend:** React + Vite
- **AI understanding:** Google Gemini API (gemini-3.8-flash)
- **Computation:** MathJS (symbolic/numeric solving)
- **Visualization:** SVG (2D), Three.js (3D)
- **Voice:** Browser-native Web Speech API

## Running locally

1. Clone this repository
2. Run `npm install`
3. Create a `.env` file in the `server` folder with: `GEMINI_API_KEY=your_key_here`
4. Start the backend: `cd server && node server.js`
5. Start the frontend: `npm run dev`
6. Open `http://localhost:5173`

## Team

Team VyomTech — SIH26207
