# Obsidian

A Gemini-powered options trading analyst built with React and TypeScript. Obsidian uses a structured system prompt to help users reason through defined-risk options trades, evaluate greeks, and think through risk scenarios.

> All analysis is based on user-provided context. The model has no access to live prices, IV data, or real-time news. Not financial advice.

## Tech Stack

- **UI**: React + TypeScript
- **Styling**: Tailwind CSS (CDN)
- **AI**: Google Gemini API (`@google/genai`)
- **Build**: Vite
- **Deployment**: Vercel

## What It Does

**Lite mode** returns concise, structured trade ideas given a ticker and thesis:
- Strategy, strikes, expiry
- Max risk / max reward
- Brief rationale

**Pro mode** runs a full analysis:
- Strategy selection with reasoning
- Greeks exposure (delta, theta, vega) at entry and over time
- Risk scenarios and adjustment points
- Position sizing considerations

## What It Doesn't Do

- No live market data or real-time prices
- No connection to a broker or execution layer
- No guaranteed outcomes

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

### Deploy to Vercel

1. Fork this repo.
2. Import to [Vercel](https://vercel.com/).
3. Add `GEMINI_API_KEY` under **Environment Variables**.
4. Deploy.

## Dev Tools

Bypass the rate limiter during development:

```js
localStorage.setItem('obsidian_dev_mode', 'true');
```