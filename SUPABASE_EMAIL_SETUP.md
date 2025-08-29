# Supabase Email Configuration

## Disable Email Confirmation (Recommended for Development)

If you're getting "invalid login credentials" errors, it might be because Supabase requires email confirmation by default.

### Method 1: Disable Email Confirmation

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Go to **Authentication** → **Settings**

2. **Disable Email Confirmation**
   - Find **"Enable email confirmations"**
   - **Turn it OFF** for development
   - Save changes

3. **Test Login**
   - Try logging in again
   - Should work immediately after registration

### Method 2: Configure Email Provider

If you want to keep email confirmation:

1. **Set up Email Provider**
   - Go to **Authentication** → **Email Templates**
   - Configure your email provider (Gmail, SendGrid, etc.)

2. **Test Email Delivery**
   - Check spam folder
   - Verify email templates are working

## Quick Fix for Multiple Admin Users

### SQL Command to Check Users
```sql
-- Check all users in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check all profiles
SELECT id, username, "fullName", role, "createdAt"
FROM profiles 
ORDER BY "createdAt" DESC;

-- Check for mismatched users
SELECT 
  au.id as auth_id,
  au.email,
  au.email_confirmed_at,
  p.id as profile_id,
  p.username,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL OR au.id IS NULL;
```

### Fix Missing Profiles
```sql
-- If a user exists in auth.users but not in profiles
INSERT INTO profiles (id, username, "fullName", university, role)
VALUES (
  'user-id-from-auth-users',
  'username',
  'Full Name',
  'University',
  'ADMIN'
);
```

### Fix Missing Auth Users
```sql
-- If a user exists in profiles but not in auth.users
-- You'll need to recreate the auth user
-- Delete from profiles first, then register again
DELETE FROM profiles WHERE id = 'problematic-user-id';
```

## Testing Multiple Admin Users

1. **Create First Admin**
   - Register with role "Administrator"
   - Should work fine

2. **Create Second Admin**
   - Register another user with role "Administrator"
   - Should also work fine

3. **Test Both Logins**
   - Login with first admin → should go to `/admin`
   - Login with second admin → should also go to `/admin`

## Common Issues and Solutions

### Issue: "Invalid login credentials"
**Solution**: Check email confirmation settings

### Issue: User exists but can't login
**Solution**: Check if profile exists in `profiles` table

### Issue: Profile exists but no auth user
**Solution**: User needs to register again

### Issue: Multiple users with same email
**Solution**: Each user must have unique email addresses

