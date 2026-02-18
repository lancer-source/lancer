# Dev Server & Demo Guide

## Starting the Dev Server

Open your terminal (in Cursor: Terminal → New Terminal, or press `` Ctrl+` ``).

Make sure you're in the project folder:
```bash
cd ~/Desktop/the-garage/projects/lancer
```

Start the dev server:
```bash
npm run dev
```

You'll see something like:
```
▲ Next.js 16.1.6
- Local: http://localhost:3000
```

Open that URL in your browser. If port 3000 is already in use, Next.js will pick the next available port (3001, 3002, etc.) — check the terminal output for the actual URL.

## Restarting the Dev Server

If the server is already running and you need to restart it (e.g., after changing environment variables or pulling new code):

1. Click in the terminal where the server is running
2. Press **Ctrl+C** to stop it
3. Run `npm run dev` again

That's it. The server picks up all your latest code changes automatically while running — you only need to restart when changing `.env.local` or installing new packages.

## Stopping All Running Servers

If you have multiple servers running and want to start fresh:

```bash
# Kill anything running on common dev ports
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null

# Start fresh
npm run dev
```

## Demo URLs

The landing page (what consumers see):
- **Home / Waitlist:** http://localhost:3000

Auth and profile pages (for investor demos — not linked from the landing page):
- **Sign Up:** http://localhost:3000/signup
- **Log In:** http://localhost:3000/login
- **Forgot Password:** http://localhost:3000/forgot-password
- **Profile Setup:** http://localhost:3000/profile/setup (requires login)
- **View Profile:** http://localhost:3000/profile (requires login)
- **Edit Profile:** http://localhost:3000/profile/edit (requires login)

**Note:** Replace `3000` with whatever port your dev server is actually running on.

## Running an Investor Demo

Here's a smooth walkthrough flow:

1. Open `http://localhost:3000` — show the landing page and waitlist
2. Navigate to `http://localhost:3000/signup` — create a new account
3. Pick "I'm ready to work" or "I'm looking for help"
4. Enter an email and password, click Create Account
5. Fill out the profile — name, bio, upload a photo, add skills/needs
6. View the completed profile at `/profile`
7. Show the edit flow at `/profile/edit`
8. Show the login flow — log out, then log back in at `/login`

**Tip:** Create a demo account ahead of time so you have a polished profile ready to show. You can always create a fresh one live to demonstrate the signup flow.

## Troubleshooting

**"Port 3000 is in use"**
Another server is already running. Either use the port it gives you, or kill the old one:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**"Your project's URL and Key are required"**
The `.env.local` file is missing a Supabase key. Make sure it has all three:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
Restart the dev server after editing `.env.local`.

**Signup works but profile pages redirect to login**
The Supabase database trigger may not be set up. Run the profiles SQL in the Supabase Dashboard (see the implementation plan at `docs/plans/user-signup-profiles-plan.md`).

**Photos don't upload**
The `avatars` storage bucket needs to be created in Supabase Dashboard → Storage → New Bucket → name: "avatars", public: yes. Then run the storage RLS policies SQL.
