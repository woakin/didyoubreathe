

## Deliver Weekly Emails at Each User's Local 9:00 AM

### Current Behavior
The cron job fires once at 9:00 AM UTC on Mondays, sending emails to all users simultaneously -- meaning users in Mexico City get it at 3:00 AM, and users in Madrid at 10:00 AM.

### New Behavior
Each user receives the email at **9:00 AM their local time** on Mondays, regardless of timezone.

### How It Works

1. **Store user timezone in `profiles`** -- add a `timezone` column (e.g., `America/Mexico_City`, `Europe/Madrid`). Default: `America/Mexico_City` since most users are Spanish-speaking.

2. **Change the cron schedule from weekly to hourly on Mondays** -- instead of one run at 9 AM UTC, run every hour on Mondays (`0 * * * 1`).

3. **Filter users by timezone in the edge function** -- on each hourly run, only process users whose current local hour is 9 AM. For example, at 15:00 UTC the function sends to users in `America/Mexico_City` (UTC-6, so 9 AM local).

4. **Let users set their timezone from Settings** -- auto-detect from the browser via `Intl.DateTimeFormat().resolvedOptions().timeZone` on first login, and allow manual change in Settings.

### Technical Changes

#### Database Migration
```sql
ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'America/Mexico_City';
```

#### `supabase/functions/send-weekly-summary/index.ts`
- Accept an optional `hour` parameter from the cron body (or compute from current UTC time)
- Before processing each user, check their `profiles.timezone`
- Use Deno's `Intl` API to check: "Is it 9 AM on a Monday in this user's timezone right now?"
- Skip users whose local time is not 9 AM

#### Cron Job (SQL -- not a migration file)
Reschedule from `0 9 * * 1` (once Monday 9AM UTC) to `0 * * * 1` (every hour on Mondays):
```sql
SELECT cron.unschedule('weekly-summary-email');
SELECT cron.schedule(
  'weekly-summary-email',
  '0 * * * 1',
  $$ ... same vault-based call ... $$
);
```

#### `src/hooks/useAuth.tsx` (or equivalent login handler)
- On successful login, auto-detect timezone and save to profile:
```ts
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
await supabase.from('profiles').update({ timezone: tz }).eq('user_id', user.id);
```

#### `src/pages/Settings.tsx`
- Add a timezone selector (or just display the auto-detected one with an option to change)

#### Translations
- Add `settings.timezone` / `settings.timezoneDescription` keys to `en.ts` and `es.ts`

### Edge Cases
- **Users without a timezone set**: default to `America/Mexico_City`
- **Duplicate sends**: the function already runs per-user, so filtering by timezone hour prevents duplicates naturally
- **DST changes**: using IANA timezone names (e.g., `America/Mexico_City`) with `Intl` handles DST automatically

