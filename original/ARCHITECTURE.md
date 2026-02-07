# Circle Eye — Product Architecture

**Status:** Production Planning  
**Client:** Circle UK Group (CUKG)  
**Purpose:** AI-powered site inspection & survey platform for security professionals  

---

## 1. What Is This?

Circle Eye is a field inspection tool for CUKG's security surveyors. An inspector arrives at a site, walks through it with their phone, and AI assists them in capturing a comprehensive security site survey — the same 218 CUKG format they currently do on paper/Word docs.

The AI watches the live camera feed, asks probing questions ("Can I see the fence line?", "What's the condition of that lock?"), flags issues, and after the walkthrough, generates a professional, regulation-compliant survey report automatically.

**The problem it solves:** Manual surveys are slow, inconsistent, and easy to miss things. AI makes every surveyor as thorough as the best surveyor.

---

## 2. Users

| Role | What they do |
|------|-------------|
| **Surveyor** (mobile) | Walks the site, streams video, answers AI questions, confirms findings |
| **Manager** (web) | Reviews completed surveys, manages sites/team, exports reports, client portal |
| **Admin** (web) | User management, company settings, billing |

---

## 3. Platform Strategy

| Platform | Purpose | Tech |
|----------|---------|------|
| **Mobile App** (iOS + Android) | Field inspection tool — camera, GPS, voice, offline-capable | React Native (Expo) |
| **Web Dashboard** | Back-office — reports, team management, analytics | Next.js |

**Why both:** Inspections happen in the field on phones. Report review, client management, and admin happen at a desk. Same architecture as CircleOverwatch.

---

## 4. The Survey Flow (Based on 218 CUKG Template)

The AI guides the surveyor through all 9 sections of the CUKG Security Site Survey:

### Section 1: General Site Information
- Site name, address, date, surveyor name, client rep, client company
- Auto-captured: GPS, date/time, surveyor (from auth)

### Section 2: Site Description & Layout
- Premises type (yard/depot/warehouse/office/mixed)
- Size, buildings, entry/exit points
- Gate/fencing condition
- CCTV coverage, alarm systems, response arrangements
- **AI actively asks:** "Can you show me the perimeter fencing?", "How many entry points can you see?"

### Section 3: Security Requirements
- Coverage type (manned guarding, patrols, mobile response, key holding, CCTV monitoring, dog unit, etc.)
- Start date, contract term
- Priority risks (trespass, theft, fly-tipping, arson, vandalism, H&S)
- **AI suggests** based on what it observes: "Given the open perimeter, I'd recommend mobile response coverage"

### Section 4: Access & Facilities
- Power, water, toilets, welfare cabin, parking, lighting
- Key access procedures
- **AI flags:** "Lighting looks inadequate in that corridor"

### Section 5: Additional Services
- Site clearance, boarding/fencing, cleaning, fit-out, alarm/CCTV, drone survey
- **AI recommends** based on observed conditions

### Section 6: Risk Assessment & Compliance
- Known hazards, lone working risk, vehicle access, induction requirements
- Fire assembly point, emergency contacts, insurance, compliance standards
- **AI cross-references** UK HSE, ISO 45001, HSWA 1974, Fire Safety Order 2005

### Section 7: Client Expectations
- Priorities, response times, reporting frequency, communication preferences, uniform branding

### Section 8: Site Handover & Next Steps
- Documentation provided (site plan, keys, RA, alarm code, access permit)
- Actions agreed, quote deadline, contract start date

### Section 9: Sign-Off
- Surveyor signature, client signature, date
- Digital signatures on device

---

## 5. AI Architecture

### Two-Model Pattern (Production)

| Role | Model | Purpose |
|------|-------|---------|
| **The Scout** | Gemini 2.5 Flash (Live API) | Real-time video analysis, proactive questioning, hazard detection |
| **The Analyst** | Gemini 2.5 Pro | Post-inspection deep analysis, compliance cross-referencing, report generation |

**Why this split:**
- Live API requires streaming-capable model (Flash)
- Report quality needs the strongest reasoning model (Pro)
- Cost-efficient: Flash is cheap for real-time, Pro only runs once per inspection

### AI Behaviour During Inspection
1. Surveyor opens app, starts new survey, enters site name
2. GPS auto-captures location, reverse geocodes address
3. Camera activates — AI Scout connects via Live API
4. Scout proactively guides through survey sections:
   - "Let's start with the perimeter. Can you show me the main entrance?"
   - "I can see CCTV cameras — looks like about 4 visible. Can you confirm?"
   - "That fencing looks moderate condition. Would you agree?"
5. Surveyor confirms/corrects verbally — hands-free operation
6. Scout tags findings with category, severity, location
7. When complete, session data hands off to the Analyst
8. Analyst generates the full CUKG-format survey report with compliance analysis

