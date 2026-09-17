# Create a visitor account for Ahmed Hoza

## What will happen
A normal visitor account is created directly in the backend, ready to sign in with the email and password you gave.

- Name: Ahmed Hoza
- Email: ahmedhoza@gmail.com
- Role: visitor (no provider role, no dashboard)
- Email marked confirmed, so sign-in works immediately

## Steps
1. Check whether an account with that email already exists. If it does, stop and report instead of creating a duplicate.
2. Create the account with the given password and display name, email confirmed.
3. Confirm the visitor profile row exists with the display name (it is created automatically on signup).
4. Verify sign-in works and that the account has no provider role, then report the account id.

## Technical notes
- Account is created via the backend admin API (auth user + auto-confirm), with `display_name` in user metadata so the existing profile trigger fills `profiles`.
- No schema change, no migration, no code change.

## One caution
You shared a real password in chat. After I create the account, it would be safer to change it from the app's password screen.
