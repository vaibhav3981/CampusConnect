# UniMeConnect

> A social platform built for the University of Messina — connecting students, professors and alumni in one place.

**Stack:** Next.js · Node.js / Express · MongoDB Atlas · Cloudinary  
**Repo:** [github.com/vaibhav3981/CampusConnect](https://github.com/vaibhav3981/CampusConnect)

---

## What is UniMeConnect?

UniMeConnect is a full-stack university companion app developed as a thesis project for the University of Messina (UniMe). It gives every member of the university — students, professors and alumni — a single platform to share updates, find people, book appointments, view timetables and stay on top of academic deadlines.

---

## Features

### Authentication & Roles
- JWT-based registration and login
- Three roles: **Student**, **Professor**, **Alumni**
- Students enroll with a degree type, programme and year of study
- Students can optionally register a **Matricola** (6-digit unique university ID)
- Professors are linked to a department; access is restricted accordingly
- Profile privacy toggle — **Public** (default) or **Private** account

---

### Social Feed
- Post text, images and videos
- **#Hashtag** support with a live trending sidebar
- **@Mention** users — clicking a mention navigates to their profile
- Like and comment on posts
- Professors can publish **targeted Announcements** to specific years or programmes
- Delete your own posts and comments

---

### Notifications
- Real-time unread badge on the navbar bell icon
- Tabs: All · Likes · Comments · Mentions · Announcements · Requests
- Inline **Accept / Decline** buttons for:
  - **Connection requests** (student → student)
  - **Follow requests** (when the target account is private)
- Resolved requests disappear from the list on refresh

---

### People & Connections
- **Follow system** — follow professors and alumni
  - Public account → instant follow
  - Private account → sends a follow request; owner approves or declines from Notifications
- **Connection system** — send friend requests to other students
- Own profile shows private counts: **Connections · Following · Followers**

---

### Search (`/search`)
- Dedicated search page accessible from the navbar
- Toggle between **Search Students** and **Search Professors**
- **Student results** — 3-column table: Name · Programme · Matricola
- **Professor results** — 2-column table: Name · Department
- Search by name **or** 6-digit Matricola number
- Inline Follow / Add Friend buttons directly in search results

---

### User Profiles
- Own profile (`/profile`) — edit bio, year, department; upload avatar
- Public profile (`/profile/[id]`) — view anyone's posts, programme, matricola, follow/connect
- Programme is **read-only** after registration (set at sign-up)
- Matricola visible on profile card and in search results

---

### Services Page (`/timetable`)

#### 📅 Timetable
- Students see their own programme's timetable only (locked by enrolled programme)
- Professors can upload PDFs or images per year and semester for their department's programmes
- Supports PDF inline viewer and full-size link

#### 🗓 Academic Calendar
- Tabbed view: **Lessons · Exam Sessions · Holidays**
- Real UniMe 2025–26 dates sourced directly from the official university calendar
- Each entry automatically shows **Now** (pulsing dot) / **Upcoming** / **Done** status

#### 📌 Book an Appointment
- **Professors** — create available time slots for the next 14 days (date, start/end time, optional note); delete unbooked slots; see who booked each slot
- **Students** — search professors by name, view their available slots, book a slot with one click; cancel up to 1 hour before; view all upcoming bookings

#### 🌐 Online Services
- Quick-launch links: ESSE3 · Moodle · Student Email · SBA Library · Apply

#### 🎓 Student Support
- ERSU Messina App · ESN Messina · ATM Bus Pass

---

### Campus Map (`/map`)
- Interactive Leaflet map with 4 campus switcher:
  - **Papardo** — Engineering, Maths, Physics, CS
  - **Annunziata** — Chemistry, Biology, Pharmacy, Vet, Humanities
  - **Central** — Law, Economics, Political Sciences
  - **Policlinico** — Medicine, Dentistry, Biomedical
- Markers for Mensa (canteen), Library (SBA) and Student Residences
- "Get Directions" opens Google Maps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Media | Cloudinary (images + PDFs) |
| Auth | JWT (7-day expiry) |
| Maps | Leaflet.js |

---

## Project Structure

```
CampusConnect/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── connectionController.js
│   │   ├── followController.js
│   │   ├── notificationController.js
│   │   ├── pageController.js
│   │   ├── postController.js
│   │   └── timetableController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── AppointmentSlot.js
│   │   ├── Connection.js
│   │   ├── Follow.js
│   │   ├── Hashtag.js
│   │   ├── Notification.js
│   │   ├── Page.js
│   │   ├── Post.js
│   │   ├── Timetable.js
│   │   └── User.js
│   ├── routes/
│   │   ├── appointments.js
│   │   ├── auth.js
│   │   ├── connections.js
│   │   ├── follows.js
│   │   ├── notifications.js
│   │   ├── pages.js
│   │   ├── posts.js
│   │   ├── timetables.js
│   │   └── upload.js
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Layout.js
        │   └── Sidebar.js
        ├── pages/
        │   ├── api/
        │   ├── post/
        │   │   └── [id].js          # Single post deep-link
        │   ├── profile/
        │   │   └── [id].js          # Public profile view
        │   ├── _app.js
        │   ├── feed.js
        │   ├── index.js
        │   ├── login.js
        │   ├── map.js
        │   ├── notifications.js
        │   ├── profile.js           # Own profile
        │   ├── register.js
        │   ├── search.js
        │   └── timetable.js         # Services page
        ├── styles/
        │   └── globals.css
        └── utils/
            ├── api.js               # Axios instance
            ├── cn.js
            └── unime_data.js        # UniMe master data (depts, programmes, calendar, campuses)
```

---

## Test Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Student | vaibhav@test.com | test1234 | Data Analysis Y3, matricola 541275 |
| Student | vikram@test.com | test1234 | Veterinary Medicine, matricola 345678 |
| Professor | rossi@university.it | prof1234 | MIFT department |

---

## Environment Variables

**Backend `.env`**
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3001
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev        # runs on http://localhost:3001

# Frontend
cd frontend
npm install
npm run dev        # runs on http://localhost:3000
```

---

## University Data

`frontend/src/utils/unime_data.js` is a master data file containing:
- All 12 departments with campus locations and URLs
- All degree programmes (Bachelor, Master, Single-Cycle, PhD) with language and year count
- Canteen locations with GPS coordinates
- Student residences and libraries
- Real 2025–26 academic calendar (lessons, exam sessions, public holidays including Madonna della Lettera)
- Service links (ESSE3, Moodle, ERSU, SBA, ESN)

---

## About

Developed by **Vaibhav Bhardwaj** as a thesis project for the Bachelor's in Data Analysis at the University of Messina (2025–26).

---

*UniMeConnect — built for UniMe, by a UniMe student.*
