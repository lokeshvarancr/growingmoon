import type { Conversation, Message } from "@/types";

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participantIds: ["demo", "f1"],
    updatedAt: "2026-10-25T11:30:00Z",
    unreadCount: 1,
    lastMessage: {
      id: "m-1-4",
      conversationId: "conv-1",
      senderId: "f1",
      content: "Here's the cold email template that got me 3 paying clients! Problem → quantified loss → 15-min chat CTA.",
      createdAt: "2026-10-25T11:30:00Z",
      read: false,
    },
  },
  {
    id: "conv-2",
    participantIds: ["demo", "f2"],
    updatedAt: "2026-10-24T16:45:00Z",
    unreadCount: 0,
    lastMessage: {
      id: "m-2-3",
      conversationId: "conv-2",
      senderId: "demo",
      content: "Sent over my thoughts on your fintech case study. The KYC drop-off framing is super compelling!",
      createdAt: "2026-10-24T16:45:00Z",
      read: true,
    },
  },
  {
    id: "conv-3",
    participantIds: ["demo", "f3"],
    updatedAt: "2026-10-23T09:10:00Z",
    unreadCount: 0,
    lastMessage: {
      id: "m-3-2",
      conversationId: "conv-3",
      senderId: "f3",
      content: "Would love to test your fitness MVP build whenever the testflight or APK is ready.",
      createdAt: "2026-10-23T09:10:00Z",
      read: true,
    },
  },
];

export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "m-1-1",
      conversationId: "conv-1",
      senderId: "demo",
      content: "Hey Arjun! Loved your update about reaching ₹42K MRR. Huge congratulations.",
      createdAt: "2026-10-25T10:00:00Z",
      read: true,
    },
    {
      id: "m-1-2",
      conversationId: "conv-1",
      senderId: "f1",
      content: "Thanks a lot! It felt impossible 3 months ago, honestly. Are you still working on your fitness-tech product?",
      createdAt: "2026-10-25T10:15:00Z",
      read: true,
    },
    {
      id: "m-1-3",
      conversationId: "conv-1",
      senderId: "demo",
      content: "Yes! Wrapping up the MVP right now. Struggling a bit with how to reach early gym trainers for discovery calls.",
      createdAt: "2026-10-25T10:45:00Z",
      read: true,
    },
    {
      id: "m-1-4",
      conversationId: "conv-1",
      senderId: "f1",
      content: "Here's the cold email template that got me 3 paying clients! Problem → quantified loss → 15-min chat CTA.",
      createdAt: "2026-10-25T11:30:00Z",
      read: false,
    },
  ],
  "conv-2": [
    {
      id: "m-2-1",
      conversationId: "conv-2",
      senderId: "f2",
      content: "Hey! Saw your journey passport. I'm also preparing to interview at startups. Mind reviewing my case study draft?",
      createdAt: "2026-10-24T14:00:00Z",
      read: true,
    },
    {
      id: "m-2-2",
      conversationId: "conv-2",
      senderId: "f2",
      content: "Here is the Notion link: https://notion.so/meera/fintech-teardown",
      createdAt: "2026-10-24T14:02:00Z",
      read: true,
    },
    {
      id: "m-2-3",
      conversationId: "conv-2",
      senderId: "demo",
      content: "Sent over my thoughts on your fintech case study. The KYC drop-off framing is super compelling!",
      createdAt: "2026-10-24T16:45:00Z",
      read: true,
    },
  ],
  "conv-3": [
    {
      id: "m-3-1",
      conversationId: "conv-3",
      senderId: "demo",
      content: "Hey Rahul, noticed we're both building in health & fitness. Let's exchange notes sometime!",
      createdAt: "2026-10-23T08:30:00Z",
      read: true,
    },
    {
      id: "m-3-2",
      conversationId: "conv-3",
      senderId: "f3",
      content: "Would love to test your fitness MVP build whenever the testflight or APK is ready.",
      createdAt: "2026-10-23T09:10:00Z",
      read: true,
    },
  ],
};

export function getConversationById(id: string): Conversation | undefined {
  return mockConversations.find((c) => c.id === id);
}

export function getMessagesByConversation(id: string): Message[] {
  return mockMessages[id] || [];
}
