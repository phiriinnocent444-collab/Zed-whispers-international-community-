import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContentSafety,
  generateAnonymousAlias,
  calculateTrendingScore,
  isSecretCrushMutual,
  formatCampusGiftDispatch,
  filterPosts,
  filterSavedPosts,
  createWhatsAppDirectLink,
  searchAllCampusEntities,
  validateStudentCanWhisper,
  filterVerifiedStudentMessages,
  validateStudentCanPostBuzz,
  filterVerifiedStudentPosts,
} from './rules';
import { GossipPost, StudentProfile, CampusEvent, ChatMessage, CurrentUser } from '../types';

test('validateContentSafety rejects empty messages', () => {
  const result = validateContentSafety('   ');
  assert.equal(result.isValid, false);
  assert.ok(result.warning?.includes('empty'));
});

test('validateContentSafety blocks leaked Zambian phone numbers', () => {
  const airtelResult = validateContentSafety('Call this lecturer on 0977123456 right now');
  assert.equal(airtelResult.isValid, false);
  assert.ok(airtelResult.warning?.includes('phone numbers'));

  const mtnResult = validateContentSafety('His WhatsApp is +260966454545 please text him');
  assert.equal(mtnResult.isValid, false);

  const cleanResult = validateContentSafety('Library closes at 22:00 tonight at UNZA Great East Road');
  assert.equal(cleanResult.isValid, true);
});

test('generateAnonymousAlias creates university-specific aliases including NIPA', () => {
  const unzaAlias = generateAnonymousAlias('unza');
  assert.ok(unzaAlias.includes('#'));
  assert.ok(typeof unzaAlias === 'string');

  const nipaAlias = generateAnonymousAlias('nipa');
  assert.ok(nipaAlias.includes('#'));
  assert.ok(typeof nipaAlias === 'string');
});

test('calculateTrendingScore weights upvotes and comments correctly', () => {
  const score = calculateTrendingScore({
    upvotes: 20,
    downvotes: 2,
    commentsCount: 5,
    timestamp: '2026-10-30',
  });
  assert.equal(score, 53);
});

test('isSecretCrushMutual identifies confirmed mutual matches', () => {
  const userList = ['@natasha_unza', 'mutale_cbu'];
  assert.equal(isSecretCrushMutual(userList, '@natasha_unza', true), true);
  assert.equal(isSecretCrushMutual(userList, '@natasha_unza', false), false);
  assert.equal(isSecretCrushMutual(userList, '@chipo_lmmu', true), false);
});

test('formatCampusGiftDispatch prepares free campus treat dispatch with zero payment', () => {
  const result = formatCampusGiftDispatch('ZedScholar_Lusaka', 'Hungry Lion 2-Piece & Krush');
  assert.equal(result.success, true);
  assert.ok(result.message.includes('Hungry Lion 2-Piece & Krush'));
});

test('filterPosts correctly filters by university including NIPA', () => {
  const samplePosts: GossipPost[] = [
    {
      id: '1',
      title: 'HELSB allowance is out',
      content: 'Ministry released funds today for UNZA and CBU',
      university: 'unza',
      category: 'news',
      authorAlias: 'Monk #101',
      isAnonymous: false,
      upvotes: 10,
      downvotes: 0,
      commentsCount: 2,
      comments: [],
      timestamp: '1h ago',
      tags: ['#helsb', '#unza'],
    },
    {
      id: '2',
      title: 'NIPA Main Campus Dushanbe Road Moot Court',
      content: 'Public administration symposium starts at 10:00 hrs',
      university: 'nipa',
      category: 'news',
      authorAlias: 'Dushanbe Diplomat',
      isAnonymous: true,
      upvotes: 15,
      downvotes: 0,
      commentsCount: 3,
      comments: [],
      timestamp: '2h ago',
      tags: ['#nipa', '#governance'],
    },
  ];

  // Filter by NIPA
  const nipaOnly = filterPosts(samplePosts, 'nipa', 'all', '');
  assert.equal(nipaOnly.length, 1);
  assert.equal(nipaOnly[0].id, '2');
  assert.equal(nipaOnly[0].university, 'nipa');
});

