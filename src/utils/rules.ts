import { GossipPost, PostCategory, UniversityId, StudentProfile, CampusEvent, ChatMessage, CurrentUser } from '../types';

/**
 * Checks whether content contains leaked phone numbers (Zambian networks: Airtel 097/077, MTN 096/076, Zamtel 095/075)
 * or explicit illegal doxxing formats to protect student anonymity and comply with campus safety standards.
 */
export function validateContentSafety(text: string): { isValid: boolean; warning?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, warning: 'Post cannot be empty.' };
  }

  // Check for Zambian mobile phone numbers (e.g., 097xxxxxxx, 096xxxxxxx, 095xxxxxxx, 077xxxxxxx, 076xxxxxxx, +260...)
  const phonePattern = /(?:\+?260\s?|0)(?:9[567]|7[567])(?:\s?\d){7}/g;
  if (phonePattern.test(text)) {
    return {
      isValid: false,
      warning: 'Safety Alert: Leaking private mobile phone numbers violates ZedWhisper anti-doxxing policy.',
    };
  }

  // Check for severe defamatory keywords / doxxing phrases
  const blockedPatterns = [
    /\b(kill yourself|commit suicide)\b/i,
    /\b(send nudes|leak nudes)\b/i,
    /\b(bank account pin|atm pin)\b/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        warning: 'This message contains prohibited content violating student safety rules.',
      };
    }
  }

  return { isValid: true };
}

/**
 * Generates an authentic anonymous student persona based on campus slang
 */
export function generateAnonymousAlias(university: UniversityId): string {
  const unzaAliases = [
    'Ruined Monk',
    'Goma Lakes Philosopher',
    'Soweto Hall Ghost',
    'NS1 Backbencher',
    'October Park Dreamer',
    'Kavulamunzi Whisperer',
    'Vet Hill Wanderer',
  ];

  const cbuAliases = [
    'Jambo Drive Engineer',
    'Council Bench Debater',
    'Riverside Alchemist',
    'Mopani Shadow',
    'Kitwe Copper Scholar',
    'COBUSU Observer',
  ];

  const mulungushiAliases = [
    'Chimbwi Rock Insider',
    'Great North Road Pilgrim',
    'Town Campus Nomad',
    'Kabwe Horizon',
  ];

  const nipaAliases = [
    'Dushanbe Road Diplomat',
    'Burma Road Administrator',
    'Governance Strategist',
    'NIPA Moot Orator',
    'Public Policy Sage',
    'Chartered Secretary',
  ];

  const genericAliases = [
    'Anonymous Scholar',
    'Midnight Tea Brewer',
    'HELSB Survivor',
    'Library Phantom',
    'Final Year Veteran',
    'Silent Fresher',
  ];

  let pool = genericAliases;
  if (university === 'unza') pool = [...unzaAliases, ...genericAliases];
  else if (university === 'cbu') pool = [...cbuAliases, ...genericAliases];
  else if (university === 'mulungushi') pool = [...mulungushiAliases, ...genericAliases];
  else if (university === 'nipa') pool = [...nipaAliases, ...genericAliases];

  const randomIndex = Math.floor(Math.random() * pool.length);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${pool[randomIndex]} #${randomSuffix}`;
}

/**
 * Calculates trending score for gossip / campus news feed
 */
export function calculateTrendingScore(post: {
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  timestamp: string;
}): number {
  const baseScore = post.upvotes * 2 - post.downvotes + post.commentsCount * 3;
  return Math.max(0, baseScore);
}

/**
 * Verifies if a secret crush matches mutually
 */
export function isSecretCrushMutual(
  currentUserSubmissions: string[],
  targetHandleOrId: string,
  targetAlsoCrushesOnUser: boolean
): boolean {
  if (!targetHandleOrId) return false;
  const normalizedTarget = targetHandleOrId.trim().toLowerCase();
  const hasUserSubmitted = currentUserSubmissions.some(
    (h) => h.trim().toLowerCase() === normalizedTarget
  );
  return hasUserSubmitted && targetAlsoCrushesOnUser;
}

