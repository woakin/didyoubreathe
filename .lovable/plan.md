

## Fix: Audio Loading Infinite Loop and "Preparando..." Stuck State

### Root Cause

There are two problems happening simultaneously:

1. **Infinite retry loop**: The `useEffect` on line 265-269 of `BreatheV2.tsx` calls `preloadAudio()` whenever `voiceEnabled && !isReady && !isLoading`. When audio is not cached (e.g., box-breathing), `preloadAudio` finishes (sets `isLoading=false`), but `isReady` remains `false` -- so the effect fires again immediately, creating an infinite loop (~1 request/second as seen in network logs).

2. **No graceful fallback**: When audio is unavailable, the button stays in "Preparando..." forever because the loading state keeps cycling. The user has no way to start a session.

### Solution

#### 1. Add a "failed" state to `useVoiceGuideV2.ts`

- Add a `hasFailed` state that gets set to `true` when `preloadAudio` returns `found: false`
- This prevents the infinite retry loop since the effect can check `hasFailed` before retrying
- Reset `hasFailed` when `voiceId` or `techniqueId` changes (so switching voices retries correctly)

#### 2. Update preload effect in `BreatheV2.tsx`

- Add `voiceGuide.hasFailed` to the guard condition: skip preload if already failed
- When audio has failed, automatically fall back to timer mode silently (no toast spam)

#### 3. Replace "Preparando..." with a progress indicator

- When `voiceGuide.isLoading` is true, show a small pulsing progress bar under the button text instead of just "Preparando..."
- If loading fails, the button immediately switches to the normal "Start" state (timer fallback)
- Add a subtle toast explaining the fallback: "Voice guide unavailable, using visual timer"

#### 4. Improve the start button UX

- When voice is enabled but audio failed: show the Play button normally (not "Preparando...") since it will use timer mode
- Add a small muted indicator below the voice selector showing "Voice unavailable" when `hasFailed` is true, so users understand why there's no voice

### Technical Changes

**`src/hooks/useVoiceGuideV2.ts`**:
- Add `hasFailed` boolean state, initialized to `false`
- Set `hasFailed = true` when response returns `found: false`
- Reset `hasFailed` in the `voiceId` change effect
- Export `hasFailed` from the hook

**`src/pages/BreatheV2.tsx`**:
- Update preload effect guard: `if (voiceEnabled && !voiceGuide.isReady && !voiceGuide.isLoading && !voiceGuide.hasFailed)`
- Update start button: when `hasFailed`, start timer session directly instead of trying to preload again
- Add a small "Voice unavailable" indicator near the voice selector when `hasFailed` is true
- Replace the "Preparando..." aura animation with a slim progress bar animation for clearer loading feedback

**`src/i18n/translations/en.ts` and `es.ts`**:
- Add `breathe.voiceUnavailable`: "Voice unavailable" / "Voz no disponible"
- Add `breathe.usingTimer`: "Using visual timer" / "Usando temporizador visual"

### What This Fixes

- Eliminates the infinite network request loop (dozens of wasted API calls)
- Users can immediately start any technique, even without cached audio
- Clear visual feedback during loading and clear fallback messaging
- No breaking changes to the existing flow for techniques that DO have cached audio (diaphragmatic)

