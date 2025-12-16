# Potion Landing Page

A clean, minimal, static landing page for Potion - your smart daily planner.

## Features

- ✅ **Pure static files** - No build step required
- ✅ **Mobile-first responsive design**
- ✅ **Accessible** - Semantic HTML, ARIA labels, keyboard navigation
- ✅ **Fast** - Optimized CSS, minimal JavaScript
- ✅ **Easy to customize** - CSS variables, well-commented code
- ✅ **Form ready** - Waitlist with email validation (swap for Google Forms easily)

## Quick Start

### 1. Add Your Assets

First, add your media files to the `assets/` folder:

```
landing/assets/
├── demo.mp4        # Your 46-second demo video
├── hero.png        # Main hero/product screenshot
└── screenshot1.png # Video thumbnail image
```

See `assets/README.md` for detailed specifications.

### 2. Run Locally

Choose one of these methods to preview the landing page:

#### Option A: Python (Built-in on macOS/Linux)

```bash
cd landing
python3 -m http.server 8000
```

Then open: http://localhost:8000

#### Option B: Node.js `serve` (Recommended)

```bash
# Install serve globally (one time)
npm install -g serve

# Run from the landing folder
cd landing
serve
```

Then open the URL shown (usually http://localhost:3000)

#### Option C: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### 3. Customize

Edit these files to match your brand:

- **`index.html`** - Update text, headlines, CTAs
- **`styles.css`** - Change colors in CSS variables (lines 6-35)
- **`app.js`** - Modify form endpoint or add analytics

---

## Forms / Feedback

**Current Setup:** Feedback & waitlist are collected via this Google Form: https://forms.gle/KiS6wvq6jPT9aZvdA

To replace with a different form or a backend endpoint, update `landing/index.html` and `landing/README.md` accordingly.

---

## Form Setup (Alternative Options)

### Option: Custom Backend

If you prefer to use a custom backend instead of Google Forms, you can set up a waitlist form that POSTs to `/subscribe`. You'll need to implement this endpoint.

**Example serverless function (Vercel):**

Create `api/subscribe.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  // Save to database, send to email service, etc.
  // Example: Save to Airtable, Google Sheets, Mailchimp, etc.

  return res.status(200).json({ message: 'Success!' });
}
```

### Alternative: Google Forms

To use Google Forms instead of a custom backend:

1. **Create a Google Form:**
   - Go to https://forms.google.com
   - Create a new form with an "Email" question
   - Click "Send" → Get the link

2. **Option A - Embed the form:**

   Replace the `<form>` in `index.html` (around line 104) with:

   ```html
   <iframe
     src="YOUR_GOOGLE_FORM_URL"
     width="100%"
     height="600"
     frameborder="0">
     Loading…
   </iframe>
   ```

3. **Option B - Link to form:**

   Replace the form with a button:

   ```html
   <a href="YOUR_GOOGLE_FORM_URL"
      target="_blank"
      class="btn btn-primary">
     Join Waitlist
   </a>
   ```

4. **Update feedback link:**

   In `index.html`, find the feedback link (line ~138) and replace with your Google Form URL:

   ```html
   <a href="https://forms.gle/YOUR_FEEDBACK_FORM"
      target="_blank"
      rel="noopener noreferrer">
     Give Feedback
   </a>
   ```

---

## Deployment

Deploy your landing page for free with these options:

### Option 1: GitHub Pages (Easiest)

**Steps:**

1. Create a new repo on GitHub (or use existing)
2. Push the `landing/` folder contents to the repo
3. Go to Settings → Pages
4. Select branch (main) and folder (root or /docs if you moved files)
5. Save - your site will be live at `https://yourusername.github.io/repo-name`

**Using a custom domain:**
- Add a `CNAME` file with your domain
- Configure DNS with your domain provider

```bash
# Quick deploy commands
cd landing
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/yourusername/repo-name.git
git push -u origin main
```

### Option 2: Vercel (Recommended)

**Why Vercel:**
- Free tier includes custom domains
- Automatic HTTPS
- Easy serverless functions for form handling
- Auto-deploy on git push

**Steps:**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd landing
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy: Y
   - Which scope: (your account)
   - Link to existing project: N
   - Project name: potion-landing
   - Directory: ./ (current directory)
   - Want to override settings: N

4. Your site is now live! Vercel gives you a URL like `potion-landing.vercel.app`

**Add a custom domain:**
- Go to your project dashboard on vercel.com
- Settings → Domains → Add your domain
- Follow DNS configuration steps

**Production deploy:**
```bash
vercel --prod
```

### Option 3: Netlify (Great Alternative)

**Why Netlify:**
- Drag-and-drop deployment (easiest)
- Free tier includes custom domains
- Built-in form handling (no backend needed!)

**Steps:**

#### Method A: Drag & Drop (Fastest)

1. Go to https://app.netlify.com/drop
2. Drag the entire `landing/` folder onto the page
3. Done! Your site is live

#### Method B: Git Integration

1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Set build settings:
   - Base directory: `landing` (if it's in a subfolder)
   - Build command: (leave empty)
   - Publish directory: `.` or `landing`
6. Deploy!

**Netlify Forms (No backend needed!):**

Update your form in `index.html`:

```html
<form name="waitlist" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="waitlist">
  <input type="email" name="email" required>
  <button type="submit">Notify Me</button>
</form>
```

Netlify will automatically handle submissions - view them in your Netlify dashboard!

---

## Customization Guide

### Change Colors

Edit CSS variables in `styles.css` (lines 11-22):

```css
:root {
    --primary-color: #6366f1;      /* Your brand color */
    --primary-hover: #4f46e5;      /* Darker version */
    --background: #ffffff;          /* Page background */
    /* ... more variables ... */
}
```

### Update Content

All text is in `index.html`:
- **Line 20-21**: Hero headline and subheadline
- **Line 42-55**: Benefits section (3 cards)
- **Line 65-85**: How it works (3 steps)
- **Line 95**: Waitlist headline
- **Line 145**: Footer text

### Add Analytics

In `app.js`, uncomment the analytics tracking functions (lines 143-168) and add your tracking code:

**Google Analytics 4:**
```html
<!-- Add to <head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible Analytics (Privacy-friendly):**
```html
<!-- Add to <head> in index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## File Structure

```
landing/
├── index.html          # Main HTML file
├── styles.css          # All styles (mobile-first, CSS variables)
├── app.js              # Form validation, modal, smooth scroll
├── README.md           # This file
└── assets/
    ├── README.md       # Asset specifications
    ├── demo.mp4        # 46s demo video (you add this)
    ├── hero.png        # Hero image (you add this)
    └── screenshot1.png # Video thumbnail (you add this)
```

---

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Form not submitting?

- **Check console:** Open DevTools (F12) → Console tab for errors
- **Endpoint not set up:** The default `/subscribe` endpoint doesn't exist yet. Either:
  - Set up a serverless function (see "Form Setup" above)
  - Switch to Google Forms (see "Alternative: Google Forms")
  - Use Netlify Forms (see "Option 3: Netlify")

### Images not loading?

- Make sure files are in `assets/` folder
- Check file names match exactly (case-sensitive)
- See `assets/README.md` for required files

### Video not playing?

- Ensure `demo.mp4` is in `assets/` folder
- Try a different browser
- Check video codec (H.264 recommended)

### Styling looks broken?

- Ensure `styles.css` is in the same folder as `index.html`
- Check browser console for 404 errors
- Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

---

## Next Steps

1. ✅ Add your assets to `assets/` folder
2. ✅ Customize colors and content
3. ✅ Set up form handling (Google Forms or backend)
4. ✅ Test on mobile devices
5. ✅ Deploy to Vercel/Netlify/GitHub Pages
6. ✅ Add custom domain (optional)
7. ✅ Set up analytics (optional)

---

## Support

Questions or issues?
- Check the comments in the code files
- Review this README
- Open an issue on GitHub

---

**Built with ❤️ for Potion**
