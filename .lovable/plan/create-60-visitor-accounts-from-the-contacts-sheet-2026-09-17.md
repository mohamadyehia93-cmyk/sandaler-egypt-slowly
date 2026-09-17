# Create 60 visitor accounts from the contacts sheet

## What will happen

From the "Master Contacts" tab of your shared sheet (about 475 email addresses in column B), 60 addresses that clearly contain a first and last name are selected, and a visitor account is created for each — exactly like the last batch.

- Name: taken from the email (e.g. `aya.sabry0@...` becomes "Aya Sabry")
- Password: the same one used for the previous accounts
- Role: visitor only (no provider role, no dashboard)
- Email marked confirmed, so sign-in works immediately

## How the 60 are chosen

Kept:
- Two clear name parts separated by a dot, underscore or hyphen (`abeer.omar@`, `sara_mahmoud@`)
- Middle names allowed — first and last part are used (`abdallah.esam.sayed` becomes "Abdallah Sayed")
- Digits stripped from the name (`esraa.attia94` becomes "Esraa Attia")

Skipped:
- Single-word addresses with no separable last name (`abdelmohsena@`, `alihishaam@`)
- Nicknames, initials and non-name addresses (`3abedthedude@`, `a.h.solyman.91@`, `aarcamr@`)
- Role/organization addresses (`info@`, `3lamaddad@goethe.de` and similar staff aliases)
- Anyone who already has an account (the 14 created earlier and your own accounts)

Selection walks the sheet in order and stops once 60 valid, new addresses are collected.

## Steps

1. Read all rows of the "Master Contacts" tab and extract the email column.
2. Apply the rules above, skipping addresses that already exist in the backend, until 60 are selected.
3. Show you the 60 addresses with the derived names before anything is created, so you can strike out any that look wrong.
4. Create the accounts, confirm the email, and store the display name on each profile.
5. Spot-check sign-in on a few accounts and report the final count.

## Notes

- These are real people's addresses. No email is sent by this process — accounts are created silently in the backend, and nothing is published or messaged.
- Since everyone shares one password, each person should change it on first sign-in.
- No app code or schema changes; this is data creation only.
