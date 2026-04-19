# Secure AI Chatbot Integration

To securely hook up the AI Assistant without leaking your Hugging Face API key, we will move the LLM fetching logic out of the public widget into your server backend.

## Proposed Changes

### Backend (/backend)

#### [MODIFY] [server.js](file:///g:/portfolio/backend/server.js)
- Build a new `POST /api/chat` route.
- This route will receive the message inputs from the chatbot, securely inject your `process.env.HUGGINGFACE_API_KEY`, and safely proxy the `fetch` request back to Mistral on Hugging Face.

#### [MODIFY] [.env.example](file:///g:/portfolio/backend/.env.example) & [backend/.env](file:///g:/portfolio/backend/.env)
- Add a reserved slot for `HUGGINGFACE_API_KEY=`. You can paste your key safely here for local testing.

### Frontend

#### [MODIFY] [chatbot-widget.js](file:///g:/portfolio/chatbot-widget.js)
- Refactor the `fetchLLMResponse` method completely.
- Point it to securely invoke `https://portfolio-backend-phi-woad.vercel.app/api/chat` (your deployed backend) instead of sending the request straight to Mistral with an exposed key.

> [!WARNING] 
> **You must update your Vercel Environment Variables!**
> After I finish these changes, you must go to your Vercel Project Dashboard for `portfolio-backend-phi-woad` and add `HUGGINGFACE_API_KEY` with your actual API key. Then trigger a redeploy so the backend has access to it.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- After setting up the code, you will need to add your personal key to the local `.env`, start the node server locally (`node backend/server.js`), and test that the chatbot successfully generates an answer without showing the "sync issue" prompt. I will configure the widget to fall back to `http://localhost:3000/api/chat` if it fails to hit the vercel domain so you can test it locally.
