# OOAD School Management Backend

Node.js + Express + MySQL backend for the school management app using Class-Table Inheritance (CTI).

## Setup

1. Configure database credentials (hardcoded):

- Open `src/config/db.js` and replace `password: "CHANGE_ME"` with your actual MySQL password. Adjust `host`, `port`, `user`, and `database` if needed.

2. Install dependencies:

```
npm install
```

3. Start the server:

```
npm run dev
```

The server runs on `http://localhost:3001`.

> Security note: Credentials are hardcoded by design per your request. Avoid committing real passwords to Git if this repo is shared.

## Healthcheck

- `GET /health` → `{ ok: true }` if DB connection is healthy.

## Auth

- `POST /auth/login` `{ email, password }` → `{ token, role, user }`
- `GET /auth/me` (Bearer token) → `{ role, user }`

## Classes

- `GET /api/classes` → classes for current role (student/teacher/admin)
- `GET /api/classes/:id` → class details
- `POST /api/classes` (teacher/admin) `{ name, description, teacher_id? }`
- `POST /api/classes/:classId/enroll/:studentId` (teacher/admin)

## Assignments

- `GET /api/classes/:classId/assignments`
- `POST /api/classes/:classId/assignments` (teacher)
  - body: `{ title, description?, due_at?, file_url?, file_name? }`
- `GET /api/assignments/:id`
- `POST /api/assignments/:id/submissions` (student)
  - body: `{ text_answer?, file_url?, file_name? }`
- `GET /api/assignments/:id/submissions` (teacher)
- `PUT /api/assignments/:id/submissions/:submissionId/grade` (teacher)

## Quizzes

- `GET /api/classes/:classId/quizzes`
- `POST /api/classes/:classId/quizzes` (teacher)
  - body: `{ title, description?, due_at?, questions: [{ text, points?, options: [{ text, is_correct }] }] }`
- `GET /api/quizzes/:id` → returns quiz with questions+options
- `POST /api/quizzes/:id/submissions` (student)
  - body: `{ answers: [{ question_id, selected_option_id }] }`
- `GET /api/quizzes/:id/submissions` (teacher)

## File Uploads

- `POST /api/files/upload` (multipart/form-data, field `file`)
  - returns `{ file_url, file_name }`
- Uploaded files served at `GET /files/:filename`

## Notes

- This backend expects the CTI schema you created earlier; table names used: `users`, `students`, `teachers`, `admins`, `classes`, `enrollments`, `assignments`, `assignment_submissions`, `quizzes`, `quiz_questions`, `quiz_options`, `quiz_submissions`, `quiz_answers`.
- Passwords must be stored hashed in `users.password_hash` (bcrypt). Use admin tools or a seed to create initial accounts.
