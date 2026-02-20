# 🇮🇳 IndiaDict 2.0 - Dravidian Morpho Master (Static Edition)

IndiaDict 2.0 is a next-generation, cloud-integrated multilingual dictionary platform. This version is a **high-performance static web application** powered by **Supabase (PostgreSQL)**, designed for maximum portability and ease of use.

<img width="1241" height="513" alt="image" src="https://github.com/user-attachments/assets/051a19bc-6226-44b2-a14e-89756c63bd76" />

## Key Features

- **Indic Discovery 2.0**: Search across 6 major Indian languages (English, Hindi, Tamil, Telugu, Kannada, Bengali).
- **Supabase Cloud Fusion**: Real-time synchronization with Supabase PostgreSQL via the browser.
- **Deep Morphology**: Built-in support for morphological analysis and cross-script intelligence.
- **Futuristic Design**: A minimalist "Dravidian 2.0" interface featuring glassmorphism, smooth animations, and ultra-readable typography.

## Technology Stack

- **Architecture**: Pure Static Web App (HTML5, CSS3, ES6 JavaScript)
- **Database**: Supabase (PostgreSQL)
- **Client Library**: `@supabase/supabase-js` (CDN)
- **Design System**: Dravidian 2.0 (Custom Vanilla CSS)
- **Fonts**: Outfit (Headings), Inter (Body)

## Getting Started

### 1. Database Setup
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the code in **`schema.sql`** to create the `dictionary` table and set up Row Level Security (RLS).

### 2. Running the Application
1. Open **`index.html`** in your browser.
2. The **Setup Connection** modal will appear. Ensure the credentials match your Supabase project.
3. Click **Connect** to start exploring.

## Project Structure
```
legacy/
├── index.html        # Main Application UI
├── schema.sql        # Database Schema & Security Policies
├── static/
│   ├── style.css     # Dravidian 2.0 Design System
│   └── script.js     # Supabase Logic & Interaction
└── README.md         # Documentation
```

## DevOps & Submission
This project is optimized for a modern serverless/static deployment. It demonstrates:
- Full-stack cloud integration without a backend server.
- Browser-native data handling and security.
- Scalable data modeling using PostgreSQL JSONB.
- Production-ready UI/UX standards.

---