# ZenMark

<p align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/stack-React_19_%7C_Vite_%7C_Supabase-blueviolet)

**A minimalist, offline-first Markdown editor built for performance and reliability.**

</p>

---

## 📖 Overview

**ZenMark** is a modern personal knowledge base and Markdown editor designed to be robust and distraction-free. Built with a strict **MVC architecture** and an **Offline-First** strategy, it ensures your writing is always accessible, regardless of your internet connection.

It seamlessly synchronizes your data between your local device (IndexedDB) and the cloud (Supabase) when a connection is available, handling conflicts intelligently.

---

## ✨ Key Features

- **⚡ Offline-First**  
  Write anywhere. Data is stored locally in IndexedDB using Dexie.js and syncs automatically when online.

- **🔄 Smart Sync**  
  Bi-directional synchronization with Supabase (PostgreSQL) including conflict detection based on timestamps.

- **📜 Version Control**  
  Built-in history with granular rollback capabilities. Every rollback creates a new version to preserve history integrity.

- **📝 Markdown Editor** *(In Progress)*  
  Rich text editing experience powered by Milkdown.

- **📤 Export Options**  
  Export your documents to HTML or print-ready PDF.

- **🔐 Secure**  
  Row Level Security (RLS) ensures you only access your own data.

- **🏗 Strict MVC**  
  Clean separation of concerns (Models, Views, Controllers) for maintainable code.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **State & Logic:** Custom MVC Controllers, React Hooks
- **Local Storage:** IndexedDB (via Dexie.js)
- **Backend & Auth:** Supabase (Auth & Database)
- **Deployment:** Vercel / PWA Ready

---

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/zenmark.git
   cd zenmark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**  
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

---

## 🗄 Database Schema (Supabase)

This project requires a specific SQL setup on Supabase. Run the following in your Supabase SQL Editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Documents Table
create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  content text,
  created_at bigint not null,
  updated_at bigint not null,
  current_version int default 1,
  tags text[],
  is_deleted boolean default false
);

-- Enable RLS
alter table documents enable row level security;

create policy "Users can only see their own documents"
  on documents
  for all
  using (auth.uid() = user_id);
```

> See `services/supabase.ts` for the full schema, including document versions.

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to submit a Pull Request or open an issue for discussion.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🧠 Improvements Over the Previous Version

1. **Removed Google Image**  
   Replaced with Shields.io badges for a more professional look.

2. **Offline-First Highlighted**  
   Core architectural strength (`SyncController` + `Dexie`) is now clearly emphasized.

3. **SQL Schema Included**  
   Allows anyone cloning the repo to quickly configure Supabase without guesswork.

4. **Clear Structure**  
   Well-defined sections for features, setup, tech stack, and contribution.

---

## 🔧 Git Commit

Once the README is updated, commit it with:

```bash
git add README.md
git commit -m "docs: update README with project specific details"
git push
```
