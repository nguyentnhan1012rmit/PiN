# PiN 📸

PiN (Photographer is Nearby) is a premium platform connecting professional photographers with clients who need them. It features a modern, high-performance interface with social networking capabilities, portfolio browsing, and secure booking management.

## ✨ Features

- **Modern SaaS UI**: A clean, fullscreen, borderless design influenced by top-tier modern web applications.
- **Social Feed**: A community space for users to post requests, share photos, and interact (Like, Comment, Reply).
- **Pro Discovery**: Browse verified photographer portfolios with rich visuals and filtering.
- **Real-time Messaging**: Integrated chat system allowing clients and photographers to communicate instantly.
- **Booking System**: Complete booking flow from request to completion, with status tracking (Pending, Confirmed, Completed).
- **Portfolio Management**: dedicated dashboard for photographers to manage their services, pricing, and photo galleries.
- **Secure Payments**: Integrated payment UI (mockup ready) for secure transactions.
- **Authentication**: Secure role-based access (Customer/Photographer) powered by Supabase Auth.
- **Dark Mode**: A dedicated, professionally curated dark theme using deep indigo and violet tones.

## 🛠 Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **State/Query**: [TanStack Query](https://tanstack.com/query/latest)
- **Routing**: [React Router](https://reactrouter.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/pin.git
    cd pin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Run the SQL scripts provided in the `database` folder in your Supabase SQL Editor in this order:
    1.  `supabase_schema.sql` (Base tables, Profiles, RLS)
    2.  `social_features.sql` (Posts, Comments, Likes)
    3.  `fix_relationships.sql` (Fixes for foreign key joins)
    4.  `reviews.sql` (Reviews & Ratings)
    5.  `chat.sql` (Real-time Messaging)
    6.  `admin.sql` (Admin Roles & Permissions)
    7.  `availability.sql` (Availability System)

5.  **Run the application:**
    ```bash
    npm run dev
    ```

### 🛡️ Super Admin Access

To enable the Super Admin dashboard:
1.  Sign up a new user (or use an existing one).
2.  Run the following SQL in your Supabase SQL Editor to promote them:
    ```sql
    update profiles set role = 'admin' where id = 'USER_UUID_HERE';
    ```
    *(You can find the UUID in the Authentication tab).*
3.  Refresh the page, and you will see the **Admin Panel** link in the profile dropdown (red text).

## 📂 Project Structure

- `src/pages`:
  - `Home.jsx`, `Feed.jsx`: Core public/community pages.
  - `Photographers.jsx`, `PhotographerProfile.jsx`: Discovery and profile viewing.
  - `PhotographerDashboard.jsx`, `MyBookings.jsx`: User-specific dashboards.
  - `Inbox.jsx`: Real-time chat interface.
  - `AdminDashboard.jsx`: Super admin controls.
- `src/components`: Reusable UI components including `Navbar`, `PostCard`, `ChatWindow`, etc.
- `src/lib`: Supabase client configuration.
- `src/contexts`: Global state providers (`AuthContext`).

## 🎨 Design System

The project uses a custom Tailwind theme configuration defined in `tailwind.config.js`, focusing on a primary `indigo-500` and secondary `violet-500` palette against a dark base. Consistently applied styles include:
- **Glassmorphism**: `.glass-panel` and `.card-glass` utilities.
- **Avatars**: Standardized `.avatar-img` class for consistent rounding and borders.
- **Animations**: Subtle entry animations (`animate-appear`, `animate-fade-in`).

---
Built with ❤️ using React & Supabase.
