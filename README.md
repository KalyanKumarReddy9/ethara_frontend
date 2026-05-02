# Ethara Frontend

Next.js app for the Ethara task manager. It talks to the **Ethara API** via `NEXT_PUBLIC_API_URL`.

## Local development

```bash
npm install
cp .env.example .env.local
# optional: point .env.local at a local backend
npm run dev
```

## Production API

Production builds use `.env.production` (committed) with the deployed backend:

`https://ethara-backend-shhe.onrender.com/api`

To use a different API URL, set `NEXT_PUBLIC_API_URL` in your host’s environment **before** `npm run build`, or edit `.env.production`.

## Deploy on Render (Web Service)

1. Connect this repo on [Render](https://render.com).
2. **Runtime:** Node  
3. **Build command:** `npm install && npm run build`  
4. **Start command:** `npm start`  
5. **Health check:** optional path `/` or `/login`

After your frontend URL is live, add it to the **backend** `CLIENT_URL` on Render (comma-separated with localhost if needed), for example:

`http://localhost:3000,https://YOUR-FRONTEND.onrender.com`

No trailing slashes. This enables CORS and Socket.IO chat.
