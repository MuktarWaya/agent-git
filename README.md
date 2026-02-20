# Centralized Organization Web App

A Next.js application for managing reports from 13 subordinate agencies.

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project.
2. Go to the **SQL Editor** in Supabase and run the contents of `supabase_schema.sql` to create tables and policies.
3. Go to **Storage**, create a new bucket named `post_images`, and make it **Public**.
4. Go to **Settings > API** and copy the `Project URL` and `anon public` key.

### 2. Environment Variables
1. Copy `.env.local.example` to `.env.local`.
2. Fill in your Supabase URL and Anon Key.

```bash
cp .env.local.example .env.local
```

### 3. Installation
(If not already done)
```bash
npm install
```

### 4. Running the App
```bash
npm run dev
```

## Features
- **Public Feed**: View latest reports from all units.
- **Unit Profiles**: specific reports for each agency.
- **Admin Dashboard**: Login to manage posts.
- **Role-Based Access**: Unit Admins can only edit their own unit's data.
