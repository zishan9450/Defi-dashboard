# Deployment Guide

This guide will help you deploy the DeFi Dashboard to various platforms.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd defi-dashboard
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Confirm deployment settings
   - Wait for build and deployment

### Option 2: Deploy via GitHub Integration

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js settings
   - Click "Deploy"

## 🌐 Other Deployment Options

### Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `.next` folder to Netlify
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=.next
   ```

### Railway

1. **Connect GitHub repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select your repository

2. **Deploy automatically**
   - Railway will detect Next.js and deploy automatically
   - No additional configuration needed

### DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select the repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Output Directory: `.next`

## 🔧 Environment Variables

If you need to configure environment variables:

### Vercel
- Go to Project Settings → Environment Variables
- Add any required variables

### Netlify
- Go to Site Settings → Environment Variables
- Add key-value pairs

### Railway
- Go to your app → Variables
- Add environment variables

## 📊 Performance Optimization

### Vercel Edge Functions
The app is configured to use Vercel Edge Functions for optimal performance:

```json
{
  "functions": {
    "app/**/*.tsx": {
      "maxDuration": 30
    }
  }
}
```

### Caching
- API responses are cached for 5 minutes
- Static assets are cached for 1 year
- Images are optimized automatically

## 🔍 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and user behavior

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor API failures and user errors

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Ensure all dependencies are installed
   - Check for TypeScript errors

2. **API Errors**
   - Verify DeFiLlama API endpoints are accessible
   - Check CORS settings if needed
   - Monitor API rate limits

3. **Wallet Connection Issues**
   - Ensure MetaMask is installed
   - Check if user is on correct network
   - Verify wallet permissions

### Support
- Check the [README.md](./README.md) for detailed setup instructions
- Review [DeFiLlama API documentation](https://api-docs.defillama.com/)
- Create an issue in the GitHub repository

## 🎯 Production Checklist

Before deploying to production:

- [ ] Test all features locally
- [ ] Verify API endpoints are working
- [ ] Test wallet connection functionality
- [ ] Check responsive design on mobile
- [ ] Validate TypeScript compilation
- [ ] Run linting checks
- [ ] Test error handling
- [ ] Verify loading states
- [ ] Check accessibility features
- [ ] Test on different browsers

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

This setup will automatically deploy your app whenever you push to the main branch.