test('filterSavedPosts correctly filters posts marked with is_saved or in bookmarks', () => {
  const posts: GossipPost[] = [
    {
      id: 'p1',
      title: 'Monk Square banter',
      content: 'Good times at UNZA',
      university: 'unza',
      category: 'hostel',
      authorAlias: 'Monk',
      isAnonymous: true,
      upvotes: 5,
      downvotes: 0,
      commentsCount: 1,
      comments: [],
      timestamp: '1h',
      tags: ['#unza'],
      is_saved: true,
    },
    {
      id: 'p2',
      title: 'CBU Exam schedule',
      content: 'Check notice boards',
      university: 'cbu',
      category: 'exams',
      authorAlias: 'KitweScholar',
      isAnonymous: false,
      upvotes: 12,
      downvotes: 1,
      commentsCount: 4,
      comments: [],
      timestamp: '2h',
      tags: ['#cbu'],
      is_saved: false,
    },
    {
      id: 'p3',
      title: 'Cavendish Moot Court',
      content: 'Law society meeting',
      university: 'cavendish',
      category: 'events',
      authorAlias: 'Barrister',
      isAnonymous: false,
      upvotes: 8,
      downvotes: 0,
      commentsCount: 2,
      comments: [],
      timestamp: '3h',
      tags: ['#cuz'],
    },
  ];

  // Post p1 has is_saved: true. Post p3 is in bookmarkedIds.
  const saved = filterSavedPosts(posts, ['p3']);
  assert.equal(saved.length, 2);
  assert.deepEqual(saved.map((p) => p.id), ['p1', 'p3']);
});

test('createWhatsAppDirectLink formats Zambian phone numbers and encodes custom greeting', () => {
  // Zambian 097 mobile number
  const link1 = createWhatsAppDirectLink('0977123456', 'Natasha', 'UNZA');
  assert.ok(link1.startsWith('https://wa.me/260977123456?text='));
  assert.ok(link1.includes('Natasha'));
  assert.ok(link1.includes('UNZA'));

  // International format +260966454545
  const link2 = createWhatsAppDirectLink('+260966454545', 'Mwila', 'NIPA');
  assert.ok(link2.startsWith('https://wa.me/260966454545?text='));

  // Empty phone fallback
  const link3 = createWhatsAppDirectLink('', 'Peer');
  assert.ok(link3.startsWith('https://wa.me/?text='));
});

test('searchAllCampusEntities finds peers, posts, and events matching query', () => {
  const mockProfiles: StudentProfile[] = [
    {
      id: 's1',
      name: 'Natasha Mwamba',
      alias: 'Tasha_UNZA',
      phoneNumber: '+260977123456',
      age: 21,
      gender: 'female',
      university: 'unza',
      campus: 'Ridgeway',
      program: 'Medicine',
      yearOfStudy: 3,
      bio: 'Future surgeon loving music',
      interests: ['Neurology', 'Amapiano'],
      hangoutSpot: 'EastPark',
      campusPromptQuestion: 'Q',
      campusPromptAnswer: 'A',
      avatarSeed: 'Natasha',
      avatarBgColor: 'pink',
      isVerifiedStudent: true,
      giftsReceived: [],
      reputationScore: 100,
    },
  ];

  const mockPosts: GossipPost[] = [
    {
      id: 'p1',
      title: 'Goma Lakes Sunday picnic',
      content: 'Fresh village chicken lunch',
      university: 'unza',
      category: 'food' as any,
      authorAlias: 'Chef',
      isAnonymous: false,
      upvotes: 10,
      downvotes: 0,
      commentsCount: 2,
      comments: [],
      timestamp: '1h',
      tags: ['#goma'],
    },
  ];

  const mockEvents: CampusEvent[] = [
    {
      id: 'e1',
      title: 'UNZA vs CBU Derbies Final',
      university: 'unza',
      category: 'sports',
      venue: 'OYDC Olympic Stadium',
      date: '2026-11-15',
      time: '15:00',
      description: 'Annual inter-university football match',
      attendeesCount: 450,
      organizer: 'UNZASU Sports Guild',
    },
  ];

  // Search for "Goma" -> matches post
  const res1 = searchAllCampusEntities('Goma', mockProfiles, mockPosts, mockEvents);
  assert.equal(res1.posts.length, 1);
  assert.equal(res1.peers.length, 0);

  // Search for "Natasha" -> matches peer
  const res2 = searchAllCampusEntities('Natasha', mockProfiles, mockPosts, mockEvents);
  assert.equal(res2.peers.length, 1);
  assert.equal(res2.peers[0].alias, 'Tasha_UNZA');

  // Search for "Derbies" -> matches event
  const res3 = searchAllCampusEntities('Derbies', mockProfiles, mockPosts, mockEvents);
  assert.equal(res3.events.length, 1);

  // Search for "UNZA" -> matches all 3
  const res4 = searchAllCampusEntities('UNZA', mockProfiles, mockPosts, mockEvents);
  assert.equal(res4.totalMatches, 3);
});

