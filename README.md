# Pulse — Task Management & Analytics Dashboard
**AIT-232T Web Technologies — Assignment # 3**

A full-stack task dashboard. Vanilla JS/HTML/CSS frontend talks to an Express + MongoDB backend over a REST API using `fetch()` — no page reloads, no frontend framework.

---

## 1. Project structure

```
task-dashboard/
├── backend/
│   ├── models/Task.js       # Mongoose schema
│   ├── routes/tasks.js      # GET / POST / PATCH / DELETE /api/tasks
│   ├── server.js            # Express app entry point
│   ├── package.json
│   └── .env.example         # copy to .env and fill in your MongoDB URI
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## 2. Run it locally

**Prerequisites:** Node.js 18+, and either a local MongoDB install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster.

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste your MONGO_URI
npm run dev        # or: npm start
```

The server serves both the API **and** the frontend from one process, so once it's running just open:

```
http://localhost:5000
```

There's nothing to start separately for the frontend — `server.js` serves the `frontend/` folder as static files.

### Getting a free MongoDB Atlas connection string
1. Create a free account at mongodb.com/cloud/atlas and create a free (M0) cluster.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — required so Render can reach it too.
4. Click **Connect → Drivers**, copy the connection string, and paste it into `.env` as `MONGO_URI`, replacing `<username>`, `<password>`, and the database name.

## 3. API reference

| Method | Route             | Body                                              | Response             |
|--------|--------------------|----------------------------------------------------|-----------------------|
| GET    | `/api/tasks`        | —                                                   | `{ success, count, data: [Task] }` |
| POST   | `/api/tasks`        | `{ title, description?, priority?, dueDate? }`     | `{ success, data: Task }` (201) or `{ success:false, message }` (400) |
| PATCH  | `/api/tasks/:id`    | any subset of Task fields, e.g. `{ completed: true }` | `{ success, data: Task }` |
| DELETE | `/api/tasks/:id`    | —                                                   | `{ success, data: {} }` (200) or 404 if not found |
| GET    | `/api/health`       | —                                                   | `{ status, dbState }` — quick deployment sanity check |

## 4. Database schema (`Task` document)

| Field        | Type     | Notes                                  |
|--------------|----------|-----------------------------------------|
| `title`      | String   | required, 1–120 chars                   |
| `description`| String   | optional                                |
| `priority`   | String   | enum: `low` \| `medium` \| `high`, default `medium` |
| `completed`  | Boolean  | default `false`                         |
| `dueDate`    | Date     | optional                                |
| `createdAt`  | Date     | auto-set on insert                      |

## 5. Deploying

### GitHub
```bash
cd task-dashboard
git init
git add .
git commit -m "Assignment 3 — Task Dashboard"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
(`.gitignore` already excludes `node_modules` and `.env`.)

### Render (free web service)
1. New → Web Service → connect your GitHub repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment variables:** add `MONGO_URI` (your Atlas string) — Render will set `PORT` automatically.
6. Deploy. Render gives you a live URL like `https://your-app.onrender.com` — that's your "Live URL Link" deliverable, and it serves the frontend too since Express serves it statically.

*(Vercel/Heroku work the same way conceptually — only the build/start command fields differ. Render is recommended here because it natively supports long-running Node servers, which this app needs since it keeps a persistent MongoDB connection.)*

## 6. Submission checklist
- [ ] Push code to GitHub → copy repo link
- [ ] Deploy backend to Render with `MONGO_URI` env var set → copy live URL
- [ ] Confirm `https://your-app.onrender.com/api/health` returns `{"status":"ok"}`
- [ ] Submit the PDF Technical Sheet (included) alongside both links
