# Authentication Implementation and Testing Guide

## Overview

This document outlines the authentication system implementation in Project Nexus, including password reset functionality, security measures, and comprehensive testing strategies.

## Authentication Features

### Password Reset Flow

The password reset system implements a secure three-step verification process:

1. **Request Reset**: User submits email address
2. **Email Verification**: User clicks verification link in email (POST request)
3. **Password Reset**: User sets new password after verification

### Security Measures

- **Token Hashing**: Reset tokens are hashed using SHA-256 before storage
- **Token Expiry**: Tokens expire after 1 hour
- **Email Verification Required**: Password cannot be reset without email verification
- **Password Confirmation**: Both new_password and confirm_password required
- **Secure Token Generation**: Uses Django's get_random_string(32)

## Implementation Details

### Backend Components

#### Models (`users/models.py`)

- `UserProfile` model includes:
  - `reset_token`: Hashed reset token (CharField, nullable)
  - `reset_token_expires`: Token expiry timestamp (DateTimeField, nullable)

#### Views (`authentication/views.py`)

**PasswordResetRequestView**:

- Handles POST requests to `/api/auth/password/reset/`
- Validates email existence
- Generates secure token and expiry
- Sends HTML email with verification link to `/auth/password/verify?token=X&email=Y`

**PasswordResetVerifyEmailView**:

- Handles POST requests to `/api/auth/password/reset/verify/`
- Validates token and expiry from request body
- Returns verification status (doesn't clear token)
- Requires both email and token in JSON payload

**PasswordResetConfirmView**:

- Handles POST requests to `/api/auth/password/reset/confirm/`
- Requires email verification (token cleared)
- Validates password confirmation
- Updates user password securely

#### URLs (`authentication/urls.py`)

- `password_reset`: POST `/api/auth/password/reset/` - Request password reset
- `password_reset_verify`: POST `/api/auth/password/reset/verify/` - Verify email/token
- `password_reset_confirm`: POST `/api/auth/password/reset/confirm/` - Confirm password reset

### Frontend Components

#### Forgot Password Page (`frontend/app/auth/forgot-password/page.tsx`)

- Email input form
- Success message directing to email verification

#### Verification Page (`frontend/app/auth/password/verify/page.tsx`)

- Token and email validation from URL parameters
- POST request to `/api/auth/password/reset/verify/` with JSON payload
- Success/error feedback with redirect to password reset form

#### Password Reset Confirm Page (`frontend/app/auth/password/reset/confirm/page.tsx`)

- New password and confirmation input
- POST request to `/api/auth/password/reset/confirm/` with both passwords

## Testing Strategy

### Test Organization Convention

Following Django best practices:

- **Unit Tests**: Located in each app's `tests.py` file
  - Test individual components (views, models, utilities)
  - Focus on specific functionality within the app

- **Integration Tests**: Located in `backend/tests/` directory
  - Test interactions between multiple components
  - Test end-to-end workflows across apps
  - Use pytest for broader test coverage

### Authentication Tests

#### App-Specific Tests (`authentication/tests.py`)

Uses Django REST Framework's `APITestCase` (unittest-based):

- **PasswordResetTestCase**:
  - `test_password_reset_request_success`: Tests successful reset request
  - `test_password_reset_request_invalid_email`: Tests invalid email handling
  - `test_password_reset_verify_email_success`: Tests email verification
  - `test_password_reset_verify_email_invalid_token`: Tests invalid token
  - `test_password_reset_verify_email_expired_token`: Tests expired token
  - `test_password_reset_confirm_success`: Tests password reset confirmation
  - `test_password_reset_confirm_unverified_email`: Tests verification requirement
  - `test_password_reset_confirm_password_mismatch`: Tests password validation
  - `test_password_reset_confirm_invalid_email`: Tests email validation
  - `test_email_template_rendering`: Tests HTML email generation
  - `test_token_expiry_logic`: Tests token expiry behavior

#### Integration Tests (`tests/test_account.py`)

Uses pytest with `@pytest.mark.django_db`:

- **test_account_update_and_password_change**: Tests account update and password change flow
- **test_account_deactivate**: Tests account deactivation

### Running Tests

```bash
# Run all authentication tests
python manage.py test authentication

# Run integration tests
python manage.py test tests.test_account

# Run with pytest (if configured)
pytest backend/tests/test_account.py
```

### Test Coverage

Tests cover:

- ✅ Successful password reset flow
- ✅ Invalid email handling
- ✅ Token validation and expiry
- ✅ Email verification requirement
- ✅ Password confirmation matching
- ✅ HTML email template rendering
- ✅ Account update and password change
- ✅ Account deactivation

## Security Considerations

### Token Security

- Tokens are hashed using SHA-256 before database storage
- Tokens expire after 1 hour to prevent replay attacks
- Email verification required before password reset
- Tokens remain valid until expiry or successful password reset

### Email Security

- HTML emails include branded content and clear instructions
- Verification links include secure tokens
- No sensitive information sent via email

### Password Security

- Passwords are hashed using Django's default hasher
- Password confirmation required during reset
- Old password verification for password changes

## Configuration

### Environment Variables

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@projectnexus.com
```

### Settings (`backend/settings.py`)

```python
# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@projectnexus.com')

# Password reset settings
PASSWORD_RESET_TIMEOUT = 3600  # 1 hour in seconds
```

## API Endpoints

### Password Reset Request

```bash
POST /api/auth/password/reset/
Content-Type: application/json

{
  "email": "user@example.com"
}

Response (200):
{
  "detail": "If the email exists, a verification link will be sent."
}
```

### Email Verification

```bash
POST /api/auth/password/reset/verify/
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset_token_here"
}

Response (200):
{
  "detail": "Email verified successfully. You may now reset your password.",
  "verified": true
}
```

### Password Reset Confirmation

```bash
POST /api/auth/password/reset/confirm/
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset_token_here",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}

Response (200):
{
  "detail": "Password reset successful."
}
```

## Error Handling

### Common Error Responses

- `400 Bad Request`: Invalid email, expired token, password mismatch
- `200 OK`: Success with message
- `404 Not Found`: Invalid endpoints

### Error Messages

- "User with this email does not exist"
- "Invalid or expired reset token"
- "Email must be verified before resetting password"
- "Passwords do not match"

## Future Enhancements

- Rate limiting for password reset requests
- SMS verification as alternative to email
- Two-factor authentication integration
- Password strength validation
- Audit logging for security events
