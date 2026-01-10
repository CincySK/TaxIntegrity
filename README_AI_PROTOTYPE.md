# AI Prototype for Tax Evasion Detection and Audit Speedup

This prototype demonstrates using AI (ChatGPT) to answer questions about tax evasion detection and speeding up audits, drawing directly from GAO and IRS source documents.

## New: RAG Chat (React/Vite app)

This repo also contains a newer RAG chat interface in `taxintegrity-ai/` (Gemini-powered) that is integrated into the website at:

- `http://localhost:5000/taxintegrity-ai/`

## Features

- **Interactive Chat Interface**: Ask questions about AI applications in tax enforcement
- **Source-Based Answers**: Answers are generated using content from uploaded PDF documents:
  - "Artificial Intelligence May Help IRS Close the Tax Gap" (U.S. GAO)
  - "IRS 2024" (add when available)
- **Vector Store Integration**: Uses OpenAI's vector stores to efficiently search and retrieve relevant information from PDFs

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set OpenAI API Key**
   This backend requires an environment variable (no keys are stored in the repo):
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Ensure PDF Files Are Present**
   Make sure the following PDF file is in the project directory:
   - `Artificial Intelligence May Help IRS Close the Tax Gap _ U.S. GAO.pdf`
   - `IRS 2024.pdf` (optional - add when available)

4. **Start the Flask Server**
   ```bash
   python server.py
   ```
   The server will start on `http://localhost:5000`

5. **(Optional) Build the new RAG Chat UI**
   The React app must be built once so Flask can serve it from `taxintegrity-ai/dist`:
   ```bash
   cd taxintegrity-ai
   npm install
   # create .env.local with GEMINI_API_KEY=...
   npm run build
   ```

6. **Open the UIs**
   - Navigate to `ai-prototype.html` in your browser
   - Or open `http://localhost:5000/ai-prototype.html` if using the Flask server
   - New RAG Chat UI: `http://localhost:5000/taxintegrity-ai/`

## Usage

1. Start the Flask server (`python server.py`)
2. Open `ai-prototype.html` in your browser
3. Type a question in the chat interface, such as:
   - "How can AI help speed up tax audits?"
   - "What are the benefits of using AI for tax evasion detection?"
   - "Is AI necessary for managing citizen's taxes?"
4. The AI will search through the PDF documents and provide an answer based on the source material

## File Structure

- `server.py` - Flask backend server that handles API requests
- `ai-prototype.html` - Frontend page with chat interface
- `inspirit_ai_project.py` - Standalone Python script (can be run independently)
- `requirements.txt` - Python dependencies

## How It Works

1. **Vector Store Creation**: When the server starts (or on first query), it creates an OpenAI vector store
2. **PDF Upload**: PDF files are uploaded to the vector store and processed into embeddings
3. **Query Processing**: When you ask a question:
   - The query is searched against the vector store
   - Relevant sections are retrieved from the PDFs
   - The results are formatted and sent to ChatGPT
   - ChatGPT generates an answer based on the provided sources

## Notes

- The model uses "gpt-4-turbo" (with fallback to "gpt-4" if needed)
- Note: The original code referenced "gpt-5.2" which doesn't exist, so it's been updated to use available models
- Vector stores are created on-demand and cached for subsequent queries
- Make sure you have sufficient OpenAI API credits/quota

## Troubleshooting

- **"Error connecting to server"**: Make sure `server.py` is running
- **"PDF file not found"**: Ensure the PDF files are in the same directory as `server.py`
- **API errors**: Check your OpenAI API key and ensure you have available credits/quota
- **RAG Chat shows 404**: Build the React app first (see step 5 above)
- **Empty results**: The vector store might still be processing PDFs - wait a moment and try again

## Adding the Second PDF

When you obtain the "IRS 2024" PDF file:
1. Place it in the project directory
2. In `server.py`, uncomment the line: `# "IRS 2024.pdf"`
3. In `inspirit_ai_project.py`, uncomment the line: `# "IRS 2024.pdf"`
4. Restart the server (or delete the existing vector store to recreate it with the new file)


