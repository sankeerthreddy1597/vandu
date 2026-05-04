To wire it up in the Clerk dashboard:

Go to Clerk Dashboard → Webhooks → Add Endpoint
URL: https://your-domain.com/api/webhooks/clerk
Events: user.created, user.updated, user.deleted
Copy the Signing Secret and paste it as CLERK_WEBHOOK_SIGNING_SECRET in your .env
For local development you can use the Clerk CLI or ngrok to forward webhooks to localhost:3000.