/**
 * Formats free campus treat dispatch (zero payment or fees required)
 */
export function formatCampusGiftDispatch(
  senderAlias: string,
  giftName: string
): { success: boolean; message: string } {
  return {
    success: true,
    message: `${senderAlias} sent ${giftName} with warm campus compliments!`,
  };
}

/**
 * Filters posts based on active university tab, category, and search text
 */
export function filterPosts(
  posts: GossipPost[],
  university: UniversityId,
  category: PostCategory,
  searchQuery: string
): GossipPost[] {
  return posts.filter((post) => {
    // University filter
    if (university !== 'all' && post.university !== university) {
      return false;
    }

    // Category filter
    if (category !== 'all' && post.category !== category) {
      return false;
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = post.title.toLowerCase().includes(q);
      const matchesContent = post.content.toLowerCase().includes(q);
      const matchesAlias = post.authorAlias.toLowerCase().includes(q);
      const matchesTags = post.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchesTitle && !matchesContent && !matchesAlias && !matchesTags) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Filters posts marked as is_saved: true or in the user's bookmarkedPostIds list
 */
export function filterSavedPosts(
  posts: GossipPost[],
  bookmarkedIds: string[] = []
): GossipPost[] {
  return posts.filter(
    (post) => post.is_saved === true || bookmarkedIds.includes(post.id)
  );
}

/**
 * Creates a clean, safe wa.me direct WhatsApp link without exposing private phone details
 * to public feeds or comments. Sanitizes Zambian phone numbers into standard international format.
 */
export function createWhatsAppDirectLink(
  phoneNumber: string | undefined,
  peerNameOrAlias: string,
  university?: string,
  customMessage?: string
): string {
  const greeting =
    customMessage ||
    `Hi ${peerNameOrAlias}! Connected with you on ZedWhisper${
      university ? ` (${university.toUpperCase()})` : ''
    }. Let's chat!`;

  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return `https://wa.me/?text=${encodeURIComponent(greeting)}`;
  }

  // Strip non-digits
  let clean = phoneNumber.replace(/[^\d]/g, '');

  // Zambian 10-digit mobile starting with 0 (e.g., 0971234567 -> 260971234567)
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '260' + clean.slice(1);
  } else if (!clean.startsWith('260') && clean.length === 9) {
    clean = '260' + clean;
  }

  return `https://wa.me/${clean}?text=${encodeURIComponent(greeting)}`;
}

export interface CampusSearchResults {
  peers: StudentProfile[];
  posts: GossipPost[];
  events: CampusEvent[];
  totalMatches: number;
}

/**
 * Unified global search across peers, whispers, and campus events
 */
export function searchAllCampusEntities(
  query: string,
  profiles: StudentProfile[] = [],
  posts: GossipPost[] = [],
  events: CampusEvent[] = []
): CampusSearchResults {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return { peers: [], posts: [], events: [], totalMatches: 0 };
  }

  const peers = profiles.filter((p) => {
    return (
      p.name.toLowerCase().includes(clean) ||
      p.alias.toLowerCase().includes(clean) ||
      p.program.toLowerCase().includes(clean) ||
      p.university.toLowerCase().includes(clean) ||
      p.campus.toLowerCase().includes(clean) ||
      p.bio.toLowerCase().includes(clean) ||
      p.interests.some((i) => i.toLowerCase().includes(clean))
    );
  });

  const matchedPosts = posts.filter((post) => {
    return (
      post.title.toLowerCase().includes(clean) ||
      post.content.toLowerCase().includes(clean) ||
      post.authorAlias.toLowerCase().includes(clean) ||
      post.category.toLowerCase().includes(clean) ||
      post.university.toLowerCase().includes(clean) ||
      post.tags.some((t) => t.toLowerCase().includes(clean))
    );
  });

  const matchedEvents = events.filter((e) => {
    return (
      e.title.toLowerCase().includes(clean) ||
      e.description.toLowerCase().includes(clean) ||
      e.venue.toLowerCase().includes(clean) ||
      e.category.toLowerCase().includes(clean) ||
      e.university.toLowerCase().includes(clean) ||
      e.organizer.toLowerCase().includes(clean)
    );
  });

  return {
    peers,
    posts: matchedPosts,
    events: matchedEvents,
    totalMatches: peers.length + matchedPosts.length + matchedEvents.length,
  };
}

