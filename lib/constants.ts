import { EventType } from "@/types";

const strikeChangers = ["1", "3", "-4"]; // '-4' is for swap manually without run

const invalidBalls = ["-4", "-3", "-2"];

export const ballEvents: Record<EventType, string> = {
  "-5": "B",
  "-4": "0",
  "-3": "NB",
  "-2": "WD",
  "-1": "W",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "6": "6",
};

const navItems = [
  { name: "Matches", href: "/matches" },
  { name: "Teams", href: "/teams" },
  { name: "Players", href: "/players" },
  { name: "Instant Scoring", href: "/scorer" },
  { name: "Guide", href: "/guide" },
] as const

const guideSteps = [
  {
    title: "Add players",
    notes: [
      "Add min. 2 players",
      "User can also add multiple players within one form",
    ],
    href: "/players",
  },
  {
    title: "Add teams",
    notes: ["Add min. 2 teams", "Select players from your created players"],
    href: "/teams",
  },
  {
    title: "Add Match",
    notes: [
      "Select teams from your created teams",
      "Create and click on a 'play' button to start the match and that's it",
    ],
    href: "/matches",
  },
];

const faqs = [
  {
    question: "Is Ballbyball compatible with mobile devices?",
    answer:
      "Yes, Ballbyball is fully mobile responsive, allowing you to score matches conveniently on the go.",
  },
  {
    question:
      "Can I edit entities (matches, players, teams) after they've been added?",
    answer: `Yes, you can easily edit entities at any time. Simply locate the entity you wish and select the "Edit" option from the dropdown menu. Read more about it in the "Guide" section.`,
  },
  {
    question: "Can I analyze match statistics using Ballbyball?",
    answer:
      "Yes, Ballbyball offers statistical analysis features that allow you to delve into detailed match statistics and analytics, helping you gain insights into team and player performance.",
  },
  {
    question: "Does Ballbyball require adding players and teams to function?",
    answer:
      "Not necessarily, Ballbyball requires to add player only on full-featured app, but not for normal scoring",
  },
  {
    question: "Does Ballbyball require an internet connection to function?",
    answer:
      "Yes, Ballbyball requires an internet connection, but not for normal scoring",
  },
];

export { strikeChangers, invalidBalls, navItems, guideSteps, faqs };
