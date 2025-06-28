# Email Verification Setup

This application includes email verification functionality to ensure users provide valid email addresses during registration.

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

```bash
# Email Configuration (Required for email verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXTAUTH_URL=http://localhost:3000
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account settings
- Navigate to Security > 2-Step Verification
- Click on "App passwords"
- Generate a new app password for "Mail"
- Use this password as your `EMAIL_PASSWORD`

### 3. Update Environment Variables
- Set `EMAIL_USER` to your Gmail address
- Set `EMAIL_PASSWORD` to the app password you generated
- Set `NEXTAUTH_URL` to your application URL (e.g., `http://localhost:3000` for development)

## How Email Verification Works

1. **Registration**: When a user registers, a verification token is generated and stored in the database
2. **Email Sent**: A verification email is sent to the user's email address with a secure link
3. **Verification**: User clicks the link, which calls the verification API
4. **Account Activation**: Upon successful verification, the user's account is marked as verified and active
5. **Welcome Email**: A welcome email is sent to the user

## Security Features

- **Token Expiration**: Verification tokens expire after 24 hours
- **Secure Tokens**: Tokens are hashed before storage in the database
- **One-time Use**: Tokens are invalidated after successful verification
- **Email Validation**: Users cannot log in until their email is verified

## Testing Email Verification

1. Register a new account
2. Check your email for the verification link
3. Click the verification link
4. You should see a success message
5. You can now log in to your account

## Troubleshooting

### Email Not Received
- Check your spam folder
- Verify the email address is correct
- Ensure the email configuration is properly set up

### Verification Link Not Working
- Links expire after 24 hours
- Make sure you're using the complete link from the email
- Check that the environment variables are correctly set

### Gmail Issues
- Make sure you're using an app password, not your regular Gmail password
- Ensure 2-Factor Authentication is enabled
- Check that "Less secure app access" is not required (app passwords are preferred) 