import type { JourneyUpdate, Comment } from "@/types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const mockUpdates: JourneyUpdate[] = [
  {
    id: "u1",
    authorId: "f1",
    headline: "Day 3: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
      {
        id: "m_1_p",
        type: "video",
        orientation: "portrait",
        url: "https://m.youtube.com/shorts/o1lDglq4XiU?ra=m",
        thumbnail: "https://img.youtube.com/vi/o1lDglq4XiU/hqdefault.jpg",
        duration: "0:58",
        alt: "Field testing mobile interactions portrait short"
      }
    ],
    category: "Learning",
    createdAt: daysAgo(1),
    likes: ["f1","f2","f3","f4","f5","demo"],
    saves: ["demo","f4"],
    comments: [
          {
                "id": "c_1_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "2h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_1_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "4h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u2",
    authorId: "f2",
    headline: "Shipped version 0.2 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
      {
        id: "m_2_l",
        type: "video",
        orientation: "landscape",
        url: "https://m.youtube.com/watch?v=6BJF8SunNT4&pp=ygULdGFtaWwgc29uZ3M%3D&ra=m",
        thumbnail: "https://img.youtube.com/vi/6BJF8SunNT4/hqdefault.jpg",
        duration: "4:32",
        alt: "Tamil songs video session"
      }
    ],
    category: "Career",
    createdAt: daysAgo(2),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_2_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "3h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_2_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "5h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u3",
    authorId: "f3",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_3_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_3_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_3_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Building",
    createdAt: daysAgo(3),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","demo"],
    saves: ["demo","f8"],
    comments: [
          {
                "id": "c_3_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "4h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_3_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "6h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u4",
    authorId: "f4",
    headline: "80% intent signal from student interviews.",
    journeyTag: "EdTech journey",
    content: "Interviewed 10 NEET aspirants today. 8 said they would use adaptive question sets daily. 2 struggled with navigation. Clear signal to double down on conversational question flow.",
    media: [],
    category: "Building",
    createdAt: daysAgo(4),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_4_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "5h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_4_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "7h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u5",
    authorId: "f5",
    headline: "Next.js real-time app demo",
    journeyTag: "Startup journey",
    content: "Sharing a live walkthrough of our active feature branch. Watch how the real-time sync loop handles offline state transitions seamlessly.\n\nVideo link: https://www.youtube.com/watch?v=lDK9EQwdxmk",
    media: [
          {
                "id": "m_5_v",
                "type": "video",
                "orientation": "portrait",
                "url": "https://www.youtube.com/watch?v=lDK9EQwdxmk",
                "duration": "11:30",
                "thumbnail": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80",
                "alt": "Next.js real-time app demo"
          }
    ],
    category: "Building",
    createdAt: daysAgo(5),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f8"],
    comments: [
          {
                "id": "c_5_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "6h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_5_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "8h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u6",
    authorId: "f6",
    headline: "React in 100 Seconds breakdown",
    journeyTag: "Learning journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=SqcY0GlETPk",
    media: [
          {
                "id": "m_6_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=SqcY0GlETPk",
                "duration": "2:15",
                "thumbnail": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                "alt": "React in 100 Seconds breakdown"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(6),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_6_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "7h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_6_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "9h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u7",
    authorId: "f7",
    headline: "3.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 3.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_7_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_7_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_7_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_7_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(6),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f12"],
    comments: [
          {
                "id": "c_7_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "8h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_7_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "10h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u8",
    authorId: "f8",
    headline: "First 100 organic cotton shirts sold out.",
    journeyTag: "D2C journey",
    content: "Took 3 weeks mostly through WhatsApp referrals and Instagram DM orders. Cost per shirt ₹450, selling price ₹1,299. Now placing batch 2 order for 250 units.",
    media: [],
    category: "Building",
    createdAt: daysAgo(7),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_8_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "9h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_8_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "11h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u9",
    authorId: "f9",
    headline: "Day 27: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_9_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(8),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f12"],
    comments: [
          {
                "id": "c_9_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "10h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_9_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "12h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u10",
    authorId: "f10",
    headline: "Shipped version 1.0 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_10_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(9),
    likes: ["f1","f2","f3","f4","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_10_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "11h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_10_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "13h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u11",
    authorId: "f11",
    headline: "4.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 4.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_11_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_11_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_11_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_11_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_11_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          }
    ],
    category: "Career",
    createdAt: daysAgo(10),
    likes: ["f1","f2","f3","f4","f5","f6","f7","demo"],
    saves: ["demo","f3"],
    comments: [
          {
                "id": "c_11_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "12h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_11_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "14h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u12",
    authorId: "f12",
    headline: "Rethinking product after deep user interview.",
    journeyTag: "Mental Health journey",
    content: "A second-year engineering student broke down crying while describing exam pressure. Users do not need another complex dashboard—they need quiet guided listening.",
    media: [],
    category: "Creativity",
    createdAt: daysAgo(11),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_12_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "13h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_12_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "15h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u13",
    authorId: "demo",
    headline: "Day 39: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_13_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Career",
    createdAt: daysAgo(12),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f3"],
    comments: [
          {
                "id": "c_13_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "14h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_13_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "16h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u14",
    authorId: "f1",
    headline: "Shipped version 1.4 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_14_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Building",
    createdAt: daysAgo(12),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_14_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "15h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_14_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "17h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u15",
    authorId: "f2",
    headline: "5.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 5.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_15_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_15_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_15_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_15_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_15_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          },
          {
                "id": "m_15_6",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 5"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(13),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f7"],
    comments: [
          {
                "id": "c_15_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "16h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_15_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "18h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u16",
    authorId: "f3",
    headline: "My weekend side project became paying SaaS.",
    journeyTag: "SaaS journey",
    content: "What started as an internal client script now has 12 paying users paying ₹999/month. They discovered it on Reddit without any ad spend. Now considering going full time.",
    media: [],
    category: "Building",
    createdAt: daysAgo(14),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_16_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "17h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_16_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "19h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u17",
    authorId: "f4",
    headline: "Day 51: Field testing mobile interactions.",
    journeyTag: "Design journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_17_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(15),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f7"],
    comments: [
          {
                "id": "c_17_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "18h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_17_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "20h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u18",
    authorId: "f5",
    headline: "Neural networks intuition for non-engineers",
    journeyTag: "EdTech journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=aircAruvnKk",
    media: [
          {
                "id": "m_18_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "duration": "19:12",
                "thumbnail": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
                "alt": "Neural networks intuition for non-engineers"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(16),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_18_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "19h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_18_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "21h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u19",
    authorId: "f6",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_19_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_19_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_19_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(17),
    likes: ["f1","f2","f3","demo"],
    saves: ["demo","f11"],
    comments: [
          {
                "id": "c_19_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "20h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_19_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "22h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u20",
    authorId: "f7",
    headline: "Turned down seed term sheet today.",
    journeyTag: "Founder journey",
    content: "A seed fund offered ₹1.5 Crore at ₹9 Crore valuation. We turned it down because institutional expectations would force premature enterprise scaling before organic product love.",
    media: [],
    category: "Career",
    createdAt: daysAgo(18),
    likes: ["f1","f2","f3","f4","f5","f6","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_20_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "21h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_20_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "23h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u21",
    authorId: "f8",
    headline: "Day 63: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_21_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(18),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","demo"],
    saves: ["demo","f11"],
    comments: [
          {
                "id": "c_21_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "22h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_21_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "24h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u22",
    authorId: "f9",
    headline: "Shipped version 2.2 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_22_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Career",
    createdAt: daysAgo(19),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_22_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "23h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_22_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "25h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u23",
    authorId: "f10",
    headline: "3.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 3.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_23_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_23_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_23_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_23_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          }
    ],
    category: "Building",
    createdAt: daysAgo(20),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f2"],
    comments: [
          {
                "id": "c_23_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "24h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_23_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "26h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u24",
    authorId: "f11",
    headline: "Building in public saved our runway.",
    journeyTag: "Startup journey",
    content: "When we built in stealth for 9 months, nobody cared. Tweeting weekly bug fixes and metrics earned us early beta champions before the product even had a landing page.",
    media: [],
    category: "Building",
    createdAt: daysAgo(21),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_24_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "1h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_24_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "3h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u25",
    authorId: "f12",
    headline: "How to build early customer traction",
    journeyTag: "Startup journey",
    content: "Sharing a live walkthrough of our active feature branch. Watch how the real-time sync loop handles offline state transitions seamlessly.\n\nVideo link: https://www.youtube.com/watch?v=V-_O7nl0Ii0",
    media: [
          {
                "id": "m_25_v",
                "type": "video",
                "orientation": "portrait",
                "url": "https://www.youtube.com/watch?v=V-_O7nl0Ii0",
                "duration": "18:40",
                "thumbnail": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
                "alt": "How to build early customer traction"
          }
    ],
    category: "Building",
    createdAt: daysAgo(22),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f2"],
    comments: [
          {
                "id": "c_25_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "2h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_25_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "4h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u26",
    authorId: "demo",
    headline: "Shipped version 2.6 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_26_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(23),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_26_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "3h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_26_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "5h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u27",
    authorId: "f1",
    headline: "4.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 4.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_27_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_27_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_27_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_27_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_27_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(23),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f6"],
    comments: [
          {
                "id": "c_27_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "4h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_27_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "6h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u28",
    authorId: "f2",
    headline: "Cut menu from 15 items to 6.",
    journeyTag: "FoodTech journey",
    content: "Kitchen throughput doubled overnight and kitchen prep errors dropped to zero. Fewer options equals faster execution and substantially happier recurring diners.",
    media: [],
    category: "Building",
    createdAt: daysAgo(24),
    likes: ["f1","f2","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_28_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "5h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_28_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "7h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u29",
    authorId: "f3",
    headline: "Day 87: Field testing mobile interactions.",
    journeyTag: "Design journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_29_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(25),
    likes: ["f1","f2","f3","f4","f5","demo"],
    saves: ["demo","f6"],
    comments: [
          {
                "id": "c_29_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "6h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_29_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "8h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u30",
    authorId: "f4",
    headline: "React in 100 Seconds breakdown",
    journeyTag: "Learning journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=SqcY0GlETPk",
    media: [
          {
                "id": "m_30_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=SqcY0GlETPk",
                "duration": "2:15",
                "thumbnail": "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
                "alt": "React in 100 Seconds breakdown"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(26),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_30_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "7h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_30_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "9h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u31",
    authorId: "f5",
    headline: "5.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 5.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_31_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_31_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_31_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_31_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_31_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          },
          {
                "id": "m_31_6",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 5"
          }
    ],
    category: "Career",
    createdAt: daysAgo(27),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","demo"],
    saves: ["demo","f10"],
    comments: [
          {
                "id": "c_31_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "8h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_31_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "10h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u32",
    authorId: "f6",
    headline: "Lessons from 60 consecutive morning workouts.",
    journeyTag: "Fitness journey",
    content: "4 sessions weekly without missing a day in 6 weeks. Physical discipline transferred directly to coding persistence: just show up and run the routine.",
    media: [],
    category: "Lifestyle",
    createdAt: daysAgo(28),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_32_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "9h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_32_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "11h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u33",
    authorId: "f7",
    headline: "Day 99: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_33_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Career",
    createdAt: daysAgo(29),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f10"],
    comments: [
          {
                "id": "c_33_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "10h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_33_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "12h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u34",
    authorId: "f8",
    headline: "Shipped version 3.4 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_34_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Building",
    createdAt: daysAgo(29),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_34_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "11h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_34_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "13h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u35",
    authorId: "f9",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_35_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_35_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_35_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(30),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f1"],
    comments: [
          {
                "id": "c_35_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "12h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_35_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "14h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u36",
    authorId: "f10",
    headline: "Found our first paying beta customer.",
    journeyTag: "SaaS journey",
    content: "Closed our first ₹15,000 yearly contract with an logistics agency in Chennai. They loved the automatic reconciliation export feature we built last weekend.",
    media: [],
    category: "Building",
    createdAt: daysAgo(31),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_36_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "13h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_36_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "15h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u37",
    authorId: "f11",
    headline: "Day 111: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_37_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(32),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f1"],
    comments: [
          {
                "id": "c_37_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "14h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_37_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "16h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u38",
    authorId: "f12",
    headline: "Shipped version 3.8 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_38_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(33),
    likes: ["f1","f2","f3","f4","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_38_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "15h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_38_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "17h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u39",
    authorId: "demo",
    headline: "3.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 3.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_39_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_39_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_39_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_39_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(34),
    likes: ["f1","f2","f3","f4","f5","f6","f7","demo"],
    saves: ["demo","f5"],
    comments: [
          {
                "id": "c_39_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "16h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_39_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "18h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u40",
    authorId: "f1",
    headline: "Replaced custom Redux with Zustand stores.",
    journeyTag: "Engineering journey",
    content: "Deleted 1,200 lines of boilerplate reducers and action creators. Bundle size shrank by 14KB and junior engineers immediately understood the global state tree.",
    media: [],
    category: "Learning",
    createdAt: daysAgo(35),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_40_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "17h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_40_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "19h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u41",
    authorId: "f2",
    headline: "Day 123: Field testing mobile interactions.",
    journeyTag: "Design journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_41_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(35),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f5"],
    comments: [
          {
                "id": "c_41_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "18h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_41_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "20h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u42",
    authorId: "f3",
    headline: "Neural networks intuition for non-engineers",
    journeyTag: "EdTech journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=aircAruvnKk",
    media: [
          {
                "id": "m_42_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "duration": "19:12",
                "thumbnail": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Neural networks intuition for non-engineers"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(36),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_42_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "19h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_42_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "21h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u43",
    authorId: "f4",
    headline: "4.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 4.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_43_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_43_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_43_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_43_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_43_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          }
    ],
    category: "Building",
    createdAt: daysAgo(37),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f9"],
    comments: [
          {
                "id": "c_43_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "20h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_43_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "22h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u44",
    authorId: "f5",
    headline: "How we landed 500 waitlist signups.",
    journeyTag: "Growth journey",
    content: "Wrote an honest breakdown of Indian compliance hurdles on LinkedIn. Zero ad budget, over 120 reposts, and 500 organic founder email signups in 48 hours.",
    media: [],
    category: "Building",
    createdAt: daysAgo(38),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_44_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "21h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_44_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "23h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u45",
    authorId: "f6",
    headline: "Next.js real-time app demo",
    journeyTag: "Startup journey",
    content: "Sharing a live walkthrough of our active feature branch. Watch how the real-time sync loop handles offline state transitions seamlessly.\n\nVideo link: https://www.youtube.com/watch?v=lDK9EQwdxmk",
    media: [
          {
                "id": "m_45_v",
                "type": "video",
                "orientation": "portrait",
                "url": "https://www.youtube.com/watch?v=lDK9EQwdxmk",
                "duration": "11:30",
                "thumbnail": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
                "alt": "Next.js real-time app demo"
          }
    ],
    category: "Building",
    createdAt: daysAgo(39),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f9"],
    comments: [
          {
                "id": "c_45_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "22h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_45_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "24h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u46",
    authorId: "f7",
    headline: "Shipped version 4.6 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_46_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(40),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_46_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "23h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_46_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "25h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u47",
    authorId: "f8",
    headline: "5.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 5.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_47_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_47_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_47_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_47_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_47_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          },
          {
                "id": "m_47_6",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 5"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(40),
    likes: ["f1","f2","f3","demo"],
    saves: ["demo","demo"],
    comments: [
          {
                "id": "c_47_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "24h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_47_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "26h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u48",
    authorId: "f9",
    headline: "Transitioning from operations to product design.",
    journeyTag: "Career journey",
    content: "Spent 4 years in logistics operations before touching Figma. Understanding how real warehousing workers interact with rugged tablets gave my UI case study an edge.",
    media: [],
    category: "Career",
    createdAt: daysAgo(41),
    likes: ["f1","f2","f3","f4","f5","f6","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_48_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "1h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_48_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "3h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u49",
    authorId: "f10",
    headline: "Day 147: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_49_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(42),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","demo"],
    saves: ["demo","demo"],
    comments: [
          {
                "id": "c_49_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "2h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_49_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "4h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u50",
    authorId: "f11",
    headline: "Shipped version 5.0 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_50_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(43),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_50_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "3h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_50_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "5h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u51",
    authorId: "f12",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_51_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_51_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_51_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Career",
    createdAt: daysAgo(44),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f4"],
    comments: [
          {
                "id": "c_51_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "4h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_51_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "6h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u52",
    authorId: "demo",
    headline: "Why we killed our mobile app.",
    journeyTag: "Product journey",
    content: "85% of our traffic was desktop web. Maintaining separate React Native builds burned 40% of sprint capacity. Shipped a PWA and shipping velocity doubled.",
    media: [],
    category: "Building",
    createdAt: daysAgo(45),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_52_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "5h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_52_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "7h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u53",
    authorId: "f1",
    headline: "Day 159: Field testing mobile interactions.",
    journeyTag: "Design journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_53_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Career",
    createdAt: daysAgo(46),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f4"],
    comments: [
          {
                "id": "c_53_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "6h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_53_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "8h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u54",
    authorId: "f2",
    headline: "React in 100 Seconds breakdown",
    journeyTag: "Learning journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=SqcY0GlETPk",
    media: [
          {
                "id": "m_54_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=SqcY0GlETPk",
                "duration": "2:15",
                "thumbnail": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
                "alt": "React in 100 Seconds breakdown"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(46),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_54_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "7h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_54_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "9h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u55",
    authorId: "f3",
    headline: "3.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 3.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_55_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_55_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_55_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_55_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(47),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f8"],
    comments: [
          {
                "id": "c_55_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "8h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_55_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "10h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u56",
    authorId: "f4",
    headline: "Bootstrapping taught us extreme pricing discipline.",
    journeyTag: "SaaS journey",
    content: "VC funded competitors offer free tiers forever. We charged ₹499 from day one. Paying users give 10x more actionable bug reports than free plan hobbyists.",
    media: [],
    category: "Building",
    createdAt: daysAgo(48),
    likes: ["f1","f2","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_56_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "9h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_56_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "11h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u57",
    authorId: "f5",
    headline: "Day 171: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_57_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(49),
    likes: ["f1","f2","f3","f4","f5","demo"],
    saves: ["demo","f8"],
    comments: [
          {
                "id": "c_57_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "10h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_57_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "12h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u58",
    authorId: "f6",
    headline: "Shipped version 5.8 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_58_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(50),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_58_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "11h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_58_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "13h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u59",
    authorId: "f7",
    headline: "4.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 4.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_59_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_59_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_59_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_59_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_59_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(51),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","demo"],
    saves: ["demo","f12"],
    comments: [
          {
                "id": "c_59_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "12h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_59_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "14h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u60",
    authorId: "f8",
    headline: "Overcoming imposter syndrome as solo founder.",
    journeyTag: "Mindset journey",
    content: "Every morning starts with wondering if anyone will actually pay for this. The antidote is not motivational quotes—it is shipping one small user fix daily.",
    media: [],
    category: "Lifestyle",
    createdAt: daysAgo(52),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_60_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "13h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_60_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "15h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u61",
    authorId: "f9",
    headline: "Day 183: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_61_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(52),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f12"],
    comments: [
          {
                "id": "c_61_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "14h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_61_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "16h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u62",
    authorId: "f10",
    headline: "Shipped version 6.2 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_62_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Career",
    createdAt: daysAgo(53),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_62_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "15h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_62_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "17h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u63",
    authorId: "f11",
    headline: "5.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 5.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_63_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_63_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_63_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_63_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_63_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          },
          {
                "id": "m_63_6",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 5"
          }
    ],
    category: "Building",
    createdAt: daysAgo(54),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f3"],
    comments: [
          {
                "id": "c_63_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "16h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_63_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "18h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u64",
    authorId: "f12",
    headline: "Switched database from MongoDB to Postgres.",
    journeyTag: "Engineering journey",
    content: "Relational foreign keys and clean ACID transactions eliminated 90% of our synchronization edge cases. SQL queries are easier to optimize at scale.",
    media: [],
    category: "Learning",
    createdAt: daysAgo(55),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_64_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "17h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_64_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "19h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u65",
    authorId: "demo",
    headline: "How to build early customer traction",
    journeyTag: "Startup journey",
    content: "Sharing a live walkthrough of our active feature branch. Watch how the real-time sync loop handles offline state transitions seamlessly.\n\nVideo link: https://www.youtube.com/watch?v=V-_O7nl0Ii0",
    media: [
          {
                "id": "m_65_v",
                "type": "video",
                "orientation": "portrait",
                "url": "https://www.youtube.com/watch?v=V-_O7nl0Ii0",
                "duration": "18:40",
                "thumbnail": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
                "alt": "How to build early customer traction"
          }
    ],
    category: "Building",
    createdAt: daysAgo(56),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f3"],
    comments: [
          {
                "id": "c_65_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "18h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_65_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "20h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u66",
    authorId: "f1",
    headline: "Neural networks intuition for non-engineers",
    journeyTag: "EdTech journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=aircAruvnKk",
    media: [
          {
                "id": "m_66_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "duration": "19:12",
                "thumbnail": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                "alt": "Neural networks intuition for non-engineers"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(57),
    likes: ["f1","f2","f3","f4","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_66_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "19h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_66_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "21h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u67",
    authorId: "f2",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_67_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_67_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_67_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(57),
    likes: ["f1","f2","f3","f4","f5","f6","f7","demo"],
    saves: ["demo","f7"],
    comments: [
          {
                "id": "c_67_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "20h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_67_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "22h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u68",
    authorId: "f3",
    headline: "First podcast interview about building tools.",
    journeyTag: "Creator journey",
    content: "Spent 45 minutes discussing why early stage founders need journey documentation rather than vanity metrics. Recording drops on Spotify this Friday.",
    media: [],
    category: "Creativity",
    createdAt: daysAgo(58),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_68_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "21h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_68_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "23h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u69",
    authorId: "f4",
    headline: "Day 207: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_69_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(59),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f7"],
    comments: [
          {
                "id": "c_69_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "22h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_69_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "24h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u70",
    authorId: "f5",
    headline: "Shipped version 7.0 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_70_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(60),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_70_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "23h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_70_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "25h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u71",
    authorId: "f6",
    headline: "3.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 3.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_71_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_71_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_71_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_71_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          }
    ],
    category: "Career",
    createdAt: daysAgo(61),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f11"],
    comments: [
          {
                "id": "c_71_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "24h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_71_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "26h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u72",
    authorId: "f7",
    headline: "Our customer churn dropped to 2%.",
    journeyTag: "SaaS journey",
    content: "Added a simple 3-minute onboarding phone call for every new business account. Proactive human touch in the first 48 hours is worth 10 automated email sequences.",
    media: [],
    category: "Building",
    createdAt: daysAgo(62),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_72_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "1h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_72_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "3h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u73",
    authorId: "f8",
    headline: "Day 219: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_73_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Career",
    createdAt: daysAgo(63),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f11"],
    comments: [
          {
                "id": "c_73_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "2h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_73_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "4h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u74",
    authorId: "f9",
    headline: "Shipped version 7.4 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_74_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Building",
    createdAt: daysAgo(63),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_74_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "3h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_74_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "5h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u75",
    authorId: "f10",
    headline: "4.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 4.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_75_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_75_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_75_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_75_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_75_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(64),
    likes: ["f1","f2","f3","demo"],
    saves: ["demo","f2"],
    comments: [
          {
                "id": "c_75_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "4h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_75_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "6h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u76",
    authorId: "f11",
    headline: "Completed 30 days of daily journaling.",
    journeyTag: "Reflection journey",
    content: "Writing 200 words every evening cleared brain fog and helped trace which decisions actually moved company revenue versus busywork.",
    media: [],
    category: "Lifestyle",
    createdAt: daysAgo(65),
    likes: ["f1","f2","f3","f4","f5","f6","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_76_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "5h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_76_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "7h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u77",
    authorId: "f12",
    headline: "Day 231: Field testing mobile interactions.",
    journeyTag: "Design journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_77_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(66),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","demo"],
    saves: ["demo","f2"],
    comments: [
          {
                "id": "c_77_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "6h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_77_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "8h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u78",
    authorId: "demo",
    headline: "React in 100 Seconds breakdown",
    journeyTag: "Learning journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=SqcY0GlETPk",
    media: [
          {
                "id": "m_78_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=SqcY0GlETPk",
                "duration": "2:15",
                "thumbnail": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
                "alt": "React in 100 Seconds breakdown"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(67),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_78_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "7h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_78_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "9h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u79",
    authorId: "f1",
    headline: "5.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 5.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_79_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_79_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_79_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_79_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_79_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          },
          {
                "id": "m_79_6",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 5"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(68),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f6"],
    comments: [
          {
                "id": "c_79_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "8h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_79_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "10h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u80",
    authorId: "f2",
    headline: "Why early customer feedback hurts so good.",
    journeyTag: "Startup journey",
    content: "A user spent 20 minutes brutally tearing apart our checkout page. It hurt my pride, but fixing those 4 issues tripled our conversion rate.",
    media: [],
    category: "Building",
    createdAt: daysAgo(69),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_80_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "9h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_80_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "11h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u81",
    authorId: "f3",
    headline: "Day 243: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_81_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(69),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f6"],
    comments: [
          {
                "id": "c_81_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "10h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_81_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "12h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u82",
    authorId: "f4",
    headline: "Shipped version 8.2 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_82_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Career",
    createdAt: daysAgo(70),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_82_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "11h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_82_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "13h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u83",
    authorId: "f5",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_83_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_83_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_83_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Building",
    createdAt: daysAgo(71),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f10"],
    comments: [
          {
                "id": "c_83_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "12h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_83_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "14h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u84",
    authorId: "f6",
    headline: "Shipped automated WhatsApp notification engine.",
    journeyTag: "AgriTech journey",
    content: "Farmers do not check email dashboards. Sending harvest readiness alerts directly to WhatsApp groups boosted buyer pickup compliance by 74%.",
    media: [],
    category: "Building",
    createdAt: daysAgo(72),
    likes: ["f1","f2","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_84_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "13h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_84_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "15h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u85",
    authorId: "f7",
    headline: "Next.js real-time app demo",
    journeyTag: "Startup journey",
    content: "Sharing a live walkthrough of our active feature branch. Watch how the real-time sync loop handles offline state transitions seamlessly.\n\nVideo link: https://www.youtube.com/watch?v=lDK9EQwdxmk",
    media: [
          {
                "id": "m_85_v",
                "type": "video",
                "orientation": "portrait",
                "url": "https://www.youtube.com/watch?v=lDK9EQwdxmk",
                "duration": "11:30",
                "thumbnail": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
                "alt": "Next.js real-time app demo"
          }
    ],
    category: "Building",
    createdAt: daysAgo(73),
    likes: ["f1","f2","f3","f4","f5","demo"],
    saves: ["demo","f10"],
    comments: [
          {
                "id": "c_85_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "14h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_85_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "16h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u86",
    authorId: "f8",
    headline: "Shipped version 8.6 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_86_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(74),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_86_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "15h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_86_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "17h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u87",
    authorId: "f9",
    headline: "3.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 3.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_87_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_87_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_87_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_87_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(74),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","demo"],
    saves: ["demo","f1"],
    comments: [
          {
                "id": "c_87_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "16h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_87_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "18h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u88",
    authorId: "f10",
    headline: "My cold outreach response rate hit 35%.",
    journeyTag: "Sales journey",
    content: "Stopped sending generic templates. Instead, recorded 60-second Loom audits pointing out specific broken forms on prospect landing pages.",
    media: [],
    category: "Career",
    createdAt: daysAgo(75),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_88_1",
                "authorId": "f12",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "17h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_88_2",
                "authorId": "f1",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "19h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u89",
    authorId: "f11",
    headline: "Day 267: Field testing mobile interactions.",
    journeyTag: "Design journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_89_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(76),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f1"],
    comments: [
          {
                "id": "c_89_1",
                "authorId": "demo",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "18h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_89_2",
                "authorId": "f2",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "20h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u90",
    authorId: "f12",
    headline: "Neural networks intuition for non-engineers",
    journeyTag: "EdTech journey",
    content: "Recorded an in-depth video walkthrough demonstrating our system architecture and deployment flow.\n\nWatch full demo on YouTube: https://www.youtube.com/watch?v=aircAruvnKk",
    media: [
          {
                "id": "m_90_yt",
                "type": "video",
                "orientation": "landscape",
                "url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "duration": "19:12",
                "thumbnail": "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Neural networks intuition for non-engineers"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(77),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_90_1",
                "authorId": "f1",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "19h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_90_2",
                "authorId": "f3",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "21h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u91",
    authorId: "demo",
    headline: "4.75 stages of our product iteration journey.",
    journeyTag: "EdTech journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 4.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_91_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_91_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_91_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_91_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_91_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          }
    ],
    category: "Career",
    createdAt: daysAgo(78),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f5"],
    comments: [
          {
                "id": "c_91_1",
                "authorId": "f2",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "20h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_91_2",
                "authorId": "f4",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "22h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u92",
    authorId: "f1",
    headline: "Reflections after 6 months of freelancing.",
    journeyTag: "Career journey",
    content: "Freedom is incredible, but taxes and cash flow management require iron discipline. Keep 6 months of runway in an emergency liquid fund.",
    media: [],
    category: "Career",
    createdAt: daysAgo(79),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_92_1",
                "authorId": "f3",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "21h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_92_2",
                "authorId": "f5",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "23h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u93",
    authorId: "f2",
    headline: "Day 279: Field testing mobile interactions.",
    journeyTag: "EdTech journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_93_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Career",
    createdAt: daysAgo(80),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f5"],
    comments: [
          {
                "id": "c_93_1",
                "authorId": "f4",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "22h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_93_2",
                "authorId": "f6",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "24h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u94",
    authorId: "f3",
    headline: "Shipped version 9.4 to our beta testers.",
    journeyTag: "D2C journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_94_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Building",
    createdAt: daysAgo(80),
    likes: ["f1","f2","f3","f4","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_94_1",
                "authorId": "f5",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "23h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_94_2",
                "authorId": "f7",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "25h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u95",
    authorId: "f4",
    headline: "5.75 stages of our product iteration journey.",
    journeyTag: "Career journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 5.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_95_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_95_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_95_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          },
          {
                "id": "m_95_4",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 3"
          },
          {
                "id": "m_95_5",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 4"
          },
          {
                "id": "m_95_6",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 5"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(81),
    likes: ["f1","f2","f3","f4","f5","f6","f7","demo"],
    saves: ["demo","f9"],
    comments: [
          {
                "id": "c_95_1",
                "authorId": "f6",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "24h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_95_2",
                "authorId": "f8",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "26h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u96",
    authorId: "f5",
    headline: "Why simple tools beat complex suites.",
    journeyTag: "Design journey",
    content: "Users do not want 50 settings menus. They want one big primary button that reliably does the one job they hired your app for.",
    media: [],
    category: "Creativity",
    createdAt: daysAgo(82),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_96_1",
                "authorId": "f7",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "1h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_96_2",
                "authorId": "f9",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "3h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u97",
    authorId: "f6",
    headline: "Day 291: Field testing mobile interactions.",
    journeyTag: "Career journey",
    content: "Observed 5 users navigating our mobile screen in person. Tap targets need to be at least 48px to prevent accidental dismissals under bright sunlight.\n\nKey takeaways:\n1. Keep primary actions within thumb radius\n2. Avoid nested hamburger menus\n3. Show immediate optimistic UI state updates.",
    media: [
          {
                "id": "m_97_p",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
                "alt": "Portrait milestone snapshot"
          }
    ],
    category: "Creativity",
    createdAt: daysAgo(83),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","f9"],
    comments: [
          {
                "id": "c_97_1",
                "authorId": "f8",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "2h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_97_2",
                "authorId": "f10",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "4h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u98",
    authorId: "f7",
    headline: "Shipped version 9.8 to our beta testers.",
    journeyTag: "Coffee journey",
    content: "Deployed the update at midnight. Our average API latency dropped from 240ms to 48ms after migrating our caching layer to edge regions.\n\nNext sprint focus is improving our checkout step conversion rate and refining automated email receipts.",
    media: [
          {
                "id": "m_98_l",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
                "alt": "Landscape progress overview"
          }
    ],
    category: "Lifestyle",
    createdAt: daysAgo(84),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_98_1",
                "authorId": "f9",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "3h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_98_2",
                "authorId": "f11",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "5h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u99",
    authorId: "f8",
    headline: "2.75 stages of our product iteration journey.",
    journeyTag: "Design journey",
    content: "Documenting every step from raw sketches to physical packaging. Seeing the progression across 2.75 snapshots reminds us how far we have come.\n\nSwipe through to see our component teardown, soldering bench, and final assembly test.",
    media: [
          {
                "id": "m_99_1",
                "type": "image",
                "orientation": "portrait",
                "url": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
                "alt": "Hero visual progression"
          },
          {
                "id": "m_99_2",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 1"
          },
          {
                "id": "m_99_3",
                "type": "image",
                "orientation": "landscape",
                "url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Detail photo 2"
          }
    ],
    category: "Learning",
    createdAt: daysAgo(85),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo","demo"],
    comments: [
          {
                "id": "c_99_1",
                "authorId": "f10",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "4h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_99_2",
                "authorId": "f12",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "6h ago",
                "likes": []
          }
    ],
  },
  {
    id: "u100",
    authorId: "f9",
    headline: "Revenue dropped 40% this month.",
    journeyTag: "Career journey",
    content: "Lost our biggest retainer client because they brought the role in-house. Relying on 3 clients for 80% revenue was a classic mistake. Now moving to productized services with fixed retainers.",
    media: [],
    category: "Career",
    createdAt: daysAgo(86),
    likes: ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","demo"],
    saves: ["demo"],
    comments: [
          {
                "id": "c_100_1",
                "authorId": "f11",
                "content": "Inspiring progress! The iteration speed on this is incredible.",
                "createdAt": "5h ago",
                "likes": [
                      "f1"
                ]
          },
          {
                "id": "c_100_2",
                "authorId": "demo",
                "content": "Loved this breakdown. Rooting for you all the way!",
                "createdAt": "7h ago",
                "likes": []
          }
    ],
  },
];

export function getUpdateById(id: string): JourneyUpdate | undefined {
  return mockUpdates.find((u) => u.id === id);
}

export function getUpdatesByAuthor(authorId: string): JourneyUpdate[] {
  return mockUpdates.filter((u) => u.authorId === authorId);
}
