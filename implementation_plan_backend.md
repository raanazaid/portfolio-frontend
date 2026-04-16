# Contact Form Backend Setup Plan

Setting up a production-ready Node.js backend to forward portfolio contact form submissions to Gmail.

## User Review Required

> [!IMPORTANT]
> **Gmail App Password Required**: To use Gmail with Nodemailer securely, you will need to generate an "App Password" from your Google Account settings. I will provide instructions for this.

> [!NOTE]
> I will be creating a new directory named `backend` to keep the server code separate from the static frontend files.

## Proposed Changes

### Backend Component

#### [NEW] [server.js](file:///g:/portfolio/backend/server.js)
- Express server foundation.
- `/api/contact` POST endpoint.
- Nodemailer configuration using environment variables.
- Server-side validation (regex for email, non-empty checks).
- Error handling and success responses.
- Security middleware (CORS, Helmet).

#### [NEW] [package.json](file:///g:/portfolio/backend/package.json)
- Dependencies: `express`, `nodemailer`, `cors`, `dotenv`, `helmet`.

#### [NEW] [.env.example](file:///g:/portfolio/backend/.env.example)
- Template for `GMAIL_USER` and `GMAIL_APP_PASSWORD`.

### Frontend Component

#### [MODIFY] [index.html](file:///g:/portfolio/index.html)
- Add unique IDs to form inputs (`contactName`, `contactEmail`, `contactMessage`).
- Implement the `fetch` request logic in the script section to send data to the backend.
- Add visual feedback for "Sending...", "Success", and "Error" states.

## Verification Plan

### Automated Tests
- I will verify the Node.js syntax and package configuration.
- I will simulate a request to the server (if run locally) to ensure the validation logic works.

### Manual Verification
- The user will need to:
    1. Run `npm install` in the backend folder.
    2. Set up their `.env` file with their Gmail credentials.
    3. Run `node server.js`.
    4. Test a form submission from the browser.
