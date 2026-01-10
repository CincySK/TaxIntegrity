# -*- coding: utf-8 -*-
"""Inspirit AI project - Updated to use proper PDF sources

This script processes PDF documents about AI and tax evasion/audits:
- "Artificial Intelligence May Help IRS Close the Tax Gap _ U.S. GAO.pdf"
- "IRS 2024.pdf" (add when available)

It uses OpenAI's vector stores to create embeddings and answer questions.
"""

import os
from openai import OpenAI

# Initialize OpenAI client
# Note: Use environment variable OPENAI_API_KEY for security in production
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "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"))

# PDF files to process
PDF_FILES = [
    "Artificial Intelligence May Help IRS Close the Tax Gap _ U.S. GAO.pdf",
    # "IRS 2024.pdf"  # Uncomment when this file is available
]

# Create vector store
vector_store = client.vector_stores.create(
    name="Tax Evasion Data Base",
)

# Get the base directory (where this script is located)
base_path = os.path.dirname(os.path.abspath(__file__))

# Upload PDF files
for pdf_file in PDF_FILES:
    pdf_path = os.path.join(base_path, pdf_file)
    if os.path.exists(pdf_path):
        print(f"Uploading {pdf_file}...")
        try:
            with open(pdf_path, "rb") as f:
                client.vector_stores.files.upload_and_poll(
                    vector_store_id=vector_store.id,
                    file=f
                )
            print(f"Successfully uploaded {pdf_file}")
        except Exception as e:
            print(f"Error uploading {pdf_file}: {e}")
    else:
        print(f"Warning: PDF file not found: {pdf_path}")

# Example query
user_query = "Is AI really necessary when it comes to managing citizen's taxes?"

# Search vector store
results = client.vector_stores.search(
    vector_store_id=vector_store.id,
    query=user_query,
)

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

formatted_results = format_results(results)

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
except:
    # Fallback to gpt-4
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

print("Query:", user_query)
print("\nAnswer:")
print(completion.choices[0].message.content)
