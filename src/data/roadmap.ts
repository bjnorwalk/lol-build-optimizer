export type RoadmapStatus = 'completed' | 'partial' | 'next' | 'planned';

export type RoadmapItem = {
  title: string;
  status: RoadmapStatus;
  detail: string;
};

export type RoadmapSection = {
  category: string;
  items: RoadmapItem[];
};

export const roadmapSections: RoadmapSection[] = [
  {
    category: 'Core Data & Build System',
    items: [
      {
        title: 'All champion coverage',
        status: 'completed',
        detail: 'The required 172 champion roster is loaded and every champion receives a generated item path.'
      },
      {
        title: 'Starter, boots, core, late, and situational item sections',
        status: 'completed',
        detail: 'The recommender separates build sections and explains why each item is suggested.'
      },
      {
        title: 'Champion guide pages',
        status: 'completed',
        detail: 'Each champion has guide content with skill order, matchup tips, variants, timeline, and rune explanation state.'
      },
      {
        title: 'Source-checked meta builds',
        status: 'next',
        detail: 'The source-check workbench now tracks role coverage, shows a role-by-role verification matrix, filters missing champions by role, controls batch size, exports candidates, validates single or batch verified JSON, and copies TypeScript entries.'
      },
      {
        title: 'High-elo Riot aggregate build data',
        status: 'partial',
        detail: 'A capped Riot API preview samples Challenger ladder matches and groups champion/role/item builds with win rate and confidence.'
      },
      {
        title: 'Real win rate, pick rate, ban rate, and confidence',
        status: 'partial',
        detail: 'Every champion now has functional win rate, pick rate, ban rate, matches, confidence, and tier values from high-elo Riot samples, seeded samples, or clearly estimated fallback rows.'
      }
    ]
  },
  {
    category: 'Education & Context',
    items: [
      {
        title: 'Item explanations',
        status: 'completed',
        detail: 'Item cards include cleaned Riot stats plus app-generated recommendation reasons.'
      },
      {
        title: 'Rune and summoner spell display',
        status: 'completed',
        detail: 'Every champion gets spells, confidence/status badges, matchup swap notes, spell alternatives, full rune-board highlighting, rune alternatives, shard display, and source-review guidance.'
      },
      {
        title: 'Skill order and timeline guidance',
        status: 'completed',
        detail: 'The guide generator creates level-by-level order, max order, phase notes, and objective timing guidance.'
      },
      {
        title: 'Full matchup tables',
        status: 'completed',
        detail: 'The build page now shows hard, even, and strong matchup tables with champion icons, source tier context when available, local win-rate estimates, and matchup-specific advice.'
      }
    ]
  },
  {
    category: 'Riot API & Player Analytics',
    items: [
      {
        title: 'Riot ID lookup',
        status: 'completed',
        detail: 'The proxy loads account, summoner, ranked, mastery, match history, and match rows from Riot APIs.'
      },
      {
        title: 'Leaderboard lookup',
        status: 'completed',
        detail: 'The app can load apex leaderboard entries and show LP, wins/losses, win rate, and hot streaks.'
      },
      {
        title: 'Personal stat tracker',
        status: 'partial',
        detail: 'Profile dashboard now shows rank, LP, recent WR, KDA, CS/min, damage/min, vision/min, champion pool, mastery, roles, modes, match rows, last-5 trends, main role, best champion, active streak, match volume, timeline coverage, coaching notes, and next-game goals.'
      },
      {
        title: 'Personal build intelligence',
        status: 'partial',
        detail: 'Recent item builds are compared against the current recommendation with overlap, first-item, gap, discipline score, common item path, per-match differences, and action notes.'
      },
      {
        title: 'Post-game build auditor',
        status: 'partial',
        detail: 'The proxy now ingests match timelines and the UI audits item overlap, purchase timing, early deaths, gold, CS, spend efficiency, purchase timeline, and death windows.'
      }
    ]
  },
  {
    category: 'Modes, Meta, and Discovery',
    items: [
      {
        title: 'Ranked, Flex, Quickplay, Normal, ARAM, ARAM Mayhem, and Arena modes',
        status: 'completed',
        detail: 'The mode selector and external mode references are available in the UI.'
      },
      {
        title: 'Champion rankings and tier list',
        status: 'completed',
        detail: 'A U.GG-style in-app tier list ranks the roster with role filters, sortable win/pick/ban/match columns, counter picks, and champion quick-select.'
      },
      {
        title: 'Patch and meta tracking',
        status: 'completed',
        detail: 'The build page now shows a per-champion patch note card, while the Tools tab keeps the patch freshness dashboard, stale source-build detection, local patch acknowledgement, and patch/meta reference links.'
      },
      {
        title: 'Advanced search by playstyle, mechanics, items, and runes',
        status: 'completed',
        detail: 'The Discover tab searches champions by name, role, playstyle, mechanics, source/build items, and rune names using local Data Dragon and source-checked data.'
      }
    ]
  },
  {
    category: 'Creator, Community, and Product',
    items: [
      {
        title: 'Saved builds',
        status: 'completed',
        detail: 'Users can save and reload builds in localStorage.'
      },
      {
        title: 'Shareable build links and copied summaries',
        status: 'completed',
        detail: 'Current champion, role, state, mode, and enemies persist in the URL, and the hero copy button now exports a Discord-ready full build with starter, boots, core, spells, runes, situational items, and matchup context.'
      },
      {
        title: 'Drag-and-drop build creator',
        status: 'completed',
        detail: 'The Tools tab has a local build creator with item search, six-slot validation, drag-to-reorder, saved version history, import, clear, and JSON export.'
      },
      {
        title: 'Community submissions, comments, votes, and profiles',
        status: 'partial',
        detail: 'The Tools tab now includes an offline community prototype with local build submissions, votes, comments, author names, and champion-role filtering; auth, moderation, and public profiles remain backend work.'
      },
      {
        title: 'Desktop companion for LCU rune/item import',
        status: 'partial',
        detail: 'The Tools tab now generates browser-safe League item-set JSON for the current champion build; direct rune/item import still requires Electron or a native companion because the League Client API is local-only.'
      }
    ]
  }
];

export const roadmapStatusLabels: Record<RoadmapStatus, string> = {
  completed: 'Completed',
  partial: 'Partial',
  next: 'Next',
  planned: 'Planned'
};
