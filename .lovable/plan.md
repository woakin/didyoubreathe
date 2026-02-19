

## Plan: Soft Signup Prompt After First Breathing Session

### The Problem

Currently, when an anonymous (not logged in) user completes a breathing session, **nothing happens**. Both `onComplete` callbacks in `BreatheV2.tsx` start with `if (!user) return;` -- meaning anonymous users get no celebration, no stats, and no prompt to save their progress. This is a massive missed opportunity at the user's **peak motivation moment** (Peak-End Rule).

### The Solution

After an anonymous user completes their first session, show a special celebration screen that:
1. Celebrates their achievement (floating particles, checkmark animation -- same vibe as existing `SessionComplete`)
2. Shows what they just accomplished (duration of session)
3. Gently invites them to create an account to **save their progress**
4. Provides a "skip" option so it never feels forced

### User Flow

```text
[Anonymous user completes session]
        |
        v
┌──────────────────────────────────┐
│       ✓ Session Complete         │
│       Well done!                 │
│                                  │
│       🕐 2m 30s                  │
│       This session               │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 💾 Save your progress      │  │
│  │ Create a free account to   │  │
│  │ track streaks & history    │  │
│  │                            │  │
│  │  [Create Account]          │  │
│  └────────────────────────────┘  │
│                                  │
│  [Repeat]         [Continue]     │
│                                  │
│      Maybe later (skip link)     │
└──────────────────────────────────┘
```

### Technical Changes

#### 1. Modify `src/pages/BreatheV2.tsx`

- Update both `onComplete` callbacks (audio-driven and timer-driven) to handle the anonymous case:
  - Instead of `if (!user) return;`, calculate session duration and show the completion screen even without a user
  - For logged-in users, behavior stays exactly the same (save to DB, show stats)

```typescript
// Audio-driven onComplete (simplified)
onComplete: useCallback(async () => {
  const duration = voiceGuide.timestamps 
    ? Math.round(voiceGuide.timestamps.totalDuration) 
    : 0;

  if (!user) {
    // Anonymous user -- show celebration with signup prompt
    setSessionStats({ duration, todayMinutes: 0, streak: 0 });
    setShowComplete(true);
    return;
  }
  // ... existing logged-in logic unchanged
}, [...])
```

Same pattern for the timer-driven `onComplete`.

#### 2. Update `src/components/SessionComplete.tsx`

- Add a new prop: `isAnonymous: boolean`
- When `isAnonymous` is true:
  - Hide the "Today" and streak stats (no data to show)
  - Show a **signup prompt card** with outcome-based copy: "Save your calm" / "Create a free account to track your streaks and breathing history"
  - Primary CTA: "Create Account" button (navigates to `/auth`)
  - Secondary: "Maybe later" text link that dismisses the prompt
  - Still show "Repeat" and "Continue" buttons so the user never feels trapped

#### 3. Update translations in `src/i18n/translations/es.ts` and `en.ts`

Add new keys under `sessionComplete`:

| Key | EN | ES |
|-----|----|----|
| `saveProgress` | Save your calm | Guarda tu calma |
| `saveProgressDescription` | Create a free account to track your streaks and breathing history | Crea una cuenta gratis para guardar tus rachas e historial |
| `createAccount` | Create Account | Crear Cuenta |
| `maybeLater` | Maybe later | Quizás después |

#### 4. Wire up navigation in `BreatheV2.tsx`

- Pass `isAnonymous={!user}` to `SessionComplete`
- Add `onCreateAccount` callback that navigates to `/auth` (signup mode)

### What This Does NOT Change

- Logged-in user experience remains identical
- No database schema changes required
- No new dependencies
- The prompt only appears on session completion, never interrupting the breathing flow

