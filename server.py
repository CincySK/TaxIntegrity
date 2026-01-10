# Flask server for AI Tax Prototype
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Serve the static marketing site from the repo root regardless of current working directory.
app = Flask(__name__, static_folder=None)  # Disable default static handling
CORS(app)

# Try to import OpenAI - it's optional for serving static files
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

# OpenAI client is initialized lazily to avoid preventing the Flask server from starting
# when optional AI dependencies are mis-versioned locally.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = None


def get_openai_client():
    """
    Lazily construct and cache an OpenAI client.

    If you see:
      TypeError: __init__() got an unexpected keyword argument 'proxies'
    it typically means your installed `httpx` is too new for your installed `openai` SDK.
    Fix by pinning `httpx<0.28` (or upgrading `openai` to a version compatible with your `httpx`).
    """
    global client

    if not OPENAI_AVAILABLE:
        raise RuntimeError("OpenAI library is not installed. Run: pip install openai")

    if client is not None:
        return client

    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        return client
    except TypeError as e:
        raise RuntimeError(
            "OpenAI client failed to initialize due to a dependency mismatch.\n"
            "Try: pip install -U \"httpx<0.28\" \"openai==1.12.0\""
        ) from e

# Vector store ID (will be initialized on first use)
vector_store_id = None
vector_store_name = "Tax Evasion Data Base"

TAXINTEGRITY_AI_DIST_DIR = os.path.join(BASE_DIR, "taxintegrity-ai", "dist")

def get_or_create_vector_store():
    """Get existing vector store or create a new one"""
    global vector_store_id

    client = get_openai_client()
    
    if vector_store_id:
        # Verify it still exists
        try:
            client.vector_stores.retrieve(vector_store_id)
            return vector_store_id
        except:
            vector_store_id = None
    
    # Create new vector store
    vector_store = client.vector_stores.create(name=vector_store_name)
    vector_store_id = vector_store.id
    
    # Upload PDFs
    pdf_files = [
        "Artificial Intelligence May Help IRS Close the Tax Gap _ U.S. GAO.pdf",
        # "IRS 2024.pdf"  # Uncomment when this file is added
    ]
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(base_path, pdf_file)
        if os.path.exists(pdf_path):
            try:
                with open(pdf_path, "rb") as f:
                    client.vector_stores.files.upload_and_poll(
                        vector_store_id=vector_store_id,
                        file=f
                    )
                print(f"Uploaded {pdf_file} to vector store")
            except Exception as e:
                print(f"Error uploading {pdf_file}: {e}")
        else:
            print(f"PDF file not found: {pdf_path}")
    
    return vector_store_id

def format_results(results):
    """Format search results for ChatGPT"""
    formatted_results = []
    
    for result in results:
        file_id = getattr(result, "file_id", "")
        file_name = getattr(result, "filename", "")
        score = getattr(result, "score", "")
        
        result_block = (
            f"<result file_id='{file_id}' "
            f"file_name='{file_name}' "
            f"score='{score}'>"
        )
        
        for part in result.content:
            text = getattr(part, "text", "")
            result_block += f"<content>{text}</content>"
        
        result_block += "</result>"
        formatted_results.append(result_block)
    
    return f"<sources>{''.join(formatted_results)}</sources>"

@app.route('/')
def index():
    return send_file(os.path.join(BASE_DIR, 'index.html'))

@app.route('/chat.html')
def chat():
    return send_file(os.path.join(BASE_DIR, 'chat.html'))

@app.route('/taxintegrity-ai/')
@app.route('/taxintegrity-ai/<path:asset_path>')
def serve_taxintegrity_ai(asset_path='index.html'):
    """
    Serve the built Vite/React RAG chat app under /taxintegrity-ai/.
    Build it first via: (cd taxintegrity-ai && npm install && npm run build)
    """
    if not os.path.isdir(TAXINTEGRITY_AI_DIST_DIR):
        return (
            "taxintegrity-ai build output not found. "
            "Run: cd taxintegrity-ai && npm install && npm run build",
            404,
        )

    file_path = os.path.join(TAXINTEGRITY_AI_DIST_DIR, asset_path)
    if asset_path and os.path.isfile(file_path):
        return send_from_directory(TAXINTEGRITY_AI_DIST_DIR, asset_path)

    # SPA fallback (safe even if the app doesn't use routing)
    return send_from_directory(TAXINTEGRITY_AI_DIST_DIR, "index.html")

@app.route('/api/query', methods=['POST'])
def query():
    """Handle query requests"""
    try:
        try:
            client = get_openai_client()
        except Exception as e:
            return jsonify({'error': str(e)}), 500

        data = request.json
        user_query = data.get('query', '')
        
        if not user_query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Get or create vector store
        vs_id = get_or_create_vector_store()
        
        # Search vector store
        results = client.vector_stores.search(
            vector_store_id=vs_id,
            query=user_query,
        )
        
        # Convert to list (since it might be an iterator)
        results_list = list(results)
        num_sources = len(results_list)
        
        # Format results
        formatted_results = format_results(results_list)
        
        # Get answer from ChatGPT
        # Note: gpt-5.2 doesn't exist, using gpt-4-turbo as fallback
        try:
            completion = client.chat.completions.create(
                model="gpt-4-turbo",  # Changed from gpt-5.2 (doesn't exist)
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that answers questions about tax evasion detection and speeding up audits using AI. Base your answers strictly on the provided sources."
                    },
                    {
                        "role": "user",
                        "content": f"Sources: {formatted_results}\n\nQuery: '{user_query}'\n\nPlease provide a concise, well-structured answer based on the sources provided."
                    }
                ],
            )
            
            answer = completion.choices[0].message.content
            
            return jsonify({
                'answer': answer,
                'sources_used': num_sources
            })
        except Exception as e:
            # Fallback to gpt-4 if gpt-4-turbo fails
            try:
                completion = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a helpful assistant that answers questions about tax evasion detection and speeding up audits using AI. Base your answers strictly on the provided sources."
                        },
                        {
                            "role": "user",
                            "content": f"Sources: {formatted_results}\n\nQuery: '{user_query}'\n\nPlease provide a concise, well-structured answer based on the sources provided."
                        }
                    ],
                )
                answer = completion.choices[0].message.content
                
                return jsonify({
                    'answer': answer,
                    'sources_used': num_sources
                })
            except Exception as e2:
                return jsonify({'error': f'Error getting ChatGPT response: {str(e2)}'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    # Security: only serve known file types
    allowed_extensions = {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.pdf', '.json', '.map'}
    ext = os.path.splitext(path)[1].lower()
    
    file_path = os.path.join(BASE_DIR, path)
    
    # Check if file exists and has allowed extension
    if os.path.isfile(file_path) and (ext in allowed_extensions or not ext):
        return send_file(file_path)
    
    # For HTML files without extension, try adding .html
    if not ext and os.path.isfile(file_path + '.html'):
        return send_file(file_path + '.html')
    
    return "File not found", 404

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Vector store will be initialized on first query")
    print("Visit: http://localhost:8080")
    app.run(debug=True, port=8080, host='127.0.0.1')

