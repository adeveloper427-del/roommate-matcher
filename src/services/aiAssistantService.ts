import { supabase } from '../lib/supabase';
import { CompatibilityResult, Property, Room, UserProfile } from '../types';
import { mapCompatibilityRow } from './compatibilityService';
import { getProperties, getRoomsByProperty } from './roomService';
import { getAllUsers } from './userService';

export interface AssistantMatch {
  user: UserProfile;
  compatibility: CompatibilityResult;
  matchedCriteria: string[];
}

export interface AssistantRoomMatch {
  property: Property;
  room: Room;
}

export interface AssistantResponse {
  text: string;
  matches?: AssistantMatch[];
  rooms?: AssistantRoomMatch[];
}

interface ParsedCriteria {
  sleepEarly?: boolean;
  sleepLate?: boolean;
  sleepFlexible?: boolean;
  nonSmoker?: boolean;
  wantsPets?: boolean;
  noPets?: boolean;
  tidy?: boolean;
  relaxed?: boolean;
  quiet?: boolean;
  noiseOk?: boolean;
  quietStudy?: boolean;
  groupStudy?: boolean;
  introvert?: boolean;
  extrovert?: boolean;
  cooksOften?: boolean;
  rarelyCooks?: boolean;
  frequentGuests?: boolean;
  rarelyGuests?: boolean;
  maxBudget?: number;
  mentionedName?: string;
}

