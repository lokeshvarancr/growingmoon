# Test Credentials

No real accounts exist in preview: the FastAPI backend (NEXT_PUBLIC_API_URL, default http://localhost:8000) is NOT part of this repo, so login/register calls fail in preview.

## Preview auth bypass (frontend-only, uses existing cached-session logic)
Before navigating, set in localStorage:
- gm_user = {"id":"demo","name":"Arjun Demo","username":"you","avatar":"AD","avatarColor":"bg-[#ECE9FE] text-[#5546D6]","bio":"","role":"Builder","stage":"Building MVP","currentGoal":"","biggestChallenge":"","skillsOffered":[],"skillsNeeded":[],"interests":[],"location":"Bengaluru","joinedDate":"2025-01-01T00:00:00Z","connectionsCount":3,"isDemo":true}
- gm_access_token = preview-token

## Seeing post cards
Go to /settings -> click "Reset Demo Data to Initial State" (loads mock updates into memory), then client-navigate (window.next.router.push('/updates/u1') or u2/u3) — a full reload loses the in-memory demo data.
