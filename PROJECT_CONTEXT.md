# 📋 Project Context Summary
> สรุปบริบททั้งหมดของโปรเจกต์ — อัปเดตล่าสุด: 20 กุมภาพันธ์ 2569

---

## 1. ภาพรวมโปรเจกต์ (Project Overview)

**ชื่อโปรเจกต์:** Centralized Organization Web App (ระบบศูนย์รวมรายงานการดำเนินงาน 13 หน่วยงาน)

**วัตถุประสงค์:** สร้าง Web Application ที่เป็นศูนย์กลางในการแสดงผลและจัดการรายงานการดำเนินงานของหน่วยงานย่อยทั้ง 13 แห่ง (เช่น รพ.สต.) โดยให้แต่ละหน่วยงานมี Admin เป็นของตนเอง สามารถล็อกอินเข้ามาโพสต์ อัปเดต หรือลบข้อมูลของหน่วยงานตนเองได้แบบเรียลไทม์ (คล้าย Facebook Page) โดยไม่ต้องรอให้ Super Admin ทำการ Deploy โค้ดใหม่

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | **Next.js** (App Router) | 16.1.6 |
| UI Library | **React** | 19.2.3 |
| Styling | **Tailwind CSS** | v4 |
| Language | **TypeScript** | v5 |
| Backend & Database | **Supabase** (PostgreSQL + Auth + Storage) | — |
| Deployment | **Vercel** (planned) | — |

---

## 3. User Roles (ระบบสิทธิ์ผู้ใช้งาน)

| Role | สิทธิ์ | จำนวน |
|------|-------|--------|
| **Public User** (บุคคลทั่วไป) | ดูรายงานผลการดำเนินงานของทุกหน่วยงาน, ฟิลเตอร์ดูเฉพาะหน่วยงาน | ไม่จำกัด |
| **Unit Admin** (แอดมินหน่วยงาน) | ล็อกอินเข้า Dashboard สร้าง/แก้ไข/ลบโพสต์ของหน่วยงานตัวเอง | 13 บัญชี |
| **Super Admin** (ผู้ดูแลหลัก) | จัดการเพิ่ม/ลด บัญชี Unit Admin, แก้ไขข้อมูลหน่วยงาน | 1+ |

---

## 4. Database Schema (Supabase)

### Tables

```sql
-- units: เก็บข้อมูลหน่วยงาน
units (id UUID PK, name TEXT, address TEXT, cover_image TEXT, created_at TIMESTAMPTZ)

-- users: เก็บข้อมูลแอดมิน (extends auth.users)
public.users (id UUID PK → auth.users, role TEXT ['super_admin','unit_admin','public'], unit_id UUID → units, created_at TIMESTAMPTZ)

-- posts: เก็บข้อมูลรายงาน
posts (id UUID PK, unit_id UUID → units, title TEXT, content TEXT, image_url TEXT, created_at TIMESTAMPTZ)
```

### Row Level Security (RLS) Policies

| Table | Policy | เงื่อนไข |
|-------|--------|---------|
| **units** | SELECT | ทุกคนดูได้ |
| **units** | INSERT/UPDATE | เฉพาะ `super_admin` |
| **users** | SELECT | ทุกคนดูได้ |
| **users** | UPDATE | แก้ไขได้เฉพาะตัวเอง |
| **posts** | SELECT | ทุกคนดูได้ |
| **posts** | INSERT/UPDATE/DELETE | เฉพาะ `unit_admin` ของหน่วยงานนั้น |

---

## 5. Project File Structure

