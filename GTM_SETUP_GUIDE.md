# 📊 Google Tag Manager (GTM) Setup Guide

This guide will help you set up Google Tag Manager (GTM) in your Shadow Fluent application to use GA4 and other analytics tools.

---

## 🔧 Step 1: Create a GTM Container

1. **Go to Google Tag Manager:**
   - Visit: https://tagmanager.google.com/
   - Sign in with your Google account

2. **Create a New Container:**
   - Click **"Create Account"** (if new) or **"Create Container"** (if you have an account)
   - **Container Name:** `Shadow Fluent` (or any name you prefer)
   - **Target Platform:** Select **"Web"**
   - Click **"Create"**

3. **Copy Your Container ID:**
   - After creating, you'll see a Container ID like: `GTM-XXXXXXX`
   - **Copy this ID** - you'll need it in the next step

---

## ⚙️ Step 2: Configure Environment Variable

1. **Open `.env` file:**
   ```bash
   # In your project root directory
   open .env
   ```
   
   If `.env` doesn't exist, copy from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Add GTM Container ID:**
   ```env
   VITE_GTM_CONTAINER_ID=GTM-XXXXXXX
   ```
   
   **Replace `GTM-XXXXXXX` with your actual Container ID!**

3. **Save the file**

---

## 🌐 Step 3: Configure in Vercel

Since you're using Vercel, you need to add the environment variable there too:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your **"shadowfluent"** project

2. **Go to Settings:**
   - Click **"Settings"** (top menu or left sidebar)

3. **Go to Environment Variables:**
   - Click **"Environment Variables"** (left sidebar)

4. **Add New Variable:**
   - **Name:** `VITE_GTM_CONTAINER_ID`
   - **Value:** `GTM-XXXXXXX` (your actual Container ID)
   - **Environment:** Select **"Production"** (and optionally "Preview" and "Development")
   - Click **"Save"**

5. **Redeploy:**
   - Go to **"Deployments"**
   - Click the **"..."** (three dots) on the latest deployment
   - Click **"Redeploy"** (or push a new commit to trigger auto-deploy)

---

## 🔗 Step 4: Set Up GA4 in GTM

Now that GTM is installed, you can set up GA4 through GTM:

1. **Go to GTM Container:**
   - Visit: https://tagmanager.google.com/
   - Select your **"Shadow Fluent"** container

2. **Create a New Tag:**
   - Click **"Tags"** (left sidebar)
   - Click **"New"** (top right)

3. **Configure GA4 Tag:**
   - **Tag Type:** Click **"Tag Configuration"** → Select **"Google Analytics: GA4 Configuration"**
   - **Measurement ID:** Enter your GA4 Measurement ID (format: `G-XXXXXXXXXX`)
     - If you don't have one, create it at: https://analytics.google.com/
   - **Triggering:** Click **"Triggering"** → Select **"All Pages"**

4. **Save and Publish:**
   - Click **"Save"**
   - Click **"Submit"** (top right)
   - **Version Name:** `Initial GA4 Setup`
   - Click **"Publish"**

---

## ✅ Step 5: Verify Installation

1. **Test Locally:**
   ```bash
   npm run dev
   ```
   - Open browser DevTools → **Console**
   - You should see: `GTM Container ID not configured...` (if not set) or no error (if set)
   - Open **Network** tab → Look for requests to `googletagmanager.com`

2. **Test in Production:**
   - Visit: `www.shadowfluent.com`
   - Open **DevTools → Network** tab
   - Look for requests to `googletagmanager.com`

3. **Use GTM Preview Mode:**
   - In GTM, click **"Preview"** (top right)
   - Enter your website URL: `www.shadowfluent.com`
   - Click **"Connect"**
   - A new tab will open with GTM debugging tools

---

## 📈 Step 6: Track Custom Events (Optional)

The application includes utility functions for tracking custom events. You can use them in your code:

```typescript
import { 
  pushGTMEvent, 
  trackPhraseSelected, 
  trackSessionStart,
  trackAIGeneration 
} from './utils/gtm'

// Example: Track phrase selection
trackPhraseSelected('business', 'phrase-123', 'ai-generated')

// Example: Track AI generation
trackAIGeneration('travel', 5)

// Example: Track custom event
pushGTMEvent('custom_event_name', {
  custom_param: 'value'
})
```

**Available tracking functions:**
- `trackPageView(path)` - Track page views
- `trackPhraseSelected(category, phraseId?, source?)` - Track phrase selection
- `trackSessionStart(phraseId, repetitions, interval)` - Track shadowing session start
- `trackSessionComplete(phraseId, duration)` - Track session completion
- `trackAIGeneration(category, count)` - Track AI phrase generation
- `trackFileUpload(fileName, fileType, phraseCount)` - Track file uploads
- `pushGTMEvent(eventName, eventData?)` - Push custom events

---

## 🔍 Troubleshooting

### GTM Not Loading:

1. **Check `.env` file:**
   - Make sure `VITE_GTM_CONTAINER_ID` is set correctly
   - Format should be: `GTM-XXXXXXX` (not `GTM-XXXXXXX ` with spaces)

2. **Check Vercel Environment Variables:**
   - Go to Vercel → Project → Settings → Environment Variables
   - Make sure `VITE_GTM_CONTAINER_ID` is set for Production

3. **Redeploy:**
   - Environment variable changes require a new deployment

### GA4 Not Tracking:

1. **Check GTM Container:**
   - Make sure the GA4 tag is **"Published"** (not just saved)
   - Check if triggers are configured correctly

2. **Check GA4 Measurement ID:**
   - Make sure the Measurement ID is correct (format: `G-XXXXXXXXXX`)
   - Check GA4 dashboard for real-time data

3. **Use GTM Preview Mode:**
   - Use GTM Preview to debug tag firing

---

## 📚 Additional Resources

- **GTM Documentation:** https://support.google.com/tagmanager
- **GA4 Documentation:** https://support.google.com/analytics/answer/10089681
- **GTM Container ID Format:** `GTM-XXXXXXX` (7 characters after GTM-)

---

## ✅ Summary

**Quick Checklist:**
- ✅ GTM Container created
- ✅ Container ID copied (`GTM-XXXXXXX`)
- ✅ `.env` file updated with `VITE_GTM_CONTAINER_ID`
- ✅ Vercel Environment Variable added
- ✅ Project redeployed
- ✅ GA4 tag configured in GTM
- ✅ GTM container published

**After setup, GTM will automatically load on your site, and GA4 will start tracking!** 🎉
