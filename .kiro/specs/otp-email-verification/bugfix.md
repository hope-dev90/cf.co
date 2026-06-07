# Bugfix Requirements Document

## Introduction

The OTP email verification flow is broken in practice. The backend generates an OTP and sends it (or attempts to), but then immediately auto-verifies the user and clears the OTP when email is not configured or when running outside production. This means the verification page (`/verify-email`) receives an email address but the OTP has already been consumed — users who do receive an email cannot use the code, and the verification step is effectively bypassed without user action. The fix must make the OTP verification flow work end-to-end: OTP is sent to the user's email, the user enters it on the frontend verification page, and only then is the account marked as verified.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user registers with a valid email and email sending succeeds THEN the system auto-verifies the account and clears the OTP before the user can enter it on the verification page
1.2 WHEN a user registers and email is not configured (no EMAIL_USER/EMAIL_PASS) THEN the system auto-verifies the account and skips the OTP verification step entirely
1.3 WHEN a user navigates to the `/verify-email` page after registration THEN the system shows the OTP input but the OTP has already been cleared, making any code entered invalid
1.4 WHEN a user submits a valid OTP on the verification page THEN the system returns "Invalid or expired OTP" because the OTP was already consumed during registration

### Expected Behavior (Correct)

2.1 WHEN a user registers with a valid email and email sending succeeds THEN the system SHALL save the OTP, send it to the user's email, and leave the account unverified until the user submits the correct OTP
2.2 WHEN a user registers and email is not configured THEN the system SHALL log the OTP to the console and still require the user to enter it on the verification page (using the console-logged value)
2.3 WHEN a user navigates to `/verify-email` after registration THEN the system SHALL accept OTP input and validate it against the saved (non-cleared) OTP
2.4 WHEN a user submits the correct OTP on the verification page THEN the system SHALL mark the account as verified, clear the OTP, and redirect the user to login

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user registers via Google OAuth THEN the system SHALL CONTINUE TO mark the account as verified immediately without requiring OTP
3.2 WHEN a verified user attempts to login with correct credentials THEN the system SHALL CONTINUE TO issue a JWT and return user data
3.3 WHEN a user requests a password reset OTP THEN the system SHALL CONTINUE TO send the OTP and require it for the reset flow
3.4 WHEN a user submits an expired or incorrect OTP THEN the system SHALL CONTINUE TO return an error without verifying the account
3.5 WHEN a registered but unverified user attempts to login in production THEN the system SHALL CONTINUE TO reject the login with a `requiresVerification: true` flag
3.6 WHEN a user clicks "Resend code" on the verification page THEN the system SHALL CONTINUE TO generate a new OTP, send it, and invalidate the previous one

---

## Bug Condition

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type RegistrationRequest
  OUTPUT: boolean

  // Bug triggers when the backend skips OTP verification after registration
  RETURN (emailSent = false OR isDevEnvironment() = true)
END FUNCTION
```

```pascal
// Property: Fix Checking — OTP must remain valid after registration
FOR ALL X WHERE isBugCondition(X) DO
  result ← register'(X)
  ASSERT user.is_verified = false
  ASSERT otp NOT cleared from database
  ASSERT frontend receives redirect signal to /verify-email
END FOR

// Property: Preservation Checking — Google OAuth and non-buggy paths unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT register(X) = register'(X)
END FOR
```
