# Clerk Authentication Setup

This application now uses Clerk for authentication with role-based access control.

## Setup Instructions

1. **Create a Clerk Account**
   - Go to https://clerk.com and sign up for a free account
   - Create a new application

2. **Get Your API Keys**
   - In the Clerk Dashboard, go to "API Keys"
   - Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

3. **Configure Environment Variables**
   - Create a `.env.local` file in the root directory
   - Add your Clerk keys:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

4. **Configure Clerk Dashboard Paths**
   - In Clerk Dashboard, navigate to: **Configure** → **Developers** → **Paths**
   - Under **Component paths** section:
     
     **For `<SignIn />` component:**
     - Select the radio button: **"Sign-in page on development host"** (not Account Portal)
     - In the input field, enter: `/login`
     - This tells Clerk to use your custom sign-in page at `http://localhost:3000/login`
     
     **For `<SignUp />` component:**
     - Select the radio button: **"Sign-up page on development host"** (not Account Portal)
     - In the input field, enter: `/register`
     - This tells Clerk to use your custom sign-up page at `http://localhost:3000/register`
     
     **For Signing Out:**
     - Select the radio button: **"Page on development host"** (not Account Portal)
     - In the input field, enter: `/login` (or `/` if you prefer)
     - This is where users will be redirected after signing out
   
   **Note:** The "After sign-in URL" and "After sign-up URL" are configured in your code (see `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx` where we set `afterSignInUrl="/"` and `afterSignUpUrl="/"`). You don't need to set these in the Dashboard.

5. **Set Up Roles (Optional)**
   - Roles are stored in Clerk's `publicMetadata`
   - Default role for new users: `product-owner`
   - Available roles:
     - `admin` - Full system administration
     - `product-owner` - Backlog & sprint management
     - `developer` - Story updates & delivery
     - `ai-agent` - Automated execution tasks

## Role Management

- Roles are managed through the `/admin/roles` page (admin only)
- Roles are stored in Clerk's `publicMetadata.role`
- Role changes are logged in the audit trail
- User status (active/disabled) is also stored in `publicMetadata.status`

## Features

- ✅ Secure authentication with Clerk
- ✅ Role-based access control (RBAC)
- ✅ Protected routes based on user roles
- ✅ Role management interface (admin only)
- ✅ Session management
- ✅ Password reset (handled by Clerk)

## Migration Notes

The application has been migrated from a custom localStorage-based authentication to Clerk. All user data is now managed through Clerk's backend.

