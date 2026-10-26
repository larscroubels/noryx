# NORYX app

One app for iOS and Android, built with Expo, for both sides of NORYX. **Salon teams** use it for Today, Calendar, Clients, Clock and More. **Clients** get their side with plan C; until then the app shows a "coming soon" screen there.

The app uses the same Supabase project, logins and row-level security as the website. It also imports pure code from the website, such as times, prices, status rules and the three languages, through `@/…` (pointing at `../src`). Its own code lives under `~/…` (pointing at `./src`).

## Setup

1. Install Node 20 or newer, then run `npm install` in this folder.
2. Copy `.env.example` to `.env` and fill in these three values:
   - `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the same values as the website's `NEXT_PUBLIC_…` ones. Never put a secret or service-role key here.
   - `EXPO_PUBLIC_SITE_URL`: the website the app talks to for account deletion, the "More" pages and email links. A phone can't reach `localhost`, so use the deployed site.
3. Run `npm start`, then scan the QR code with **Expo Go** (iPhone: the Camera app; Android: the Expo Go app). The phone and computer must be on the same network.

Before you finish a change, run `npm run check`: lint, typecheck and the Jest tests.

## Builds and the stores (EAS, also from Windows)

iOS builds run in Expo's cloud, so no Mac is needed.

- `npx eas-cli@latest build --profile preview --platform android`: an installable test build.
- `npx eas-cli@latest build --profile production --platform ios|android`: store builds. These need an Apple Developer account (€99 per year) and a Google Play developer account (a one-off $25).
- Before you submit, replace `assets/images/icon.png` with a 1024×1024 icon. The current one is the website's 512 px icon.

The bundle identifier and package name are both `be.noryx.app` (set in `app.json`).

## Manual test script (real phone)

Use the demo logins from `supabase/seed.sql` on the hosted project, or test accounts you made yourself. Steps that change data change them for everyone who uses that demo.

1. **Owner confirms an appointment** (spec flow 1). Sign in as `owner@noryx.test`.
   - Today shows the greeting, the day's appointments and bookings that wait for approval.
   - Open a pending booking and tap **Confirm**. The status label changes, and the website's calendar shows the same.
2. **Staff member clocks in and out** (spec flow 2). Sign in as `staff@noryx.test` and open **Clock**.
   - Tap **Clock in**: you see "since hh:mm" and the running time.
   - Tap **Clock out**. The website's time page shows the registration.
   - Calendar shows only this staff member's appointments, with no other professionals to choose.
3. **Owner finds the connection code** (spec flow 3). In the app, open **More → Settings**: the website opens already signed in, and the "NORYX app" card shows the code.
4. **Switching sides** (spec flow 8). Use a staff account that also has a client link (link one with `link_business_by_code`).
   - The app asks where to start.
   - **Profile** offers both sides.
5. **Appointment actions**:
   - Reschedule to a busy time: you see the overlap message, and nothing moves.
   - Reschedule to a free time: the appointment moves.
   - Record a cash payment: you see "Payment recorded." It is only recorded in NORYX; nothing is charged.
   - Cancel with a reason: the cancel button asks for confirmation first.
6. **Clients**:
   - Search for part of a name, and for `a,b` or `50%`: there is no error.
   - Open a client, then tap the phone and email buttons.
   - Add a note: only shown to roles that may see notes.
7. **Profile**:
   - Switching language changes all text, and "Salon language" goes back to the salon's language.
   - Sign out.
   - **Delete account** for a fresh test account: the account is gone, and signing in again fails.
   - Deleting the only owner of a salon is refused with the website's message.
8. **Quality checks**:
   - Set the largest text size: nothing is clipped, and buttons stay tappable.
   - VoiceOver (iOS) or TalkBack (Android) on Today and Calendar: every control is read out with a label, in the same order as on screen.
   - Airplane mode: screens show the "couldn't load" message with **Try again**, never an endless spinner.
   - Revoke the session (for example by changing the password on the website): the app returns to sign-in with "You've been signed out."
