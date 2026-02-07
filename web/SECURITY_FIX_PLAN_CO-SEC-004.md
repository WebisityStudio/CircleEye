# Security Fix Plan: CO-SEC-004 (DOM XSS Sink)

**Scope:** DOM injection risk in `index.html` emergency alert script.  
**Goal:** Remove unsafe `innerHTML` and inline handlers; ensure untrusted input is rendered safely.

---

## 1) Fix Strategy

1. Replace `innerHTML` with DOM node creation and `textContent`.
2. Replace inline `onclick` with `addEventListener`.
3. Keep alert styling unchanged.

---

## 2) Implementation Notes

- No CSP changes in this step (optional follow-up if desired).
- Only affects the emergency alert helper.

---

## 3) Verification Checklist

- Call `window.emergencyAlert('<img onerror=alert(1)>')` and confirm it renders as text.
- Alert dismiss button still removes the alert.
- No console errors from the script.

---

## 4) Rollback Plan

- Revert `index.html` to the prior inline template version if needed.

