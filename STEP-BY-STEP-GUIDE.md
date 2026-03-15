# Rankset PWA – Step-by-Step Guide (Non-Technical)

This guide walks you through building and deploying **Rankset**—a free, cross-platform PWA for competitive exam tests—using only **Render** (free) and **MongoDB Atlas** (500 MB free). No cost, no coding experience required to follow the steps.

---

## Part 1: What You Need (All Free)

| What | Where to Get | Purpose |
|------|--------------|---------|
| **MongoDB Atlas** | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) | Free 500 MB database for users, questions, results |
| **Render** | [render.com](https://render.com) | Free hosting for your app (backend + frontend) |
| **Google Account** | Already have | For password recovery (Google Apps Script), AdSense later |
| **GitHub** | [github.com](https://github.com) | Free; store your code and connect to Render |
| **Cursor IDE** | You have it | To edit and run the project |

---

## Part 2: Big Picture – How Rankset Works

1. **Frontend (PWA)**  
   The website/app users see: register, choose language → exam → chapter, take test, see rank, share result, change password. Works on mobile, tablet, and desktop.

2. **Backend (API)**  
   Runs on Render. It talks to MongoDB (save users, questions, test results, ranks) and sends data to the frontend. No direct MongoDB connection from the browser (secure).

3. **MongoDB**  
   Stores: user profiles, exams, chapters, questions (with images, LaTeX), test attempts, ranks.

4. **Password recovery**  
   Done via **Google Apps Script** (you’ll get a web app URL that your frontend calls to send reset emails). No extra server cost.

5. **AdSense**  
   Placeholders are in the UI. After the app is live and you get approval, you replace placeholders with your AdSense code. Layout is designed so ads don’t irritate users.

---

## Part 3: Step-by-Step Setup

### Step 1 – Create MongoDB Atlas (Free 500 MB)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Create a **new project** (e.g. “Rankset”).
3. Build a **cluster**:
   - Choose **M0 FREE** (shared).
   - Pick a cloud provider and region (closest to your users).
   - Create cluster.
4. **Database user**:
   - Security → Database Access → Add New Database User.
   - Authentication: Password. Note username and password safely.
5. **Network access**:
   - Security → Network Access → Add IP Address.
   - For development: “Allow Access from Anywhere” (0.0.0.0/0). For production you can later restrict to Render IPs if you want.
6. **Connection string**:
   - Clusters → Connect → Connect your application.
   - Copy the URI. It looks like:  
     `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/rankset?retryWrites=true&w=majority`
   - Replace `USERNAME` and `PASSWORD` with your DB user. Replace database name with `rankset` (or keep as in URI).
7. Save this URI; you’ll add it to Render as an environment variable (e.g. `MONGODB_URI`).

---

### Step 2 – Create a GitHub Account and Repository

1. Sign up at [github.com](https://github.com) if you don’t have an account.
2. Create a **new repository**:
   - Name: `rankset` (or any name).
   - Public, no need to add README if you’ll push existing code.
3. You’ll use this repo to push your project from Cursor (or Git). Render will deploy from this repo.

---

### Step 3 – Get the Rankset Code in Your Folder

Your project is in `e:\rankset` with:

- **backend/** – Node.js API (users, exams, questions, tests, ranks).
- **frontend/** – React PWA (UI, tests, leaderboard, AdSense placeholders).

In Cursor:

1. Open folder: **File → Open Folder →** `e:\rankset`.
2. Open **Terminal** in Cursor (e.g. Ctrl+`).
3. Install backend dependencies:
   - `cd e:\rankset\backend`
   - Run: `npm install`
4. Install frontend dependencies:
   - `cd e:\rankset\frontend`
   - Run: `npm install`

If any step fails, copy the error and search it online or ask in the Cursor chat.

---

### Step 4 – Configure Environment Variables (Secrets)

**Backend** needs these. Create a file `backend/.env` (never commit this to GitHub; add `.env` to `.gitignore`):

```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=any_long_random_string_you_make_up
FRONTEND_URL=https://your-rankset-app.onrender.com
PASSWORD_RESET_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

- `MONGODB_URI`: from Step 1.
- `JWT_SECRET`: invent a long random string (e.g. 32+ characters).
- `FRONTEND_URL`: after you deploy on Render, put your frontend URL here.
- `PASSWORD_RESET_SCRIPT_URL`: from Step 7 (Google Apps Script).

**Frontend** needs the backend URL. Create `frontend/.env`:

```env
VITE_API_URL=https://your-rankset-api.onrender.com
```

You’ll set these again in **Render Dashboard** as environment variables (so the live app uses them).

---

### Step 5 – Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up / log in (GitHub is easiest).
2. **New → Web Service**.
3. Connect your **GitHub** account and select the **rankset** repository.
4. Settings:
   - **Name**: e.g. `rankset-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. **Environment**:
   - Add: `MONGODB_URI` = your Atlas URI  
   - Add: `JWT_SECRET` = your secret  
   - Add: `FRONTEND_URL` = your frontend URL (you can set this after deploying frontend)  
   - Add: `PASSWORD_RESET_SCRIPT_URL` = your Google Script URL (after Step 7)
6. Create Web Service. Render will build and deploy. Note the URL (e.g. `https://rankset-api.onrender.com`).

---

### Step 6 – Deploy Frontend on Render

1. **New → Static Site** (or Web Service if you use a small server for SPA).
2. Connect same repo.
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: Add `VITE_API_URL` = your backend URL (e.g. `https://rankset-api.onrender.com`)
4. Deploy. Note the URL (e.g. `https://rankset.onrender.com`).

Then go back to **backend** service and set `FRONTEND_URL` to this frontend URL so CORS and password-reset links work.

---

### Step 7 – Password Recovery with Google Apps Script (Free)

A ready-to-use script is in **`docs/google-apps-script-password-reset.js`** — open it in your project and copy its contents into Google Apps Script (or follow the steps below).

1. Go to [script.google.com](https://script.google.com).
2. New project. Paste the contents of `docs/google-apps-script-password-reset.js` (or this minimal version):

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var email = data.email;
  var resetLink = data.resetLink;
  var subject = "Rankset - Password Reset";
  var body = "Click to reset password: " + resetLink;
  GmailApp.sendEmail(email, subject, body);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New deployment → Type: Web app.
   - Execute as: Me; Who has access: Anyone.
4. Copy the **Web app URL**. That is your `PASSWORD_RESET_SCRIPT_URL`. Your backend will call this URL with `email` and `resetLink`; the script sends the email via your Gmail.

---

### Step 8 – Upload Your Logo

1. Put your logo file as **`frontend/public/logo.png`** (e.g. 192×192 or 512×512 pixels for best PWA icon quality).
2. The app header already uses `/logo.png`. If the image is missing or fails to load, the text "Rankset" is shown instead.

---

### Step 9 – Google AdSense (After App Is Live)

1. Apply at [google.com/adsense](https://www.google.com/adsense). You need a live website URL (your Render frontend URL).
2. Once approved, you get an ad code snippet. In the frontend, replace the AdSense **placeholder** components with your real snippet (only in the places marked for ads so it doesn’t irritate users).
3. Privacy policy and other policies (below) are required for AdSense approval.

---

### Step 10 – Roles: Admin vs Manager

- **Admin**: Full access – upload questions (single + CSV), manage users, download all reports (user info + test ranks, exam-wise and topic-wise).
- **Manager**: Can only get **reports** (leaderboard/reports filtered by exam, phone number, and other criteria). No user management or question upload.

The backend uses a `role` field on the user: `admin`, `manager`, or `user`. You can set your first user as `admin` in MongoDB once, then create managers from the admin panel.

---

## Part 4: Features Checklist (What the Code Does)

| Feature | Where It Lives |
|---------|----------------|
| Register (name, father name, exam, email, phone, password) | Frontend: Register page → Backend: POST /api/auth/register |
| Choose language → exam → chapter | Frontend: dropdowns + API for exams/chapters |
| Take test | Frontend: Test screen → Backend: submit attempt, compute score |
| Subject-wise & overall rank (sandwich sidebar) | Frontend: Leaderboard component with tabs/sidebar |
| Recover password (Google Script) | Backend calls your Script URL; frontend has “Forgot password” |
| Change password | Frontend: Profile/Settings → Backend: POST /api/auth/change-password |
| Result + share (WhatsApp, Instagram, etc.) | Frontend: Result page with share buttons (Web Share API + links) |
| Review mistakes | Frontend: After result, show questions with correct/incorrect and correct answer |
| Admin: Download user report (filters) | Admin panel → Backend: GET /api/admin/users/export?filters... |
| Admin: Download rank reports (exam/topic) | Admin panel → Backend: GET /api/admin/reports/ranks?... |
| Admin: Manage users | Admin panel → Backend: list, block, delete users |
| Admin: Upload questions (medium, class, chapter, images, LaTeX) | Admin panel → Backend: POST /api/admin/questions (multipart) |
| Admin: Bulk upload CSV | Admin panel → Backend: POST /api/admin/questions/bulk (CSV) |
| Manager: Reports by exam, phone, criteria | Same reports API with role check; manager sees only report endpoints |
| PWA (installable, offline-capable) | frontend: manifest + service worker (Vite PWA plugin) |
| Responsive (mobile, tablet, desktop) | CSS and layout in frontend |
| AdSense placeholders | Dedicated ad components in layout (non-intrusive) |

---

## Part 5: Privacy Policy & Monetization

For AdSense and app stores you need:

1. **Privacy Policy** – What data you collect (name, email, phone, exam, results), how you use it, MongoDB/Render, AdSense, and user rights. A template is in `docs/PRIVACY-POLICY.md`.
2. **Terms of Service** – Rules of use, no misuse, disclaimer for exam content. Template in `docs/TERMS-OF-SERVICE.md`.
3. **Cookie policy** – If you use cookies (e.g. login token); mention in privacy policy.

Add links to these in the app footer and, if needed, in the registration flow. Host the pages either as static pages in your frontend (e.g. `/privacy`, `/terms`) or as separate pages on Render.

---

## Part 6: Performance (Thousands of Students)

- **MongoDB**: Indexes on `email`, `phone`, `exam`, `chapter`, `attempts.userId`, `attempts.examId`, etc. The backend defines indexes so queries stay fast.
- **Render free tier**: Spins down after inactivity; first request can be slow. For “thousands at a time” you’d eventually need a paid plan; for starting free, this is the trade-off.
- **Frontend**: Static files on Render CDN; minimal JS; lazy loading for heavy screens (e.g. admin). AdSense placeholders are in non-critical layout so they don’t block the main flow.

---

## Part 7: Creating your first exam and chapter

Before students can take tests, you need at least one **exam** and one **chapter** in the database. After you set your user as **admin** (in MongoDB: edit the user document and set `role: "admin"`):

1. Log in and go to **Admin → Upload questions** (or **Reports** then use **Upload questions**).
2. **Option A – Seed script:** From the `backend` folder run: `node scripts/seed.js`. This creates one sample exam and one chapter so you can start adding questions from the Admin panel.  
   **Option B – Manual:** In MongoDB Atlas, create documents in the **exams** and **chapters** collections. Example:
   - **exams:** `{ "name": "NEET", "slug": "neet", "language": "en", "isActive": true, "order": 0 }`
   - **chapters:** `{ "examId": "<paste exam _id>", "name": "Physics - Motion", "slug": "physics-motion", "isActive": true, "order": 0 }`
3. Then in the app, use **Admin → Upload questions** or **Bulk CSV** to add questions for that exam and chapter.

---

## Part 8: Quick Reference – Order of Doing Things

1. MongoDB Atlas: cluster + user + URI.  
2. GitHub: create repo.  
3. In Cursor: open `e:\rankset`, run `npm install` in `backend` and `frontend`.  
4. Create `backend/.env` and `frontend/.env` with the variables above.  
5. Deploy **backend** on Render (Web Service), add env vars.  
6. Deploy **frontend** on Render (Static Site), set `VITE_API_URL`.  
7. Set backend `FRONTEND_URL` and create Google Apps Script for password reset; set `PASSWORD_RESET_SCRIPT_URL`.  
8. Upload logo to `frontend/public/logo.png`.  
9. In MongoDB, set your user’s `role` to `admin`; create at least one exam and chapter (see Part 7).  
10. Add Privacy Policy and Terms (from `docs/`) and link in app.  
11. Apply for AdSense with your live URL and replace placeholders when approved.

---

## If Something Fails

- **Build fails on Render**: Check “Logs” in Render; often it’s a missing env var or wrong root directory.  
- **Can’t connect to MongoDB**: Check IP allowlist (0.0.0.0/0 for start) and URI (username, password, database name).  
- **Password reset not sending**: Check Google Script URL, “Execute as: Me”, and Gmail permissions.  
- **CORS error**: Ensure `FRONTEND_URL` in backend exactly matches the URL you open in the browser (no trailing slash).

You can do each part one step at a time; the project is structured so you can run backend and frontend locally first, then deploy when ready.
