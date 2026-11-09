import type { DiscoveryCategory, DiscoveryMatch } from "@/types";
import { founders } from "./founders";

export const mockDiscoveryMatches: DiscoveryMatch[] = [
  // Same Stage (Demo is 'Building MVP')
  {
    founderId: "f3",
    category: "same-stage",
    matchReason: "Both building MVP in Consumer Health & Fitness apps. Rahul is 3 weeks ahead in beta distribution.",
    relevanceScore: 96,
  },
  {
    founderId: "f10",
    category: "same-stage",
    matchReason: "Also validating MVP with early cohort and facing technical building hurdles without a co-founder.",
    relevanceScore: 91,
  },
  {
    founderId: "f12",
    category: "same-stage",
    matchReason: "Conducting user discovery interviews for consumer habit formation and student psychology.",
    relevanceScore: 88,
  },
  {
    founderId: "f4",
    category: "same-stage",
    matchReason: "Learning modern full-stack development and shipping first production code alone.",
    relevanceScore: 84,
  },

  // One Step Ahead ('Launched' and 'First Customers')
  {
    founderId: "f1",
    category: "one-step-ahead",
    matchReason: "Arjun transitioned from backend dev to ₹42K MRR in 6 months using cold outreach. Highly relevant trajectory.",
    relevanceScore: 98,
  },
  {
    founderId: "f6",
    category: "one-step-ahead",
    matchReason: "Successfully sold first 100 inventory units and validated positive unit economics after MVP launch.",
    relevanceScore: 92,
  },
  {
    founderId: "f11",
    category: "one-step-ahead",
    matchReason: "Transitioning a side prototype into 12 recurring subscribers while managing freelance cashflow.",
    relevanceScore: 90,
  },
  {
    founderId: "f8",
    category: "one-step-ahead",
    matchReason: "Navigating early client revenue, retainer pricing, and customer concentration risks.",
    relevanceScore: 85,
  },

  // Similar Challenges
  {
    founderId: "f1",
    category: "similar-challenges",
    matchReason: "Both solving early customer acquisition from scratch with zero marketing budget.",
    relevanceScore: 95,
  },
  {
    founderId: "f3",
    category: "similar-challenges",
    matchReason: "Both balancing demanding day obligations with disciplined nightly product building.",
    relevanceScore: 94,
  },
  {
    founderId: "f2",
    category: "similar-challenges",
    matchReason: "Both crafting compelling case study portfolios to prove capability to early stakeholders.",
    relevanceScore: 89,
  },
  {
    founderId: "f7",
    category: "similar-challenges",
    matchReason: "Transitioning out of corporate stability into entrepreneurial ownership.",
    relevanceScore: 86,
  },
];