```
web_page/
├── .env.local                  # Supabase credentials
├── PRD.txt                     # Product Requirements Document
├── README.md                   # Setup instructions
├── supabase_schema.sql         # Database schema + RLS policies
├── package.json                # Dependencies
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── src/
    ├── middleware.ts            # Edge middleware สำหรับ route protection & authorization
    ├── types/
    │   └── index.ts            # UserProfile type (id, role, unit_id)
    ├── lib/supabase/
    │   ├── client.ts           # Supabase client (browser)
    │   ├── server.ts           # Supabase client (server)
    │   └── middleware.ts       # Supabase middleware helper
    ├── hooks/
    │   └── useUser.ts          # Custom hook for user state
    ├── components/
    │   ├── public/
    │   │   ├── PublicFeed.tsx       # หน้าแสดงโพสต์รวมทุกหน่วยงาน
    │   │   └── UnitFilterBar.tsx    # ฟิลเตอร์เลือกหน่วยงาน
    │   ├── admin/
    │   │   ├── PostForm.tsx         # ฟอร์มสร้าง/แก้ไขโพสต์
    │   │   ├── PostList.tsx         # รายการโพสต์ใน Dashboard
    │   │   └── DeleteButton.tsx     # ปุ่มลบโพสต์
    │   └── layout/
    │       └── .keep
    └── app/
        ├── layout.tsx              # Root layout
        ├── page.tsx                # Landing page (Public Feed)
        ├── globals.css
        ├── favicon.ico
        ├── login/
        │   └── page.tsx            # หน้า Login
        ├── unit/[id]/
        │   └── page.tsx            # หน้าโปรไฟล์หน่วยงาน (Dynamic Route)
        ├── actions/
        │   ├── auth.ts             # Server Actions: login(), logout()
        │   └── posts.ts            # Server Actions: CRUD posts
        └── dashboard/
            ├── layout.tsx          # Dashboard layout (protected)
            ├── page.tsx            # Dashboard redirect
            ├── create/
            │   └── page.tsx        # สร้างโพสต์ (legacy)
            ├── unit/[unit_id]/
            │   ├── page.tsx        # Unit Admin Dashboard
            │   └── create/
            │       └── page.tsx    # สร้างโพสต์ (scoped to unit)
            └── super/
                └── page.tsx        # Super Admin Dashboard
```

---

## 6. Routing & Authorization Logic

```
POST /login
  → role = super_admin   → redirect /dashboard/super
  → role = unit_admin    → redirect /dashboard/unit/{unit_id}
  → role = public        → redirect /

Middleware (Edge):
  /dashboard/**           → ต้อง authenticated
  /dashboard/super/**     → ต้องเป็น super_admin
  /dashboard/unit/[id]/** → unit_admin ต้องมี unit_id ตรงกัน
  /login (ถ้าล็อกอินแล้ว) → redirect ไป dashboard ตาม role
```

---

## 7. Supabase Setup (วิธีตั้งค่า)

1. **สร้างโปรเจกต์** ใน Supabase
2. **รัน SQL Schema** — คัดลอก `supabase_schema.sql` ไปรันใน SQL Editor
3. **สร้าง Storage Bucket** — ชื่อ `post_images`, ตั้งเป็น Public
4. **เพิ่มหน่วยงาน** ในตาราง `units` (13 หน่วยงาน)
5. **สร้าง Users** ใน Authentication > Users
6. **ผูกสิทธิ์** ในตาราง `public.users` — ระบุ role และ unit_id
7. **ตั้งค่า `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
   ```

---

## 8. Environment Variables

| Variable | คำอธิบาย |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous/Public API Key |

---

## 9. สรุปการพัฒนาที่ทำไปแล้ว (Development History)

### ✅ Phase 1: Database Schema Design
- ออกแบบ Schema สำหรับ `units`, `users`, `posts`
- กำหนด RBAC (Role-Based Access Control) ด้วย RLS Policies
- ใช้ Supabase เป็น Backend (Database + Auth + Storage)

### ✅ Phase 2: Project Initialization
- สร้างโปรเจกต์ Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript
- ตั้งค่า Supabase Client (browser + server + middleware)
- สร้าง Type Definitions (`UserProfile`)

