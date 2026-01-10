<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Integrated into the main TaxIntegrity website

This repo’s Flask server (`server.py`) serves the built UI under:

- `http://localhost:5000/taxintegrity-ai/`

To build the static assets that Flask serves:

1. `npm install`
2. Create `.env.local` with `GEMINI_API_KEY=...`
3. `npm run build`

Then start the root server:

- `python ../server.py`
