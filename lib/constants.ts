import { EventType } from "@/types";

const strikeChangers = ["1", "3", "-4"];

const invalidBalls = ["-4", "-3", "-2"];

export const ballEvents: Record<EventType, string> = {
  "-5": "B",
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

export const wicketTypes = [
  {
    id: 1,
    type: "Bowled",
    shortName: "b.",
  },
  {
    id: 2,
    type: "LBW",
    shortName: "lbw.",
  },
  {
    id: 3,
    type: "Caught",
    shortName: "c.",
    isOtherPlayerInvolved: true,
  },
  {
    id: 4,
    type: "Caught & Bowled",
    shortName: "c & b.",
  },
  {
    id: 5,
    type: "Run Out",
    shortName: "run out.",
    isOtherPlayerInvolved: true,
    isNotBowlersWicket: true,
  },
  {
    id: 6,
    type: "Stumped",
    shortName: "st.",
    isOtherPlayerInvolved: true,
  },
  {
    id: 7,
    type: "Hit Wicket",
    shortName: "hit wkt.",
    isNotBowlersWicket: true,
  },
  {
    id: 8,
    type: "Retired Hurt",
    shortName: "ret. hurt",
    isNotBowlersWicket: true,
  },
];

const navItems = [
  { name: "Matches", href: "/matches" },
  { name: "Teams", href: "/teams" },
  { name: "Players", href: "/players" },
  { name: "Records", href: "/records" },
  { name: "Rivalries", href: "/rivalries" },
  { name: "Instant Scoring", href: "/scorer" },
  { name: "Guide", href: "/guide" },
] as const;

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

const commentsCollection = {
  "0": [
    // Dot ball
    "{bowler} bowls a fantastic delivery, and {batsman} can't get it away. a dot ball.",
    "No run! {bowler} keeps it tight, and {batsman} finds it hard to rotate the strike.",
    "Great line from {bowler}, {batsman} fails to score.",
    "A dot ball, {batsman} is struggling to find the gaps as bowler keeps him tied down.",
    "No runs on this ball, {bowler} will be happy with that dot.",
  ],
  "1": [
    // Single run
    "{batsman} taps it towards the off side, and they steal a quick single off {bowler}.",
    "{batsman} nudges it into the leg side for an easy single. Good running between the wickets.",
    "Smart cricket from {batsman}, finding the gap and taking a single as {bowler} tries to keep it tight.",
    "{batsman} drives it gently, and they quickly scamper through for a well-judged single.",
    "A quick single for {batsman} as they look to rotate the strike off {bowler}.",
  ],
  "2": [
    // Two runs
    "{batsman} plays a beautiful shot into the gap, and they comfortably come back for two runs.",
    "Good running! {batsman} flicks it off the pads and they take two well-judged runs off {bowler}.",
    "{batsman} finds the gap, and with some excellent running, they pick up two more runs.",
    "Lovely placement by {batsman}, and they run two as {bowler} tries to restrict the runs.",
    "Two runs to {batsman}, placed perfectly between the fielders.",
  ],
  "3": [
    // Three runs
    "{batsman} drives beautifully through the covers, and they take three well-run runs off {bowler}.",
    "Good timing by {batsman}, pushing it through the gap and they come back for three runs.",
    "Three runs for {batsman} as {bowler}'s delivery is driven down the ground, and the fielder pulls it back just in time.",
    "{batsman} finds the gap and excellent running between the wickets results in three runs.",
    "{batsman} shows great placement, sending it through the infield for three well-earned runs.",
  ],
  "4": [
    // Four runs
    "What a shot by {batsman}! {bowler} offers width, and it's driven for a glorious four through the covers.",
    "{batsman} cuts the ball hard, piercing the gap, and it races away to the boundary for four runs.",
    "Brilliant shot! {batsman} flicks it through mid-wicket for four, leaving {bowler} helpless.",
    "Exquisite timing from {batsman}! {bowler} is punished as the ball races away for four.",
    "{batsman} lofts it over the infield, and the ball runs away for a beautifully timed four.",
  ],
  "6": [
    // Six runs
    "That's massive! {batsman} picks it up beautifully and sends {bowler}'s delivery over the boundary for a huge six.",
    "What a strike from {batsman}! The ball soars into the stands for a monstrous six.",
    "{batsman} gets under {bowler}'s delivery and smashes it out of the park for six!",
    "Incredible shot by {batsman}! He dispatches {bowler} into the stands for a towering six.",
    "That's out of the ground! {batsman} clears his front leg and hammers {bowler} for a colossal six.",
  ],
  "-1_1": [
    // Bowled
    "Bowled him! {bowler} delivers an absolute peach, and {batsman} is beaten all ends up. Timber!",
    "{bowler} has rattled the stumps! {batsman} is completely deceived, and the ball crashes into the stumps.",
    "Clean bowled! {batsman} fails to read {bowler}'s delivery, and the stumps are knocked over.",
    "What a delivery! {bowler} hits the perfect spot, and {batsman} is bowled through the gate.",
    "{bowler} strikes! {batsman} misjudges the line, and the ball smashes into the stumps.",
  ],
  "-1_2": [
    // LBW
    "Up goes the finger! {bowler} traps {batsman} right in front, and the umpire has no hesitation in giving it out LBW.",
    "That's plumb! {batsman} is caught on the crease, and {bowler}'s delivery hits him right in front of the stumps.",
    "Huge shout for LBW, and it's given! {batsman} is beaten by {bowler}, and the ball would have hit middle stump.",
    "LBW! {batsman} misses, and {bowler} gets him out leg-before. Great bowling!",
    "{batsman} is trapped in front by {bowler}! No doubts from the umpire, and it's LBW.",
  ],
  "-1_3": [
    // Catch
    "Caught! {batsman} tries to go big, but {fielder} takes a fantastic catch in the outfield off {bowler}'s bowling.",
    "{batsman} mistimes the shot, and {fielder} makes no mistake with a brilliant catch off {bowler}.",
    "{fielder} takes a stunner! {batsman} hits it high, but {fielder} shows safe hands. {bowler} is delighted.",
    "{batsman} is out, caught by {fielder}! A mistimed shot, and {bowler} gets the wicket.",
    "What a catch by {fielder}! {batsman} tried to clear the infield, but {fielder} pulled off a great catch off {bowler}.",
  ],
  "-1_4": [
    // Catch & Bowled
    "Caught and bowled! {bowler} reacts quickly to take a sharp return catch and dismiss {batsman}.",
    "{bowler} takes a brilliant catch off his own bowling! {batsman} is out caught and bowled.",
    "Outstanding reflexes from {bowler}, as he takes a return catch and dismisses {batsman}.",
    "It's caught and bowled! {bowler} completes the dismissal with a fantastic catch off his own bowling.",
    "{bowler} displays great agility, catching {batsman}'s mistimed shot and completing the catch himself.",
  ],
  "-1_5": [
    // Runout
    "Run out! {fielder} fires in a direct hit, and {batsman} is short of his ground. Brilliant fielding.",
    "{fielder} shows superb reflexes, picking up and throwing down the stumps to run out {batsman}.",
    "Excellent work by {fielder}! He reacts quickly and throws down the stumps, and {batsman} is run out.",
    "Disaster for {batsman}! A brilliant throw from {fielder}, and he's run out by a yard.",
    "{batsman} is run out! A poor call, and {fielder}'s throw is right on target to get the wicket.",
  ],
  "-1_6": [
    // Stumped
    "Quick work by the keeper! {batsman} is out of his crease, and {fielder} does his job.",
  ],
  "-1_7": [
    // Hit wicket
    "Unbelievable! {batsman} steps back too far and dislodges the bails. He's out hit wicket off {bowler}.",
  ],
  "-1_8": [
    // Retired hurt
    "A setback for the team as {batsman} retires hurt. It looks like an injury, and {bowler} can take a breather.",
  ],
  "-2": [
    // Wide
    "That's a wide ball! The bowler strays down the leg side, gifting an extra run to the batting team.",
    "Poor delivery from the bowler, way outside off stump, and the umpire signals wide.",
    "Wide called by the umpire! The bowler needs to get his line right.",
    "Too wide outside the reach of the batsman, and it's signaled as a wide. Extra run added to the total.",
    "The bowler loses control, and it's a wide down the leg side. The batting side won't mind the free runs.",
  ],
  "-3": [
    // No ball
    "No ball! The bowler has lost discipline, and it's a free hit for the batsman on the next delivery.",
    "That's a no ball! The batsman ducks, and the umpire calls it.",
    "Poor length by the bowler results in a no ball. Extra run and an extra delivery for the batting side.",
    "Illegal delivery! and the umpire signals no ball.",
    "No ball signaled! The bowler has to be careful with his run-up. The batting team gets a bonus.",
  ],
  "-4": [
    // Strike change
    "The batsmen have crossed over, and there will be a change of strike for the next delivery.",
  ],
  "-5": [
    // Byes
    "Extra runs through byes! The batsmen take advantage as the keeper fails to collect the ball.",
  ],
};

export {
  strikeChangers,
  invalidBalls,
  navItems,
  guideSteps,
  faqs,
  commentsCollection,
};
