# GrowEdge: AI-Powered Interview Preparation and Task Management Platform

GrowEdge is a comprehensive web application that helps users prepare for technical interviews through AI-generated questions, resume analysis, and structured task management. The platform combines interview practice, skill assessment, and progress tracking to provide a complete interview preparation experience.

The application leverages modern web technologies and AI capabilities to deliver personalized interview questions based on uploaded resumes and selected topics. Users can practice with voice-enabled responses, receive immediate feedback, track their progress through interactive charts, and manage their preparation tasks. The platform includes features for resume parsing, skill extraction, and performance analytics to help users improve their interview readiness.

## Repository Structure
```
.
├── backend/                 # Backend server implementation
│   ├── middleware/         # Authentication and request processing
│   ├── models/            # MongoDB data models for Users, Tasks, and Interview Results
│   ├── routes/            # API route handlers for auth, questions, resume, and tasks
│   ├── utils/             # Helper functions for info extraction and question generation
│   └── server.mjs         # Express.js server entry point
├── frontend/              # React-based frontend application
│   └── project/
│       ├── src/          # Source code directory
│       │   ├── components/    # Reusable UI components
│       │   ├── layouts/      # Page layout templates
│       │   ├── pages/        # Individual page components
│       │   └── services/     # API integration services
│       └── vite.config.js    # Vite build configuration
```

## Usage Instructions
### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Modern web browser with Speech Recognition support
- npm or yarn package manager

### Required Modules
#### Backend Dependencies
```bash
npm install axios bcrypt cors dotenv express mongoose multer jsonwebtoken pdf-parse
```

Key modules:
- express: Web application framework
- mongoose: MongoDB object modeling
- cors: Cross-Origin Resource Sharing
- dotenv: Environment variable management
- multer: File upload handling
- pdf-parse: PDF document parsing

#### Frontend Dependencies
```bash
npm install react react-dom react-router-dom axios chart.js react-chartjs-2
```

Key modules:
- react & react-dom: UI framework
- chart.js & react-chartjs-2: Data visualization

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd growedge
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend/project
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Quick Start
1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend/project
npm run dev
```

3. Access the application at `http://localhost:5173`

### More Detailed Examples

1. User Authentication:
```javascript
// Login
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
const token = response.data.token;
```

2. Starting an Interview:
```javascript
// Generate interview questions
const response = await axios.post('/api/questions/generate', {
  topic: 'React',
  difficulty: 'Medium'
});
const questions = response.data.questions;
```

### Troubleshooting

1. Authentication Issues
- Error: "No token, authorization denied"
  - Ensure you're logged in and the token is stored in localStorage
  - Check if the Authorization header is properly set in API requests
  - Verify JWT_SECRET in backend .env file

2. Resume Upload Issues
- Error: "Failed to parse resume"
  - Ensure the PDF file is not password protected
  - Verify file size is under 5MB
  - Check if the file is properly formatted PDF

3. Interview Generation Issues
- Error: "Failed to generate questions"
  - Verify DEEPSEEK_API_KEY is valid
  - Check network connectivity
  - Ensure topic and difficulty are properly specified

## Data Flow
GrowEdge processes user interactions through a structured pipeline from resume upload to interview feedback.

```ascii
User Input → Resume Parser → Skill Extraction → Question Generation → Interview Session → Evaluation → Results Storage
     ↑                                                                                                      |
     └──────────────────────────────── Performance Analytics ────────────────────────────────────────────────┘
```

Key Component Interactions:
1. Frontend communicates with backend via RESTful APIs
2. Authentication middleware validates JWT tokens for protected routes
3. Resume parser extracts text and identifies relevant skills
4. Question generator uses AI to create personalized interview questions
5. Voice recognition processes user responses during interviews
6. Results are stored in MongoDB for historical tracking
7. Analytics engine processes performance data for visualization