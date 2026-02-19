

## Simplify Audio System: Remove Edge Function, Use Direct Public URLs

### What Changes

The `audio-guides` bucket is already public, so there is no need for a backend function to fetch audio URLs. The client can construct the URL directly, making audio loading faster (one fewer network hop) and the system simpler to maintain.

### Changes Overview

| File | Action |
|------|--------|
| `src/hooks/useVoiceGuideV2.ts` | Rewrite `preloadAudio` to construct public URLs directly instead of calling the edge function |
| `supabase/functions/fetch-cached-audio/index.ts` | Delete this file (and remove the deployed function) |

### Technical Details

**1. `src/hooks/useVoiceGuideV2.ts` -- Direct URL construction**

Replace the edge function call with direct URL building:

```typescript
const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/audio-guides`;

// Map technique IDs: "box-breathing" -> "box_breathing"
const fileId = techniqueId.replace(/-/g, '_');
const audioUrl = `${STORAGE_BASE}/${fileId}_${effectiveVoiceId}_v4.mp3`;
const timestampsUrl = `${STORAGE_BASE}/${fileId}_${effectiveVoiceId}_v4_timestamps.json`;
```

The new `preloadAudio` flow:
1. Build the audio and timestamps URLs directly
2. Fetch timestamps JSON via `fetch()` (non-blocking, OK if missing)
3. Create `new Audio(audioUrl)` and wait for `oncanplaythrough` with a **10-second timeout**
4. If audio fails (404 or timeout), try the legacy filename (`_es_full.mp3`) as fallback
5. If everything fails, set `hasFailed = true` so the auto-fallback to timer mode activates

This also fixes the "stuck on Buscando tu guia" bug by adding the timeout and setting `hasFailed` on all error paths.

**2. Delete `supabase/functions/fetch-cached-audio/index.ts`**

This edge function becomes unnecessary. It will be deleted from the codebase and undeployed.

### Benefits
- **Faster**: Removes one network round-trip (client -> edge function -> storage -> edge function -> client becomes client -> storage directly)
- **Simpler**: ~40 lines of client code replaces ~100 lines of edge function + ~70 lines of client code
- **More reliable**: No edge function cold starts or timeouts blocking audio loading
- **Fixes the stuck button**: The 10-second timeout ensures `isLoading` always resolves

