import type { JourneyPassport, Milestone } from "@/types";

export const mockMilestones: Milestone[] = [
  // Arjun Sharma (f1)
  {
    id: "m1-1",
    founderId: "f1",
    title: "Quit backend dev job",
    description: "Walked away from ₹18LPA package to build a B2B SaaS full-time with 6 months runway.",
    date: "2026-03-01T00:00:00Z",
    status: "completed",
    isSelfReported: true,
  },
  {
    id: "m1-2",
    founderId: "f1",
    title: "Built MVP v1.0",
    description: "Completed compliance automation engine after 40 days of nonstop coding. Buggy but functional.",
    date: "2026-04-12T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "link", url: "https://github.com/arjun/compliance-core", label: "v1.0 GitHub Release" }],
  },
  {
    id: "m1-3",
    founderId: "f1",
    title: "First paying customer (₹3,000/mo)",
    description: "Signed a boutique accounting firm in Koramangala after 30 in-person meetings.",
    date: "2026-06-15T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "image", url: "/proof/invoice-1.png", label: "First Stripe Receipt" }],
  },
  {
    id: "m1-4",
    founderId: "f1",
    title: "Reached ₹42K MRR",
    description: "Scaled to 3 annual clients via cold outreach and referrals. Churn rate currently 0%.",
    date: "2026-09-20T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "image", url: "/proof/stripe-mrr.png", label: "Stripe Verified MRR" }],
  },
  {
    id: "m1-5",
    founderId: "f1",
    title: "Reach ₹1,00,000 Monthly Revenue",
    description: "Onboard 4 enterprise clients on annual contracts and hire first customer support intern.",
    date: "2026-12-31T00:00:00Z",
    status: "in-progress",
    isSelfReported: true,
  },

  // Meera Pillai (f2)
  {
    id: "m2-1",
    founderId: "f2",
    title: "Started Product Transition",
    description: "Enrolled in Reforge & started studying consumer tech product tear-downs every evening.",
    date: "2026-05-01T00:00:00Z",
    status: "completed",
    isSelfReported: true,
  },
  {
    id: "m2-2",
    founderId: "f2",
    title: "Published Fintech Onboarding Teardown",
    description: "Wrote a detailed 15-page teardown on frictionless KYC, generating 2,400 reads.",
    date: "2026-07-15T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "link", url: "https://substack.com/meera/fintech-kyc", label: "Substack Article" }],
  },
  {
    id: "m2-3",
    founderId: "f2",
    title: "First PM Interview Call",
    description: "Invited to Series A logistics startup loop after submitting personalized product spec.",
    date: "2026-10-20T00:00:00Z",
    status: "completed",
    isSelfReported: true,
  },
  {
    id: "m2-4",
    founderId: "f2",
    title: "Secure Full-Time Associate PM Offer",
    description: "Complete final loop with founders and transition into high-growth tech environment.",
    date: "2026-11-30T00:00:00Z",
    status: "in-progress",
    isSelfReported: true,
  },

  // Rahul Varma (f3)
  {
    id: "m3-1",
    founderId: "f3",
    title: "Launched Private Beta",
    description: "Distributed APK to 34 gym peers in Hyderabad. Collected daily feedback over WhatsApp.",
    date: "2026-07-01T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "link", url: "https://testflight.apple.com/join/demo", label: "TestFlight Link" }],
  },
  {
    id: "m3-2",
    founderId: "f3",
    title: "61 Workouts Streak Logged",
    description: "Built the habit consistency tracker while living the product every single day.",
    date: "2026-10-15T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "image", url: "/proof/workout-log.png", label: "Telemetry Log" }],
  },
  {
    id: "m3-3",
    founderId: "f3",
    title: "Cross 100 Daily Active Users",
    description: "Integrate automatic gym set detection and launch on Play Store public track.",
    date: "2026-12-15T00:00:00Z",
    status: "in-progress",
    isSelfReported: true,
  },

  // Vikram Rao (f5)
  {
    id: "m5-1",
    founderId: "f5",
    title: "Opened Commercial Cloud Kitchen",
    description: "Secured FSSAI license and set up small 200 sqft facility in Banjara Hills.",
    date: "2026-04-10T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "document", url: "/proof/fssai.pdf", label: "FSSAI Certification" }],
  },
  {
    id: "m5-2",
    founderId: "f5",
    title: "Trimmed Menu from 15 to 6 Items",
    description: "Reduced kitchen prep latency by 60% and improved profit margins to 38%.",
    date: "2026-08-01T00:00:00Z",
    status: "completed",
    isSelfReported: true,
  },
  {
    id: "m5-3",
    founderId: "f5",
    title: "Hit 20 Orders in Single Lunch Rush",
    description: "Zero dispatch delays, 4.8 star average rating across delivery aggregator.",
    date: "2026-10-22T00:00:00Z",
    status: "completed",
    isSelfReported: true,
  },
  {
    id: "m5-4",
    founderId: "f5",
    title: "Launch Second Hub in Madhapur",
    description: "Expand delivery catchment area to cover Hitec City tech corridors.",
    date: "2027-01-15T00:00:00Z",
    status: "upcoming",
    isSelfReported: true,
  },

  // Demo User (demo)
  {
    id: "m-demo-1",
    founderId: "demo",
    title: "Committed to Startup Path",
    description: "Decided to document real entrepreneurial progress instead of polished vanity posts.",
    date: "2026-09-01T00:00:00Z",
    status: "completed",
    isSelfReported: true,
  },
  {
    id: "m-demo-2",
    founderId: "demo",
    title: "Built First Functional Prototype",
    description: "Shipped core interactive UI with mock database and connected telemetry flows.",
    date: "2026-10-01T00:00:00Z",
    status: "completed",
    isSelfReported: false,
    evidence: [{ type: "link", url: "https://growingmoon.vercel.app", label: "Live Demo Build" }],
  },
  {
    id: "m-demo-3",
    founderId: "demo",
    title: "Onboard First 10 Beta Founders",
    description: "Host 1-on-1 feedback walkthroughs with peers in similar entrepreneurial stages.",
    date: "2026-11-15T00:00:00Z",
    status: "in-progress",
    isSelfReported: true,
  },
];

