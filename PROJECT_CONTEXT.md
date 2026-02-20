# 📋 Project Context Summary
> สรุปบริบททั้งหมดของโปรเจกต์ — อัปเดตล่าสุด: **20 กุมภาพันธ์ 2569 เวลา 16:19 น.**

---

## 1. ภาพรวมโปรเจกต์ (Project Overview)

**ชื่อโปรเจกต์:** Centralized Organization Web App (ระบบศูนย์รวมรายงานการดำเนินงาน 13 หน่วยงาน)

**วัตถุประสงค์:** สร้าง Web Application ที่เป็นศูนย์กลางในการแสดงผลและจัดการรายงานการดำเนินงานของ **รพ.สต.** ย่อยทั้ง 13 แห่ง โดยให้แต่ละหน่วยงานมี Admin เป็นของตนเอง สามารถล็อกอินเข้ามาโพสต์ อัปเดต หรือลบข้อมูลได้แบบเรียลไทม์ (คล้าย Facebook Page) ไม่ต้องรอ Deploy โค้ดใหม่

**รพ.สต. มี Google Drive Pro อยู่แล้ว** → ใช้อัปโหลดรูปไว้ใน Google Drive แล้ววาง URL ลงในระบบ

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | **Next.js** (App Router) | 16.1.6 |
| UI Library | **React** | 19.2.3 |
| Styling | **Tailwind CSS** | v4 |
| Language | **TypeScript** | v5 |
| Backend & Database | **Supabase** (PostgreSQL + Auth + Storage) | — |
| Deployment | **Vercel** (GitHub Auto-Deploy เปิดใช้แล้ว) | — |
| Image Storage | **Google Drive** (URL → Direct Image Link) | — |

---

## 3. User Roles (ระบบสิทธิ์ผู้ใช้งาน)

| Role | สิทธิ์ | จำนวน |
|------|-------|--------|
| **Public User** (บุคคลทั่วไป) | ดูรายงานผลการดำเนินงานของทุกหน่วยงาน | ไม่จำกัด |
| **Unit Admin** (แอดมินหน่วยงาน) | ล็อกอินเข้า Dashboard สร้าง/แก้ไข/ลบโพสต์ของหน่วยงานตัวเอง | 13 บัญชี |
| **Super Admin** (ผู้ดูแลหลัก) | จัดการทุกหน่วยงาน โพสต์ได้ทุก Unit | 1+ |

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

### Row Level Security (RLS) Policies ✅ (อัปเดตล่าสุด)

| Table | Policy | เงื่อนไข |
|-------|--------|---------| 
| **units** | SELECT | ทุกคนดูได้ |
| **units** | INSERT/UPDATE | เฉพาะ `super_admin` |
| **users** | SELECT | ทุกคนดูได้ |
| **users** | UPDATE | แก้ไขได้เฉพาะตัวเอง |
| **posts** | SELECT | ทุกคนดูได้ |
| **posts** | INSERT | `unit_admin` ของหน่วยงานนั้น **หรือ** `super_admin` |
| **posts** | UPDATE/DELETE | `unit_admin` ของหน่วยงานนั้น **หรือ** `super_admin` |

> ⚠️ **หมายเหตุ:** ใน `supabase_schema.sql` ในโปรเจกต์ยังเป็น Schema เก่า (มีเฉพาะ unit_admin) แต่ใน Supabase จริงได้เพิ่ม Policy สำหรับ super_admin ไปแล้วผ่าน SQL Editor

---

## 5. Project File Structure

```
web_page/
├── .env.local                  # Supabase credentials
├── PRD.txt                     # Product Requirements Document
├── supabase_schema.sql         # Database schema + RLS policies (อาจต้องอัปเดต)
├── next.config.ts              # ✅ เพิ่ม remotePatterns (Google, Supabase)
├── src/
│   ├── middleware.ts            # Edge middleware (route protection & authorization)
│   ├── types/index.ts           # UserProfile type
│   ├── lib/
│   │   ├── supabase/            # client.ts, server.ts, middleware.ts
│   │   └── gdrive.ts            # ✅ NEW: แปลง Google Drive URL → Direct Image URL
│   ├── components/
│   │   ├── public/
│   │   │   ├── PublicFeed.tsx       # หน้าแสดงโพสต์รวมทุกหน่วยงาน
│   │   │   └── UnitFilterBar.tsx    # ฟิลเตอร์เลือกหน่วยงาน
│   │   └── admin/
│   │       ├── PostForm.tsx         # ✅ UPDATED: รองรับ URL + File Tab Toggle
│   │       ├── PostList.tsx
│   │       └── DeleteButton.tsx
│   └── app/
│       ├── page.tsx                # Landing Page (Public Feed + ISR)
│       ├── login/page.tsx          # หน้า Login
│       ├── unit/[id]/page.tsx      # หน้าโปรไฟล์หน่วยงาน
│       ├── actions/
│       │   ├── auth.ts             # login(), logout()
│       │   └── posts.ts            # ✅ UPDATED: createPost/updatePost/deletePost + Google Drive URL
│       └── dashboard/
│           ├── unit/[unit_id]/
│           │   ├── page.tsx            # Unit Admin Dashboard
│           │   └── create/
│           │       ├── page.tsx        # ✅ UPDATED: Server Component (อ่าน params ถูกต้อง)
│           │       └── CreatePostForm.tsx  # ✅ NEW: Client wrapper
│           └── super/page.tsx          # Super Admin Dashboard
```

---

## 6. Routing & Authorization Logic

