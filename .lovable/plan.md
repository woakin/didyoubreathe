

## Fix: Audio Loading Progress Bar and Playback on Respiracion Diafragmatica

### Problem

Two related issues on the breathing session page:

1. **Repeating progress bar**: The "Preparando..." button contains a loading bar that uses `animation: pulse-loading 1.5s ease-in-out infinite`, making it loop 0-to-100% endlessly. It should show a determinate or single-pass animation.

2. **Audio not playing**: The `fetch-cached-audio` function likely returns `found: false` for the diaphragmatic technique (the pre-generated audio files may not exist in storage for this voice/technique combo). When this happens, the UI should quickly fall back to timer mode instead of appearing stuck.

### Changes

#### 1. `src/index.css` -- Fix the loading animation
Replace the infinite looping animation with a single-pass indeterminate shimmer that feels like real progress (Labor Illusion -- "Finding your perfect rhythm..."):

- Change `pulse-loading` from `infinite` to a slow single-pass fill (e.g., 8s ease-out, fills from 0% to 90% and stays). This gives the perception of work being done without the jarring loop reset.

#### 2. `src/pages/BreatheV2.tsx` -- Improve loading feedback and fallback

- When `voiceGuide.isLoading` is true, show the Labor Illusion text: "Buscando tu guia..." / "Finding your guide..." instead of just "Preparando..."
- When loading fails (`hasFailed`), immediately start the timer session without leaving the user in a stuck state
- Add a `useEffect` that watches `voiceGuide.hasFailed`: if it becomes true while no session is active, auto-start the timer session and show a brief toast ("Usando modo visual" / "Using visual mode")

#### 3. `src/i18n/translations/es.ts` and `en.ts`
- Add a key for the Labor Illusion loading text (e.g., `breathe.findingGuide`: "Buscando tu guia..." / "Finding your guide...")

### Technical Details

**Loading animation fix** (`src/index.css`):
```css
@keyframes pulse-loading {
  0% { width: 0%; opacity: 0.7; }
  100% { width: 92%; opacity: 1; }
}

.animate-pulse-loading {
  animation: pulse-loading 6s ease-out forwards;
}
```

Key change: `infinite` becomes `forwards` (fills once and holds).

**Auto-fallback** (`src/pages/BreatheV2.tsx`):
Add a `useEffect` watching `voiceGuide.hasFailed`:
```ts
useEffect(() => {
  if (voiceGuide.hasFailed && voiceEnabled && !sessionState.isActive) {
    // Auto-fall back to timer mode silently
    toast.info(t.breathe.voiceUnavailable);
  }
}, [voiceGuide.hasFailed]);
```

Also update `handleStart` to check `hasFailed` earlier to avoid unnecessary loading delays.

### Edge Cases
- If audio files are genuinely missing from storage, the fallback to timer mode should be fast (under 2s)
- The single-pass loading bar will hold at 92% if loading takes longer than 6s, which still looks natural

