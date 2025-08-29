# Admin Setup Guide

## How to Create and Login as Admin

### Method 1: Register as Admin (Recommended)

1. **Go to Registration Page**
   - Navigate to `/register` in your application
   - Or click "Register here" from the login page

2. **Fill in Admin Details**
   - **Username**: Choose a unique username
   - **Full Name**: Enter your full name
   - **University**: Enter your university
   - **Email**: Enter your email address
   - **Password**: Create a strong password
   - **Role**: Select "Administrator" from the dropdown

3. **Complete Registration**
   - Click "Register"
   - You'll be automatically redirected to the admin dashboard

### Method 2: Update Existing User to Admin

If you already have a user account, you can update it to admin role:

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Go to Table Editor
   - Select the `profiles` table

2. **Find Your User**
   - Look for your user record
   - Click "Edit" on your row

3. **Update Role**
   - Change the `role` field from `PLAYER` to `ADMIN`
   - Save the changes

4. **Login**
   - Go to `/login` in your application
   - Login with your existing credentials
   - You'll be redirected to admin dashboard

### Method 3: Direct Database Update

You can also run this SQL command in Supabase SQL Editor:

```sql
-- Update a specific user to admin (replace 'user-email@example.com' with actual email)
UPDATE profiles 
SET role = 'ADMIN' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'user-email@example.com'
);
```

## Admin Features Available

Once logged in as admin, you can access:

### Dashboard
- **Statistics Overview**: Total players, teams, matches, live matches
- **Quick Actions**: Create teams, schedule matches, assign players
- **Recent Activity**: Latest matches and system status

### Player Management
- **View All Players**: See all registered players with team assignments
- **Assign Players**: Assign players to teams
- **Player Details**: View individual player information

### Team Management
- **View All Teams**: See all teams with player counts
- **Create Teams**: Add new teams to the tournament
- **Team Details**: View team information and members

### Match Management
- **View All Matches**: See match schedule with status and scores
- **Schedule Matches**: Create new match fixtures
- **Live Control**: Manage ongoing matches

## Security Features

- **Role-based Access**: Only users with `ADMIN` role can access admin pages
- **Authentication Required**: Must be logged in to access admin features
- **Automatic Redirects**: Non-admin users are redirected to home page
- **Session Management**: Admin privileges are checked on each page load

## Troubleshooting

### "Access Denied" Error
- Make sure you're logged in
- Verify your user has `ADMIN` role in the `profiles` table
- Check that the role field is exactly `ADMIN` (case-sensitive)

### Login Issues
- Ensure your email and password are correct
- Check that your user account exists in both `auth.users` and `profiles` tables
- Verify email confirmation if required by your Supabase settings

### Database Connection Issues
- Check your `.env.local` file has correct Supabase credentials
- Verify your Supabase project is active
- Test connection using `/api/test-connection` endpoint

## Admin Account Best Practices

1. **Use Strong Passwords**: Choose complex passwords for admin accounts
2. **Limit Admin Users**: Only give admin access to trusted individuals
3. **Regular Security Review**: Periodically review admin user list
4. **Backup Important Data**: Regularly backup tournament data
5. **Monitor Activity**: Keep track of admin actions and changes

## Quick Commands

### Create Admin User via SQL
```sql
-- Insert admin user directly (replace with actual values)
INSERT INTO profiles (id, username, "fullName", university, role)
VALUES (
  'your-user-id-here',
  'admin_username',
  'Admin Full Name',
  'University Name',
  'ADMIN'
);
```

### Check Admin Users
```sql
-- List all admin users
SELECT username, "fullName", university, role 
FROM profiles 
WHERE role = 'ADMIN';
```

### Remove Admin Access
```sql
-- Remove admin access from a user
UPDATE profiles 
SET role = 'PLAYER' 
WHERE username = 'username-to-downgrade';
```
