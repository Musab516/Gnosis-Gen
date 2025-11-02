# 🧠 Gnosis Gen

**AI-Powered Study Notes & Quiz Generator**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://gnosis-gen.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Railway-purple?style=for-the-badge&logo=railway)](https://gnosis-gen-production.up.railway.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> Transform your study materials into comprehensive notes and interactive quizzes using AI — in seconds.

---

## 🌐 **[Try Gnosis Gen Live →](https://gnosis-gen.vercel.app/)**

Upload a PDF, paste your lecture notes, or just describe what you want to learn — let AI do the rest.

---

## ✨ Features

### 📚 **Notes Mode**
- **Upload PDFs** — Extract text from lecture slides, textbooks, or papers
- **Paste Text** — Add your own notes, articles, or course materials
- **Natural Requests** — Tell the AI exactly what you want: *"Explain binary search trees in simple terms"*
- **Structured Output** — Get well-organized, easy-to-understand study notes with examples

### 🎯 **Quiz Mode**
- **Multiple Choice Questions** — Test your knowledge with auto-generated MCQs
- **Fill-in-the-Blank** — Practice key concepts with interactive blanks
- **Real-Time Scoring** — See your score update instantly as you answer
- **Smart Answer Checking** — Fuzzy matching accepts variations of correct answers
- **Instant Feedback** — Know immediately if you're right or wrong

### 🎨 **Beautiful UI**
- **Dark/Light Mode** — Easy on the eyes, day or night
- **Glassmorphism Design** — Modern, elegant interface with blur effects
- **Smooth Animations** — Polished interactions and transitions
- **Responsive Layout** — Works perfectly on desktop, tablet, and mobile

---

## 🚀 How It Works

```
1. Choose Your Mode
   ├─ 📝 Notes → Generate study materials
   └─ 🎯 Quiz → Create practice questions

2. Provide Content
   ├─ 📄 Upload PDF (lecture slides, textbooks)
   ├─ ✍️ Paste Text (notes, articles)
   └─ 💬 Describe Topic (natural language)

3. Get AI-Generated Content
   ├─ Notes: Comprehensive explanations with examples
   └─ Quiz: MCQs + Fill-in-the-blank questions

4. (Quiz Mode) Take the Quiz
   ├─ Answer questions interactively
   ├─ Get instant feedback
   └─ See your final score
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with custom gradients
- **Animations:** CSS transitions and transforms
- **State Management:** React Hooks (useState, useEffect)
- **Deployment:** Vercel (Edge Network)

### Backend
- **Framework:** FastAPI (Python)
- **AI Model:** GPT-4o-mini via OpenRouter API
- **PDF Processing:** PyPDF2 for text extraction
- **CORS:** Cross-Origin Resource Sharing enabled
- **Deployment:** Railway (Serverless)

### Key Libraries
```json
{
  "frontend": ["react", "vite", "tailwindcss"],
  "backend": ["fastapi", "openai", "pypdf2", "python-multipart"]
}
```

---

## 📸 Screenshots

### Notes Mode
![Notes Mode](https://via.placeholder.com/800x450/6366f1/ffffff?text=Notes+Mode+Screenshot)
*Generate comprehensive study notes from any material*

### Quiz Mode
![Quiz Mode](https://via.placeholder.com/800x450/ec4899/ffffff?text=Quiz+Mode+Screenshot)
*Take interactive quizzes with instant feedback*

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x450/1e293b/ffffff?text=Dark+Mode+UI)
*Beautiful dark theme for late-night studying*

---

## 🔧 Local Development

### Prerequisites
- Node.js 18+ (Frontend)
- Python 3.9+ (Backend)
- OpenRouter API Key

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Musab516/Gnosis-Gen.git
cd Gnosis-Gen

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend  # (or wherever your main.py is)

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn openai python-multipart pypdf2 python-dotenv

# Create .env file
echo "OPENROUTER_API_KEY=your_key_here" > .env

# Start server
uvicorn main:app --reload --port 8000
```

Backend will run on `http://localhost:8000`

---

## 🌍 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables:**
- `VITE_API_BASE` → Your Railway backend URL

### Backend (Railway)

1. Push your code to GitHub
2. Connect repository to Railway
3. Add environment variable: `OPENROUTER_API_KEY`
4. Railway auto-deploys on push

---

## 📖 API Documentation

### `POST /generate`

Generate notes or quiz from provided content.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Either `"notes"` or `"quiz"` |
| `user_request` | string | No | Natural language instruction |
| `topic` | string | No | Topic name (e.g., "Binary Search Trees") |
| `text_input` | string | No | Raw text content |
| `file` | file | No | PDF file upload |

