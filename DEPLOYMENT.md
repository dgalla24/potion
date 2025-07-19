# 🚀 Deployment Guide

This guide will help you deploy GoalAI to Vercel for production use.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- LiteLLM API key

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GoalAI - AI-powered goal planning app"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it `goal-ai`
   - Make it public or private
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/goal-ai.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your `goal-ai` repository

2. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     Name: LITELLM_API_KEY
     Value: your_actual_litellm_api_key
     Environment: Production, Preview, Development
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)

## Step 3: Custom Domain (Optional)

1. **Add Custom Domain**
   - In your Vercel project dashboard
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## Step 4: Verify Deployment

1. **Test the Application**
   - Visit your deployed URL
   - Test the landing page
   - Go to `/demo` and test the AI functionality
   - Verify calendar and task management work

2. **Check Environment Variables**
   - Ensure your LiteLLM API key is working
   - Test creating a goal and generating tasks

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `LITELLM_API_KEY` | Your LiteLLM API key for AI functionality | Yes |

## Troubleshooting

### Build Errors
- **Module not found**: Run `npm install` locally to ensure all dependencies are in `package.json`
- **TypeScript errors**: Fix any TypeScript issues before deploying
- **Environment variables**: Ensure all required env vars are set in Vercel

### Runtime Errors
- **API key issues**: Verify your LiteLLM API key is correct and has sufficient credits
- **CORS errors**: Vercel handles CORS automatically for Next.js apps
- **404 errors**: Check that your API routes are in the correct location (`src/app/api/`)

### Performance Issues
- **Slow loading**: Check your LiteLLM API response times
- **Large bundle size**: The app is optimized with Next.js, but monitor bundle size in Vercel analytics

## Monitoring & Analytics

1. **Vercel Analytics** (Optional)
   - Enable in your project settings
   - Monitor page views and performance

2. **Error Tracking**
   - Check Vercel function logs for API errors
   - Monitor browser console for client-side issues

## Updates & Maintenance

1. **Deploy Updates**
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
   Vercel will automatically redeploy on push to main.

2. **Environment Variable Updates**
   - Go to Vercel project settings
   - Update environment variables as needed
   - Redeploy if necessary

## Security Considerations

- ✅ Environment variables are encrypted in Vercel
- ✅ API keys are not exposed to the client
- ✅ HTTPS is enabled by default
- ⚠️ Consider rate limiting for production use
- ⚠️ Monitor API usage to avoid unexpected costs

## Cost Optimization

- **LiteLLM API**: Monitor usage and set up billing alerts
- **Vercel**: Free tier includes 100GB bandwidth and 100 serverless function executions per day
- **Custom Domain**: Free with Vercel

---

**Your GoalAI app is now live! 🎉**

Share your deployed URL and start helping people achieve their goals with AI-powered planning. 