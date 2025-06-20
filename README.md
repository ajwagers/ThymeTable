# ThymeTable - Meal Planning Made Simple

A beautiful, feature-rich meal planning application built with React, TypeScript, and Supabase.

## Features

- 🗓️ **Weekly Meal Planning** - Drag and drop meal organization
- 🍽️ **Recipe Management** - Thousands of recipes with dietary filtering
- ❤️ **Favorites System** - Save your favorite recipes
- 📚 **Saved Meal Plans** - Store and reuse weekly meal plans
- 🛒 **Smart Grocery Lists** - Auto-generated shopping lists
- 🔧 **Dietary Filters** - 18+ diet types plus custom filters
- 📱 **Responsive Design** - Works on all devices
- 🔒 **User Authentication** - Secure login with Supabase

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd thyme-table
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for migrations)
- `VITE_SPOONACULAR_API_KEY` - Your Spoonacular API key

### 3. Database Setup (Automated)
The database migration runs automatically when you start the dev server:

```bash
npm run dev
```

### 4. Manual Migration (if needed)
If automatic migration fails, run manually:

```bash
npm run migrate
```

Or copy the SQL from `supabase/migrations/20250620184438_lively_unit.sql` and run it in your Supabase dashboard.

## Getting API Keys

### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings > API to get your keys
3. The service role key is needed for automated migrations

### Spoonacular API
1. Sign up at [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Get your API key from the dashboard
3. Free tier includes 150 requests/day

## Available Scripts

- `npm run dev` - Start development server with auto-migration
- `npm run build` - Build for production with auto-migration
- `npm run migrate` - Run database migration manually
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Database Schema

The app automatically creates these tables:

### `favorite_recipes`
- User's saved favorite recipes
- Stores full recipe data for offline access

### `saved_meal_plans`
- User's saved weekly meal plans
- Includes meal plan data and metadata

Both tables include:
- Row Level Security (RLS)
- User-specific access policies
- Automatic timestamps

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **API**: Spoonacular for recipe data
- **State**: React Context + Local Storage
- **UI**: Framer Motion + Lucide Icons

## Deployment

The app is ready for deployment to any platform that supports Node.js:

1. **Vercel/Netlify**: Connect your repo and deploy
2. **Railway/Render**: Use the build script
3. **Docker**: Standard Node.js container

Make sure to set environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details