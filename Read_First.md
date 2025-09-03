<!-- @format -->

# Backend Template Setup

## Prerequisites

- Node.js installed
- MongoDB running
- Environment variables configured

## Installation

```bash
npm install
```

## Environment Setup

**IMPORTANT**: Before running the application, you must configure your environment variables.

1. Create a `.env` file in the project root
2. Copy the required variables from `ENVIRONMENT_SETUP.md`
3. Set your JWT_SECRET, JWT_EXPIRES_IN, and JWT_REFRESH_EXPIRES_IN values
4. Configure your MongoDB URI

See `ENVIRONMENT_SETUP.md` for detailed configuration instructions.

## Running the Application

```bash
npm run dev
```

## API Endpoints

- Authentication: `/api/auth/*`
- Users: `/api/users/*` (admin only)
- Candidates: `/api/candidates/*`

## Security Notes

- All JWT configuration is now environment-based (no hardcoded values)
- JWT_SECRET must be a strong, random string
- Access tokens are short-lived, refresh tokens are longer-lived
- Admin verification is required for user access
