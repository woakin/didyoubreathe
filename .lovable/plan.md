

## Scroll to Top on Navigation to Breathing Page

### Problem

When navigating from the Techniques page to a breathing session (e.g., `/breathe/diaphragmatic`), the page retains the previous scroll position instead of starting at the top. This creates a disorienting experience.

### Solution

Add a `window.scrollTo(0, 0)` call in a `useEffect` on mount inside `BreatheV2.tsx`. This is the simplest, most reliable fix -- it ensures every breathing session page starts from the top regardless of where the user scrolled on the previous page.

### Technical Details

| File | Change |
|------|--------|
| `src/pages/BreatheV2.tsx` | Add a `useEffect(() => { window.scrollTo(0, 0); }, [])` near the top of the component, right after the existing hooks |

One small addition -- no other files need changes.

