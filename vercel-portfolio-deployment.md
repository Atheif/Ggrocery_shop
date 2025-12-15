# Deploy Coffee Shop to Existing Vercel Portfolio

## Option 1: Separate Project (Recommended)
Deploy as a new project alongside your portfolio:

```bash
cd coffee-shop-react
vercel --prod --name coffee-shop-app
```

This creates: `https://coffee-shop-app.vercel.app`

## Option 2: Subdomain of Portfolio
If your portfolio is `yourname.vercel.app`, deploy as:

```bash
vercel --prod --name yourname-coffee-shop
```

This creates: `https://yourname-coffee-shop.vercel.app`

## Option 3: Custom Domain Path
Add to existing portfolio with custom routing:

1. Deploy as separate project first
2. In your portfolio's vercel.json, add:
```json
{
  "rewrites": [
    {
      "source": "/coffee-shop/(.*)",
      "destination": "https://coffee-shop-app.vercel.app/$1"
    }
  ]
}
```

## Quick Deploy Commands:

```bash
# Navigate to project
cd coffee-shop-react

# Deploy with custom name
vercel --prod --name your-coffee-shop

# Or deploy and let Vercel auto-name
vercel --prod
```

## Environment Variables:
Add in Vercel dashboard for the new project:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`