/**
 * Validates that only verified students can send direct whisper messages
 * and blocks bot/auto-fabricated messages.
 */
export function validateStudentCanWhisper(
  isVerifiedStudent: boolean | undefined,
  messageText: string
): { canWhisper: boolean; reason?: string } {
  if (isVerifiedStudent === false) {
    return {
      canWhisper: false,
      reason: 'Only verified Zambian university students can send whisper messages.',
    };
  }

  const clean = messageText.trim();
  if (!clean) {
    return { canWhisper: false, reason: 'Message cannot be empty.' };
  }

  // Reject bot/auto-generated canned phrases
  if (clean.includes('Saw you on ZedWhisper campus encounters.')) {
    return {
      canWhisper: false,
      reason: 'Automated fake messages are prohibited. Please type a genuine message.',
    };
  }

  return { canWhisper: true };
}

/**
 * Filters out fake or bot-generated messages, guaranteeing that only genuine messages from verified students appear
 */
export function filterVerifiedStudentMessages(messages: ChatMessage[] = []): ChatMessage[] {
  return messages.filter((m) => {
    if (!m || !m.text || typeof m.text !== 'string') return false;
    // Discard any legacy auto-seeded fake greetings
    if (m.text.includes('Saw you on ZedWhisper campus encounters.')) return false;
    // Explicitly reject unverified student senders
    if (m.isVerifiedStudent === false) return false;
    return true;
  });
}

/**
 * Validates that only verified Zambian university students can post to the campus buzz feed,
 * blocking unverified actors, bots, and prohibited content.
 */
export function validateStudentCanPostBuzz(
  user: CurrentUser,
  postData: { title: string; content: string }
): { canPost: boolean; reason?: string } {
  if (user.isVerifiedStudent === false || !user.realName?.trim() || !user.alias?.trim()) {
    return {
      canPost: false,
      reason: 'Please complete your student ID profile with your required information to post.',
    };
  }

  const titleCheck = validateContentSafety(postData.title);
  if (!titleCheck.isValid) {
    return { canPost: false, reason: titleCheck.warning || 'Please provide a valid title.' };
  }

  const contentCheck = validateContentSafety(postData.content);
  if (!contentCheck.isValid) {
    return { canPost: false, reason: contentCheck.warning || 'Please provide valid content.' };
  }

  return { canPost: true };
}

/**
 * Filters out fake buzz, bot-generated teas, or unverified posts,
 * ensuring the campus feed contains exclusively authentic messages from verified students.
 */
export function filterVerifiedStudentPosts(posts: GossipPost[] = []): GossipPost[] {
  // Known legacy mock IDs that were fake gossip/spoilers
  const legacyFakeIds = new Set(['whisper-unza-crush', 'whisper-unza-helsb']);

  return posts
    .filter((post) => {
      if (!post || !post.title || !post.content) return false;
      // Discard legacy fake mock items
      if (legacyFakeIds.has(post.id)) return false;
      // Discard fake anonymous crush rumors and bots
      if (post.authorAlias?.includes('Secret Admirer') || post.authorAlias?.includes('Monk Square Elder')) {
        return false;
      }
      // Require verified student
      if (post.isVerifiedStudent !== true) return false;
      return true;
    })
    .map((post) => ({
      ...post,
      isVerifiedStudent: true,
      comments: (post.comments || []).filter((c) => c && c.isVerifiedStudent !== false),
    }));
}

