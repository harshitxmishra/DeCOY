export const DEMO_USER_INTERESTS = [
  "coffee",
  "indie music",
  "tech",
  "design",
  "reading",
  "hiking",
  "travel",
  "cinema",
];

export function getSharedInterests(profileInterests: string[]): string[] {
  const userSet = new Set(DEMO_USER_INTERESTS.map((i) => i.toLowerCase()));
  return profileInterests.filter((interest) =>
    userSet.has(interest.toLowerCase()) ||
    DEMO_USER_INTERESTS.some((ui) => interest.toLowerCase().includes(ui) || ui.includes(interest.toLowerCase()))
  );
}

export function generateIcebreakers(profile: {
  name: string;
  location: string;
  interests: string[];
}): string[] {
  const shared = getSharedInterests(profile.interests);
  const firstName = profile.name.split(" ")[0] || profile.name;
  const prompts: string[] = [];

  for (const item of shared) {
    const s = item.toLowerCase();
    if (s.includes("coffee") || s.includes("chai") || s.includes("tea")) {
      prompts.push(`"What's your go-to coffee spot around ${profile.location}?"`);
    } else if (s.includes("music") || s.includes("indie")) {
      prompts.push(`"What song has been on repeat for you lately?"`);
    } else if (s.includes("tech") || s.includes("coding")) {
      prompts.push(`"Tabs or spaces? (And tell me your favorite side-project!)"`);
    } else if (s.includes("reading") || s.includes("writing")) {
      prompts.push(`"What's one book you wish you could read again for the first time?"`);
    } else if (s.includes("hiking") || s.includes("trekking")) {
      prompts.push(`"Best mountain trail you've ever hiked?"`);
    } else if (s.includes("design") || s.includes("ux") || s.includes("art")) {
      prompts.push(`"Clean minimalism or bold brutalist design?"`);
    } else if (s.includes("cinema") || s.includes("film")) {
      prompts.push(`"What's an overrated movie that everyone else loves?"`);
    }
    if (prompts.length >= 3) break;
  }

  if (prompts.length === 0) {
    prompts.push(`"What's your favorite hidden gem in ${profile.location}?"`);
    prompts.push(`"What's something on your bucket list this year, ${firstName}?"`);
  } else if (prompts.length === 1) {
    prompts.push(`"What's your favorite spot in ${profile.location} to unwind?"`);
  }

  return prompts.slice(0, 2);
}
