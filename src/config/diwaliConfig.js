/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRAL DIWALI SURPRISE CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Easily update names, memories, and personal messages here or via URL params.
 */

export const DIWALI_CONFIG = {
  // ── Names ──
  herName: 'Helly',
  yourName: 'Rudra',

  // ── Section 01: The Surprise ──
  surpriseHeadline: 'This Diwali, my favourite light is you.',
  surpriseSubtext: 'I made something special, just for you, Helly.',
  surpriseButton: 'Open Your Surprise →',

  // ── Section 02: Cinematic Diya Journey ──
  cinematicMidSentence: 'You make even the simplest moments feel magical.',

  // ── Section 03: A Message From My Heart ──
  heartHeading: 'A little something from my heart...',
  heartMessageWords: [
    'Diwali', 'is', 'all', 'about', 'light,', 'happiness', 'and', 'beautiful',
    'beginnings.', 'But', 'for', 'me,', 'the', 'most', 'beautiful', 'part', 'of',
    'life', 'is', 'having', 'you', 'in', 'it.', 'Your', 'smile', 'makes', 'my',
    'ordinary', 'days', 'special,', 'your', 'presence', 'makes', 'everything',
    'feel', 'warmer,', 'and', 'every', 'moment', 'with', 'you', 'becomes', 'a',
    'memory', 'I', 'want', 'to', 'keep', 'forever.'
  ],
  interactivePillars: [
    {
      id: 'smile',
      title: 'Your Smile',
      preview: 'The glow that softens every day',
      romanticMessage:
        'The effortless way your face lights up is brighter than every festival lamp in the city. It softens my toughest moments and makes pure joy feel so natural.',
    },
    {
      id: 'presence',
      title: 'Your Presence',
      preview: 'A warmth like nowhere else',
      romanticMessage:
        'Just being near you brings a peaceful calm that nothing else can replicate. When you are by my side, everything feels grounded, warm, and comforting.',
    },
    {
      id: 'happiness',
      title: 'Your Happiness',
      preview: 'My deepest, most genuine wish',
      romanticMessage:
        'Seeing you truly content, laughing without holding back, and thriving is my greatest happiness. Every Diwali wish I make has your peace and joy at its centre.',
    },
    {
      id: 'memories',
      title: 'Our Memories',
      preview: 'Treasures I hold forever',
      romanticMessage:
        'From our quietest conversations to the moments we completely lost track of time, every chapter we share has become an irreplaceable treasure I hold close.',
    },
  ],

  // ── Section 04: Our Little Memories ──
  memoriesHeading: 'If I could wish for anything...',
  memoriesSubtext: 'It would be to see you smiling, today and every day after.',
  relationshipMemories: [
    {
      id: 'mem-1',
      title: 'A Memory to Remember',
      tag: 'Cherished Evening',
      content:
        '[RELATIONSHIP_MEMORY_1 — That quiet evening on your terrace when the whole city below sparkled with festive lights, and you looked at me and said you wished time would freeze right there.]',
      image:
        'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Glowing traditional diyas amidst vibrant marigold petals and soft golden light',
    },
    {
      id: 'mem-2',
      title: 'A Moment I Treasure',
      tag: 'Pure Laughter',
      content:
        '[RELATIONSHIP_MEMORY_2 — The way you laugh without holding back whenever we share something silly, bringing more warmth into my world than any festival could ever hope to bring.]',
      image:
        'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Clay diya casting warm illumination on festive Indian textiles',
    },
    {
      id: 'mem-3',
      title: 'My Favourite Feeling',
      tag: 'Home With You',
      content:
        '[RELATIONSHIP_MEMORY_3 — Holding your hand amidst the celebration, knowing that in a world full of noise, bustling crowds, and thousands of lights, you are my home.]',
      image:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Artful arrangement of golden festive lights and serene celebration',
    },
  ],

  // ── Section 04: A Little Playtime for Us (Couple Games) ──
  coupleGames: {
    heading: 'A Little Playtime for Us ❤️',
    subtext: 'Because every beautiful love story deserves a little fun, some laughter and a few unexpected surprises.',
    
    // Game 01: This or That — Couple Edition
    thisOrThat: {
      title: 'This or That ❤️',
      description: "Let's discover our little preferences!",
      rounds: [
        { id: 'r1', optionA: 'Long Drives 🚗', optionB: 'Movie Nights 🎬' },
        { id: 'r2', optionA: 'Mountains 🏔️', optionB: 'Beaches 🌊' },
        { id: 'r3', optionA: 'Sunrise 🌅', optionB: 'Sunset 🌇' },
        { id: 'r4', optionA: 'Coffee ☕', optionB: 'Ice Cream 🍦' },
        { id: 'r5', optionA: 'Cuddles 🤗', optionB: 'Hand Holding 🤝' },
        { id: 'r6', optionA: 'Romantic Dinner 🕯️', optionB: 'Street Food 🍲' },
        { id: 'r7', optionA: 'Rainy Days 🌧️', optionB: 'Winter Nights ❄️' },
        { id: 'r8', optionA: 'Surprise Gifts 🎁', optionB: 'Handwritten Letters 💌' },
        { id: 'r9', optionA: 'Staying In 🏡', optionB: 'Exploring Together ✈️' },
        { id: 'r10', optionA: 'Hugs 🫂', optionB: 'Kisses 💋' },
      ],
      finalMessage: "Every little choice becomes special when it's with you.",
    },

    // Game 02: Love Treasure Hunt
    treasureHunt: {
      title: 'Find Your Little Surprise',
      description: 'Three little clues, three little challenges and one special surprise waiting for you.',
      clues: [
        {
          id: 'clue-1',
          badge: 'Clue 01',
          name: 'A Little Beginning',
          question: 'What is the one thing that makes my day instantly better?',
          options: [
            'Your morning text & sweet voice',
            'A cup of black coffee',
            'Checking social media feeds',
          ],
          correctIndex: 0,
          successMessage: 'Correct! You already know how to make my world brighter.',
        },
        {
          id: 'clue-2',
          badge: 'Clue 02',
          name: 'Our Little Secret',
          question: 'What is something that makes our time together so special?',
          options: [
            'Visiting fancy restaurants',
            'The fact that even sitting in silence feels complete with you',
            'Watching expensive movies',
          ],
          correctIndex: 1,
          successMessage: "Exactly! It's not about where we go, but who we are with.",
        },
        {
          id: 'clue-3',
          badge: 'Clue 03',
          name: 'The Final Clue',
          question: 'What will always be my favourite part of every celebration?',
          options: [
            'The loud fireworks outside',
            'The endless festive sweets',
            'YOU — having you right by my side',
          ],
          correctIndex: 2,
          successMessage: 'You found it! And the answer is YOU. ❤️',
        },
      ],
      finalTreasure: {
        headline: 'You Unlocked the Final Treasure! ✨',
        envelopeLabel: 'Tap to Open Your Secret Love Letter',
        message:
          'Among a thousand lights, a million wishes and countless beautiful moments, you will always be my favourite blessing.',
      },
    },

    // Game 03: Truth or Dare — Love Edition
    truthOrDare: {
      title: 'Truth or Dare? 😉',
      description: "Let's make some more memories!",
      truths: [
        'What was your honest first impression of me?',
        'What is your all-time favourite memory of us?',
        'What is one little thing you secretly love about me?',
        'When do you miss me the most throughout the day?',
        'What is one dream adventure you want us to do together?',
        'Describe our bond in three heartfelt words.',
      ],
      dares: [
        'Send me your cutest smiling selfie right now.',
        'Say three things you genuinely love about me.',
        'Send me a cute 10-second voice note saying something sweet.',
        'Give me a new romantic nickname of your choice.',
        'Send me your absolute favourite photo of us.',
        'Tell me something sweet you have never told me before.',
      ],
    },

    // Game 04: Scratch to Reveal
    scratchCard: {
      title: 'A Little Surprise Just for You',
      description: "There's something special hidden underneath. Scratch to discover!",
      instruction: 'Scratch here to reveal your surprise ✨',
      messages: [
        "You're my favourite reason to smile.",
        'My world becomes brighter because of you.',
        'You are my favourite Diwali blessing.',
        'One lifetime, countless memories with you.',
      ],
    },

    // Game 05: Spin the Love Wheel
    spinWheel: {
      title: "Let's Spin Some Love!",
      description: 'Who knows what little surprise is waiting for you?',
      segments: [
        {
          label: 'A Sweet Compliment',
          color: '#D6AD62',
          icon: '✨',
          result:
            'You have the kindest heart and the most radiant smile I have ever seen. You make every ordinary moment glow with happiness.',
        },
        {
          label: 'A Romantic Question',
          color: '#FFF8ED',
          icon: '💭',
          result:
            'If we could pause any single moment we have shared together and live in it forever, which one would you choose?',
        },
        {
          label: 'A Little Dare',
          color: '#DFA5A0',
          icon: '💌',
          result:
            'Right now, text me the exact little thing that made you smile the hardest today!',
        },
        {
          label: 'A Special Wish',
          color: '#E8A13A',
          icon: '🌟',
          result:
            'May your life always be illuminated with deep peace, boundless laughter, and all the warm love you bring to others.',
        },
        {
          label: 'A Virtual Hug',
          color: '#D6AD62',
          icon: '🫂',
          result:
            'Sending you the tightest, warmest, and longest hug right across the distance. Close your eyes and feel how loved you are.',
        },
        {
          label: 'A Secret Message',
          color: '#FFF8ED',
          icon: '🤫',
          result:
            'Even when my days are hectic and quiet, you are constantly on my mind in the softest, most comforting way.',
        },
        {
          label: 'Your Favourite Memory',
          color: '#DFA5A0',
          icon: '📷',
          result:
            'Remember that time when we both laughed so hard we could barely breathe? That will forever be one of my happiest days.',
        },
        {
          label: 'A Surprise for You',
          color: '#E8A13A',
          icon: '🎁',
          result:
            'Redeemable Anytime Coupon: One long romantic evening with your favourite dessert + unlimited warm forehead kisses!',
        },
      ],
    },
  },

  // ── Section 05: The Final Diwali Wish ──
  finalWish: {
    heading: 'A thousand diyas, one special wish.',
    message:
      'May your life always shine with happiness, your dreams find their way to reality, and your smile never lose its brightness.',
    mainWish: 'Happy Diwali, Helly ❤️',
    supportingMessage:
      'Thank you for being one of the most beautiful parts of my life.',
    buttonText: 'Light a Diya for Us ✨',
    afterLightQuote:
      'No matter how many lights surround us, you will always be my favourite one.',
    signatureIntro: 'With all my love,',
  },
}

/**
 * Reads any URL overrides (e.g., ?her=Helly&you=Rahul)
 */
export function getResolvedConfig() {
  if (typeof window === 'undefined' || !window.location.search) {
    return DIWALI_CONFIG
  }
  try {
    const p = new URLSearchParams(window.location.search)
    const conf = { ...DIWALI_CONFIG }
    if (p.get('her')) {
      conf.herName = p.get('her')
      conf.surpriseSubtext = `I made something special, just for you, ${p.get('her')}.`
      conf.finalWish.mainWish = `Happy Diwali, ${p.get('her')} ❤️`
    }
    if (p.get('you')) {
      conf.yourName = p.get('you')
    }
    return conf
  } catch {
    return DIWALI_CONFIG
  }
}

