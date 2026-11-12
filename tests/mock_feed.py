# Mock FeedPost payloads for intercepting the (broken) live /api/feed endpoints in Playwright
import json

IMG = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
IMG2 = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"


def media(i, t, o, url, thumb=None):
    return {"id": f"m{i}", "post_id": "p", "media_type": t, "orientation": o, "url": url,
            "thumbnail_url": thumb, "display_order": i, "created_at": "2026-01-01T00:00:00Z"}


def post(pid, headline, med, cat="building"):
    return {"id": pid, "author_id": "a_" + pid, "author": {"id": "a_" + pid, "username": "TEST_user_" + pid,
            "name": "TEST User " + pid, "avatar_initials": "TU", "role_title": "Builder"},
            "headline": headline, "journey_tag": "TEST journey", "content": "TEST content " * 30, "category": cat,
            "is_posted": True, "is_draft": False, "fuels_count": 0, "saves_count": 0, "comments_count": 0,
            "ask_1_answers_count": 0, "ask_2_answers_count": 0, "media_count": len(med), "media": med,
            "is_fueled_by_me": False, "is_saved_by_me": False,
            "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z"}


POSTS = [
    post("TEST_p1", "TEST text only", []),
    post("TEST_p2", "TEST single image", [media(0, "image", "landscape", IMG)]),
    post("TEST_p3", "TEST four images", [media(i, "image", "landscape", IMG if i % 2 else IMG2) for i in range(4)]),
    post("TEST_p4", "TEST yt video", [media(0, "video", "landscape", "https://www.youtube.com/watch?v=SqcY0GlETPk",
                                            "https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg")]),
    post("TEST_p5", "TEST six images", [media(i, "image", "portrait" if i == 0 else "landscape", IMG2 if i % 2 else IMG) for i in range(6)]),
]

BODY = json.dumps({"items": POSTS, "has_more": False, "next_cursor": None})
