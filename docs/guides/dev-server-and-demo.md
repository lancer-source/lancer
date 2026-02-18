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

## Demo Account Setup

### The "Hero" Demo Account (create once, use forever)

Sign up once with credentials you'll remember, then build a polished profile:

- **Email:** Use your real email (e.g., `jack@example.com`)
- **Password:** Something you'll remember for live demos
- **Profile:** Fill in a complete name, bio, professional photo, and skills

This is the account you log into to show off the finished profile during pitches. Log in at `/login`, walk them through the profile, done.

### Fresh Signup Demos (show the signup flow live)

To demo the signup flow in front of an investor, you need a "new" email each time. Gmail makes this easy with the **+alias trick** — add `+anything` before the `@` and it all goes to your same inbox:

- `yourname+demo1@gmail.com`
- `yourname+demo2@gmail.com`
- `yourname+investor-acme@gmail.com`
- `yourname+pitch-feb18@gmail.com`

Each one is unique to Supabase, so you can sign up fresh every time. Use a simple password you can type quickly on stage (e.g., `demo123456`).

### Cleaning Up Old Demo Accounts

If you want to delete test accounts, go to [Supabase Authentication](https://supabase.com/dashboard/project/ldmdtkgijsnnbrmdsvxw/auth/users), find the user, and click the three-dot menu → Delete User. The profile row gets deleted automatically (cascade).

## Running an Investor Demo

### Recommended flow (5 minutes)

1. **Start with the landing page** — `http://localhost:3000`
   - "This is what consumers see. Clean, simple, waitlist capture."
   - Scroll through the sections briefly.

2. **Show the signup flow** — navigate to `/signup`
   - "Let me show you the actual product experience."
   - Pick "I'm ready to work", enter a fresh +alias email, sign up.

3. **Complete the profile** — you'll land on `/profile/setup`
   - Fill in a name, write a quick bio, upload a photo, add a few skills.
   - "This is what every Lancer fills out when they join."

4. **Show the finished profile** — you'll land on `/profile`
   - "This is what homeowners will see when they're looking for help."

5. **Switch to the hero account** — log out, log in at `/login` with your polished demo account
   - "And here's a more complete profile with everything filled out."

### Tips for a smooth demo

- **Pre-load the pages** in browser tabs before the meeting so there's no waiting.
- **Use your phone** to show mobile responsiveness — just open the same URL on your phone if you're on the same WiFi.
- **Have a photo ready** on your desktop for the avatar upload — don't dig through folders during the pitch.
- **Use a simple demo password** you can type without looking at the keyboard.

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