function parseQuery(query: string): ParsedCriteria {
  const q = query.toLowerCase();
  const criteria: ParsedCriteria = {};

  if (/sleeps? early|early bird|early riser/.test(q)) criteria.sleepEarly = true;
  if (/night owl|sleeps? late|stays? up late/.test(q)) criteria.sleepLate = true;
  if (/flexible sleep|flexible schedule/.test(q)) criteria.sleepFlexible = true;

  if (/doesn'?t smoke|non-?smoker|no smoking/.test(q)) criteria.nonSmoker = true;

  if (/has pets|likes? pets|pet.?friendly|okay with pets/.test(q)) criteria.wantsPets = true;
  if (/no pets|doesn'?t (like|want) pets/.test(q)) criteria.noPets = true;

  if (/tidy|very clean|organized|neat/.test(q)) criteria.tidy = true;
  if (/relaxed (about|on) (cleanliness|mess)|not (too )?fussy/.test(q)) criteria.relaxed = true;

  if (/quiet|low noise|peaceful/.test(q)) criteria.quiet = true;
  if (/doesn'?t mind noise|okay with noise|noise (is )?fine/.test(q)) criteria.noiseOk = true;

  if (/quiet (focus|study)|needs? (a )?quiet (place|space) to study|focused study/.test(q)) criteria.quietStudy = true;
  if (/group study|studies? with others|study group/.test(q)) criteria.groupStudy = true;

  if (/introvert/.test(q)) criteria.introvert = true;
  if (/extrovert|outgoing|social(ly active)?/.test(q)) criteria.extrovert = true;

  if (/cooks? (a lot|often|daily|every day)|loves? (to )?cook/.test(q)) criteria.cooksOften = true;
  if (/rarely cooks?|doesn'?t cook/.test(q)) criteria.rarelyCooks = true;

  if (/frequent guests|has (people|guests) over (a lot|often)|hosts? often/.test(q)) criteria.frequentGuests = true;
  if (/rarely has guests|no guests|doesn'?t (like|want) guests/.test(q)) criteria.rarelyGuests = true;

  const budgetMatch = q.match(/(?:ksh|kes)?\s*(\d{1,3}(?:,\d{3})?|\d+)\s*(k)?/);
  if (/budget|around|under|below|less than/.test(q) && budgetMatch) {
    const raw = budgetMatch[1].replace(/,/g, '');
    let amount = Number(raw);
    if (budgetMatch[2] === 'k') amount *= 1000;
    if (amount > 500) criteria.maxBudget = amount;
  }

  const whyMatch = query.match(/(?:why (?:was|is)|tell me about)\s+([a-z]+(?:\s+[a-z]+)?)/i);
  if (whyMatch) criteria.mentionedName = whyMatch[1].trim();

  return criteria;
}

function criteriaLabels(criteria: ParsedCriteria): string[] {
  const labels: string[] = [];
  if (criteria.sleepEarly) labels.push('Sleeps early');
  if (criteria.sleepLate) labels.push('Night owl');
  if (criteria.sleepFlexible) labels.push('Flexible sleep schedule');
  if (criteria.nonSmoker) labels.push('Non-smoker');
  if (criteria.wantsPets) labels.push('Okay with pets');
  if (criteria.noPets) labels.push('No pets');
  if (criteria.tidy) labels.push('Tidy');
  if (criteria.relaxed) labels.push('Relaxed about cleanliness');
  if (criteria.quiet) labels.push('Prefers quiet');
  if (criteria.noiseOk) labels.push("Doesn't mind noise");
  if (criteria.quietStudy) labels.push('Needs quiet to study');
  if (criteria.groupStudy) labels.push('Studies in groups');
  if (criteria.introvert) labels.push('Introvert');
  if (criteria.extrovert) labels.push('Extrovert');
  if (criteria.cooksOften) labels.push('Cooks often');
  if (criteria.rarelyCooks) labels.push('Rarely cooks');
  if (criteria.frequentGuests) labels.push('Has guests often');
  if (criteria.rarelyGuests) labels.push('Rarely has guests');
  if (criteria.maxBudget) labels.push(`Budget ≤ KSh ${criteria.maxBudget.toLocaleString()}`);
  return labels;
}

function userMatchesCriteria(user: UserProfile, criteria: ParsedCriteria): { matches: boolean; matched: string[] } {
  const matched: string[] = [];
  let matches = true;

  const check = (condition: boolean | undefined, actual: string | undefined, expected: string, label: string) => {
    if (!condition) return;
    if (actual === expected) matched.push(label);
    else if (actual) matches = false;
  };

  check(criteria.sleepEarly, user.lifestyle.sleepSchedule, 'early_bird', 'Sleeps early');
  check(criteria.sleepLate, user.lifestyle.sleepSchedule, 'night_owl', 'Night owl');
  check(criteria.sleepFlexible, user.lifestyle.sleepSchedule, 'flexible', 'Flexible sleep schedule');
  check(criteria.nonSmoker, user.lifestyle.smoking, 'non_smoker', 'Non-smoker');
  check(criteria.tidy, user.lifestyle.cleanliness, 'very_tidy', 'Very tidy');
  check(criteria.relaxed, user.lifestyle.cleanliness, 'relaxed', 'Relaxed about cleanliness');
  check(criteria.quiet, user.lifestyle.noiseTolerance, 'low', 'Prefers quiet');
  check(criteria.noiseOk, user.lifestyle.noiseTolerance, 'high', "Doesn't mind noise");
  check(criteria.quietStudy, user.lifestyle.studyHabits, 'quiet_focus', 'Needs quiet to study');
  check(criteria.groupStudy, user.lifestyle.studyHabits, 'group_study', 'Studies in groups');
  check(criteria.introvert, user.lifestyle.socialLifestyle, 'introvert', 'Introvert');
  check(criteria.extrovert, user.lifestyle.socialLifestyle, 'extrovert', 'Extrovert');
  check(criteria.cooksOften, user.lifestyle.cooking, 'daily', 'Cooks often');
  check(criteria.rarelyCooks, user.lifestyle.cooking, 'rarely', 'Rarely cooks');
  check(criteria.frequentGuests, user.lifestyle.guests, 'frequently', 'Has guests often');
  check(criteria.rarelyGuests, user.lifestyle.guests, 'rarely', 'Rarely has guests');

  if (criteria.wantsPets) {
    if (user.lifestyle.pets && user.lifestyle.pets !== 'no_pets') matched.push('Okay with pets');
    else if (user.lifestyle.pets) matches = false;
  }
  if (criteria.noPets) {
    if (user.lifestyle.pets === 'no_pets') matched.push('No pets');
    else if (user.lifestyle.pets) matches = false;
  }
  if (criteria.maxBudget) {
    if (user.budgetMax != null) {
      if (user.budgetMax <= criteria.maxBudget * 1.15) matched.push(`Budget fits (KSh ${user.budgetMax.toLocaleString()})`);
      else matches = false;
    }
  }

  return { matches, matched };
}

interface FaqTopic {
  patterns: RegExp[];
  answer: string;
}

const FAQ_TOPICS: FaqTopic[] = [
  {
    patterns: [/how (do|can) i book/, /book a room/, /booking process/],
    answer:
      'To book a room: go to the Rooms tab → tap a listing → View Room → Book Room. Fill in your move-in date and submit — the organization will approve or reject it, and you can track the status in My Bookings.',
  },
  {
    patterns: [/cancel (a |my )?booking/, /how (do|can) i cancel/],
    answer:
      "There's no self-cancel button yet — message the organization directly (Messages → New Message) and ask them to update or cancel your booking. They can change its status from their Booking Requests screen.",
  },
  {
    patterns: [/what happens after i book/, /booking (status|approv)/, /pending booking/],
    answer:
      'After you submit a booking it starts as Pending. The organization reviews it from their dashboard and marks it Approved or Rejected — you\'ll see the updated status in My Bookings, and get a notification.',
  },
  {
    patterns: [/edit (my )?profile/, /update (my )?profile/, /change (my )?(profile|details|info)/],
    answer:
      'Go to Profile → Edit Profile to update your name, university, budget, and bio, or Lifestyle Preferences to update your sleep schedule, cleanliness, and other matching criteria.',
  },
  {
    patterns: [/complete (my )?profile/, /profile (not )?complete/],
    answer:
      "If you skipped the questionnaire at signup, go to Profile → Edit Profile and Lifestyle Preferences to fill in the rest — the more you fill in, the more accurate your compatibility scores will be.",
  },
  {
    patterns: [/how (does|do) (matching|compatibility) work/, /compatibility score/, /how (are|is) matches? (calculated|generated|found)/],
    answer:
      'Your compatibility score is calculated from how closely your lifestyle preferences line up with another person\'s — sleep schedule, cleanliness, noise tolerance, study habits, social lifestyle, budget, and location. The closer they match, the higher the score. Fill in your Lifestyle Preferences for more accurate matches.',
  },
  {
    patterns: [/how (do|can) i connect/, /connection request/, /accept.*(connection|request)/, /decline.*(connection|request)/],
    answer:
      'From Find Roommates, tap Connect on someone\'s card to send a request. Check the Connections tab for requests waiting on you — you can Accept or Decline each one there.',
  },
  {
    patterns: [/how (do|can) i message/, /send a message/, /start a (chat|conversation)/, /who can i message/],
    answer:
      'Tap the pencil icon on the Messages tab → New Message to see every person and organization you can message. You can start a conversation with anyone, not just people you\'ve connected with.',
  },
  {
    patterns: [/list (a )?room/, /add (a )?property/, /become an organization/, /organization account/],
    answer:
      'Organizations register from the Welcome screen → Get Started → "I\'m an organization." Once signed in, use Add Property to create a listing, then Add Room to add rooms to it — including photos, pricing, and amenities.',
  },
  {
    patterns: [/verified organization/, /what does verified mean/, /blue (check|badge)/],
    answer:
      "A Verified badge means an admin has reviewed and confirmed that organization is legitimate. It's not automatic — organizations start unverified and admins verify them from the Admin → Organizations screen.",
  },
  {
    patterns: [/notification/],
    answer:
      'Notifications appear via the bell icon on your Home screen — tap it to see new matches, booking updates, and messages. Tap "mark all read" from there to clear the unread count.',
  },
  {
    patterns: [/forgot (my )?password/, /reset (my )?password/, /can'?t log ?in/],
    answer:
      'On the Login screen, tap "Forgot password?" and enter your email — you\'ll get a reset link. If you\'re still stuck, double check you\'re using the right account type (organizations and regular accounts use the same login).',
  },
  {
    patterns: [/delete (my )?account/, /remove (my )?account/],
    answer:
      "There's no self-service account deletion in the app yet — an admin would need to remove your account from the database. Let them know if this is something you need.",
  },
  {
    patterns: [/what can you do/, /what do you do/, /^help$/, /help me\b/],
    answer:
      "I can help you find compatible roommates (\"someone who sleeps early and doesn't smoke\"), search for rooms (\"rooms in Nairobi under KSh 10,000\"), explain a specific match (\"why was Sarah recommended?\"), or answer questions about using the app — booking, messaging, profiles, and more. Just ask.",
  },
  {
    patterns: [/^(hi|hello|hey|sup|yo)[\s!.]*$/],
    answer: "Hey! Ask me to find a roommate, search for rooms, or how to do something in the app — I'm here to help.",
  },
  {
    patterns: [/^(thanks|thank you|thx|cheers)[\s!.]*$/],
    answer: "You're welcome! Let me know if you need anything else.",
  },
];

function answerAppFaq(query: string): string | null {
  const q = query.toLowerCase().trim();
  for (const topic of FAQ_TOPICS) {
    if (topic.patterns.some((pattern) => pattern.test(q))) {
      return topic.answer;
    }
  }
  return null;
}

const ROOM_SEARCH_PATTERN = /\broom|rooms|hostel|apartment|accommodation|place to (stay|live)\b/;

async function searchRooms(query: string): Promise<AssistantResponse> {
  const q = query.toLowerCase();
  const properties = await getProperties();

  let maxBudget: number | undefined;
  const budgetMatch = q.match(/(?:ksh|kes)?\s*(\d{1,3}(?:,\d{3})?|\d+)\s*(k)?/);
  if (budgetMatch) {
    const raw = budgetMatch[1].replace(/,/g, '');
    let amount = Number(raw);
    if (budgetMatch[2] === 'k') amount *= 1000;
    if (amount > 500) maxBudget = amount;
  }

  const knownLocations = Array.from(new Set(properties.map((p) => p.location.toLowerCase())));
  const matchedLocation = knownLocations.find((loc) => q.includes(loc) || loc.split(',')[0] && q.includes(loc.split(',')[0].trim()));

  const roomLists = await Promise.all(properties.map((p) => getRoomsByProperty(p.id)));
  const results: AssistantRoomMatch[] = [];

  properties.forEach((property, index) => {
    const room = roomLists[index].find((r) => r.status !== 'full');
    if (!room) return;
    if (matchedLocation && !property.location.toLowerCase().includes(matchedLocation)) return;
    if (maxBudget && room.pricePerMonth > maxBudget * 1.15) return;
    results.push({ property, room });
  });

  results.sort((a, b) => a.room.pricePerMonth - b.room.pricePerMonth);
  const top = results.slice(0, 5);

  const filters: string[] = [];
  if (matchedLocation) filters.push(`in ${matchedLocation}`);
  if (maxBudget) filters.push(`under KSh ${maxBudget.toLocaleString()}`);

  if (top.length === 0) {
    return {
      text:
        filters.length > 0
          ? `I couldn't find any available rooms ${filters.join(' ')}. Try a different location or budget.`
          : "I couldn't find any available rooms right now. Check back soon, or try Discover Rooms directly.",
    };
  }

  return {
    text: `Here are rooms ${filters.length > 0 ? filters.join(' ') : 'I found'}, cheapest first:`,
    rooms: top,
  };
}

export async function askAssistant(currentUserId: string, query: string): Promise<AssistantResponse> {
  const faqAnswer = answerAppFaq(query);
  if (faqAnswer) {
    return { text: faqAnswer };
  }

  const criteria = parseQuery(query);

  if (criteria.mentionedName) {
    return explainWhyRecommended(currentUserId, criteria.mentionedName);
  }

  if (ROOM_SEARCH_PATTERN.test(query.toLowerCase())) {
    return searchRooms(query);
  }

  const allUsers = await getAllUsers();
  const candidates = allUsers.filter((u) => u.id !== currentUserId);

  const scored = await Promise.all(
    candidates.map(async (user) => {
      const { matches, matched } = userMatchesCriteria(user, criteria);
      if (!matches) return null;

      const { data, error } = await supabase
        .rpc('calculate_compatibility', { p_user_id: currentUserId, p_matched_user_id: user.id })
        .single();
      if (error || !data) return null;

      return { user, compatibility: mapCompatibilityRow(data), matchedCriteria: matched } satisfies AssistantMatch;
    })
  );

  const results = scored
    .filter((r): r is AssistantMatch => r !== null)
    .sort((a, b) => b.compatibility.compatibilityScore - a.compatibility.compatibilityScore)
    .slice(0, 3);

  const labels = criteriaLabels(criteria);

  if (results.length === 0) {
    return {
      text:
        labels.length > 0
          ? `I couldn't find anyone matching ${labels.join(', ').toLowerCase()} right now. Try a broader search, or check back as more people join.`
          : `I couldn't find any strong matches for that. Try mentioning specifics like sleep schedule, smoking, pets, study habits, or budget — e.g. "someone who sleeps early and doesn't smoke, budget around KSh 10,000." You can also ask me to find rooms, or how to use the app.`,
    };
  }

  const intro =
    labels.length > 0
      ? `Here's who I found matching ${labels.join(', ').toLowerCase()}:`
      : `Here are your best matches based on your profile:`;

  return { text: intro, matches: results };
}

async function explainWhyRecommended(currentUserId: string, namePart: string): Promise<AssistantResponse> {
  const allUsers = await getAllUsers();
  const target = allUsers.find((u) => u.fullName.toLowerCase().includes(namePart.toLowerCase()));

  if (!target) {
    return { text: `I couldn't find anyone named "${namePart}". Check the spelling and try again.` };
  }

  if (target.id === currentUserId) {
    return { text: "That's you! Try asking about someone else." };
  }

  const { data, error } = await supabase
    .rpc('calculate_compatibility', { p_user_id: currentUserId, p_matched_user_id: target.id })
    .single();

  if (error || !data) {
    return { text: `I couldn't calculate a compatibility score for ${target.fullName} right now.` };
  }

  const compatibility = mapCompatibilityRow(data);
  const entries = Object.entries(compatibility.breakdown) as [string, number][];
  const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 2);

  const labelMap: Record<string, string> = {
    sleepSchedule: 'sleep schedule',
    cleanliness: 'cleanliness habits',
    noisePreference: 'noise tolerance',
    studyHabits: 'study habits',
    socialLifestyle: 'social lifestyle',
    budget: 'budget range',
    location: 'preferred location',
  };

  const reasons = top.map(([key, value]) => `your ${labelMap[key] ?? key} align closely (${value}%)`);

  const text = `${target.fullName} is ${compatibility.compatibilityScore}% compatible with you mainly because ${reasons.join(' and ')}. ${compatibility.recommendation}`;

  return { text, matches: [{ user: target, compatibility, matchedCriteria: [] }] };
}
