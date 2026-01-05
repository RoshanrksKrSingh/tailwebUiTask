# Assignment Portal - Frontend Client

This is the client-side application for the Assignment Workflow Portal. It handles the UI for Teachers and Students, interacting with the backend API to manage assignments and submissions.

##  Technologies Used
- **React.js** - Frontend Library
- **Redux Toolkit** - State Management
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **Axios** - API Requests

##  Features

###  Teacher Dashboard
- Create new assignments (Draft mode).
- Publish assignments for students.
- View student submissions.
- Mark assignments as Completed.
- **Redo Workflow:** Allow students to resubmit tasks if needed.

### 👨 Student Dashboard
- View published assignments.
- Submit answers (Text-based).
- View submission status (Submitted / Redo Requested).
- Prevent duplicate submissions unless a Redo is requested.

## Setup & Installation

1. **Download Zip file or import the project on desktop and Navigate to the frontend directory:**
   ```bash
   cd frontend
Install Dependencies:

Bash

npm install
Configuration:

Ensure the backend server is running on http://localhost:5000.

If your backend port is different, update the API_URL in src/redux/assignmentSlice.js and src/redux/authSlice.js.

Run the App:

Bash

npm start
The app will open at http://localhost:3000.

 Testing Credentials 
You can register your own users, or use these if you have seeded the database:

Teacher:

Email: teacher@test.com

Password: 123

Student:

Email: student@test.com

Password: 123

# Project Structure
frontend/src/
├── components/     # Reusable components (Navbar, Modal, etc.)
├── pages/          # Dashboard & Login pages
├── redux/          # Redux slices (Auth, Assignments)
└── App.js          # Main Route setup