export const mockPassports: Record<string, JourneyPassport> = {
  demo: {
    founderId: "demo",
    startDate: "2026-09-01T00:00:00Z",
    currentGoal: "Launch my fitness-tech MVP and validate with 10 early founders",
    milestones: mockMilestones.filter((m) => m.founderId === "demo"),
  },
  f1: {
    founderId: "f1",
    startDate: "2026-03-01T00:00:00Z",
    currentGoal: "Reach ₹1L monthly revenue with 0% churn rate",
    milestones: mockMilestones.filter((m) => m.founderId === "f1"),
  },
  f2: {
    founderId: "f2",
    startDate: "2026-05-01T00:00:00Z",
    currentGoal: "Land my first PM role at a Series A startup",
    milestones: mockMilestones.filter((m) => m.founderId === "f2"),
  },
  f3: {
    founderId: "f3",
    startDate: "2026-06-01T00:00:00Z",
    currentGoal: "Get 100 beta testers using workout tracker daily",
    milestones: mockMilestones.filter((m) => m.founderId === "f3"),
  },
  f5: {
    founderId: "f5",
    startDate: "2026-04-10T00:00:00Z",
    currentGoal: "Open a second kitchen hub in Madhapur",
    milestones: mockMilestones.filter((m) => m.founderId === "f5"),
  },
};

export function getPassportByFounderId(founderId: string): JourneyPassport {
  if (mockPassports[founderId]) {
    return mockPassports[founderId];
  }
  // Fallback dynamic passport
  return {
    founderId,
    startDate: "2026-05-01T00:00:00Z",
    currentGoal: "Building and validating my next milestone",
    milestones: mockMilestones.filter((m) => m.founderId === founderId),
  };
}