test('validateStudentCanWhisper enforces verified student status and blocks fake auto-replies', () => {
  // Non-verified student is blocked
  const unverified = validateStudentCanWhisper(false, 'Hello fellow monk');
  assert.equal(unverified.canWhisper, false);
  assert.ok(unverified.reason?.includes('verified Zambian university students'));

  // Empty text blocked
  const empty = validateStudentCanWhisper(true, '   ');
  assert.equal(empty.canWhisper, false);

  // Auto-generated fake bot phrase blocked
  const fakeBot = validateStudentCanWhisper(
    true,
    'Hey Natasha! Saw you on ZedWhisper campus encounters.'
  );
  assert.equal(fakeBot.canWhisper, false);
  assert.ok(fakeBot.reason?.includes('Automated fake messages are prohibited'));

  // Genuine student message passes
  const genuine = validateStudentCanWhisper(
    true,
    'Hey! Are you studying at the main library right now?'
  );
  assert.equal(genuine.canWhisper, true);
});

test('filterVerifiedStudentMessages removes fake messages and retains only verified student whispers', () => {
  const mixedMessages: ChatMessage[] = [
    {
      id: 'm1',
      conversationId: 'c1',
      senderId: 'bot1',
      senderAlias: 'AutoBot',
      isSenderGhost: false,
      isVerifiedStudent: true,
      text: 'Hey Innocent! Saw you on ZedWhisper campus encounters.',
      timestamp: '1h',
    },
    {
      id: 'm2',
      conversationId: 'c1',
      senderId: 'unverified-user',
      senderAlias: 'Spammer',
      isSenderGhost: false,
      isVerifiedStudent: false,
      text: 'Click this link to win money',
      timestamp: '30m',
    },
    {
      id: 'm3',
      conversationId: 'c1',
      senderId: 'stud-1',
      senderAlias: 'Tasha_UNZA',
      isSenderGhost: false,
      isVerifiedStudent: true,
      text: 'Mwine! Are you coming for the CS study group at Vet Hill?',
      timestamp: 'Just now',
    },
  ];

  const cleaned = filterVerifiedStudentMessages(mixedMessages);
  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].id, 'm3');
  assert.equal(cleaned[0].text, 'Mwine! Are you coming for the CS study group at Vet Hill?');
});

test('validateStudentCanPostBuzz enforces verified student status and rejects empty or unsafe posts', () => {
  const verifiedUser: CurrentUser = {
    id: 'user-1',
    realName: 'Innocent Phiri',
    alias: 'ZedScholar',
    university: 'unza',
    campus: 'Great East Road',
    program: 'BSc Computer Science',
    year: 3,
    isGhostMode: false,
    isVerifiedStudent: true,
    treatsSentCount: 0,
    secretCrushesSubmitted: [],
    bookmarkedPostIds: [],
  };

  const unverifiedUser: CurrentUser = {
    ...verifiedUser,
    isVerifiedStudent: false,
  };

  // Block unverified user
  const unverifiedCheck = validateStudentCanPostBuzz(unverifiedUser, {
    title: 'Study group',
    content: 'Meeting at library',
  });
  assert.equal(unverifiedCheck.canPost, false);
  assert.ok(unverifiedCheck.reason?.includes('Only verified Zambian university students'));

  // Block empty content
  const emptyCheck = validateStudentCanPostBuzz(verifiedUser, {
    title: 'Study group',
    content: '   ',
  });
  assert.equal(emptyCheck.canPost, false);

  // Allow genuine verified student post
  const validCheck = validateStudentCanPostBuzz(verifiedUser, {
    title: 'Engineering lab revision hours',
    content: 'Lab will remain open until 22:00 with solar backup.',
  });
  assert.equal(validCheck.canPost, true);
});

