# 🏠 StayFinder - Premium Apartment Rental Platform

<div align="center">

![StayFinder Banner](https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=400&fit=crop)

**Discover handpicked apartments and unique stays that match your lifestyle**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.86-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

</div>

---

## ✨ Features

### For Guests

- 🔍 **Browse Apartments** - Explore curated apartment listings with detailed information
- 📍 **Region Selection** - Choose between Kenya and USA with localized currency (KES/USD)
- 💬 **AI Chat Assistant** - Get instant help finding the perfect apartment
- 📅 **Easy Booking** - Simple date-based booking system with real-time availability
- 👤 **User Authentication** - Secure sign up and sign in with Supabase Auth
- 👤 **User Profile** - Manage your profile and view booking history

### For Administrators

- 📊 **Dashboard** - Overview of bookings and apartments at a glance
- 🏢 **Apartment Management** - Add, edit, and manage apartment listings
- 📋 **Booking Management** - Approve, decline, or manage bookings
- 👥 **User Management** - Assign roles and manage user access

---

## 🚀 Tech Stack

| Category               | Technology                      |
| ---------------------- | ------------------------------- |
| **Frontend Framework** | React 18.3                      |
| **Language**           | TypeScript 5.8                  |
| **Build Tool**         | Vite 5.4                        |
| **Styling**            | Tailwind CSS 3.4                |
| **UI Components**      | shadcn/ui + Radix UI            |
| **Backend**            | Supabase (PostgreSQL)           |
| **Authentication**     | Supabase Auth                   |
| **State Management**   | TanStack Query v5               |
| **Routing**            | React Router DOM v6             |
| **Charts**             | Recharts                        |
| **Maps**               | Mapbox GL                       |
| **Forms**              | React Hook Form + Zod           |
| **AI Integration**     | Google Gemini (via Lovable API) |
| **Code Quality**       | ESLint + TypeScript ESLint      |

---

## 📁 Project Structure

```
Stay-Finder-Home/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable shadcn/ui components
│   │   ├── layout/          # Navbar, Footer, etc.
│   │   ├── home/            # Home page sections
│   │   ├── apartments/      # Apartment-related components
│   │   └── chat/            # AI chat widget
│   ├── contexts/
│   │   └── RegionContext.tsx        # Multi-region state management
│   ├── hooks/
│   │   ├── useAuth.tsx              # Authentication hook
│   │   └── useToast.ts              # Toast notifications
│   ├── integrations/
│   │   └── supabase/        # Supabase client & types
│   ├── pages/
│   │   ├── Index.tsx               # Home page
│   │   ├── Apartments.tsx          # Browse apartments
│   │   ├── ApartmentDetail.tsx     # Apartment details
│   │   ├── Auth.tsx                # Authentication page
│   │   ├── Bookings.tsx            # User bookings
│   │   ├── Profile.tsx             # User profile
│   │   ├── NotFound.tsx            # 404 page
│   │   └── admin/                  # Admin dashboard pages
│   ├── types/
│   │   └── database.ts       # TypeScript types for database
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── functions/
│   │   └── chat/
│   │       └── index.ts      # Edge function for AI chat
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Stay-Finder-Home
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

```

> **Note:** You can find these values in your Supabase project settings under API.

### 4. Set Up Supabase Database

Run the migrations in your Supabase SQL editor:

```bash
# The migrations are located in supabase/migrations/
# Run them in order:
# 1. 20251203150245_3177390a-4ca5-4f6c-bc03-ccb02a7f0e05.sql
# 2. 20251204083428_244d104f-bf5a-4a25-aa82-e702f5940926.sql
# 3. 20251204092425_0cfb2575-1bbd-4a74-9764-42de581bd191.sql
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

---

## 📜 Available Scripts

| Command             | Description               |
| ------------------- | ------------------------- |
| `npm run dev`       | Start development server  |
| `npm run build`     | Build for production      |
| `npm run build:dev` | Build in development mode |
| `npm run preview`   | Preview production build  |
| `npm run lint`      | Run ESLint                |

---

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for its component library. All components are located in `src/components/ui/` and include:

- **Accordion** - Expandable content sections
- **Alert** - Callout messages
- **Avatar** - User profile images
- **Button** - Interactive buttons
- **Calendar** - Date picker
- **Card** - Content containers
- **Carousel** - Image sliders
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Context menus
- **Form** - Form inputs with validation
- **Input** - Text fields
- **Select** - Dropdown selects
- **Tabs** - Tabbed navigation
- **Toast** - Notifications
- And many more...

---

## 🔐 Authentication Flow

The app uses Supabase Auth with the following features:

- **Email/Password** - Traditional sign up and sign in
- **Session Management** - Persistent sessions with localStorage
- **Protected Routes** - Access control based on authentication status
- **Role-Based Access** - Admin and user roles via `user_roles` table

### User Roles

| Role    | Permissions                                                   |
| ------- | ------------------------------------------------------------- |
| `user`  | Browse apartments, make bookings, view profile                |
| `admin` | All user permissions + manage apartments, bookings, and users |

---

## 💱 Multi-Region Support

StayFinder supports multiple regions with localized settings:

| Region | Currency | Symbol | Locale |
| ------ | -------- | ------ | ------ |
| Kenya  | KES      | KSh    | en-KE  |
| USA    | USD      | $      | en-US  |

Users can toggle between regions, and prices will be formatted accordingly.

---

## 🤖 AI Chat Widget

The AI Chat Widget provides instant assistance to users:

- **24/7 Availability** - Always-on customer support
- **Smart Responses** - Powered by Google Gemini 2.5 Flash
- **Context-Aware** - Understands apartment rentals and bookings
- **Streaming Responses** - Real-time answer delivery

### API Configuration

The chat uses an Edge Function deployed on Supabase:

```typescript
// supabase/functions/chat/index.ts
// Endpoint: https://your-project.supabase.co/functions/v1/chat
```

---

## 📱 Responsive Design

StayFinder is fully responsive and works on:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 🖥️ Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

---

## 🔧 Configuration

### Tailwind Configuration

Custom colors and utilities are configured in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Path Aliases

The project uses `@` as an alias for `src/`:

```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

---

## 📦 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy Supabase Functions

```bash
supabase functions deploy chat
```

---

## 🧪 Code Quality

### ESLint

The project uses ESLint with TypeScript support:

```bash
npm run lint
```

### TypeScript Strict Mode

All TypeScript code is written with strict type checking enabled.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the lightning-fast build tool
- [Google Gemini](https://gemini.google.com/) for AI capabilities

---

<div align="center">

**Made with ❤️ by the StayFinder Team**

</div>
