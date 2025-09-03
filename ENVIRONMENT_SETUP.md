<!-- @format -->

# Environment Variables Setup

This project requires specific environment variables to be configured in your `.env` file. **All JWT-related variables are mandatory and have no default values.**

## Required Environment Variables

### Database Configuration

```env
MONGODB_URI=mongodb://localhost:27017/your_database_name
```

### Server Configuration

```env
PORT=6969
```

### JWT Configuration (MANDATORY - No Defaults)

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Optional Configuration

```env
NODE_ENV=development
```

## JWT Configuration Details

### JWT_SECRET

- **Type**: String
- **Description**: Secret key used to sign and verify JWT tokens
- **Security**: Must be a strong, random string (minimum 32 characters)
- **Example**: `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`

### JWT_EXPIRES_IN

- **Type**: String
- **Description**: Access token expiration time
- **Format**: Time string (e.g., "24h", "1d", "3600s")
- **Example**: `JWT_EXPIRES_IN=24h`

### JWT_REFRESH_EXPIRES_IN

- **Type**: String
- **Description**: Refresh token expiration time
- **Format**: Time string (e.g., "7d", "1w", "604800s")
- **Example**: `JWT_REFRESH_EXPIRES_IN=7d`

## Setup Instructions

1. **Create `.env` file** in your project root
2. **Copy the required variables** from above
3. **Generate a secure JWT_SECRET**:

   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Or using OpenSSL
   openssl rand -hex 64
   ```

4. **Set your database URI** to point to your MongoDB instance
5. **Configure token expiration times** according to your security requirements

## Security Recommendations

### JWT_SECRET

- Use a cryptographically secure random string
- Minimum 32 characters, preferably 64+ characters
- Never commit the actual secret to version control
- Use different secrets for different environments (dev, staging, production)

### Token Expiration

- **Access Token**: Short-lived (1-24 hours) for better security
- **Refresh Token**: Longer-lived (7-30 days) for user convenience
- Consider your application's security requirements when setting these values

## Example .env File

```env
# Database
MONGODB_URI=mongodb://localhost:27017/voting_system

# Server
PORT=6969

# JWT (REQUIRED)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Environment
NODE_ENV=development
```

## Error Handling

If any required JWT environment variables are missing, the application will throw an error on startup:

```
Error: JWT_SECRET environment variable is required
Error: JWT_EXPIRES_IN environment variable is required
Error: JWT_REFRESH_EXPIRES_IN environment variable is required
```

Make sure all required variables are properly set in your `.env` file before starting the application.
