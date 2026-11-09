import type { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  {
    id: "n-1",
    type: "connection_accepted",
    actorId: "f1",
    message: "Arjun Sharma accepted your connection request.",
    read: false,
    createdAt: "2026-10-25T11:25:00Z",
    link: "/profile/arjun_sharma",
  },
  {
    id: "n-2",
    type: "comment",
    actorId: "f5",
    targetId: "u1",
    message: "Vikram Rao commented on Arjun Sharma's journey update.",
    read: false,
    createdAt: "2026-10-25T08:14:00Z",
    link: "/updates/u1",
  },
  {
    id: "n-4",
    type: "connection_request",
    actorId: "f7",
    message: "Priya Nair wants to connect with you based on shared interests in Product & Fintech.",
    read: true,
    createdAt: "2026-10-23T19:30:00Z",
    link: "/profile/priya_nair",
  },
  {
    id: "n-5",
    type: "like",
    actorId: "f3",
    targetId: "u1",
    message: "Rahul Varma liked an update you saved.",
    read: true,
    createdAt: "2026-10-22T17:00:00Z",
    link: "/updates/u1",
  },
];
