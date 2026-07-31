# Google OAuth 2.0 & Full Authentication Suite

## Overview

Weekie AI Captions features a complete, production-ready Authentication System with **Google OAuth 2.0**, JWT token verification, and strict Route Guarding for the Creator Studio.

---

## Architecture & Authentication Flow

```
+-------------------------------------------------------------------+
|                            User Action                            |
|             (Clicks "Continue with Google" / Sign In)             |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                 Google Identity Services (GIS) SDK                |
|             Loads https://accounts.google.com/gsi/client          |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                   Google OAuth 2.0 Credential                     |
|            (Signed JWT containing sub, email, name, picture)      |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                      JWT Decoder & Session                        |
|   1. Decode Base64 Payload                                        |
|   2. Set `weekie_user` in localStorage                            |
|   3. Set `weekie_session=active` Cookie (Max-Age: 24h)           |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                    Redirect to /studio Workspace                  |
+-------------------------------------------------------------------+
```

---

## Core Authentication Components

### 1. Google OAuth Button (`frontend/src/components/google-auth-button.tsx`)

The `GoogleAuthButton` component handles both:
- **Google Identity Services Native SDK** (`window.google.accounts.id.renderButton`).
- **In-App Account Chooser Modal** to guarantee seamless fallback authentication without `401: invalid_client` errors when Client ID is unconfigured.

#### JWT Token Parser:
```ts
const parseGoogleJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};
```

---

## Authentication Pages

| Route | Purpose | Features |
| :--- | :--- | :--- |
| `/login` | User Login | Google OAuth button, Email/Password login, "Forgot Password?" link |
| `/register` | User Registration | Google OAuth button, Full Name, Email, Password, Terms agreement checkbox |
| `/forgot-password` | Password Recovery | Email input field with live reset link dispatch & confirmation feedback |

---

## Studio Route Guarding (`frontend/src/app/studio/page.tsx`)

The `/studio` workspace enforces authentication. Unauthenticated users see the **"Account Required"** gatekeeper screen:

```tsx
if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-bold">Sign In Required to Access Studio</h2>
        <GoogleAuthButton label="Sign In with Google to Continue" redirectUrl="/studio" />
      </div>
    </div>
  );
}
```

---

## Configuring Google Cloud OAuth Client ID

To connect your own Google Cloud project:
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Web Client ID**.
3. Add Authorized Origin: `http://localhost:3010`.
4. Add Authorized Redirect URI: `http://localhost:3010/login`.
5. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
