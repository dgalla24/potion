# Landing Page Assets

This folder contains all media assets for the Potion landing page.

## Required Files

You need to add the following files to this `assets/` folder:

### 1. `demo.mp4`
**Location:** `landing/assets/demo.mp4`

**Description:** 46-second demo video showing Potion in action

**Specifications:**
- Format: MP4 (H.264 codec recommended for best browser compatibility)
- Duration: ~46 seconds
- Recommended resolution: 1920x1080 or 1280x720
- Recommended max file size: 10-20 MB (optimize for web)

**Where it's used:**
- Plays in the modal when users click the demo video thumbnail
- Referenced in: `index.html` line with `<video>` element

---

### 2. `hero.png`
**Location:** `landing/assets/hero.png`

**Description:** Main hero image showing the Potion app interface

**Specifications:**
- Format: PNG or JPG
- Recommended resolution: 1600x1000 or similar (2:1 or 16:10 aspect ratio)
- Should show the main Potion interface (calendar + tasks)
- Recommended max file size: 500 KB (optimize with tools like TinyPNG)

**Where it's used:**
- Displayed prominently in the hero section at the top of the page
- Referenced in: `index.html` in the `.hero-image` section

---

### 3. `screenshot1.png`
**Location:** `landing/assets/screenshot1.png`

**Description:** Screenshot used as the demo video thumbnail

**Specifications:**
- Format: PNG or JPG
- Recommended resolution: 1600x900 or 1280x720 (16:9 aspect ratio)
- Should be an appealing still from the demo or a custom thumbnail
- Consider adding a "Play" overlay or text (or rely on the CSS play button)
- Recommended max file size: 400 KB

**Where it's used:**
- Thumbnail/preview image for the demo video section
- Referenced in: `index.html` in the `.video-thumbnail` section

---

## File Checklist

Once you've added your files, this folder should contain:

```
landing/assets/
├── README.md (this file)
├── demo.mp4
├── hero.png
└── screenshot1.png
```

## Image Optimization Tips

To keep your landing page fast:

1. **Compress images** before adding them:
   - Use [TinyPNG](https://tinypng.com) for PNG files
   - Use [Squoosh](https://squoosh.app) for JPG/PNG with more control
   - Use [Compressor.io](https://compressor.io) for quick compression

2. **Optimize video** for web:
   ```bash
   # Using ffmpeg (if installed):
   ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k demo.mp4
   ```

3. **Check file sizes**:
   - Hero image: aim for < 500 KB
   - Screenshot: aim for < 400 KB
   - Demo video: aim for < 20 MB

## Need Placeholder Images?

If you don't have your assets ready yet, you can use placeholder services:

- **Images:** [Placehold.co](https://placehold.co) - e.g., `https://placehold.co/1600x1000`
- **Videos:** Record a quick screen recording using:
  - macOS: QuickTime Player (File > New Screen Recording)
  - Windows: Xbox Game Bar (Win + G)
  - Cross-platform: OBS Studio (free)

---

**Note:** All these files are referenced in `index.html`. If you change filenames, make sure to update the HTML accordingly.
