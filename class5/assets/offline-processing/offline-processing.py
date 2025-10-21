import fitz  # PyMuPDF
import re
import json
from collections import Counter
from nltk.corpus import stopwords
import nltk
import string
import glob

#script from chatgpt

# Ensure stopwords are downloaded
nltk.download('stopwords')

# ==== CONFIG ====

# PDF input
PDF_FILES = glob.glob("./*.pdf")
# PDF_FILES = ['file1.pdf', 'file2.pdf']   # <- Add your PDFs here
TARGET_JSON = 'word_freq.json'
CUSTOM_FILTER = {"ieee", "acm", "elsevier", "springer", "based", }  # Words to always remove
AUTHOR_NAMES = {"conficconi", "santambrogio", "lee"}  # Example author last names to remove
TOP_N = 100  # Number of keywords to keep
MIN_WORD_LENGTH = 3  # Ignore very short words
# =================

stop_words = set(stopwords.words('english'))
stop_words.update(CUSTOM_FILTER)  # Add extra banned words

def extract_text_from_pdfs(pdf_paths):
    """Extract all text from a list of PDF files."""
    full_text = ""
    for path in pdf_paths:
        doc = fitz.open(path)
        for page in doc:
            full_text += " " + page.get_text()
    return full_text

def clean_and_tokenize(text):
    """Tokenize text into lowercase words, remove punctuation and numbers."""
    words = re.findall(r'\b[a-zA-Z]{%d,}\b' % MIN_WORD_LENGTH, text.lower())
    return words

def filter_words(words):
    """Remove stop words, author names, and unwanted terms."""
    filtered = [
        w for w in words
        if w not in stop_words
        and w not in AUTHOR_NAMES
    ]
    return filtered

def main():
    text = extract_text_from_pdfs(PDF_FILES)
    words = clean_and_tokenize(text)
    filtered_words = filter_words(words)

    # Count frequencies
    word_counts = Counter(filtered_words)

    # Save as JSON for p5.js
    output = {"data": word_counts.most_common(TOP_N)}
    with open(TARGET_JSON, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"Saved top {TOP_N} keywords to {TARGET_JSON}")

if __name__ == "__main__":
    main()