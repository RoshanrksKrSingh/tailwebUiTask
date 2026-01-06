# Assignment Portal - Frontend Client

This is the client-side application for the Assignment Workflow Portal. It handles the UI for Teachers and Students, interacting with the backend API to manage assignments and submissions.

## Technologies Used
- **React.js** - Frontend Library
- **Redux Toolkit** - State Management
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **Axios** - API Requests

## Features

### Teacher Dashboard
- **Create & Manage:** Create new assignments (starts as Draft).
- **Edit/Delete:** Modify or delete assignments *only* while they are in **Draft** mode.
- **Workflow:** Publish assignments for students -> Mark as Completed to lock them.
- **Review System:** View student submissions and mark them as **Reviewed**.

### Student Dashboard
- **View Assignments:** See only **Published** assignments.
- **Submit Work:** Submit text-based answers (One submission per assignment).
- **Read-Only View:** Once submitted, students can view their answer but **cannot edit** it.
- **Status Indicators:** See if the teacher has reviewed the submission.
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