test('filterVerifiedStudentPosts purges legacy fake buzz and retains only authentic student messages', () => {
  const mixedPosts: GossipPost[] = [
    {
      id: 'whisper-unza-crush', // legacy fake crush tea
      title: 'Fake Crush Rumor',
      content: 'Saw someone at table 14',
      university: 'unza',
      category: 'crushes',
      authorAlias: 'Secret Admirer #290',
      isAnonymous: true,
      upvotes: 10,
      downvotes: 0,
      commentsCount: 0,
      comments: [],
      timestamp: '1h',
      tags: ['#crushes'],
    },
    {
      id: 'post-unverified',
      title: 'Unverified spam',
      content: 'Spam advertisement',
      university: 'cbu',
      category: 'marketplace',
      authorAlias: 'BotUser',
      isAnonymous: false,
      isVerifiedStudent: false, // explicitly unverified
      upvotes: 0,
      downvotes: 5,
      commentsCount: 0,
      comments: [],
      timestamp: '2h',
      tags: [],
    },
    {
      id: 'whisper-unza-revision',
      title: 'UNZA Ridgeway Medical Library 24hr Revision Access',
      content: 'Dean confirmed quiet hall open 24/7 with solar backup.',
      university: 'unza',
      category: 'exams',
      authorAlias: 'Natasha Mwamba',
      isAnonymous: false,
      isVerifiedStudent: true,
      studentProgram: 'MBChB Medicine',
      upvotes: 25,
      downvotes: 0,
      commentsCount: 1,
      comments: [
        {
          id: 'c1',
          postId: 'whisper-unza-revision',
          authorAlias: 'Innocent Phiri',
          authorUniversity: 'unza',
          isAuthorGhost: false,
          isVerifiedStudent: true,
          content: 'Great news!',
          upvotes: 5,
          timestamp: '1h',
        },
      ],
      timestamp: '3h',
      tags: ['#unza', '#exams'],
    },
  ];

  const filtered = filterVerifiedStudentPosts(mixedPosts);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'whisper-unza-revision');
  assert.equal(filtered[0].authorAlias, 'Natasha Mwamba');
  assert.equal(filtered[0].isVerifiedStudent, true);
});

test('generateAnonymousAlias creates aliases for Kwame Nkrumah and Evelyn Hone', () => {
  const nkrumahAlias = generateAnonymousAlias('nkrumah');
  assert.ok(nkrumahAlias.includes('#'));
  assert.ok(nkrumahAlias.length > 5);

  const honeAlias = generateAnonymousAlias('evelyn_hone');
  assert.ok(honeAlias.includes('#'));
  assert.ok(honeAlias.length > 5);
});

test('filterPosts filters correctly for Kwame Nkrumah and Evelyn Hone', () => {
  const samplePosts: GossipPost[] = [
    {
      id: 'post-knu-1',
      title: 'Kwame Nkrumah Science Lab Practical Session',
      content: 'Physics & Chemistry combined practical at Munkoyo campus labs.',
      university: 'nkrumah',
      category: 'exams',
      authorAlias: 'Luyando Tembo',
      isAnonymous: false,
      isVerifiedStudent: true,
      upvotes: 18,
      downvotes: 0,
      commentsCount: 2,
      comments: [],
      timestamp: '2h ago',
      tags: ['#nkrumah', '#science'],
    },
    {
      id: 'post-hone-1',
      title: 'Evelyn Hone Media & Radio Studio Booking Open',
      content: 'Mass communication students can book broadcast booths.',
      university: 'evelyn_hone',
      category: 'exams',
      authorAlias: 'Chileshe Banda',
      isAnonymous: false,
      isVerifiedStudent: true,
      upvotes: 21,
      downvotes: 0,
      commentsCount: 3,
      comments: [],
      timestamp: '3h ago',
      tags: ['#evelyn_hone', '#journalism'],
    },
    {
      id: 'post-unza-1',
      title: 'UNZA Main Mall meeting',
      content: 'Library study circle',
      university: 'unza',
      category: 'exams',
      authorAlias: 'Monk #101',
      isAnonymous: false,
      isVerifiedStudent: true,
      upvotes: 10,
      downvotes: 0,
      commentsCount: 1,
      comments: [],
      timestamp: '4h ago',
      tags: ['#unza'],
    },
  ];

  const nkrumahOnly = filterPosts(samplePosts, 'nkrumah', 'all', '');
  assert.equal(nkrumahOnly.length, 1);
  assert.equal(nkrumahOnly[0].id, 'post-knu-1');

  const honeOnly = filterPosts(samplePosts, 'evelyn_hone', 'all', '');
  assert.equal(honeOnly.length, 1);
  assert.equal(honeOnly[0].id, 'post-hone-1');
});


