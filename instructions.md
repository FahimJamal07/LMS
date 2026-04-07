# 🧠 Leave Management System – Project Instructions

## 🎯 Goal

Build a **production-grade, modern SaaS-style Leave Management System** frontend using React with a premium UI/UX similar to Stripe, Linear, or Notion.

---

## ⚙️ Tech Stack (Strict)

- React (Vite or Next.js)
- TypeScript
- Tailwind CSS
- shadcn/ui (or equivalent)
- Framer Motion (for animations)
- Zustand (state management)
- Recharts (for analytics)

---

## 🎨 Design System (STRICTLY FOLLOW)

### Style Principles

- Minimal, clean, modern
- No clutter, no outdated UI patterns
- Consistent spacing and layout
- Smooth animations and transitions

### UI Rules

- Use **rounded corners (xl or 2xl)**
- Use **soft shadows (not harsh)**
- Use **subtle gradients**
- Maintain **consistent color palette**
- Use **Inter or Poppins font**

### UX Rules

- Every interaction should feel smooth
- Add hover states, focus states, transitions
- Use loading skeletons instead of spinners
- Provide empty states for no data

---

## 🧱 Architecture Rules

### Folder Structure (STRICT)

src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── store/
├── services/
├── utils/
├── types/

---

### Component Rules

- Components must be **reusable**
- Avoid duplication
- Keep components small and modular
- Separate UI and logic when possible

---

### State Management

- Use Zustand
- Keep global state minimal and clean
- Mock APIs via service layer

---

## 🧠 Features to Implement

### Authentication

- Login / Signup pages
- Clean UI with validation

---

### Role-Based Dashboards

#### 👨‍🎓 Student

- Apply leave (form with date picker, type, reason)
- View leave history (table + filters)
- Status cards

---

#### 👨‍🏫 Faculty

- View pending requests
- Approve / Reject with remarks
- Quick decision UI

---

#### 🏫 Admin

- View all requests
- Analytics dashboard (charts)
- User management

---

## 🔔 Notifications

- Notification bell
- Dropdown panel
- Mock real-time updates

---

## 📊 UI Components Required

- Sidebar (collapsible)
- Navbar with profile menu
- Cards, tables, modals
- Toast notifications
- Tabs and filters

---

## ✨ Animation Rules

- Use Framer Motion
- Smooth page transitions
- Micro-interactions (hover, click)
- Avoid excessive or distracting animations

---

## 📱 Responsiveness

- Mobile-first design
- Fully responsive on all screen sizes

---

## 🚫 DO NOT

- Do not use outdated UI styles
- Do not generate plain/basic layouts
- Do not ignore responsiveness
- Do not mix inconsistent styles

---

## ✅ Expected Output

- Clean, modular, production-ready code
- Beautiful, modern UI
- Fully functional frontend with mock data
- Easy backend integration later

---

## 🚀 Final Note

This project should look like a **premium SaaS product**, not a student project.

Every UI decision should feel intentional, elegant, and modern.