```
POST /login
  → role = super_admin   → redirect /dashboard/super
  → role = unit_admin    → redirect /dashboard/unit/{unit_id}
  → role = public        → redirect /

Middleware (Edge):
  /dashboard/**          → ต้อง authenticated
  /dashboard/super/**    → ต้องเป็น super_admin
  /dashboard/unit/[id]/**→ unit_admin ต้องมี unit_id ตรงกัน
```

---

## 7. Supabase Setup (วิธีตั้งค่า)

1. **สร้างโปรเจกต์** ใน Supabase
2. **รัน SQL Schema** — คัดลอก `supabase_schema.sql` ไปรันใน SQL Editor
3. **เพิ่ม Super Admin Policies** ด้วย SQL ด้านล่าง (สำคัญ! ไม่ได้อยู่ใน schema.sql):

```sql
-- Super Admin สร้าง/แก้ไข/ลบโพสต์ได้
DROP POLICY IF EXISTS "Super Admins can insert posts." ON posts;
DROP POLICY IF EXISTS "Super Admins can update posts." ON posts;
DROP POLICY IF EXISTS "Super Admins can delete posts." ON posts;

CREATE POLICY "Super Admins can insert posts." ON posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Super Admins can update posts." ON posts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Super Admins can delete posts." ON posts FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'));
```

4. **เพิ่ม Super Admin User** (แทน UID จริง):
```sql
INSERT INTO public.users (id, role) VALUES ('YOUR-UID-HERE', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
```
> Super Admin UID ของระบบนี้: `693af407-2d57-4310-a755-305ee6081466`

5. **สร้าง Storage Bucket** — ชื่อ `post_images`, ตั้งเป็น Public (ถ้าต้องการอัปโหลดไฟล์โดยตรง)
6. **ตั้งค่า `.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qclqhqsvkfreownzygie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

---

## 8. ระบบการจัดการรูปภาพ (Image Storage Strategy)

**เหตุผล:** 13 หน่วยงาน × 2-3 รูป/วัน = ~39 รูป/วัน → Supabase Free (1GB) จะเต็มใน 2 สัปดาห์

**วิธีการ (Hybrid):**
- แอดมินอัปโหลดรูปขึ้น **Google Drive** (มี Pro Account อยู่แล้ว)
- แชร์ลิงก์ → วาง URL ใน PostForm → ระบบแปลงเป็น Direct Image URL อัตโนมัติ

**วิธีใช้ Google Drive:**
1. อัปโหลดรูปใน Google Drive
2. คลิกขวา → แชร์ → เปลี่ยนเป็น **"Anyone with the link"** → คัดลอกลิงก์
3. วางใน Dashboard → แท็บ **"📎 วาง URL (Google Drive)"**
4. รูปปรากฏใน Landing Page ทันที ✨

**Library ที่สร้าง:** `src/lib/gdrive.ts` — ฟังก์ชัน `convertGDriveUrl()` แปลง `drive.google.com/file/d/ID/view` → `lh3.googleusercontent.com/d/ID`

---

## 9. สรุปการพัฒนาที่ทำไปแล้ว (Development History)

### ✅ Phase 1-5: ระบบหลัก (ทำไปแล้วก่อนหน้า)
- Database Schema + RLS, Auth + Middleware, Admin CMS, Public Pages

### ✅ Phase 6: Deploy & Storage (วันนี้ 20 ก.พ. 2569)
- ✅ **Deploy ขึ้น Vercel** — GitHub Auto-Deploy เปิดใช้แล้ว
- ✅ **Google Drive Image URL** — สร้าง `gdrive.ts` + แก้ `PostForm.tsx` + `posts.ts`
- ✅ **แก้บัค: null unit_id** — แยก `CreatePostPage` เป็น Server Component
- ✅ **แก้ RLS Policies** — เพิ่ม Super Admin สิทธิ์โพสต์ได้ทุกหน่วยงาน
- ✅ **แก้ Super Admin User** — เพิ่ม UID `693af407-...` ในตาราง `public.users`
- ✅ **next.config.ts** — เพิ่ม remotePatterns สำหรับ Google Drive / Supabase

---

## 10. คำสั่งที่ใช้บ่อย (Common Commands)

```bash
npm run dev      # Development Server
npm run build    # Build Production
npm start        # Run Production

# Push to GitHub (Vercel จะ Redeploy อัตโนมัติ)
git add -A && git commit -m "..." && git push origin main
```

---

## 11. สิ่งที่ต้องทำต่อ (TODO / Next Steps)

- [ ] ลบข้อความ debug `unit_id: {unitId}` ออกจาก `CreatePostForm.tsx`
- [ ] ทดสอบสร้างโพสต์ด้วย Google Drive URL จาก รพ.สต. จริง
- [ ] เพิ่มข้อมูลหน่วยงาน 13 แห่งลงในตาราง `units`
- [ ] สร้างบัญชี Unit Admin ทั้ง 13 บัญชี
- [ ] ปรับแต่ง UI/UX ให้สวยงามขึ้น (Premium Design)
- [ ] เพิ่ม Rich Text Editor สำหรับ Post Content
- [ ] เพิ่ม Search / Filter ในหน้า Public Feed
- [ ] ทำ Super Admin Dashboard ให้สมบูรณ์ (จัดการ User, จัดการ Unit)
- [ ] SEO Optimization (meta tags, og:image)
- [ ] Responsive Design บนมือถือ
- [ ] อัปเดต `supabase_schema.sql` ให้ตรงกับ Policy ที่ใช้จริง

---

> 📝 **หมายเหตุ:** ไฟล์นี้สรุปบริบทการพัฒนาทั้งหมด เพื่อให้สามารถทำงานต่อในครั้งถัดไปได้ทันที