### AI Guardrails
- Scout has structured prompts per survey section — it doesn't freestyle
- Analyst output is validated against the template schema
- Human always confirms findings before they're final
- Report clearly marked as AI-assisted, requires inspector sign-off

---

## 6. Data & GDPR Strategy

### The Problem
Security surveys capture sensitive premises data — layouts, vulnerabilities, access points. Highly regulated environment.

### The Approach: Process Remotely, Store Locally

| Data | Where processed | Where stored | Retention |
|------|----------------|-------------|-----------|
| Live video stream | Gemini Live API (Google) | **NOT stored** — real-time only | None |
| AI findings/tags | Gemini API → Supabase | Supabase (encrypted) | Per retention policy |
| Final survey report | Generated server-side | Supabase + PDF export | Per client contract |
| Audio transcripts | Gemini Live API | Supabase (text only) | Per retention policy |
| Photos/snapshots | Captured on device | Supabase Storage (encrypted) | Per retention policy |

### Key GDPR Controls
- **No video storage** — stream processed in real-time, never persisted
- **Data Processing Agreement** with Google (Gemini API) required
- **Encryption at rest** — Supabase handles this
- **RLS enforced** — users see only their own data
- **Right to deletion** — admin can purge all data for a site/inspection
- **Data export** — full PDF + JSON export available
- **Audit trail** — who accessed what, when

### Future Option: Fully On-Device
If regulations tighten or clients demand it:
- Record video locally on device
- Process with on-device ML (smaller model)
- Upload only the structured survey data (no media)
- This is a v2 consideration, not v1

---

## 7. Tech Stack (Production)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | React Native + Expo | Cross-platform, camera/GPS/voice, Konrad's stack |
| **Web Dashboard** | Next.js | SSR, fast, same stack as CircleOverwatch |
| **Backend** | Supabase | Auth, Postgres, Storage, RLS, real-time |
| **AI (Real-time)** | Gemini 2.5 Flash Live API | Only option for live video streaming |
| **AI (Analysis)** | Gemini 2.5 Pro | Best reasoning for compliance reports |
| **PDF Generation** | Server-side (Edge Function or client) | Professional report output |
| **Auth** | Supabase Auth | Email/password + potential SSO for enterprise |
| **Hosting (Web)** | Vercel | Next.js native, fast deploys |
| **CI/CD** | GitHub Actions | Automated testing + builds |

---

## 8. Database Schema (Production)

Needs significant expansion from the hackathon schema. Key new tables:

```
-- Core
user_profiles          (existing, expand with role/company)
organisations          (CUKG + future multi-tenant)

-- Survey
surveys                (replaces inspection_sessions — full CUKG template)
survey_sections        (per-section data, maps to 9 CUKG sections)
survey_findings        (AI-detected issues with evidence)
survey_photos          (snapshots captured during survey)

-- Reports
survey_reports         (generated reports with compliance analysis)
report_templates       (customisable report formats)

-- Admin
sites                  (site registry — reusable across surveys)
team_members           (surveyor management)
audit_log              (GDPR compliance trail)
```

---

## 9. Branding

Aligned with Circle Overwatch:
- Same design language, colour palette, component library
- "Circle Eye" wordmark with eye icon
- Professional, clean, authority — this is a security company's tool
- Dark mode primary (field use in all conditions)

---

## 10. MVP Scope (v1)

### Must Have
- [ ] Mobile app: camera stream + AI Scout guided survey
- [ ] All 9 CUKG survey sections as structured forms
- [ ] AI proactive questioning during walkthrough
- [ ] Voice interaction (hands-free)
- [ ] GPS + auto address capture
- [ ] Finding tagging with photos
- [ ] AI Analyst post-survey report generation
- [ ] PDF export matching CUKG format
- [ ] Digital sign-off (surveyor + client)
- [ ] Auth + user management
- [ ] Web dashboard: view surveys + reports

### Nice to Have (v1.1)
- [ ] Offline mode (start survey without connection, sync later)
- [ ] Template customisation (not just CUKG format)
- [ ] Multi-language support
- [ ] Client portal (view their own survey reports)
- [ ] Analytics dashboard (surveys per week, common findings, etc.)

### Future (v2)
- [ ] On-device video processing option
- [ ] Integration with existing security management platforms
- [ ] Drone survey integration
- [ ] Historical site comparison (compare surveys over time)

---

## 11. Open Questions

1. **Gemini API key** — Do we have a production key, or still using the hackathon one?
2. **Branding assets** — Does CUKG have brand guidelines / logos we should use?
3. **User auth** — Email/password sufficient, or does CUKG want SSO?
4. **Multi-tenant** — Is this CUKG-only, or will it be offered to other security companies?
5. **Offline requirement** — How often are surveyors in areas with poor signal?
6. **Existing systems** — Does CUKG use any existing platform this needs to integrate with?

---

*This is the starting point. Ready to build.*
