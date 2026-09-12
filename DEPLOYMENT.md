# Vercel deployment

Deploy the repository root, not `client`, as the Vercel project root. The root `vercel.json` serves the Vite build and routes `/api/*` to the Express function in `api/index.js`.

Set this Vercel environment variable for Production:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
```

Redeploy after setting the variables. The frontend uses `/api` by default, so no `VITE_API_URL` value is needed when the API function is deployed in the same Vercel project. If the API is hosted separately, set `VITE_API_URL` to that server's public URL ending in `/api` instead.

Verify the deployment with:

```text
https://<your-vercel-domain>/api/health
```

It should return JSON with `"status": "ONLINE"`.