**Example Request:**
```javascript
const formData = new FormData();
formData.append('mode', 'quiz');
formData.append('topic', 'Data Structures');
formData.append('user_request', 'Create a quiz on stacks and queues');
formData.append('file', pdfFile);

const response = await fetch('https://gnosis-gen-production.up.railway.app/generate', {
  method: 'POST',
  body: formData
});
```

**Example Response (Quiz Mode):**
```json
{
  "status": "success",
  "mode": "quiz",
  "quiz": {
    "mcq": [
      {
        "question": "What data structure follows LIFO principle?",
        "options": ["Queue", "Stack", "Tree", "Graph"],
        "correct_answer": "Stack"
      }
    ],
    "short_answer": [
      {
        "question": "A stack uses _____ principle.",
        "correct_answer": "LIFO"
      }
    ]
  }
}
```

---

## 🧠 How the AI Works

### Notes Generation
1. **Extract Content** — Parse PDF or read text input
2. **Build Prompt** — Include user request + material
3. **GPT-4o-mini** — Generate comprehensive notes
4. **Return Markdown** — Formatted for easy reading

### Quiz Generation
1. **Extract Content** — Same as notes mode
2. **Structured Prompt** — Request JSON format with MCQs and blanks
3. **GPT-4o-mini** — Generate questions with correct answers
4. **JSON Parsing** — Extract structured quiz data
5. **Return Quiz** — Ready for interactive display

### Smart Answer Checking
```javascript
// Fuzzy matching algorithm
function calculateSimilarity(userAnswer, correctAnswer) {
  // Normalize: lowercase, trim
  const userWord = userAnswer.split(' ')[0];
  const correctWords = correctAnswer.split(' ')
    .filter(word => word.length > 2 && !fillerWords.has(word));
  
  // Match first meaningful word
  return correctWords.includes(userWord) ? 1.0 : 0;
}
```

---

## 🎓 Use Cases

### For Students
- 📚 Generate notes from lecture PDFs
- 🎯 Create practice quizzes before exams
- 📝 Summarize long textbook chapters
- ✅ Self-test on key concepts

### For Educators
- 🏫 Quickly create study materials
- 📊 Generate assessment questions
- 📖 Supplement course content
- 🎓 Provide extra practice resources

### For Self-Learners
- 📚 Break down complex topics
- 🧠 Test understanding of new concepts
- 📝 Create personalized study guides
- 🎯 Practice with AI-generated questions

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Flashcard Mode** — Spaced repetition system
- [ ] **Multiple File Upload** — Process multiple PDFs at once
- [ ] **Export Options** — Download notes as PDF/Markdown
- [ ] **Study Sessions** — Track progress over time
- [ ] **Difficulty Levels** — Easy, Medium, Hard quizzes
- [ ] **True/False Questions** — Additional question type
- [ ] **Timed Quizzes** — Add time pressure for practice
- [ ] **User Accounts** — Save history and progress
- [ ] **Collaborative Study** — Share quizzes with friends
- [ ] **Voice Notes** — Upload audio lectures

### Technical Improvements
- [ ] **Caching** — Store common quiz responses
- [ ] **Rate Limiting** — Prevent API abuse
- [ ] **Analytics** — Track usage patterns
- [ ] **A/B Testing** — Optimize prompts for better output
- [ ] **WebSocket** — Real-time generation progress
- [ ] **OCR Support** — Handle scanned PDFs with images

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features (flashcards, analytics, etc.)
- 🎨 UI/UX improvements
- 📚 Documentation enhancements
- 🧪 Test coverage

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Musab Bin Majid**  
Computer Science Student @ IBA, Karachi

- 🌐 **Gnosis Gen**: [gnosis-gen.vercel.app](https://gnosis-gen.vercel.app/)
- 💻 **GitHub**: [github.com/Musab516](https://github.com/Musab516)
- 💼 **LinkedIn**: [linkedin.com/in/musab-bin-majid-8714272b5](https://linkedin.com/in/musab-bin-majid-8714272b5)
- 📧 **Email**: musabsiddiqui05@gmail.com

---

## 🙏 Acknowledgments

- **OpenRouter** — For providing access to GPT-4o-mini API
- **Vercel** — For seamless frontend deployment
- **Railway** — For reliable backend hosting
- **FastAPI** — For the amazing Python web framework
- **React** — For the powerful UI library

---

## 📊 Project Stats

- **Lines of Code**: ~800 (Frontend) + ~200 (Backend)
- **Technologies**: 7+ (React, Python, FastAPI, Tailwind, etc.)
- **API Calls**: GPT-4o-mini via OpenRouter
- **Deployment**: 2 platforms (Vercel + Railway)
- **Features**: Notes generation + Interactive quizzes

---

**⭐ If Gnosis Gen helped you study better, please star the repository!**

---

*Built with 🧠 and ☕ by Musab Bin Majid*