### ✅ Phase 3: Authentication & Authorization
- สร้างหน้า Login ด้วย Server Action
- Implement Edge Middleware สำหรับ Route Protection
- Redirect ตาม Role หลัง Login
- ป้องกัน Unit Admin เข้าถึง Dashboard ของหน่วยงานอื่น

### ✅ Phase 4: Admin Dashboard (CMS)
- สร้าง Unit Admin Dashboard พร้อม CRUD สำหรับ Posts
- สร้างฟอร์มโพสต์พร้อม Image Upload (Supabase Storage)
- สร้าง PostList Component สำหรับแสดง/จัดการโพสต์
- สร้าง DeleteButton พร้อม Confirmation
- สร้าง Super Admin Dashboard (Overview)

### ✅ Phase 5: Public-Facing Pages
- สร้าง Landing Page (Public Feed) แสดงโพสต์ล่าสุดจากทุกหน่วยงาน
- สร้าง Unit Profile Page (/unit/[id]) แสดงข้อมูลเฉพาะหน่วยงาน
- สร้าง UnitFilterBar Component

---

## 10. โปรเจกต์อื่นที่เกี่ยวข้อง (Other Projects Context)

### 🏥 Health Tracker / สาธารณสุข
- **ระบบติดตาม HT, DM, BP** — ใช้ Google Sheets + Google Apps Script เป็น Backend
- **ฟีเจอร์ GIS/Health Map** — ใช้ Google Maps API แสดงข้อมูลจุดพิกัดครัวเรือน
- **ระบบ Telegram Notification** — แจ้งเตือนเมื่อมีเคสส่งต่อ (Referral)
- **ระบบ Registry** — ทะเบียนผู้ป่วย พร้อม Click-to-Edit
- **UI Redesign** — ธีมสดใส rounded, warm color palette, card-based layout
- **อสม. Info** — เพิ่มข้อมูลอสม. ที่รับผิดชอบในฟอร์ม Home BP/FPG
- **Duplicate Filter Fix** — แก้ปัญหา Moo filter ซ้ำซ้อน
- **Fullscreen Map Mode** — โหมดเต็มจอสำหรับ Pin ตำแหน่งครัวเรือน

### 🛠️ เครื่องมือ
- **Opencode.ai** — ทดลองติดตั้งบน Windows (ใช้ PowerShell)
- **Claude Opus** — หมดโควต้าการใช้งาน

---

## 11. คำสั่งที่ใช้บ่อย (Common Commands)

```bash
# ติดตั้ง Dependencies
npm install

# รัน Development Server
npm run dev

# Build สำหรับ Production
npm run build

# รัน Production Server
npm start

# Lint
npm run lint
```

---

## 12. สิ่งที่ต้องทำต่อ (TODO / Next Steps)

- [ ] Deploy ขึ้น Vercel
- [ ] เพิ่มข้อมูลหน่วยงาน 13 แห่งลงในตาราง `units`
- [ ] สร้างบัญชี Unit Admin ทั้ง 13 บัญชี
- [ ] ปรับแต่ง UI/UX ให้สวยงามขึ้น (Premium Design)
- [ ] เพิ่ม Rich Text Editor สำหรับ Post Content
- [ ] เพิ่ม Search / Filter ในหน้า Public Feed
- [ ] ทำ Super Admin Dashboard ให้สมบูรณ์ (จัดการ User, จัดการ Unit)
- [ ] เพิ่มระบบ Notification (เมื่อมีโพสต์ใหม่)
- [ ] SEO Optimization (meta tags, og:image)
- [ ] ทำ Responsive Design ให้สมบูรณ์

---

> 📝 **หมายเหตุ:** ไฟล์นี้สรุปบริบทการพัฒนาทั้งหมดจาก 16 การสนทนา เพื่อให้สามารถย้ายไปใช้งานในตำแหน่งใหม่ได้อย่างต่อเนื่อง
