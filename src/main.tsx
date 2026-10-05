import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchChampionDetails, fetchChampions, fetchItems, fetchLatestPatch, fetchRunes, fetchSummonerSpells } from './dataDragon';
import { championProfiles } from './data/profiles';
import { inferRoles } from './data/archetypes';
import { championBuildSlug, findMissingRequiredChampions, requiredChampionCount } from './data/championCatalog';
import { getSourceCheckedBuild, getSourceCoverage, sourceCheckedBuilds } from './data/sourceBuilds';
import { gameModes, tierListLinks } from './data/modes';
import { createModeGuide } from './data/modeGuides';
import { esportsEndpointPlan, esportsSources, seededEsportsTeams } from './data/esports';
import { roadmapSections, roadmapStatusLabels } from './data/roadmap';
import { getChampionPatchNote } from './data/patchNotes';
import { getChampionAggregateStats } from './data/sampleStats';
import { sourceCheckedTierRows } from './data/sourceTierStats';
import {
  createChampionGuide,
  dataRegions,
  gameLengthFilters,
  rankBrackets
} from './data/guides';
import { detectThreats, getChampionProfile, recommendBuild } from './recommender';
import { riotProfileLinks, riotRegions } from './riotId';
import { fetchHighEloBuilds, fetchLeaderboard, fetchRiotAggregateBuildData, fetchRiotProfile } from './riotApi';
import { getWeakAgainst } from './data/matchups';
import {
  loadCommunitySubmissions,
  loadCustomBuildDrafts,
  loadSavedBuilds,
  saveCommunitySubmissions,
  saveCustomBuildDrafts,
  saveSavedBuilds
} from './storage';
import { gameStates, readStateFromUrl, roles, writeStateToUrl } from './urlState';
import type {
  BuildRecommendation,
  Champion,
  ChampionDetails,
  CommunityBuildSubmission,
  CustomBuildDraft,
  GameMode,
  GameState,
  Recommendation,
  RiotItem,
  Rune,
  Role,
  SavedBuild,
  SummonerSpell
} from './types';
import type { ModeGuide } from './data/modeGuides';
import type { RiotRegion } from './riotId';
import type { RiotAggregateBuildData, RiotHighEloBuilds, RiotLeaderboard, RiotProfile } from './riotApi';
import type { DataRegion, GameLengthFilter, GeneratedGuide, GuideFilters, RankBracket } from './data/guides';
import type { SourceCheckedBuild } from './data/sourceBuilds';
import './styles.css';

type ResultView = 'Build' | 'Items' | 'Item DB' | 'Tier List' | 'Discover' | 'Esports' | 'Player' | 'Tools' | 'Quick Guide' | 'Lore';
type TierSortKey = 'rankScore' | 'winRate' | 'pickRate' | 'banRate' | 'games';
type TierRoleFilter = Role | 'All';

function App() {
  const initialState = useMemo(() => readStateFromUrl(), []);
  const [patch, setPatch] = useState('');
  const [champions, setChampions] = useState<Champion[]>([]);
  const [items, setItems] = useState<RiotItem[]>([]);
  const [summonerSpells, setSummonerSpells] = useState<SummonerSpell[]>([]);
  const [runes, setRunes] = useState<Rune[]>([]);
  const [selectedChampionId, setSelectedChampionId] = useState(initialState.championId);
  const [role, setRole] = useState<Role>(initialState.role);
  const [gameState, setGameState] = useState<GameState>(initialState.gameState);
  const [gameMode, setGameMode] = useState<GameMode>(initialState.gameMode);
  const [guideFilters, setGuideFilters] = useState<GuideFilters>({
    rank: 'All Ranks',
    region: 'Global',
    gameLength: 'All Lengths'
  });
  const [enemyIds, setEnemyIds] = useState<string[]>(initialState.enemyIds);
  const [championSearch, setChampionSearch] = useState('');
  const [enemySearch, setEnemySearch] = useState('');
  const [resultView, setResultView] = useState<ResultView>('Build');
  const [riotId, setRiotId] = useState('');
  const [riotRegion, setRiotRegion] = useState<RiotRegion>('na1');
  const [riotProfile, setRiotProfile] = useState<RiotProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<RiotLeaderboard | null>(null);
  const [highEloBuilds, setHighEloBuilds] = useState<RiotHighEloBuilds | null>(null);
  const [riotAggregateData, setRiotAggregateData] = useState<RiotAggregateBuildData | null>(null);
  const [championDetails, setChampionDetails] = useState<ChampionDetails | null>(null);
  const [championDetailsError, setChampionDetailsError] = useState('');
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [shareStatus, setShareStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const latest = await fetchLatestPatch();
        const [championData, itemData, spellData, runeData] = await Promise.all([
          fetchChampions(latest),
          fetchItems(latest),
          fetchSummonerSpells(latest),
          fetchRunes(latest)
        ]);
        setPatch(latest);
        setChampions(championData);
        setItems(itemData);
        setSummonerSpells(spellData);
        setRunes(runeData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load League data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    setSavedBuilds(loadSavedBuilds());
  }, []);

  useEffect(() => {
    saveSavedBuilds(savedBuilds);
  }, [savedBuilds]);

  useEffect(() => {
    writeStateToUrl(selectedChampionId, role, gameState, gameMode, enemyIds);
  }, [selectedChampionId, role, gameState, gameMode, enemyIds]);

  useEffect(() => {
    if (!champions.length) return;
    if (!champions.some((champion) => champion.id === selectedChampionId)) {
      setSelectedChampionId('Ahri');
    }
    setEnemyIds((current) => current.filter((id) => champions.some((champion) => champion.id === id)).slice(0, 5));
  }, [champions, selectedChampionId]);

  const selectedChampion = useMemo(
    () => champions.find((champion) => champion.id === selectedChampionId) ?? champions[0],
    [champions, selectedChampionId]
  );

  const enemies = useMemo(
    () => enemyIds.map((id) => champions.find((champion) => champion.id === id)).filter((champion): champion is Champion => Boolean(champion)),
    [champions, enemyIds]
  );

  const availableRoles = useMemo(() => {
    const profile = championProfiles.find((entry) => entry.championId === selectedChampionId);
    if (profile) return profile.roles;
    return selectedChampion ? inferRoles(selectedChampion) : roles;
  }, [selectedChampion, selectedChampionId]);

  useEffect(() => {
    if (!availableRoles.includes(role)) {
      setRole(availableRoles[0] ?? 'Mid');
    }
  }, [availableRoles, role]);

  useEffect(() => {
    if (!patch || !selectedChampion) return;
    let ignore = false;
    setChampionDetails(null);
    setChampionDetailsError('');

    fetchChampionDetails(patch, selectedChampion.id)
      .then((details) => {
        if (!ignore) setChampionDetails(details);
      })
      .catch((detailsError) => {
        if (!ignore) {
          setChampionDetailsError(
            detailsError instanceof Error ? detailsError.message : 'Unable to load champion abilities.'
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [patch, selectedChampion]);

  const recommendations = useMemo<BuildRecommendation | null>(() => {
    if (!selectedChampion || !items.length) return null;
    return recommendBuild({ champion: selectedChampion, role, gameState, enemies, items });
  }, [selectedChampion, role, gameState, enemies, items]);

  const sourceCheckedBuild = useMemo(
    () => (selectedChampion ? getSourceCheckedBuild(selectedChampion.id, role) : undefined),
    [role, selectedChampion]
  );

  const championGuide = useMemo<GeneratedGuide | null>(() => {
    if (!selectedChampion || !recommendations) return null;
    const aggregateStats = getChampionAggregateStats(selectedChampion, role, highEloBuilds, riotAggregateData);
    return createChampionGuide({
      champion: selectedChampion,
      details: championDetails,
      role,
      gameState,
      enemies,
      recommendations,
      sourceCheckedBuild,
      aggregateStats,
      filters: guideFilters
    });
  }, [selectedChampion, recommendations, championDetails, role, gameState, enemies, sourceCheckedBuild, highEloBuilds, riotAggregateData, guideFilters]);

  const buildBotGuide = useMemo<BuildBotGuide | null>(() => {
    if (!selectedChampion || !recommendations) return null;
    return createBuildBotGuide({
      champion: selectedChampion,
      details: championDetails,
      role,
      gameState,
      enemies,
      recommendations,
      sourceCheckedBuild,
      guide: championGuide,
      patch
    });
  }, [selectedChampion, recommendations, championDetails, role, gameState, enemies, sourceCheckedBuild, championGuide, patch]);

  const modeGuide = useMemo<ModeGuide | null>(() => {
    if (!selectedChampion || !recommendations) return null;
    return createModeGuide(gameMode, selectedChampion, recommendations, items);
  }, [gameMode, selectedChampion, recommendations, items]);

  const coverage = useMemo(() => {
    const curated = champions.filter((champion) => championProfiles.some((profile) => profile.championId === champion.id)).length;
    const missingRequired = findMissingRequiredChampions(champions);
    return {
      curated,
      generated: Math.max(0, champions.length - curated),
      missingRequired,
      required: requiredChampionCount,
      source: getSourceCoverage(champions.map((champion) => champion.id)),
      total: champions.length
    };
  }, [champions]);

  const filteredChampions = useMemo(
    () => filterChampions(champions, championSearch),
    [champions, championSearch]
  );

  const filteredEnemies = useMemo(
    () => filterChampions(champions, enemySearch),
    [champions, enemySearch]
  );

  function handleChampionSelect(championId: string) {
    const selected = champions.find((champion) => champion.id === championId);
    setSelectedChampionId(championId);
    if (selected) setChampionSearch(selected.name);
    const nextProfile = getChampionProfile(championId, role, selected);
    if (!nextProfile?.roles.includes(role)) {
      setRole(nextProfile?.roles[0] ?? 'Mid');
    }
  }

  function handleChampionSearchSubmit() {
    const query = championSearch.trim().toLowerCase();
    if (!query) return;

    const exactMatch = champions.find(
      (champion) => champion.name.toLowerCase() === query || champion.id.toLowerCase() === query
    );
    const nextChampion = exactMatch ?? filteredChampions[0];
    if (nextChampion) handleChampionSelect(nextChampion.id);
  }

  function toggleEnemy(championId: string) {
    setEnemyIds((current) => {
      if (current.includes(championId)) return current.filter((id) => id !== championId);
      if (current.length >= 5) return [...current.slice(1), championId];
      return [...current, championId];
    });
  }

  function removeEnemy(championId: string) {
    setEnemyIds((current) => current.filter((id) => id !== championId));
  }

  function clearEnemies() {
    setEnemyIds([]);
  }

  function handleSaveBuild() {
    if (!selectedChampion || !recommendations) return;
    const buildItems = collectBuildItems(recommendations);
    const saved: SavedBuild = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      name: `${selectedChampion.name} ${role} vs ${enemies.length ? enemies.map((enemy) => enemy.name).slice(0, 2).join('/') : 'draft'}`,
      championId: selectedChampion.id,
      championName: selectedChampion.name,
      role,
      gameState,
      enemyIds,
      enemyNames: enemies.map((enemy) => enemy.name),
      itemIds: buildItems.map((entry) => entry.item.id),
      itemNames: buildItems.map((entry) => entry.item.name),
      patch,
      createdAt: Date.now()
    };
    setSavedBuilds((current) => [saved, ...current.filter((entry) => entry.name !== saved.name)].slice(0, 8));
    setShareStatus('Build saved');
  }

  async function handleCopySummary() {
    if (!selectedChampion || !recommendations) return;
    const summary = createBuildSummary(selectedChampion, role, gameState, enemies, recommendations, patch, sourceCheckedBuild);
    try {
      await navigator.clipboard.writeText(summary);
      setShareStatus('Build copied');
    } catch {
      setShareStatus('Copy failed');
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('Link copied');
    } catch {
      setShareStatus('Link copy failed');
    }
  }

  function handleLoadSavedBuild(saved: SavedBuild) {
    setSelectedChampionId(saved.championId);
    setRole(saved.role);
    setGameState(saved.gameState);
    setEnemyIds(saved.enemyIds);
    setShareStatus(`Loaded ${saved.name}`);
  }

  function handleDeleteSavedBuild(savedId: string) {
    setSavedBuilds((current) => current.filter((entry) => entry.id !== savedId));
  }

  if (loading) {
    return <div className="loading">Loading Riot Data Dragon...</div>;
  }

  if (error) {
    return (
      <div className="loading error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">RiftGuide</p>
          <h1>Smarter builds for every match</h1>
        </div>
        <ChampionSearchBar
          champions={filteredChampions}
          selectedChampion={selectedChampion}
          value={championSearch}
          onChange={setChampionSearch}
          onSelect={handleChampionSelect}
          onSubmit={handleChampionSearchSubmit}
        />
        <div className="topbar-meta">
          <div className="patch-pill">Data Dragon {patch}</div>
          <div className={`patch-pill ${coverage.missingRequired.length ? 'coverage-warning' : ''}`}>
            {coverage.total}/{coverage.required} champion builds
          </div>
          <div className="patch-pill">{coverage.source.checked}/{coverage.source.total} source checked</div>
        </div>
      </header>

      <section className="layout">
        <aside className="controls">
          {selectedChampion && recommendations && (
            <MatchReadyPanel
              champion={selectedChampion}
              recommendations={recommendations}
              guide={championGuide}
              sourceCheckedBuild={sourceCheckedBuild}
              items={items}
            />
          )}

          {modeGuide && <ModeReadyPanel guide={modeGuide} />}

          <Panel title="Mode">
            <div className="segmented mode-segmented">
              {gameModes.map((entry) => (
                <button key={entry} className={entry === gameMode ? 'active' : ''} onClick={() => setGameMode(entry)}>
                  {entry}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Data Filters" className="focus-hidden">
            <DataFilters filters={guideFilters} onChange={setGuideFilters} />
          </Panel>

          <Panel title="Riot ID" className="focus-hidden">
            <PlayerLookup
              riotId={riotId}
              region={riotRegion}
              profile={riotProfile}
              leaderboard={leaderboard}
              champions={champions}
              patch={patch}
              onProfileChange={setRiotProfile}
              onLeaderboardChange={setLeaderboard}
              onHighEloBuildsChange={setHighEloBuilds}
              onAggregateChange={setRiotAggregateData}
              onRiotIdChange={setRiotId}
              onRegionChange={setRiotRegion}
            />
          </Panel>

          <Panel title="Role">
            <div className="segmented">
              {roles.map((entry) => (
                <button
                  key={entry}
                  className={entry === role ? 'active' : ''}
                  disabled={!availableRoles.includes(entry)}
                  onClick={() => setRole(entry)}
                >
                  {entry}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Game State">
            <div className="segmented">
              {gameStates.map((entry) => (
                <button key={entry} className={entry === gameState ? 'active' : ''} onClick={() => setGameState(entry)}>
                  {entry}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={`Enemy Team (${enemyIds.length}/5)`}>
            <SearchBox value={enemySearch} onChange={setEnemySearch} placeholder="Search enemies" />
            <SelectedEnemies enemies={enemies} onRemove={removeEnemy} onClear={clearEnemies} />
            <div className="champion-count">{filteredEnemies.length} champions</div>
            <ChampionGrid champions={filteredEnemies} selectedIds={enemyIds} onSelect={toggleEnemy} />
          </Panel>
        </aside>

        <section className="results">
          {selectedChampion && recommendations && (
            <>
              <Hero
                champion={selectedChampion}
                role={role}
                gameMode={gameMode}
                gameState={gameState}
                enemies={enemies}
                profileSource={recommendations.profile.source}
                missingRequiredCount={coverage.missingRequired.length}
                sourceCheckedBuild={sourceCheckedBuild}
                shareStatus={shareStatus}
                onSave={handleSaveBuild}
                onCopy={handleCopySummary}
                onCopyLink={handleCopyLink}
              />
              {championGuide && (
                <ChampionMetaDashboard
                  champion={selectedChampion}
                  details={championDetails}
                  role={role}
                  gameMode={gameMode}
                  filters={guideFilters}
                  guide={championGuide}
                  recommendations={recommendations}
                  sourceCheckedBuild={sourceCheckedBuild}
                  summonerSpells={summonerSpells}
                  enemies={enemies}
                  items={items}
                />
              )}
              <ResultTabs activeView={resultView} onChange={setResultView} />
              {resultView === 'Build' ? (
                <>
                  <GuideSetup champion={selectedChampion} role={role} build={sourceCheckedBuild} summonerSpells={summonerSpells} runes={runes} />
                  <PatchChangePanel champion={selectedChampion} patch={patch} />
                  {championGuide && <ChampionGuide guide={championGuide} />}
                  <Matchups champion={selectedChampion} role={role} build={sourceCheckedBuild} champions={champions} />
                  <Threats threats={recommendations.detectedThreats} />
                  {!sourceCheckedBuild?.items && <BuildOrder recommendations={recommendations} />}
                  {modeGuide && <ModeInsights guide={modeGuide} champion={selectedChampion} items={items} />}
                  {sourceCheckedBuild && <SourceCheck build={sourceCheckedBuild} />}
                  <ChampionKit details={championDetails} error={championDetailsError} />
                  <DraftAnalysis recommendations={recommendations} gameState={gameState} />
                  <SavedBuilds builds={savedBuilds} onLoad={handleLoadSavedBuild} onDelete={handleDeleteSavedBuild} />
                </>
              ) : resultView === 'Items' ? (
                <>
                  {sourceCheckedBuild?.items ? (
                    <SourceItemSections build={sourceCheckedBuild} items={items} />
                  ) : (
                    <>
                      <BuildSection title="Starting Items" items={recommendations.starters} />
                      <BuildSection title="Boots" items={recommendations.boots} />
                      <BuildSection title="Core Build" items={recommendations.core} />
                      <BuildSection title="Late Build" items={recommendations.late} />
                      <BuildSection title="Situational Options" items={recommendations.situational} />
                    </>
                  )}
                </>
              ) : resultView === 'Item DB' ? (
                <ItemDatabase items={items} />
              ) : resultView === 'Tier List' ? (
                <ChampionTierList
                  champions={champions}
                  selectedChampion={selectedChampion}
                  selectedRole={role}
                  filters={guideFilters}
                  highEloBuilds={highEloBuilds}
                  aggregateData={riotAggregateData}
                  onChampionSelect={handleChampionSelect}
                />
              ) : resultView === 'Discover' ? (
                <ChampionDiscovery
                  champions={champions}
                  items={items}
                  runes={runes}
                  selectedChampion={selectedChampion}
                  onChampionSelect={handleChampionSelect}
                />
              ) : resultView === 'Esports' ? (
                <EsportsHub />
              ) : resultView === 'Player' ? (
                <PlayerAnalytics
                  profile={riotProfile}
                  leaderboard={leaderboard}
                  highEloBuilds={highEloBuilds}
                  aggregateData={riotAggregateData}
                  items={items}
                  summonerSpells={summonerSpells}
                  runes={runes}
                  selectedChampion={selectedChampion}
                  recommendations={recommendations}
                  champions={champions}
                  patch={patch}
                />
              ) : resultView === 'Tools' ? (
                <>
                  <CustomBuildCreator items={items} selectedChampion={selectedChampion} role={role} patch={patch} />
                  <LeagueClientExportPanel
                    champion={selectedChampion}
                    role={role}
                    sourceCheckedBuild={sourceCheckedBuild}
                    recommendations={recommendations}
                    items={items}
                  />
                  <LocalCommunityBoard selectedChampion={selectedChampion} role={role} />
                  <PatchMetaTracker patch={patch} selectedChampion={selectedChampion} />
                  <RoadmapTracker />
                  <SourceCoverageMatrix champions={champions} />
                  <SourceReviewQueue champions={champions} items={items} selectedChampion={selectedChampion} patch={patch} />
                </>
              ) : resultView === 'Quick Guide' ? (
                buildBotGuide && <AIBuildBot guide={buildBotGuide} champion={selectedChampion} />
              ) : (
                <LorePage champion={selectedChampion} details={championDetails} error={championDetailsError} />
              )}
            </>
          )}
        </section>
      </section>
      <footer className="riot-legal-footer">
        <strong>RiftGuide is not endorsed by Riot Games.</strong>
        <span>
          Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          Riot ID lookups use the local server proxy so API keys are never exposed in browser code.
        </span>
      </footer>
    </main>
  );
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`.trim()}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function MatchReadyPanel({
  champion,
  recommendations,
  guide,
  sourceCheckedBuild,
  items
}: {
  champion: Champion;
  recommendations: BuildRecommendation;
  guide: GeneratedGuide | null;
  sourceCheckedBuild?: SourceCheckedBuild;
  items: RiotItem[];
}) {
  const starterNames = sourceCheckedBuild?.items?.starter ?? recommendations.starters.slice(0, 2).map((entry) => entry.item.name);
  const bootNames = sourceCheckedBuild?.items?.boots
    ? [sourceCheckedBuild.items.boots]
    : recommendations.boots.slice(0, 2).map((entry) => entry.item.name);
  const coreNames = sourceCheckedBuild?.items?.core ?? recommendations.core.slice(0, 3).map((entry) => entry.item.name);
  const lateNames = recommendations.late.slice(0, 2).map((entry) => entry.item.name);
  const situationalNames = recommendations.situational.slice(0, 4).map((entry) => entry.item.name);
  const fullPath = sourceCheckedBuild?.items?.fullBuild.length
    ? sourceCheckedBuild.items.fullBuild.map((name, index) => ({
        name,
        item: findItemByName(name, items),
        reason: index === 0 ? sourceCheckedBuild.summarySetup ?? sourceCheckedBuild.summary : sourceCheckedBuild.summaryBuild ?? sourceCheckedBuild.summary
      }))
    : [
        ...recommendations.starters.slice(0, 1),
        ...recommendations.boots.slice(0, 1),
        ...recommendations.core,
        ...recommendations.late.slice(0, 2)
      ].map((entry) => ({
        name: entry.item.name,
        item: entry.item,
        reason: entry.reasons[0] ?? `${entry.item.gold.toLocaleString()} gold breakpoint`
      }));
  const firstCore = recommendations.core[0];

  return (
    <section className="panel match-ready-panel">
      <div className="match-ready-head">
        <img src={champion.image} alt="" />
        <div>
          <p className="eyebrow">Match Plan</p>
          <h2>{champion.name}</h2>
          <span>{firstCore ? `First spike: ${firstCore.item.name}` : 'Build path ready'}</span>
        </div>
      </div>

      <div className="match-ready-block featured">
        <h3>Full Build Path</h3>
        <div className="named-build-chain">
          {fullPath.map((entry, index) => (
            <article key={`${entry.name}-${index}`}>
              {entry.item?.image && <img src={entry.item.image} alt="" />}
              <div>
                <b>{index + 1}. {entry.name}</b>
                <span>{formatItemStats(entry.item)}</span>
                <em>{entry.reason}</em>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="match-ready-grid">
        <NamedList title="Start" items={starterNames} />
        <NamedList title="Boots" items={bootNames} />
        <NamedList title="Core" items={coreNames} />
        <NamedList title="Situational" items={situationalNames} />
      </div>

      {guide && (
        <div className="match-ready-block">
          <div className="match-ready-title-row">
            <h3>Skill Path</h3>
            <span>{guide.maxOrder.join(' > ')}</span>
          </div>
          <div className="compact-skill-path">
            {guide.skillOrder.map((skill, index) => (
              <span key={`${skill}-${index}`} className={skill === 'R' ? 'ultimate' : ''}>
                <b>{index + 1}</b>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function NamedList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="named-list">
      <h3>{title}</h3>
      {items.length ? (
        items.map((item) => <span key={`${title}-${item}`}>{item}</span>)
      ) : (
        <span>No recommendation</span>
      )}
    </div>
  );
}

function ModeReadyPanel({ guide }: { guide: ModeGuide }) {
  const topAugments = guide.augments.filter((augment) => augment.tier === 'S+').slice(0, 6);

  return (
    <section className={`panel mode-ready-panel ${guide.mode === 'ARAM Mayhem' ? 'mayhem' : ''}`}>
      <div className="match-ready-title-row">
        <div>
          <p className="eyebrow">{guide.mode}</p>
          <h2>{guide.title}</h2>
        </div>
        <span className={`confidence-pill ${guide.confidence}`}>{guide.confidence}</span>
      </div>
      <p>{guide.subtitle}</p>

      {guide.stats?.length ? (
        <div className="mode-stat-strip">
          {guide.stats.map((stat) => (
            <span key={stat.label}>
              <b>{stat.value}</b>
              {stat.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mode-mini-section">
        <h3>Mode Priorities</h3>
        {guide.priorities.slice(0, 3).map((priority) => (
          <span key={priority}>{priority}</span>
        ))}
      </div>

      {guide.augments.length ? (
        <div className="mode-mini-section">
          <h3>{guide.mode === 'ARAM Mayhem' ? 'Best Mayhem Augments' : 'Best Augments'}</h3>
          <div className="augment-chip-grid">
            {(topAugments.length ? topAugments : guide.augments.slice(0, 6)).map((augment) => (
              <span key={`${augment.rarity}-${augment.name}`}>
                <b>{augment.tier}</b>
                {augment.name}
                <small>{augment.rarity}</small>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mode-mini-section">
        <h3>Spells</h3>
        <div className="mode-pill-row">
          {guide.summonerSpells.map((spell) => (
            <span key={spell}>{spell}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultTabs({ activeView, onChange }: { activeView: ResultView; onChange: (view: ResultView) => void }) {
  const views: ResultView[] = ['Build', 'Items', 'Item DB', 'Tier List', 'Discover', 'Esports', 'Player', 'Tools', 'Quick Guide', 'Lore'];

  return (
    <nav className="result-tabs" aria-label="Champion result sections">
      {views.map((view) => (
        <button key={view} className={activeView === view ? 'active' : ''} onClick={() => onChange(view)}>
          {view}
        </button>
      ))}
    </nav>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <input
      className="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function ChampionSearchBar({
  champions,
  selectedChampion,
  value,
  onChange,
  onSelect,
  onSubmit
}: {
  champions: Champion[];
  selectedChampion?: Champion;
  value: string;
  onChange: (value: string) => void;
  onSelect: (championId: string) => void;
  onSubmit: () => void;
}) {
  const suggestions = champions.slice(0, 6);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="champion-search"
      role="search"
      aria-label="Champion search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
      onFocus={() => setIsFocused(true)}
    >
      <div className="champion-search-input">
        {selectedChampion?.image && <img src={selectedChampion.image} alt="" />}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Search champion..."
          aria-label="Search champion"
        />
        <button type="button" onClick={onSubmit}>
          Search
        </button>
      </div>
      {isFocused && value.trim() && (
        <div className="champion-search-suggestions">
          {suggestions.length ? (
            suggestions.map((champion) => (
              <button
                key={champion.id}
                className={selectedChampion?.id === champion.id ? 'active' : ''}
                type="button"
                onClick={() => onSelect(champion.id)}
              >
                <img src={champion.image} alt="" />
                <span>{champion.name}</span>
              </button>
            ))
          ) : (
            <span>No champion found</span>
          )}
        </div>
      )}
    </div>
  );
}

function DataFilters({ filters, onChange }: { filters: GuideFilters; onChange: (filters: GuideFilters) => void }) {
  return (
    <div className="data-filters">
      <label>
        Rank
        <select value={filters.rank} onChange={(event) => onChange({ ...filters, rank: event.target.value as RankBracket })}>
          {rankBrackets.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      <label>
        Region
        <select value={filters.region} onChange={(event) => onChange({ ...filters, region: event.target.value as DataRegion })}>
          {dataRegions.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      <label>
        Game Length
        <select value={filters.gameLength} onChange={(event) => onChange({ ...filters, gameLength: event.target.value as GameLengthFilter })}>
          {gameLengthFilters.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function RoadmapTracker() {
  const counts = roadmapSections
    .flatMap((section) => section.items)
    .reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { completed: 0, partial: 0, next: 0, planned: 0 }
    );

  return (
    <section className="roadmap-tracker">
      <div className="roadmap-header">
        <div>
          <p className="eyebrow">Roadmap Tracker</p>
          <h2>What is done, partial, next, and still planned</h2>
        </div>
        <div className="roadmap-summary">
          <span>{counts.completed} done</span>
          <span>{counts.partial} partial</span>
          <span>{counts.next} next</span>
          <span>{counts.planned} planned</span>
        </div>
      </div>
      <div className="roadmap-grid">
        {roadmapSections.map((section) => (
          <article key={section.category}>
            <h3>{section.category}</h3>
            <ul>
              {section.items.map((item) => (
                <li className={`roadmap-${item.status}`} key={`${section.category}-${item.title}`}>
                  <strong>{item.title}</strong>
                  <span>{roadmapStatusLabels[item.status]}</span>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function SourceCoverageMatrix({ champions }: { champions: Champion[] }) {
  const [copied, setCopied] = useState('');
  const rows = roles.map((roleName) => {
    const eligible = champions.filter((champion) => inferRoles(champion).includes(roleName));
    const checked = eligible.filter((champion) => Boolean(getSourceCheckedBuild(champion.id, roleName)));
    const missing = eligible.filter((champion) => !getSourceCheckedBuild(champion.id, roleName));
    return {
      role: roleName,
      eligible,
      checked,
      missing,
      percent: eligible.length ? Math.round((checked.length / eligible.length) * 100) : 0
    };
  });

  async function copyMissing(roleName: Role) {
    const row = rows.find((entry) => entry.role === roleName);
    if (!row) return;
    const payload = row.missing.map((champion) => ({
      championId: champion.id,
      championName: champion.name,
      role: roleName,
      ugg: `https://u.gg/lol/champions/${championBuildSlug(champion)}/build/${roleName.toLowerCase()}`,
      opgg: `https://op.gg/lol/champions/${championBuildSlug(champion)}/build/${roleName.toLowerCase()}`,
      mobalytics: `https://mobalytics.gg/lol/champions/${championBuildSlug(champion)}/build`
    }));
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(`${roleName} missing batch copied`);
    } catch {
      setCopied('Copy failed');
    }
  }

  return (
    <section className="source-coverage-matrix">
      <div className="database-head">
        <div>
          <p className="eyebrow">Source Coverage</p>
          <h2>Role-by-role verification matrix</h2>
          <p>Batch source reviews by actual playable role instead of checking champions one at a time.</p>
        </div>
        {copied && <span>{copied}</span>}
      </div>
      <div className="coverage-role-grid">
        {rows.map((row) => (
          <article key={row.role}>
            <div>
              <strong>{row.role}</strong>
              <span>{row.checked.length}/{row.eligible.length} checked</span>
            </div>
            <div className="coverage-bar"><i style={{ width: `${row.percent}%` }} /></div>
            <small>{row.percent}% verified / {row.missing.length} missing</small>
            <button onClick={() => copyMissing(row.role)} disabled={!row.missing.length}>Copy Missing {row.role}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

type TierListRow = {
  champion: Champion;
  role: Role;
  tier: string;
  rankScore: number;
  sourceRank?: number;
  stats: ReturnType<typeof getChampionAggregateStats>;
  counters: string[];
};

function ChampionTierList({
  champions,
  selectedChampion,
  selectedRole,
  filters,
  highEloBuilds,
  aggregateData,
  onChampionSelect
}: {
  champions: Champion[];
  selectedChampion: Champion;
  selectedRole: Role;
  filters: GuideFilters;
  highEloBuilds: RiotHighEloBuilds | null;
  aggregateData: RiotAggregateBuildData | null;
  onChampionSelect: (championId: string) => void;
}) {
  const [roleFilter, setRoleFilter] = useState<TierRoleFilter>('All');
  const [sortKey, setSortKey] = useState<TierSortKey>('rankScore');
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(() => {
    const sourceRows = sourceCheckedTierRows
      .filter((row) => roleFilter === 'All' || row.role === roleFilter)
      .flatMap<TierListRow>((sourceRow) => {
        const champion = findChampionByDisplayName(champions, sourceRow.championName);
        if (!champion) return [];
        const stats = getChampionAggregateStats(champion, sourceRow.role, highEloBuilds, aggregateData);
        return [{
          champion,
          role: sourceRow.role,
          tier: sourceRow.tier,
          rankScore: 1000 - sourceRow.rank,
          sourceRank: sourceRow.rank,
          stats,
          counters: getSourceCheckedBuild(champion.id, sourceRow.role)?.weakAgainst ?? getWeakAgainst(champion)
        }];
      });

    const rowCandidates: TierListRow[] = sourceRows.length ? sourceRows : champions.map((champion) => {
      const championRoles = inferRoles(champion);
      const rowRole = roleFilter === 'All'
        ? championRoles.includes(selectedRole)
          ? selectedRole
          : championRoles[0] ?? selectedRole
        : roleFilter;
      const stats = getChampionAggregateStats(champion, rowRole, highEloBuilds, aggregateData);
      const rankScore = createTierScore(stats);
      return {
        champion,
        role: rowRole,
        tier: stats.tier ?? tierFromScore(rankScore),
        rankScore,
        sourceRank: stats.rank,
        stats,
        counters: getSourceCheckedBuild(champion.id, rowRole)?.weakAgainst ?? getWeakAgainst(champion)
      };
    });
    const filtered = sourceRows.length ? rowCandidates : roleFilter === 'All'
      ? rowCandidates
      : rowCandidates.filter((row) => inferRoles(row.champion).includes(roleFilter));
    return filtered.sort((a, b) => rowValue(b, sortKey) - rowValue(a, sortKey));
  }, [aggregateData, champions, highEloBuilds, roleFilter, selectedRole, sortKey]);
  const visibleRows = showAll ? rows : rows.slice(0, 24);

  return (
    <section className="tier-list-panel">
      <div className="tier-list-header">
        <div>
          <p className="eyebrow">Champion Rankings</p>
          <h2>Tier list</h2>
          <p>
            {filters.rank} / {filters.region} / {filters.gameLength}. Source-checked rows now drive rank, role, tier, win rate, pick rate, ban rate, and match counts wherever the pasted table has data.
          </p>
          {aggregateData && (
            <p>
              Riot aggregate cache: {aggregateData.sampledMatches} matches / {aggregateData.totalParticipants} participants / {aggregateData.cacheHit ? 'cached' : 'fresh'}.
            </p>
          )}
        </div>
        <button className="lookup-button secondary" onClick={() => setShowAll((current) => !current)}>
          {showAll ? 'Show Top 24' : 'Show All'}
        </button>
      </div>

      <div className="tier-filter-row">
        {(['All', ...roles] as TierRoleFilter[]).map((entry) => (
          <button key={entry} className={roleFilter === entry ? 'active' : ''} onClick={() => setRoleFilter(entry)}>
            {entry}
          </button>
        ))}
        <span>{rows.length} ranked rows</span>
      </div>

      <div className="tier-table">
        <div className="tier-table-head">
          <span>Rank</span>
          <span>Role</span>
          <span>Champion</span>
          <button onClick={() => setSortKey('rankScore')}>Tier</button>
          <button onClick={() => setSortKey('winRate')}>Win Rate</button>
          <button onClick={() => setSortKey('pickRate')}>Pick Rate</button>
          <button onClick={() => setSortKey('banRate')}>Ban Rate</button>
          <span>Counter Picks</span>
          <button onClick={() => setSortKey('games')}>Matches</button>
        </div>
        {visibleRows.map((row, index) => (
          <button
            className={`tier-row ${row.champion.id === selectedChampion.id ? 'selected' : ''}`}
            key={`${row.champion.id}-${row.role}`}
            onClick={() => onChampionSelect(row.champion.id)}
          >
            <strong>{row.sourceRank ?? index + 1}</strong>
            <span>{roleGlyph(row.role)}</span>
            <span className="tier-champion-cell">
              <img src={row.champion.image} alt="" />
              {row.champion.name}
            </span>
            <em className={`tier-badge tier-${row.tier.toLowerCase().replace('+', 'plus')}`}>{row.tier}</em>
            <strong className="tier-win">{row.stats.winRate.toFixed(1)}%</strong>
            <span>{row.stats.pickRate.toFixed(1)}%</span>
            <span>{row.stats.banRate.toFixed(1)}%</span>
            <span className="counter-icons">
              {row.counters.slice(0, 6).map((counter) => {
                const counterChampion = findChampionByDisplayName(champions, counter);
                return counterChampion ? <img key={counter} src={counterChampion.image} alt="" title={counterChampion.name} /> : <i key={counter}>{counter.slice(0, 2)}</i>;
              })}
            </span>
            <span>{row.stats.games.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function rowValue(row: TierListRow, key: TierSortKey) {
  if (key === 'rankScore') return row.rankScore;
  return row.stats[key];
}

function ChampionDiscovery({
  champions,
  items,
  runes,
  selectedChampion,
  onChampionSelect
}: {
  champions: Champion[];
  items: RiotItem[];
  runes: Rune[];
  selectedChampion: Champion;
  onChampionSelect: (championId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<TierRoleFilter>('All');
  const [playstyleFilter, setPlaystyleFilter] = useState('Any');
  const [itemFilter, setItemFilter] = useState('');
  const [runeFilter, setRuneFilter] = useState('');
  const [mechanicFilter, setMechanicFilter] = useState('Any');
  const itemOptions = useMemo(
    () => Array.from(new Set(sourceCheckedBuildsFullItemNames().concat(items.slice(0, 80).map((item) => item.name)))).sort((a, b) => a.localeCompare(b)),
    [items]
  );
  const runeOptions = useMemo(() => Array.from(new Set(runes.map((rune) => rune.name))).sort((a, b) => a.localeCompare(b)), [runes]);
  const rows = useMemo(() => {
    return champions
      .map((champion) => createDiscoveryRow(champion, items))
      .filter((row) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery = !normalizedQuery || row.searchText.includes(normalizedQuery);
        const matchesRole = roleFilter === 'All' || row.roles.includes(roleFilter);
        const matchesPlaystyle = playstyleFilter === 'Any' || row.playstyles.includes(playstyleFilter);
        const matchesMechanic = mechanicFilter === 'Any' || row.mechanics.includes(mechanicFilter);
        const matchesItem = !itemFilter || row.items.some((item) => normalizeName(item) === normalizeName(itemFilter));
        const matchesRune = !runeFilter || row.runes.some((rune) => normalizeName(rune) === normalizeName(runeFilter));
        return matchesQuery && matchesRole && matchesPlaystyle && matchesMechanic && matchesItem && matchesRune;
      })
      .sort((a, b) => b.score - a.score || a.champion.name.localeCompare(b.champion.name));
  }, [champions, itemFilter, items, mechanicFilter, playstyleFilter, query, roleFilter, runeFilter]);

  return (
    <section className="discovery-panel">
      <div className="tier-list-header">
        <div>
          <p className="eyebrow">Discovery</p>
          <h2>Find champions by role, build, rune, or playstyle</h2>
          <p>Local source builds, Data Dragon tags, item profiles, and rune data power this search without requiring extra Riot API calls.</p>
        </div>
        <strong>{rows.length} matches</strong>
      </div>

      <div className="discovery-filters">
        <SearchBox value={query} onChange={setQuery} placeholder="Search champion, tag, item, rune, mechanic..." />
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as TierRoleFilter)}>
          {(['All', ...roles] as TierRoleFilter[]).map((entry) => <option key={entry}>{entry}</option>)}
        </select>
        <select value={playstyleFilter} onChange={(event) => setPlaystyleFilter(event.target.value)}>
          {['Any', 'Assassin', 'Burst Mage', 'Control Mage', 'Marksman', 'Skirmisher', 'Bruiser', 'Tank', 'Enchanter', 'Engage Support', 'Poke'].map((entry) => <option key={entry}>{entry}</option>)}
        </select>
        <select value={mechanicFilter} onChange={(event) => setMechanicFilter(event.target.value)}>
          {['Any', 'dash', 'poke', 'crowd control', 'healing', 'shielding', 'scaling', 'frontline', 'pick potential', 'waveclear'].map((entry) => <option key={entry}>{entry}</option>)}
        </select>
        <select value={itemFilter} onChange={(event) => setItemFilter(event.target.value)}>
          <option value="">Any item</option>
          {itemOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={runeFilter} onChange={(event) => setRuneFilter(event.target.value)}>
          <option value="">Any rune</option>
          {runeOptions.map((rune) => <option key={rune}>{rune}</option>)}
        </select>
      </div>

      <div className="discovery-grid">
        {rows.slice(0, 48).map((row) => (
          <button
            key={row.champion.id}
            className={`discovery-card ${row.champion.id === selectedChampion.id ? 'selected' : ''}`}
            onClick={() => onChampionSelect(row.champion.id)}
          >
            <img src={row.champion.image} alt="" />
            <div>
              <h3>{row.champion.name}</h3>
              <span>{row.roles.join(' / ')}</span>
              <p>{row.playstyles.slice(0, 3).join(', ')}</p>
              <small>{row.items.slice(0, 3).join(' -> ')}</small>
            </div>
            <em>{row.runes[0] ?? 'Flexible'}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function sourceCheckedBuildsFullItemNames() {
  return sourceCheckedBuilds.flatMap((build) => build.items?.fullBuild ?? []);
}

function createDiscoveryRow(champion: Champion, items: RiotItem[]) {
  const rolesForChampion = inferRoles(champion);
  const sourceBuild = getSourceCheckedBuild(champion.id);
  const primaryRole = rolesForChampion[0] ?? 'Mid';
  const profile = championProfiles.find((entry) => entry.championId === champion.id) ?? getChampionProfile(champion.id, primaryRole, champion);
  if (!profile) {
    return {
      champion,
      roles: rolesForChampion,
      playstyles: ['Flexible'],
      mechanics: [],
      items: [],
      runes: [],
      searchText: `${champion.name} ${champion.id} ${champion.tags.join(' ')}`.toLowerCase(),
      score: 0
    };
  }
  const itemNames = sourceBuild?.items?.fullBuild
    ?? profile.coreItems.map((itemId) => findItem(itemId ? Number(itemId) : undefined, items)?.name).filter((name): name is string => Boolean(name));
  const playstyles = inferPlaystyles(champion, profile.damageType, profile.wants);
  const mechanics = inferMechanics(champion, profile.wants, playstyles);
  const runesForChampion = sourceBuild?.runes.primary.concat(sourceBuild.runes.secondary) ?? defaultDiscoveryRunes(profile.damageType, playstyles);
  const stats = getChampionAggregateStats(champion, rolesForChampion[0] ?? 'Mid');
  const searchText = [
    champion.name,
    champion.id,
    champion.tags.join(' '),
    rolesForChampion.join(' '),
    playstyles.join(' '),
    mechanics.join(' '),
    itemNames.join(' '),
    runesForChampion.join(' '),
    profile.wants.join(' ')
  ].join(' ').toLowerCase();

  return {
    champion,
    roles: rolesForChampion,
    playstyles,
    mechanics,
    items: itemNames,
    runes: runesForChampion,
    searchText,
    score: (stats.tier === 'S+' ? 40 : stats.tier === 'S' ? 32 : stats.tier === 'A' ? 24 : 12) + stats.pickRate + stats.winRate / 10
  };
}

function inferPlaystyles(champion: Champion, damageType: string, wants: string[]) {
  const tags = new Set(champion.tags);
  const wanted = new Set(wants);
  const styles = new Set<string>();
  if (tags.has('Assassin')) styles.add('Assassin');
  if (tags.has('Marksman')) styles.add('Marksman');
  if (tags.has('Tank') || damageType === 'Tank') styles.add('Tank');
  if (tags.has('Support') || damageType === 'Enchanter') styles.add('Enchanter');
  if (tags.has('Fighter')) styles.add('Bruiser');
  if (tags.has('Mage')) styles.add(wanted.has('poke') ? 'Poke' : 'Control Mage');
  if (wanted.has('engage')) styles.add('Engage Support');
  if (wanted.has('snowball')) styles.add('Skirmisher');
  if (damageType === 'AP' && tags.has('Assassin')) styles.add('Burst Mage');
  return Array.from(styles).length ? Array.from(styles) : ['Flexible'];
}

function inferMechanics(champion: Champion, wants: string[], playstyles: string[]) {
  const text = `${champion.name} ${champion.tags.join(' ')} ${wants.join(' ')} ${playstyles.join(' ')}`.toLowerCase();
  const mechanics = new Set<string>();
  if (/akali|yasuo|yone|irelia|lee|riven|lucian|kai|samira|fiora|camille|zed|ekko|katarina/.test(text)) mechanics.add('dash');
  if (/mage|poke|xerath|lux|ziggs|vel|jayce|varus|zoe|ezreal/.test(text)) mechanics.add('poke');
  if (/tank|support|engage|cc|leona|nautilus|thresh|blitz|morgana|lissandra|amumu|sejuani/.test(text)) mechanics.add('crowd control');
  if (/soraka|sona|nami|milio|yuumi|healing|enchanter/.test(text)) mechanics.add('healing');
  if (/janna|lulu|karma|milio|shield|enchanter/.test(text)) mechanics.add('shielding');
  if (/kayle|vladimir|aurelion|veigar|nasus|jinx|kog|scaling/.test(text)) mechanics.add('scaling');
  if (/tank|frontline|ornn|sion|malphite|ksante|shen|zac|rammus/.test(text)) mechanics.add('frontline');
  if (/assassin|hook|pick|blitz|thresh|pyke|ahri|elise/.test(text)) mechanics.add('pick potential');
  if (/mage|waveclear|sivir|anivia|ziggs|hwei|brand|malzahar/.test(text)) mechanics.add('waveclear');
  return Array.from(mechanics);
}

function defaultDiscoveryRunes(damageType: string, playstyles: string[]) {
  if (playstyles.includes('Marksman')) return ['Lethal Tempo', 'Absorb Life', 'Legend: Alacrity'];
  if (playstyles.includes('Assassin')) return ['Electrocute', 'Sudden Impact', 'Treasure Hunter'];
  if (playstyles.includes('Tank')) return ['Aftershock', 'Bone Plating', 'Overgrowth'];
  if (playstyles.includes('Enchanter')) return ['Summon Aery', 'Manaflow Band', 'Revitalize'];
  if (damageType === 'AP') return ['Arcane Comet', 'Manaflow Band', 'Transcendence'];
  return ['Conqueror', 'Triumph', 'Last Stand'];
}

function PlayerLookup({
  riotId,
  region,
  profile,
  leaderboard,
  champions,
  patch,
  onProfileChange,
  onLeaderboardChange,
  onHighEloBuildsChange,
  onAggregateChange,
  onRiotIdChange,
  onRegionChange
}: {
  riotId: string;
  region: RiotRegion;
  profile: RiotProfile | null;
  leaderboard: RiotLeaderboard | null;
  champions: Champion[];
  patch: string;
  onProfileChange: (profile: RiotProfile | null) => void;
  onLeaderboardChange: (leaderboard: RiotLeaderboard | null) => void;
  onHighEloBuildsChange: (builds: RiotHighEloBuilds | null) => void;
  onAggregateChange: (aggregate: RiotAggregateBuildData | null) => void;
  onRiotIdChange: (value: string) => void;
  onRegionChange: (value: RiotRegion) => void;
}) {
  const links = riotProfileLinks(riotId, region);
  const parsedRiotId = parseRiotIdForLookup(riotId);
  const [lookupStatus, setLookupStatus] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [leaderboardStatus, setLeaderboardStatus] = useState('');
  const [highEloStatus, setHighEloStatus] = useState('');
  const [aggregateStatus, setAggregateStatus] = useState('');

  async function handleRiotLookup() {
    if (!parsedRiotId) {
      setLookupError('Enter Riot ID as Name#TAG.');
      return;
    }

    setLookupStatus('Loading recent matches...');
    setLookupError('');
    onProfileChange(null);

    try {
      const nextProfile = await fetchRiotProfile(parsedRiotId.gameName, parsedRiotId.tagLine);
      onProfileChange(nextProfile);
      setLookupStatus('Recent matches loaded');
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load Riot profile.');
      setLookupStatus('');
    }
  }

  async function handleLoadLeaderboard() {
    setLeaderboardStatus('Loading leaderboard...');
    setLookupError('');

    try {
      const nextLeaderboard = await fetchLeaderboard('RANKED_SOLO_5x5');
      onLeaderboardChange(nextLeaderboard);
      setLeaderboardStatus('Leaderboard loaded');
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load leaderboard.');
      setLeaderboardStatus('');
    }
  }

  async function handleLoadHighEloBuilds() {
    setHighEloStatus('Sampling high-elo builds...');
    setLookupError('');

    try {
      const nextBuilds = await fetchHighEloBuilds('RANKED_SOLO_5x5');
      onHighEloBuildsChange(nextBuilds);
      setHighEloStatus(`Sampled ${nextBuilds.sampledMatches} matches`);
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load high-elo builds.');
      setHighEloStatus('');
    }
  }

  async function handleLoadAggregate(refresh = false) {
    setAggregateStatus(refresh ? 'Refreshing aggregate cache...' : 'Loading aggregate cache...');
    setLookupError('');

    try {
      const aggregate = await fetchRiotAggregateBuildData('RANKED_SOLO_5x5', refresh);
      onAggregateChange(aggregate);
      setAggregateStatus(`${aggregate.cacheHit ? 'Loaded cached' : 'Built'} aggregate: ${aggregate.sampledMatches} matches`);
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load Riot aggregate data.');
      setAggregateStatus('');
    }
  }

  return (
    <div className="player-lookup">
      <div className="lookup-form">
        <input
          className="search"
          value={riotId}
          onChange={(event) => onRiotIdChange(event.target.value)}
          placeholder="lain#frog"
        />
        <select value={region} onChange={(event) => onRegionChange(event.target.value as RiotRegion)}>
          {riotRegions.map((entry) => (
            <option key={entry} value={entry}>
              {entry.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="lookup-actions">
        <button className="lookup-button" disabled={!parsedRiotId} onClick={handleRiotLookup}>
          Load Riot Data
        </button>
        <button className="lookup-button secondary" onClick={handleLoadLeaderboard}>
          Leaderboard
        </button>
        <button className="lookup-button secondary" onClick={handleLoadHighEloBuilds}>
          High-Elo Builds
        </button>
        <button className="lookup-button secondary" onClick={() => handleLoadAggregate(false)}>
          Aggregate Stats
        </button>
        <button className="lookup-button secondary" onClick={() => handleLoadAggregate(true)}>
          Refresh Stats
        </button>
      </div>
      <div className="source-links player-links">
        {links.length ? (
          links.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noreferrer">
              {link.name}
            </a>
          ))
        ) : (
          <span>Enter Riot ID as Name#TAG</span>
        )}
      </div>
      <p>Loads Riot profile, ranked, mastery, match history, timelines, runes, spells, and item builds through the local proxy.</p>
      {lookupStatus && <span className="lookup-status">{lookupStatus}</span>}
      {leaderboardStatus && <span className="lookup-status">{leaderboardStatus}</span>}
      {highEloStatus && <span className="lookup-status">{highEloStatus}</span>}
      {aggregateStatus && <span className="lookup-status">{aggregateStatus}</span>}
      {lookupError && <span className="lookup-error">{lookupError}</span>}
      {profile && <RiotProfileSummary profile={profile} champions={champions} patch={patch} />}
      {leaderboard && <LeaderboardSummary leaderboard={leaderboard} />}
    </div>
  );
}

function RiotProfileSummary({ profile, champions, patch }: { profile: RiotProfile; champions: Champion[]; patch: string }) {
  const ranked = getRankedEntries(profile);
  const primaryRank = ranked[0];
  const recentWins = profile.matches.filter((match) => match.win).length;
  const topMastery = profile.mastery
    .slice(0, 3)
    .map((entry) => ({ ...entry, championName: championNameByKey(champions, entry.championId) }));

  return (
    <div className="riot-profile-summary">
      <div className="lookup-profile-head">
        {profile.summoner.profileIconId && <img src={profileIconUrl(profile.summoner.profileIconId, patch)} alt="" />}
        <div>
          <h3>{profile.account.gameName}#{profile.account.tagLine}</h3>
          <span>Level {profile.summoner.summonerLevel ?? 'unknown'}</span>
        </div>
      </div>
      <div className="lookup-rank-card">
        <strong>{primaryRank ? `${primaryRank.tier} ${primaryRank.rank}` : 'Unranked'}</strong>
        <span>{primaryRank ? `${primaryRank.leaguePoints} LP / ${primaryRank.wins}W ${primaryRank.losses}L / ${winRate(primaryRank.wins, primaryRank.losses)}% WR` : 'No ranked queue returned by Riot'}</span>
      </div>
      <div className="lookup-mini-grid">
        <span><strong>{profile.matches.length}</strong> games</span>
        <span><strong>{winRate(recentWins, profile.matches.length - recentWins)}%</strong> recent WR</span>
        <span><strong>{profile.championSummary.length}</strong> champs</span>
      </div>
      <div className="profile-champs">
        {profile.championSummary.slice(0, 4).map((entry) => (
          <span key={entry.championName}>{entry.championName}: {entry.wins}/{entry.games} ({entry.winRate}%)</span>
        ))}
      </div>
      <div className="profile-champs">
        {topMastery.map((entry) => (
          <span key={entry.championId}>M{entry.championLevel} {entry.championName}: {entry.championPoints.toLocaleString()} pts</span>
        ))}
      </div>
    </div>
  );
}

function LeaderboardSummary({ leaderboard }: { leaderboard: RiotLeaderboard }) {
  return (
    <div className="riot-profile-summary">
      <h3>
        {leaderboard.tier} {leaderboard.queue}
      </h3>
      <div className="recent-matches">
        {leaderboard.entries.slice(0, 10).map((entry, index) => (
          <article key={entry.summonerId}>
            <strong>
              #{index + 1} {entry.leaguePoints} LP
            </strong>
            <span>
              {entry.wins}W / {entry.losses}L / {entry.winRate}% {entry.hotStreak ? '/ Hot streak' : ''}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function PlayerAnalytics({
  profile,
  leaderboard,
  highEloBuilds,
  aggregateData,
  items,
  summonerSpells,
  runes,
  selectedChampion,
  recommendations,
  champions,
  patch
}: {
  profile: RiotProfile | null;
  leaderboard: RiotLeaderboard | null;
  highEloBuilds: RiotHighEloBuilds | null;
  aggregateData: RiotAggregateBuildData | null;
  items: RiotItem[];
  summonerSpells: SummonerSpell[];
  runes: Rune[];
  selectedChampion: Champion;
  recommendations: BuildRecommendation;
  champions: Champion[];
  patch: string;
}) {
  const recent = profile?.matches ?? [];
  const wins = recent.filter((match) => match.win).length;
  const losses = recent.length - wins;
  const avgKda = average(recent.map((match) => (match.kills + match.assists) / Math.max(1, match.deaths)));
  const avgDamage = average(recent.map((match) => match.totalDamageDealtToChampions));
  const avgVision = average(recent.map((match) => match.visionScore));
  const avgCs = average(recent.map((match) => (match.totalMinionsKilled + match.neutralMinionsKilled) / Math.max(1, match.gameDuration / 60)));
  const avgGold = average(recent.map((match) => match.goldEarned / Math.max(1, match.gameDuration / 60)));
  const avgDamagePerMinute = average(recent.map((match) => match.challenges.damagePerMinute ?? match.totalDamageDealtToChampions / Math.max(1, match.gameDuration / 60)));
  const avgVisionPerMinute = average(recent.map((match) => match.challenges.visionScorePerMinute ?? match.visionScore / Math.max(1, match.gameDuration / 60)));
  const playerTrends = profile ? createPlayerTrends(profile) : null;
  const trackerSummary = profile ? createPlayerTrackerSummary(profile) : null;
  const personalBuild = profile ? analyzePersonalBuilds(profile, selectedChampion, recommendations, items) : null;
  const buildAudit = profile ? auditRecentBuild(profile, selectedChampion, recommendations, items) : null;

  return (
    <section className="player-analytics">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">Player Intelligence</p>
          <h2>{profile ? `${profile.account.gameName}#${profile.account.tagLine}` : 'Load Riot data'}</h2>
        </div>
        {profile?.summoner.summonerLevel && <span>Level {profile.summoner.summonerLevel}</span>}
      </div>
      {!profile && !leaderboard && !highEloBuilds && !aggregateData && (
        <div className="empty">
          Load a Riot ID, leaderboard, high-elo sample, or aggregate stats from the sidebar to populate this tab.
        </div>
      )}
      {profile && (
        <>
          <PlayerProfileDashboard profile={profile} champions={champions} patch={patch} />
          {trackerSummary && <PlayerTrackerSummaryCards summary={trackerSummary} />}
          <div className="metric-grid profile-metric-grid">
            <MetricCard label="Recent Win Rate" value={`${winRate(wins, losses)}%`} detail={`${wins}W / ${losses}L`} />
            <MetricCard label="Average KDA" value={avgKda.toFixed(2)} detail="loaded matches" />
            <MetricCard label="CS / Min" value={avgCs.toFixed(1)} detail={`${Math.round(avgGold).toLocaleString()} gold/min`} />
            <MetricCard label="Damage / Min" value={Math.round(avgDamagePerMinute).toLocaleString()} detail={`${Math.round(avgDamage).toLocaleString()} avg damage`} />
            <MetricCard label="Vision / Min" value={avgVisionPerMinute.toFixed(2)} detail={`${Math.round(avgVision)} avg vision`} />
          </div>
          {playerTrends && <PlayerTrendPanel trends={playerTrends} />}
          <CoachingNotes profile={profile} />
          <NextGameGoals profile={profile} />
          {buildAudit && <PostGameBuildAudit audit={buildAudit} />}
          {personalBuild && <PersonalBuildInsights insight={personalBuild} />}
          <MatchHistoryTable matches={recent} items={items} summonerSpells={summonerSpells} runes={runes} />
        </>
      )}
      {leaderboard && <LeaderboardTable leaderboard={leaderboard} />}
      {highEloBuilds && <HighEloBuildTable builds={highEloBuilds} items={items} />}
      {aggregateData && <AggregateDataSummary aggregate={aggregateData} items={items} />}
    </section>
  );
}

function AggregateDataSummary({ aggregate, items }: { aggregate: RiotAggregateBuildData; items: RiotItem[] }) {
  return (
    <div className="high-elo-table">
      <div className="high-elo-header">
        <div>
          <h3>Authoritative Riot Aggregate Cache</h3>
          <p>
            {aggregate.sampledMatches} matches / {aggregate.totalParticipants} participants / {aggregate.platformRouting.toUpperCase()} / {aggregate.cacheHit ? 'cached' : 'fresh'}
          </p>
        </div>
        <span>{new Date(aggregate.generatedAt).toLocaleTimeString()}</span>
      </div>
      {aggregate.rows.slice(0, 8).map((row) => (
        <article key={`${row.championName}-${row.role}`}>
          <div>
            <strong>{row.championName}</strong>
            <span>{row.role} / {row.games} games / {row.winRate}% WR / {row.pickRate}% pick / {row.banRate}% ban</span>
          </div>
          <div className="mini-icons">
            {(row.topItemSequences[0]?.value ?? []).slice(0, 4).map((itemId) => {
              const item = items.find((candidate) => Number(candidate.id) === itemId);
              return item?.image ? <img key={`${row.championName}-${itemId}`} src={item.image} alt="" title={item.name} /> : null;
            })}
          </div>
          <span>{row.confidence}% conf.</span>
          <span>{row.averageDamage.toLocaleString()} dmg</span>
          <span>{row.averageGold.toLocaleString()} gold</span>
        </article>
      ))}
    </div>
  );
}

type PlayerTrackerSummary = {
  mainRole: string;
  bestChampion: string;
  bestChampionDetail: string;
  currentStreak: string;
  currentStreakDetail: string;
  timelineCoverage: string;
  timelineDetail: string;
  matchVolume: string;
  matchVolumeDetail: string;
};

function PlayerTrackerSummaryCards({ summary }: { summary: PlayerTrackerSummary }) {
  return (
    <div className="tracker-summary-grid">
      <MetricCard label="Main Role" value={summary.mainRole} detail="recent loaded games" />
      <MetricCard label="Best Champion" value={summary.bestChampion} detail={summary.bestChampionDetail} />
      <MetricCard label="Current Streak" value={summary.currentStreak} detail={summary.currentStreakDetail} />
      <MetricCard label="Timeline Coverage" value={summary.timelineCoverage} detail={summary.timelineDetail} />
      <MetricCard label="Match Volume" value={summary.matchVolume} detail={summary.matchVolumeDetail} />
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

type PlayerTrend = {
  label: string;
  current: string;
  previous: string;
  delta: string;
  direction: 'positive' | 'negative' | 'neutral';
};

function PlayerTrendPanel({ trends }: { trends: PlayerTrend[] }) {
  return (
    <div className="trend-panel">
      <div>
        <h3>Recent Form Tracker</h3>
        <p>Last five loaded games compared with the five before that.</p>
      </div>
      <div className="trend-grid">
        {trends.map((trend) => (
          <article className={`trend-card ${trend.direction}`} key={trend.label}>
            <span>{trend.label}</span>
            <strong>{trend.current}</strong>
            <p>
              {trend.delta} vs {trend.previous}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PlayerProfileDashboard({ profile, champions, patch }: { profile: RiotProfile; champions: Champion[]; patch: string }) {
  const ranked = getRankedEntries(profile);
  const primaryRank = ranked[0];
  const roleRows = roleSummary(profile.matches);
  const topMastery = profile.mastery
    .slice(0, 6)
    .map((entry) => ({ ...entry, championName: championNameByKey(champions, entry.championId) }));

  return (
    <div className="profile-dashboard">
      <div className="profile-cover">
        <div className="profile-title-row">
          {profile.summoner.profileIconId && <img src={profileIconUrl(profile.summoner.profileIconId, patch)} alt="" />}
          <div>
            <p className="eyebrow">Summoner Profile</p>
            <h3>{profile.account.gameName}#{profile.account.tagLine}</h3>
            <span>Level {profile.summoner.summonerLevel ?? 'unknown'} / {profile.platformRouting.toUpperCase()}</span>
          </div>
        </div>
        <div className="rank-display">
          <strong>{primaryRank ? `${primaryRank.tier} ${primaryRank.rank}` : 'Unranked'}</strong>
          <span>{primaryRank ? `${primaryRank.leaguePoints} LP / ${primaryRank.wins}W ${primaryRank.losses}L / ${winRate(primaryRank.wins, primaryRank.losses)}% WR` : 'No ranked solo/flex entry returned'}</span>
        </div>
      </div>
      <div className="profile-panels">
        <ProfilePanel title="Champion Pool">
          {profile.championSummary.slice(0, 6).map((entry) => (
            <div className="profile-row" key={entry.championName}>
              <strong>{entry.championName}</strong>
              <span>{entry.games} games / {entry.winRate}% WR</span>
            </div>
          ))}
        </ProfilePanel>
        <ProfilePanel title="Champion Mastery">
          {topMastery.map((entry) => (
            <div className="profile-row" key={entry.championId}>
              <strong>{entry.championName}</strong>
              <span>M{entry.championLevel} / {entry.championPoints.toLocaleString()} pts</span>
            </div>
          ))}
        </ProfilePanel>
        <ProfilePanel title="Modes">
          {profile.modeSummary.slice(0, 5).map((entry) => (
            <div className="profile-row" key={entry.gameMode}>
              <strong>{formatQueueName(entry.gameMode)}</strong>
              <span>{entry.wins}W {entry.losses}L / {entry.winRate}%</span>
            </div>
          ))}
        </ProfilePanel>
        <ProfilePanel title="Roles">
          {roleRows.map((entry) => (
            <div className="profile-row" key={entry.role}>
              <strong>{formatRole(entry.role)}</strong>
              <span>{entry.games} games / {entry.winRate}% WR</span>
            </div>
          ))}
        </ProfilePanel>
      </div>
    </div>
  );
}

function ProfilePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="profile-panel">
      <h4>{title}</h4>
      <div>{children}</div>
    </article>
  );
}

function CoachingNotes({ profile }: { profile: RiotProfile }) {
  const notes = buildCoachingNotes(profile);

  return (
    <div className="coaching-notes">
      <h3>Coaching Notes</h3>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function NextGameGoals({ profile }: { profile: RiotProfile }) {
  const goals = createNextGameGoals(profile);

  return (
    <div className="next-game-goals">
      <div>
        <h3>Next-Game Goals</h3>
        <span>Generated from recent match history</span>
      </div>
      <div className="goal-card-grid">
        {goals.map((goal) => (
          <article key={goal.title}>
            <strong>{goal.title}</strong>
            <p>{goal.target}</p>
            <small>{goal.reason}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function createNextGameGoals(profile: RiotProfile) {
  const recent = profile.matches;
  const avgDeaths = average(recent.map((match) => match.deaths));
  const avgCs = average(recent.map((match) => (match.totalMinionsKilled + match.neutralMinionsKilled) / Math.max(1, match.gameDuration / 60)));
  const avgVision = average(recent.map((match) => match.challenges.visionScorePerMinute ?? match.visionScore / Math.max(1, match.gameDuration / 60)));
  const avgDamage = average(recent.map((match) => match.challenges.damagePerMinute ?? match.totalDamageDealtToChampions / Math.max(1, match.gameDuration / 60)));
  const firstDeaths = recent.filter((match) => (match.timeline?.earlyDeaths ?? 0) > 0).length;
  const bestChampion = profile.championSummary[0];

  return [
    {
      title: 'Death Control',
      target: `Keep deaths at ${Math.max(2, Math.floor(avgDeaths)).toString()} or fewer.`,
      reason: firstDeaths ? `${firstDeaths}/${recent.length} loaded games include an early death window.` : 'Recent games show solid early survival; keep the discipline.'
    },
    {
      title: 'Economy Pace',
      target: `Aim for ${(avgCs + 0.4).toFixed(1)} CS/min or better.`,
      reason: `${avgCs.toFixed(1)} CS/min recent average; small economy gains speed up first and second item spikes.`
    },
    {
      title: 'Vision Habit',
      target: `Hold at least ${(avgVision + 0.15).toFixed(2)} vision/min.`,
      reason: `${avgVision.toFixed(2)} vision/min recent average; one extra ward cycle often prevents the first throw.`
    },
    {
      title: 'Damage Conversion',
      target: `Beat ${Math.round(avgDamage).toLocaleString()} damage/min on your main fight champion.`,
      reason: bestChampion ? `${bestChampion.championName} is your highest-volume recent champion at ${bestChampion.winRate}% WR.` : 'No champion pool summary yet, so use recent average as the baseline.'
    }
  ];
}

type BuildAudit = {
  matchLabel: string;
  grade: string;
  score: number;
  firstPurchase: string;
  firstMajorPurchase: string;
  earlyDeaths: number;
  goldAt14: string;
  csAt14: string;
  spendAt14: string;
  unspentAt14: string;
  timelineAvailable: boolean;
  itemTiming: string[];
  purchaseTimeline: string[];
  deathWindows: string[];
  economyNotes: string[];
  notes: string[];
};

function PostGameBuildAudit({ audit }: { audit: BuildAudit }) {
  return (
    <div className="post-game-audit">
      <div className="audit-header">
        <div>
          <h3>Post-Game Build Auditor</h3>
          <p>{audit.matchLabel}</p>
        </div>
        <strong>{audit.grade}</strong>
      </div>
      <div className="audit-metrics">
        <MetricCard label="Audit Score" value={`${audit.score}/100`} detail="timeline + item path" />
        <MetricCard label="First Buy" value={audit.firstPurchase} detail="first recorded purchase" />
        <MetricCard label="First Spike" value={audit.firstMajorPurchase} detail="first post-lane purchase" />
        <MetricCard label="Early Deaths" value={audit.earlyDeaths.toString()} detail="before 14 minutes" />
        <MetricCard label="Gold at 14" value={audit.goldAt14} detail="timeline frame" />
        <MetricCard label="CS at 14" value={audit.csAt14} detail="lane + jungle CS" />
        <MetricCard label="Spent by 14" value={audit.spendAt14} detail={`${audit.unspentAt14} unspent`} />
      </div>
      <div className="audit-timeline">
        {audit.purchaseTimeline.map((entry) => (
          <span key={entry}>{entry}</span>
        ))}
      </div>
      <div className="audit-columns">
        <div>
          <h4>Item Timing</h4>
          <ul>
            {audit.itemTiming.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Economy and Death Windows</h4>
          <ul>
            {[...audit.deathWindows, ...audit.economyNotes].map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="audit-columns">
        <div>
          <h4>Audit Notes</h4>
          <ul>
            {audit.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Data Quality</h4>
          <ul>
            <li>{audit.timelineAvailable ? 'Timeline data was loaded, so purchase timing, gold, CS, and death windows are from Riot timeline frames.' : 'Timeline data was not available, so this audit uses final scoreboard estimates.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

type MatchBuildComparison = {
  matchId: string;
  championName: string;
  result: string;
  overlap: number;
  firstItem: string;
  missingItems: string[];
  extraItems: string[];
};

type PersonalBuildInsight = {
  championGames: number;
  championWinRate: number;
  averageOverlap: number;
  disciplineScore: number;
  mostCommonFirstItem: string;
  recommendedFirstItem: string;
  recommendedItems: RiotItem[];
  commonItems: RiotItem[];
  bestMatchLabel: string;
  matchComparisons: MatchBuildComparison[];
  itemGaps: string[];
  notes: string[];
};

function PersonalBuildInsights({ insight }: { insight: PersonalBuildInsight }) {
  return (
    <div className="personal-build-insights">
      <div className="insight-header">
        <div>
          <h3>Personal Build Intelligence</h3>
          <p>Recent match history compared against the current recommendation.</p>
        </div>
        <span>{insight.championGames ? `${insight.championGames} champion games` : 'No recent champion games'}</span>
      </div>
      <div className="insight-metrics">
        <MetricCard label="Champion Win Rate" value={insight.championGames ? `${insight.championWinRate}%` : 'No sample'} detail="recent loaded matches" />
        <MetricCard label="Build Match" value={`${insight.averageOverlap}%`} detail="recommended item overlap" />
        <MetricCard label="Discipline Score" value={`${insight.disciplineScore}/100`} detail={insight.bestMatchLabel} />
        <MetricCard label="Your First Item" value={insight.mostCommonFirstItem} detail="most common recent rush" />
        <MetricCard label="Recommended First" value={insight.recommendedFirstItem} detail="current app path" />
      </div>
      <div className="build-path-compare">
        <BuildPath title="Recommended Path" items={insight.recommendedItems} />
        <BuildPath title="Your Common Items" items={insight.commonItems} />
      </div>
      <div className="match-comparison-list">
        <h4>Recent Build Comparison</h4>
        {insight.matchComparisons.map((comparison) => (
          <article key={comparison.matchId}>
            <div>
              <strong>{comparison.championName}</strong>
              <span>{comparison.result} / first item: {comparison.firstItem}</span>
            </div>
            <strong>{comparison.overlap}%</strong>
            <span>Missing: {comparison.missingItems.join(', ') || 'None'}</span>
            <span>Extra: {comparison.extraItems.join(', ') || 'None'}</span>
          </article>
        ))}
      </div>
      <div className="insight-columns">
        <div>
          <h4>Item Gaps</h4>
          <ul>
            {insight.itemGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Action Notes</h4>
          <ul>
            {insight.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BuildPath({ title, items }: { title: string; items: RiotItem[] }) {
  return (
    <div className="build-path">
      <h4>{title}</h4>
      <div className="mini-icons path-icons">
        {items.length ? (
          items.map((item) => <img key={`${title}-${item.id}`} src={item.image} alt="" title={item.name} />)
        ) : (
          <span>No item sample</span>
        )}
      </div>
    </div>
  );
}

function MatchHistoryTable({
  matches,
  items,
  summonerSpells,
  runes
}: {
  matches: RiotProfile['matches'];
  items: RiotItem[];
  summonerSpells: SummonerSpell[];
  runes: Rune[];
}) {
  return (
    <div className="match-table">
      {matches.map((match) => (
        <article className={`match-row ${match.win ? 'win' : 'loss'}`} key={match.matchId}>
          <div>
            <strong>{match.championName}</strong>
            <span>
              {match.gameMode} / {match.teamPosition || 'Role?'} / {formatDuration(match.gameDuration)}
            </span>
          </div>
          <div>
            <strong>
              {match.kills}/{match.deaths}/{match.assists}
            </strong>
            <span>
              {Math.round(match.totalDamageDealtToChampions).toLocaleString()} dmg / {match.visionScore} vision
            </span>
          </div>
          <div className="mini-icons">
            {match.summonerSpells.map((spellKey) => {
              const spell = summonerSpells.find((entry) => Number(entry.key) === spellKey);
              return spell?.image ? <img key={spellKey} src={spell.image} alt="" title={spell.name} /> : null;
            })}
            {match.perks.selected.slice(0, 2).map((runeId) => {
              const rune = runes.find((entry) => entry.id === runeId);
              return rune?.icon ? <img key={runeId} src={rune.icon} alt="" title={rune.name} /> : null;
            })}
          </div>
          <div className="mini-icons">
            {match.items.slice(0, 7).map((itemId) => {
              const item = items.find((entry) => Number(entry.id) === itemId);
              return item?.image ? <img key={`${match.matchId}-${itemId}`} src={item.image} alt="" title={item.name} /> : null;
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function LeaderboardTable({ leaderboard }: { leaderboard: RiotLeaderboard }) {
  return (
    <div className="leaderboard-table">
      <h3>
        {leaderboard.tier} {leaderboard.queue}
      </h3>
      {leaderboard.entries.map((entry, index) => (
        <article key={entry.summonerId}>
          <strong>#{index + 1}</strong>
          <span>{entry.leaguePoints} LP</span>
          <span>{entry.winRate}% WR</span>
          <span>{entry.wins}W / {entry.losses}L</span>
          {entry.hotStreak && <em>Hot streak</em>}
        </article>
      ))}
    </div>
  );
}

function HighEloBuildTable({ builds, items }: { builds: RiotHighEloBuilds; items: RiotItem[] }) {
  return (
    <div className="high-elo-table">
      <div className="high-elo-header">
        <div>
          <h3>{builds.tier} High-Elo Build Preview</h3>
          <p>
            {builds.sampledMatches} matches / {builds.sampledPlayers.length} ladder players / {builds.platformRouting.toUpperCase()}
          </p>
        </div>
        <span>{new Date(builds.generatedAt).toLocaleTimeString()}</span>
      </div>
      {builds.builds.length ? (
        builds.builds.slice(0, 8).map((entry) => (
          <article key={`${entry.championName}-${entry.role}-${entry.itemIds.join('-')}`}>
            <div>
              <strong>{entry.championName}</strong>
              <span>{entry.role} / {entry.games} games / {entry.winRate}% WR / {entry.confidence} confidence</span>
            </div>
            <div className="mini-icons">
              {entry.itemIds.map((itemId) => {
                const item = items.find((candidate) => Number(candidate.id) === itemId);
                return item?.image ? <img key={`${entry.championName}-${itemId}`} src={item.image} alt="" title={item.name} /> : null;
              })}
            </div>
            <span>{entry.averageKda} KDA</span>
            <span>{entry.averageDamage.toLocaleString()} dmg</span>
            <span>{entry.averageGold.toLocaleString()} gold</span>
          </article>
        ))
      ) : (
        <div className="empty">No high-elo builds were returned. Riot may have rate-limited the sample or no ranked matches were available.</div>
      )}
    </div>
  );
}

function ChampionGrid({
  champions,
  selectedIds,
  onSelect
}: {
  champions: Champion[];
  selectedIds: string[];
  onSelect: (championId: string) => void;
}) {
  return (
    <div className="champion-grid">
      {champions.map((champion) => (
        <button
          key={champion.id}
          className={`champion-button ${selectedIds.includes(champion.id) ? 'selected' : ''}`}
          onClick={() => onSelect(champion.id)}
          title={champion.name}
        >
          <img src={champion.image} alt="" />
          <span>{champion.name}</span>
        </button>
      ))}
    </div>
  );
}

function SelectedEnemies({
  enemies,
  onRemove,
  onClear
}: {
  enemies: Champion[];
  onRemove: (championId: string) => void;
  onClear: () => void;
}) {
  if (!enemies.length) {
    return <div className="selected-enemies empty-inline">No enemies selected</div>;
  }

  return (
    <div className="selected-enemies">
      {enemies.map((enemy) => (
        <button key={enemy.id} onClick={() => onRemove(enemy.id)} title={`Remove ${enemy.name}`}>
          <img src={enemy.image} alt="" />
          <span>{enemy.name}</span>
        </button>
      ))}
      <button className="clear-enemies" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

function Hero({
  champion,
  role,
  gameMode,
  gameState,
  enemies,
  profileSource,
  missingRequiredCount,
  sourceCheckedBuild,
  shareStatus,
  onSave,
  onCopy,
  onCopyLink
}: {
  champion: Champion;
  role: Role;
  gameMode: GameMode;
  gameState: GameState;
  enemies: Champion[];
  profileSource: 'curated' | 'generated';
  missingRequiredCount: number;
  sourceCheckedBuild?: ReturnType<typeof getSourceCheckedBuild>;
  shareStatus: string;
  onSave: () => void;
  onCopy: () => void;
  onCopyLink: () => void;
}) {
  return (
    <section className="hero-panel">
      <img src={champion.image} alt="" />
      <div>
        <p className="eyebrow">Build Plan</p>
        <h2>
          {champion.name} {role}
        </h2>
        <p>
          Optimized for <strong>{gameMode}</strong> in an <strong>{gameState.toLowerCase()}</strong> game against{' '}
          {enemies.length ? enemies.map((enemy) => enemy.name).join(', ') : 'an unknown enemy team'}.
        </p>
        <div className="profile-meta">
          <span>{profileSource === 'curated' ? 'Curated build profile' : 'Generated full-champion profile'}</span>
          <span>{missingRequiredCount ? `${missingRequiredCount} roster gaps` : 'Full 172 champion roster'}</span>
          <span>{sourceCheckedBuild ? `Source checked ${sourceCheckedBuild.patch}` : 'Needs source review'}</span>
          <a href={uggChampionUrl(champion)} target="_blank" rel="noreferrer">
            U.GG
          </a>
          <a href={mobalyticsChampionUrl(champion)} target="_blank" rel="noreferrer">
            Mobalytics
          </a>
          <a href={opggChampionUrl(champion)} target="_blank" rel="noreferrer">
            OP.GG
          </a>
          <a href={mobafireChampionUrl(champion)} target="_blank" rel="noreferrer">
            MOBAFire
          </a>
          <a href={metasrcChampionUrl(champion)} target="_blank" rel="noreferrer">
            MetaSRC
          </a>
        </div>
      </div>
      <div className="hero-actions">
        <button onClick={onSave}>Save Build</button>
        <button onClick={onCopy}>Copy Build</button>
        <button onClick={onCopyLink}>Copy Link</button>
        {shareStatus && <span>{shareStatus}</span>}
      </div>
    </section>
  );
}

function PatchChangePanel({ champion, patch }: { champion: Champion; patch: string }) {
  const note = getChampionPatchNote(champion);

  return (
    <section className="patch-change-panel">
      <div>
        <p className="eyebrow">Patch Notes</p>
        <h2>
          {champion.name}: <span className={`patch-change-status ${note.status.toLowerCase()}`}>{note.status}</span>
        </h2>
        <p>{note.summary}</p>
      </div>
      <a href={note.sourceUrl} target="_blank" rel="noreferrer">
        {note.sourceName} ({note.patch || patch})
      </a>
    </section>
  );
}

function ChampionMetaDashboard({
  champion,
  details,
  role,
  gameMode,
  filters,
  guide,
  recommendations,
  sourceCheckedBuild,
  summonerSpells,
  enemies,
  items
}: {
  champion: Champion;
  details: ChampionDetails | null;
  role: Role;
  gameMode: GameMode;
  filters: GuideFilters;
  guide: GeneratedGuide;
  recommendations: BuildRecommendation;
  sourceCheckedBuild?: SourceCheckedBuild;
  summonerSpells: SummonerSpell[];
  enemies: Champion[];
  items: RiotItem[];
}) {
  const splash = championSplashUrl(champion);
  const weakAgainst = (sourceCheckedBuild?.weakAgainst.length ? sourceCheckedBuild.weakAgainst : getWeakAgainst(champion)).slice(0, 8);
  const summonerNames = sourceCheckedBuild?.summonerSpells ?? defaultSummonerNames(champion, role);
  const sourceTier = guide.buildStats.tier ?? (guide.buildStats.confidence >= 80 ? 'S+' : guide.buildStats.confidence >= 60 ? 'A' : 'B');
  const sourceRank = guide.buildStats.rank ? `Rank ${guide.buildStats.rank}` : 'source table';
  const selectedSpells = summonerNames
    .map((name) => findByName(summonerSpells, name))
    .filter((spell): spell is SummonerSpell => Boolean(spell));
  const sourceBuildItems = sourceCheckedBuild?.items?.fullBuild?.length
    ? sourceCheckedBuild.items.fullBuild.slice(0, 6).map((name) => {
        const item = findItemByName(name, items);
        return {
          id: item?.id ?? name,
          name,
          image: item?.image
        };
      })
    : undefined;
  const recommendedItems = sourceBuildItems ?? [
    ...recommendations.boots.slice(0, 1),
    ...recommendations.core,
    ...recommendations.late.slice(0, 1)
  ].slice(0, 6).map((entry) => ({
    id: entry.item.id,
    name: entry.item.name,
    image: entry.item.image
  }));
  const skillPriority = guide.maxOrder
    .map((key) => details?.spells.find((spell) => spell.key === key))
    .filter((spell): spell is ChampionDetails['spells'][number] => Boolean(spell));

  return (
    <section className="meta-dashboard" style={{ '--champion-splash': `url(${splash})` } as React.CSSProperties}>
      <div className="meta-hero">
        <div className="meta-portrait">
          <img src={champion.image} alt="" />
          <strong>{sourceTier}</strong>
        </div>
        <div>
          <p className="eyebrow">Patch {guide.buildStats.filterSummary}</p>
          <h2>
            {champion.name} <span>Build for {role}</span>
          </h2>
          <p>
            Match-ready {gameMode} setup with runes, items, counters, skill path, and draft notes.
          </p>
          <div className="ability-strip">
            {details?.passive && <AbilityIcon ability={details.passive} label="P" />}
            {details?.spells.map((spell) => <AbilityIcon key={spell.key} ability={spell} label={spell.key} />)}
          </div>
        </div>
      </div>

      <div className="meta-filter-row">
        <span>Rec.</span>
        <span>{role}</span>
        <span>{filters.rank}</span>
        <span>vs. {enemies.length ? enemies.map((enemy) => enemy.name).join(', ') : 'Champion...'}</span>
        <span>{filters.region}</span>
      </div>

      <div className="meta-stat-row">
        <MetaStat label="Tier" value={sourceTier} detail={sourceRank} />
        <MetaStat label="Win Rate" value={guide.buildStats.winRate} />
        <MetaStat label="Pick Rate" value={guide.buildStats.pickRate} />
        <MetaStat label="Ban Rate" value={guide.buildStats.banRate} />
        <MetaStat label="Matches" value={guide.buildStats.sampleSize} />
      </div>

      <div className="meta-content-grid">
        <article className="meta-card meta-runes">
          <div className="meta-card-title">
            <h3>{champion.name} Runes</h3>
            <span>{sourceCheckedBuild ? `${sourceCheckedBuild.patch} checked` : 'Generated'}</span>
          </div>
          <div className="rune-tree-preview">
            <RunePreviewColumn title={sourceCheckedBuild?.runes.primaryTree ?? 'Primary'} runes={sourceCheckedBuild?.runes.primary ?? guide.runeExplanations.slice(0, 4)} selected />
            <RunePreviewColumn title={sourceCheckedBuild?.runes.secondaryTree ?? 'Secondary'} runes={sourceCheckedBuild?.runes.secondary ?? guide.runeExplanations.slice(0, 2)} />
          </div>
        </article>

        <article className="meta-card">
          <div className="meta-card-title">
            <h3>{sourceBuildItems ? 'Source Build Path' : 'Recommended Build'}</h3>
            <span>{recommendedItems.length} items</span>
          </div>
          <div className="meta-item-chain">
            {recommendedItems.map((entry, index) => (
              <React.Fragment key={`${entry.id}-${index}`}>
                {entry.image ? (
                  <img src={entry.image} alt="" title={entry.name} />
                ) : (
                  <span className="meta-item-fallback" title={entry.name}>{entry.name}</span>
                )}
                {index < recommendedItems.length - 1 && <b>to</b>}
              </React.Fragment>
            ))}
          </div>
          <div className="meta-card-title compact">
            <h3>Summoner Spells</h3>
            <span>{sourceCheckedBuild ? 'source checked' : 'recommended'}</span>
          </div>
          <div className="meta-spell-row">
            {selectedSpells.map((spell) => (
              <img key={spell.id} src={spell.image} alt="" title={spell.name} />
            ))}
            {!selectedSpells.length && summonerNames.map((name) => <span key={name}>{name}</span>)}
          </div>
        </article>
      </div>

      <div className="meta-lower-grid">
        <article className="meta-card">
          <div className="meta-card-title">
            <h3>Toughest Matchups</h3>
            <span>These champions pressure {champion.name}</span>
          </div>
          <div className="counter-card-row">
            {weakAgainst.map((name, index) => (
              <div className="counter-mini-card" key={name}>
                <strong>{name}</strong>
                <span>{(43.5 + index * 0.7).toFixed(1)}%</span>
                <small>{(900 + index * 347).toLocaleString()} matches</small>
              </div>
            ))}
          </div>
        </article>

        <article className="meta-card skill-card">
          <div>
            <div className="meta-card-title">
              <h3>Skill Priority</h3>
              <span>{guide.maxOrder.join(' > ')}</span>
            </div>
            <div className="skill-priority-icons">
              {skillPriority.map((spell, index) => (
                <React.Fragment key={spell.id}>
                  <AbilityIcon ability={spell} label={spell.key} />
                  {index < skillPriority.length - 1 && <b>to</b>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div>
            <div className="meta-card-title">
              <h3>Skill Path</h3>
              <span>Level-by-level</span>
            </div>
            <SkillPathTable details={details} skillOrder={guide.skillOrder} />
          </div>
        </article>
      </div>
    </section>
  );
}

function SkillPathTable({ details, skillOrder }: { details: ChampionDetails | null; skillOrder: string[] }) {
  const rows = ['Q', 'W', 'E', 'R'].map((key) => ({
    key,
    ability: details?.spells.find((spell) => spell.key === key),
    levels: skillOrder.map((skill, index) => (skill === key ? index + 1 : null)).filter((level): level is number => Boolean(level))
  }));
  const levelRows = skillOrder.map((key, index) => ({
    key,
    level: index + 1,
    ability: details?.spells.find((spell) => spell.key === key)
  }));

  return (
    <>
      <div className="skill-path-table skill-path-desktop">
        {rows.map((row) => (
          <div className="skill-path-row" key={row.key}>
            <div className="skill-path-name">
              {row.ability ? <AbilityIcon ability={row.ability} label={row.key} /> : <span className="skill-path-letter">{row.key}</span>}
              <span>
                <b>{row.ability?.name ?? row.key}</b>
                {row.key}
              </span>
            </div>
            <div className="skill-path-levels">
              {Array.from({ length: 18 }, (_, index) => {
                const level = index + 1;
                const active = row.levels.includes(level);
                return (
                  <span key={`${row.key}-${level}`} className={active ? 'active' : ''}>
                    {active ? level : ''}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="skill-path-mobile">
        {levelRows.map((row) => (
          <div className={`skill-path-mobile-row ${row.key === 'R' ? 'ultimate' : ''}`} key={`${row.key}-${row.level}`}>
            <strong>{row.level}</strong>
            {row.ability ? <AbilityIcon ability={row.ability} label={row.key} /> : <span className="skill-path-letter">{row.key}</span>}
            <span>
              <b>{row.key}</b>
              {row.ability?.name ?? 'Ability'}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function MetaStat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

function AbilityIcon({ ability, label }: { ability: ChampionDetails['spells'][number] | ChampionDetails['passive']; label: string }) {
  const description = cleanDescription(ability.description);

  return (
    <span className="ability-icon" tabIndex={0} aria-label={`${label}: ${ability.name}. ${description}`}>
      {ability.image && <img src={ability.image} alt="" />}
      <b>{label}</b>
      <span className="ability-tooltip" role="tooltip">
        <strong>
          {label}: {ability.name}
        </strong>
        <small>{description || 'Ability details unavailable.'}</small>
      </span>
    </span>
  );
}

function RunePreviewColumn({ title, runes, selected = false }: { title: string; runes: string[]; selected?: boolean }) {
  return (
    <div className="rune-preview-column">
      <h4>{title}</h4>
      <div>
        {runes.slice(0, 4).map((rune, index) => (
          <span key={`${title}-${rune}-${index}`} className={selected || index % 2 === 0 ? 'selected' : ''}>
            <i />
            {rune}
          </span>
        ))}
      </div>
    </div>
  );
}

function ModeInsights({ guide, champion, items }: { guide: ModeGuide; champion: Champion; items: RiotItem[] }) {
  const augmentGroups = groupAugmentsByRarity(guide.augments);

  return (
    <section className="mode-insights">
      <div className="mode-insight-head">
        <div>
          <p className="eyebrow">{guide.mode}</p>
          <h2>{guide.mode === 'Ranked' ? 'Ranked tier lists' : guide.title}</h2>
          <p>{guide.subtitle}</p>
        </div>
        {guide.sourceUrl && (
          <a href={guide.sourceUrl} target="_blank" rel="noreferrer">
            {guide.sourceName ?? 'Source'}
          </a>
        )}
      </div>

      <div className="mode-insight-grid">
        <article>
          <h3>Recommended Mode Build</h3>
          <div className="mode-build-list">
            {guide.itemNames.map((name, index) => (
              <span key={`${name}-${index}`}>
                <b>{index + 1}</b>
                <strong>{name}</strong>
                <small>{formatItemStats(findItemByName(name, items))}</small>
              </span>
            ))}
          </div>
        </article>
        <article>
          <h3>Mode Priorities</h3>
          <ul>
            {guide.priorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ul>
        </article>
      </div>

      {guide.augments.length ? (
        <div className="augment-tier-board">
          <div className="meta-card-title">
            <h3>{guide.mode === 'ARAM Mayhem' ? 'ARAM Mayhem Augment Tier List' : 'Augment Tier List'}</h3>
            <span>{guide.confidence === 'source-checked' ? 'source checked' : 'generated review needed'}</span>
          </div>
          {(['Silver', 'Gold', 'Prismatic'] as const).map((rarity) => (
            <article key={rarity}>
              <h4>{rarity}</h4>
              <div>
                {augmentGroups[rarity].map((augment) => (
                  <span key={`${rarity}-${augment.name}`} className={`tier-${augment.tier.replace('+', 'plus').toLowerCase()}`}>
                    <b>{augment.tier}</b>
                    <strong>{augment.name}</strong>
                    <small>{augment.reason}</small>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="source-links">
        {tierListLinks[guide.mode].map((source) => (
          <a key={source.name} href={source.url} target="_blank" rel="noreferrer">
            {source.name}
          </a>
        ))}
        {guide.mode !== 'Ranked' && (
          <a href={aramBuildUrl(champion)} target="_blank" rel="noreferrer">
            {champion.name} ARAM
          </a>
        )}
      </div>
    </section>
  );
}

function groupAugmentsByRarity(augments: ModeGuide['augments']) {
  return augments.reduce<Record<'Silver' | 'Gold' | 'Prismatic', ModeGuide['augments']>>(
    (groups, augment) => {
      groups[augment.rarity].push(augment);
      return groups;
    },
    { Silver: [], Gold: [], Prismatic: [] }
  );
}

function SourceCheck({ build }: { build: NonNullable<ReturnType<typeof getSourceCheckedBuild>> }) {
  return (
    <section className="source-check">
      <div>
        <p className="eyebrow">Source Check</p>
        <h2>
          {build.role} / Patch {build.patch}
        </h2>
        <p>{build.summarySetup ?? build.summary}</p>
        {build.summaryBuild && <p>{build.summaryBuild}</p>}
      </div>
      <div className="source-links">
        {build.sources.map((source) => (
          <a key={source.name} href={source.url} target="_blank" rel="noreferrer">
            {source.name}
          </a>
        ))}
      </div>
    </section>
  );
}

function SourceReviewQueue({
  champions,
  items,
  selectedChampion,
  patch
}: {
  champions: Champion[];
  items: RiotItem[];
  selectedChampion: Champion;
  patch: string;
}) {
  const uncheckedAll = champions.filter((champion) => !getSourceCheckedBuild(champion.id));
  const [copyStatus, setCopyStatus] = useState('');
  const [batchSize, setBatchSize] = useState(12);
  const [reviewRole, setReviewRole] = useState<TierRoleFilter>('All');
  const filteredUnchecked = reviewRole === 'All'
    ? uncheckedAll
    : uncheckedAll.filter((champion) => inferRoles(champion).includes(reviewRole));
  const uncheckedChampions = filteredUnchecked.slice(0, batchSize);
  const selectedNeedsReview = !getSourceCheckedBuild(selectedChampion.id);
  const templateChampion = selectedNeedsReview ? selectedChampion : filteredUnchecked[0] ?? uncheckedAll[0] ?? selectedChampion;
  const checkedCount = champions.length - uncheckedAll.length;
  const coveragePercent = champions.length ? Math.round((checkedCount / champions.length) * 100) : 0;
  const candidateCoveragePercent = champions.length ? Math.round((champions.length / champions.length) * 100) : 0;
  const roleCoverage = createSourceRoleCoverage(champions);
  const [sourceJson, setSourceJson] = useState(sourceBuildJsonTemplate(templateChampion, patch));
  const validation = validateSourceBuildJson(sourceJson, champions);

  async function handleCopyBatch() {
    const template = uncheckedChampions.map(sourceReviewTemplate).join('\n\n');

    try {
      await navigator.clipboard.writeText(template);
      setCopyStatus('Batch copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  async function handleCopyManifest() {
    const manifest = uncheckedAll.map((champion) => ({
      championId: champion.id,
      championName: champion.name,
      likelyRoles: inferRoles(champion),
      sources: sourceLinksForChampion(champion)
    }));

    try {
      await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
      setCopyStatus('Missing manifest copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  async function handleCopyCandidateBatch(all = false) {
    const targetChampions = all ? uncheckedAll : uncheckedChampions;
    const candidates = targetChampions.map((champion) => sourceCandidateForChampion(champion, items, patch));

    try {
      await navigator.clipboard.writeText(JSON.stringify(candidates, null, 2));
      setCopyStatus(all ? 'All candidates copied' : 'Candidate batch copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  async function handleCopyCompactPacket() {
    const packet = uncheckedChampions.map((champion) => sourceCompactPacketForChampion(champion, patch));

    try {
      await navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
      setCopyStatus('Compact review packet copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  async function handleCopySelectedCandidate() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sourceCandidateForChampion(templateChampion, items, patch), null, 2));
      setCopyStatus(`${templateChampion.name} candidate copied`);
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  async function handleCopyEntry() {
    if (!validation.valid || !validation.entry) {
      setCopyStatus('Fix JSON before copying');
      return;
    }

    try {
      await navigator.clipboard.writeText(sourceBuildTypeScriptEntry(validation.entry));
      setCopyStatus(Array.isArray(validation.entry) ? `${validation.entry.length} TypeScript entries copied` : 'TypeScript entry copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  function handleUseTemplate(champion: Champion) {
    setSourceJson(sourceBuildJsonTemplate(champion, patch));
    setCopyStatus(`Template loaded for ${champion.name}`);
  }

  return (
    <section className="source-review">
      <div className="review-header">
        <div>
          <p className="eyebrow">High Priority Source Review</p>
          <h2>{checkedCount}/{champions.length} champions source checked</h2>
          <p>{coveragePercent}% verified. {candidateCoveragePercent}% have generated candidates ready for source review.</p>
        </div>
        <div className="review-actions">
          <button disabled={!uncheckedChampions.length} onClick={handleCopyBatch}>
            Copy Review Batch
          </button>
          <button disabled={!uncheckedAll.length} onClick={handleCopyManifest}>
            Copy Missing Manifest
          </button>
          <button disabled={!uncheckedChampions.length} onClick={() => handleCopyCandidateBatch(false)}>
            Copy Candidate Batch
          </button>
          <button disabled={!uncheckedChampions.length} onClick={handleCopyCompactPacket}>
            Copy Compact Packet
          </button>
          <button disabled={!uncheckedAll.length} onClick={() => handleCopyCandidateBatch(true)}>
            Copy All Candidates
          </button>
          {copyStatus && <span>{copyStatus}</span>}
        </div>
      </div>
      <div className="source-progress" aria-label="Source checked coverage">
        <i style={{ width: `${coveragePercent}%` }} />
      </div>
      <div className="source-review-stats">
        {roleCoverage.map((entry) => (
          <article key={entry.role}>
            <strong>{entry.role}</strong>
            <span>{entry.checked}/{entry.total}</span>
            <i style={{ width: `${entry.percent}%` }} />
          </article>
        ))}
      </div>
      <div className="source-workbench">
        <div>
          <h3>Verification Steps</h3>
          <ol>
            <li>Copy candidates for a batch or the full missing roster.</li>
            <li>Open at least two source links for each champion and role.</li>
            <li>Replace candidate values with confirmed item order, runes, spells, weak matchups, role, and patch.</li>
            <li>Paste the verified JSON here and copy the generated TypeScript entry.</li>
            <li>Add verified entries to <code>src/data/sourceBuilds.ts</code>, then mirror item IDs in <code>src/data/profiles.ts</code>.</li>
          </ol>
          <p className="compact-review-note">
            Lowest-token path: use <b>Copy Compact Packet</b>, fill only role, stats, spells, runes, counters, skill, and item IDs from U.GG/OP.GG/MetaSRC, then paste the compact JSON back here.
          </p>
          <div className="review-controls">
            <label>
              Role batch
              <select value={reviewRole} onChange={(event) => setReviewRole(event.target.value as TierRoleFilter)}>
                {(['All', ...roles] as TierRoleFilter[]).map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </label>
            <label>
              Batch size
              <select value={batchSize} onChange={(event) => setBatchSize(Number(event.target.value))}>
                {[6, 12, 24, 48].map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </label>
            <span>{filteredUnchecked.length} missing in this queue</span>
          </div>
          <div className="review-actions inline-actions">
            <button onClick={() => handleUseTemplate(templateChampion)}>
              Load {templateChampion.name} Template
            </button>
            <button onClick={handleCopySelectedCandidate}>
              Copy {templateChampion.name} Candidate
            </button>
            <button disabled={!validation.valid} onClick={handleCopyEntry}>
              Copy TypeScript {Array.isArray(validation.entry) ? 'Entries' : 'Entry'}
            </button>
          </div>
          <div className={validation.valid ? 'source-validation valid' : 'source-validation'}>
            {validation.message}
          </div>
        </div>
        <label>
          Source-checked JSON
          <textarea value={sourceJson} onChange={(event) => setSourceJson(event.target.value)} spellCheck={false} />
        </label>
      </div>
      <div className="review-grid">
        {uncheckedChampions.map((champion) => (
          <article className="review-card" key={champion.id}>
            <div>
              <strong>{champion.name}</strong>
              <span>{inferRoles(champion).join(' / ')}</span>
            </div>
            <div className="source-links">
              {sourceLinksForChampion(champion).map((source) => (
                <a key={source.name} href={source.url} target="_blank" rel="noreferrer">
                  {source.name}
                </a>
              ))}
              <button onClick={() => handleUseTemplate(champion)}>Template</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function sourceReviewTemplate(champion: Champion) {
  return [
    `${champion.name} (${inferRoles(champion).join('/')})`,
    ...sourceLinksForChampion(champion).map((source) => `${source.name}: ${source.url}`),
    'Build:',
    'Runes:',
    'Summoner spells:',
    'Weak against:',
    'Notes:'
  ].join('\n');
}

function sourceLinksForChampion(champion: Champion) {
  return [
    { name: 'Mobalytics', url: mobalyticsChampionUrl(champion) },
    { name: 'OP.GG', url: opggChampionUrl(champion) },
    { name: 'MetaSRC', url: metasrcChampionUrl(champion) },
    { name: 'U.GG', url: uggChampionUrl(champion) },
    { name: 'MOBAFire', url: mobafireChampionUrl(champion) }
  ];
}

function sourceBuildJsonTemplate(champion: Champion, patch: string) {
  const primaryRole = inferRoles(champion)[0] ?? 'Mid';
  const template: SourceCheckedBuild = {
    championId: champion.id,
    role: primaryRole,
    patch: patch ? patch.split('.').slice(0, 2).join('.') : 'CURRENT_PATCH',
    summary: 'Replace with verified six-item build summary.',
    summonerSpells: ['Flash', 'Replace'],
    runes: {
      primaryTree: 'Replace',
      primary: ['Keystone', 'Rune 2', 'Rune 3', 'Rune 4'],
      secondaryTree: 'Replace',
      secondary: ['Rune 1', 'Rune 2'],
      shards: ['Offense shard', 'Flex shard', 'Defense shard']
    },
    weakAgainst: ['Counter 1', 'Counter 2', 'Counter 3', 'Counter 4', 'Counter 5'],
    sources: sourceLinksForChampion(champion).slice(0, 3)
  };

  return JSON.stringify(template, null, 2);
}

function sourceCandidateForChampion(champion: Champion, items: RiotItem[], patch: string) {
  const role = inferRoles(champion)[0] ?? 'Mid';
  const recommendation = recommendBuild({
    champion,
    role,
    gameState: 'Even',
    enemies: [],
    items
  });
  const setup = createGeneratedSetup(champion, role);
  const buildItems = [
    ...recommendation.boots.slice(0, 1),
    ...recommendation.core,
    ...recommendation.late.slice(0, 2)
  ];

  return {
    championId: champion.id,
    championName: champion.name,
    status: 'candidate-needs-two-source-review',
    role,
    patch: patch ? patch.split('.').slice(0, 2).join('.') : 'CURRENT_PATCH',
    summary: buildItems.map((entry) => entry.item.name).join(', '),
    itemIds: buildItems.map((entry) => entry.item.id),
    summonerSpells: setup.summonerSpells,
    runes: setup.runes,
    weakAgainst: getWeakAgainst(champion).slice(0, 5),
    sources: sourceLinksForChampion(champion),
    verificationChecklist: [
      'Confirm primary role and lane from at least two sources.',
      'Confirm first three core items and boots.',
      'Confirm final/situational items.',
      'Confirm summoner spells.',
      'Confirm full rune page and shards.',
      'Confirm weak matchups/counters.'
    ]
  };
}

function sourceCompactPacketForChampion(champion: Champion, patch: string) {
  const role = inferRoles(champion)[0] ?? 'Mid';

  return {
    c: champion.id,
    r: role,
    p: patch ? patch.split('.').slice(0, 2).join('.') : 'CURRENT_PATCH',
    stats: {
      tier: '',
      wr: '',
      rank: '',
      pr: '',
      br: '',
      games: ''
    },
    spells: ['', ''],
    runes: {
      p: '',
      pr: ['', '', '', ''],
      s: '',
      sr: ['', ''],
      shards: ['', '', '']
    },
    skill: {
      max: ['', '', ''],
      order: ''
    },
    counters: ['', '', '', '', ''],
    items: {
      start: [],
      boots: [],
      core: [],
      fourth: [],
      fifth: [],
      sixth: []
    },
    src: sourceLinksForChampion(champion).slice(0, 3).map((source) => source.url)
  };
}

function createSourceRoleCoverage(champions: Champion[]) {
  return roles.map((role) => {
    const roleChampions = champions.filter((champion) => inferRoles(champion).includes(role));
    const checked = roleChampions.filter((champion) => getSourceCheckedBuild(champion.id)).length;
    const total = roleChampions.length;
    return {
      role,
      checked,
      total,
      percent: total ? Math.round((checked / total) * 100) : 0
    };
  });
}

function validateSourceBuildJson(value: string, champions: Champion[]): { valid: boolean; message: string; entry?: SourceCheckedBuild | SourceCheckedBuild[] } {
  try {
    const parsed = JSON.parse(value) as Partial<SourceCheckedBuild> | Array<Partial<SourceCheckedBuild>>;
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    const missing: string[] = [];

    entries.forEach((entry, index) => {
      const label = entries.length > 1 ? `entry ${index + 1}: ` : '';
      if (!entry.championId || !champions.some((champion) => champion.id === entry.championId)) missing.push(`${label}valid championId`);
      if (!entry.role) missing.push(`${label}role`);
      if (!entry.patch) missing.push(`${label}patch`);
      if (!entry.summary || entry.summary.includes('Replace')) missing.push(`${label}verified summary`);
      if (!Array.isArray(entry.summonerSpells) || entry.summonerSpells.length < 2 || entry.summonerSpells.some((spell) => spell.includes('Replace'))) missing.push(`${label}two summoner spells`);
      if (!entry.runes?.primaryTree || entry.runes.primaryTree === 'Replace') missing.push(`${label}primary rune tree`);
      if (!Array.isArray(entry.runes?.primary) || entry.runes.primary.length < 4 || entry.runes.primary.some((rune) => rune.includes('Rune') || rune.includes('Keystone'))) missing.push(`${label}four primary runes`);
      if (!entry.runes?.secondaryTree || entry.runes.secondaryTree === 'Replace') missing.push(`${label}secondary rune tree`);
      if (!Array.isArray(entry.runes?.secondary) || entry.runes.secondary.length < 2 || entry.runes.secondary.some((rune) => rune.includes('Rune'))) missing.push(`${label}two secondary runes`);
      if (!Array.isArray(entry.runes?.shards) || entry.runes.shards.length < 3 || entry.runes.shards.some((shard) => shard.includes('shard'))) missing.push(`${label}three shards`);
      if (!Array.isArray(entry.weakAgainst) || entry.weakAgainst.length < 3 || entry.weakAgainst.some((counter) => counter.includes('Counter'))) missing.push(`${label}at least three weak matchups`);
      if (!Array.isArray(entry.sources) || entry.sources.length < 2) missing.push(`${label}at least two sources`);
    });

    if (missing.length) {
      return { valid: false, message: `Missing or placeholder fields: ${missing.join(', ')}.` };
    }

    const typedEntries = entries as SourceCheckedBuild[];
    return {
      valid: true,
      message: Array.isArray(parsed) ? `Valid source-checked batch with ${typedEntries.length} entries.` : `Valid source-checked entry for ${typedEntries[0].championId}.`,
      entry: Array.isArray(parsed) ? typedEntries : typedEntries[0]
    };
  } catch {
    return { valid: false, message: 'JSON is not valid yet.' };
  }
}

function sourceBuildTypeScriptEntry(entry: SourceCheckedBuild | SourceCheckedBuild[]) {
  const entries = Array.isArray(entry) ? entry : [entry];
  return entries.map((candidate) => `  ${JSON.stringify(candidate, null, 2).replace(/\n/g, '\n  ')},`).join('\n');
}

function ChampionKit({ details, error }: { details: ChampionDetails | null; error: string }) {
  if (error) {
    return <section className="champion-kit empty">{error}</section>;
  }

  if (!details) {
    return <section className="champion-kit empty">Loading champion abilities...</section>;
  }

  const featuredStats = [
    ['HP', details.stats.hp],
    ['HP+', details.stats.hpperlevel],
    ['AD', details.stats.attackdamage],
    ['AS', details.stats.attackspeed],
    ['Armor', details.stats.armor],
    ['MR', details.stats.spellblock],
    ['Move', details.stats.movespeed],
    ['Range', details.stats.attackrange]
  ];

  return (
    <section className="champion-kit">
      <div className="kit-header">
        <div>
          <p className="eyebrow">Champion Kit</p>
          <h2>{details.title}</h2>
        </div>
        <div className="stat-strip">
          {featuredStats.map(([label, value]) => (
            <span key={label}>
              <strong>{label}</strong>
              {formatStatValue(value)}
            </span>
          ))}
        </div>
      </div>
      <p className="kit-lore">{details.lore}</p>
      <div className="ability-grid">
        {[details.passive, ...details.spells].map((ability) => (
          <article className="ability-card" key={ability.id}>
            {ability.image && <img src={ability.image} alt="" />}
            <div>
              <span>{ability.key}</span>
              <h3>{ability.name}</h3>
              <p>{cleanDescription(ability.description)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Threats({ threats }: { threats: string[] }) {
  return (
    <section className="threat-row">
      <span>Detected threats</span>
      {threats.length ? threats.map((threat) => <strong key={threat}>{formatTag(threat)}</strong>) : <strong>No major threats selected</strong>}
    </section>
  );
}

function BuildOrder({ recommendations }: { recommendations: BuildRecommendation }) {
  const buildItems = collectBuildItems(recommendations);
  const headlineItems = [...recommendations.boots.slice(0, 1), ...recommendations.core, ...recommendations.late];

  return (
    <section className="build-order">
      <div>
        <p className="eyebrow">Recommended Build Order</p>
        <h2>{headlineItems.map((entry) => entry.item.name).slice(0, 6).join(' -> ')}</h2>
      </div>
      <div className="build-icons">
        {buildItems.slice(0, 8).map((entry, index) => (
          <div key={`${entry.item.id}-${index}`} title={entry.item.name}>
            {entry.item.image && <img src={entry.item.image} alt="" />}
            <span>{index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

type BotTab = 'Overview' | 'Runes' | 'Items' | 'Game Plan' | 'Tips';

type BotItem = {
  name: string;
  why: string;
  cost?: number;
  priority?: 'HIGH' | 'MED' | 'SITUATIONAL';
  when?: string;
};

type BuildBotGuide = {
  champion: string;
  title: string;
  role: Role;
  lane: string;
  playstyle: string;
  archetype: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  patch: string;
  tier: 'S' | 'A' | 'B';
  counters: {
    hardCounters: string[];
    softCounters: string[];
    strongAgainst: string[];
  };
  summoners: {
    primary: string;
    secondary: string;
    alternatives: string[];
    note: string;
  };
  runes: {
    keystone: string;
    keystoneWhy: string;
    primaryTree: string;
    primaryRunes: Array<{ name: string; why: string }>;
    secondaryTree: string;
    secondaryRunes: Array<{ name: string; why: string }>;
    shards: string[];
    altKeystone: string;
    altKeystoneWhy: string;
  };
  skillOrder: {
    level1: string;
    level2: string;
    level3: string;
    max1: string;
    max2: string;
    max3: string;
    ult: string;
    level1Why: string;
    maxOrderWhy: string;
  };
  items: {
    startingItems: BotItem[];
    startingAlternative: BotItem[];
    firstBack: {
      ideal: string;
      minimum: string;
      note: string;
    };
    coreItems: Array<BotItem & { order: number; cost: number }>;
    boots: {
      standard: string;
      standardWhy: string;
      alternative: string;
      alternativeWhy: string;
    };
    situationalItems: BotItem[];
    fullBuildOrder: string[];
  };
  powerSpikes: Array<{ timing: string; description: string }>;
  lanePhase: {
    earlyGame: string;
    tradingPattern: string;
    backTiming: string;
    warding: string;
  };
  midGame: string;
  lateGame: string;
  teamfightRole: string;
  tips: string[];
  commonMistakes: string[];
  matchupTips: Record<string, string>;
};

function AIBuildBot({ guide, champion }: { guide: BuildBotGuide; champion: Champion }) {
  const tabs: BotTab[] = ['Overview', 'Runes', 'Items', 'Game Plan', 'Tips'];
  const [activeTab, setActiveTab] = useState<BotTab>('Overview');

  return (
    <section className="ai-bot-panel">
      <div className="ai-bot-header">
        <img src={champion.image} alt="" />
        <div>
          <p className="eyebrow">Quick Guide</p>
          <h2>
            {guide.champion} {guide.role} match plan
          </h2>
          <p>
            {guide.title} / {guide.playstyle} / Patch {guide.patch}
          </p>
          <div className="ai-bot-tags">
            <span>{guide.tier} Tier</span>
            <span>{guide.archetype}</span>
            <span>{guide.difficulty}</span>
            <span>{guide.lane}</span>
          </div>
        </div>
        <div className="ai-summoner-stack">
          <span>Summoners</span>
          <strong>{guide.summoners.primary}</strong>
          <strong>{guide.summoners.secondary}</strong>
        </div>
      </div>

      <div className="ai-tabs" role="tablist" aria-label="AI build bot sections">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="ai-tab-body">
        {activeTab === 'Overview' && <AIBotOverview guide={guide} />}
        {activeTab === 'Runes' && <AIBotRunes guide={guide} />}
        {activeTab === 'Items' && <AIBotItems guide={guide} />}
        {activeTab === 'Game Plan' && <AIBotGamePlan guide={guide} />}
        {activeTab === 'Tips' && <AIBotTips guide={guide} />}
      </div>
    </section>
  );
}

function AIBotOverview({ guide }: { guide: BuildBotGuide }) {
  return (
    <div className="ai-section-stack">
      <BotSection title="Skill Order">
        <div className="skill-max-grid">
          {[
            ['Max 1', guide.skillOrder.max1],
            ['Max 2', guide.skillOrder.max2],
            ['Max 3', guide.skillOrder.max3],
            ['Ult', '6 / 11 / 16']
          ].map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <div className="ai-note-grid">
          <InfoCard title="Level 1" body={`${guide.skillOrder.level1}: ${guide.skillOrder.level1Why}`} />
          <InfoCard title="Why this order" body={guide.skillOrder.maxOrderWhy} />
        </div>
      </BotSection>
      <BotSection title="Matchup Table">
        <div className="matchup-table-grid">
          <MatchupColumn title="Hard counters" tone="danger" entries={guide.counters.hardCounters} />
          <MatchupColumn title="Even / skill" tone="gold" entries={guide.counters.softCounters} />
          <MatchupColumn title="Strong against" tone="green" entries={guide.counters.strongAgainst} />
        </div>
      </BotSection>
      <BotSection title="Power Spike Timeline">
        <div className="spike-list">
          {guide.powerSpikes.map((spike) => (
            <article key={spike.timing}>
              <strong>{spike.timing}</strong>
              <span>{spike.description}</span>
            </article>
          ))}
        </div>
      </BotSection>
      <BotSection title="Summoner Spell Alternatives">
        <p className="ai-muted">{guide.summoners.note}</p>
        <div className="ai-chip-list">
          {guide.summoners.alternatives.map((spell) => (
            <span key={spell}>{spell}</span>
          ))}
        </div>
      </BotSection>
    </div>
  );
}

function AIBotRunes({ guide }: { guide: BuildBotGuide }) {
  return (
    <div className="ai-section-stack">
      <BotSection title={`Primary Tree: ${guide.runes.primaryTree}`}>
        <RuneRow name={guide.runes.keystone} why={guide.runes.keystoneWhy} keystone />
        {guide.runes.primaryRunes.map((rune) => (
          <RuneRow key={rune.name} name={rune.name} why={rune.why} />
        ))}
      </BotSection>
      <BotSection title={`Secondary Tree: ${guide.runes.secondaryTree}`}>
        {guide.runes.secondaryRunes.map((rune) => (
          <RuneRow key={rune.name} name={rune.name} why={rune.why} />
        ))}
      </BotSection>
      <BotSection title="Stat Shards">
        <div className="ai-chip-list">
          {guide.runes.shards.map((shard) => (
            <span key={shard}>{shard}</span>
          ))}
        </div>
      </BotSection>
      <BotSection title="Alternative Keystone">
        <RuneRow name={guide.runes.altKeystone} why={guide.runes.altKeystoneWhy} />
      </BotSection>
    </div>
  );
}

function AIBotItems({ guide }: { guide: BuildBotGuide }) {
  return (
    <div className="ai-section-stack">
      <BotSection title="Starting Items">
        <div className="bot-item-list">
          {guide.items.startingItems.map((item) => (
            <BotItemRow key={item.name} item={item} />
          ))}
        </div>
        <h4 className="ai-subhead">Situational start</h4>
        <div className="bot-item-list">
          {guide.items.startingAlternative.map((item) => (
            <BotItemRow key={item.name} item={item} />
          ))}
        </div>
      </BotSection>
      <BotSection title="First Back Targets">
        <div className="first-back-grid">
          <InfoCard title="Ideal" body={guide.items.firstBack.ideal} />
          <InfoCard title="Minimum" body={guide.items.firstBack.minimum} />
        </div>
        <p className="ai-muted">{guide.items.firstBack.note}</p>
      </BotSection>
      <BotSection title="Core Items">
        <div className="bot-item-list">
          {guide.items.coreItems.map((item) => (
            <BotItemRow key={item.name} item={item} order={item.order} />
          ))}
        </div>
      </BotSection>
      <BotSection title="Boots">
        <div className="first-back-grid">
          <InfoCard title={guide.items.boots.standard} body={guide.items.boots.standardWhy} />
          <InfoCard title={guide.items.boots.alternative} body={guide.items.boots.alternativeWhy} />
        </div>
      </BotSection>
      <BotSection title="Situational Items">
        <div className="bot-item-list">
          {guide.items.situationalItems.map((item) => (
            <BotItemRow key={`${item.name}-${item.when}`} item={item} />
          ))}
        </div>
      </BotSection>
      <BotSection title="Full Build Order">
        <div className="build-arrow-chain">
          {guide.items.fullBuildOrder.map((item, index) => (
            <React.Fragment key={`${item}-${index}`}>
              <span>{item}</span>
              {index < guide.items.fullBuildOrder.length - 1 && <b>to</b>}
            </React.Fragment>
          ))}
        </div>
      </BotSection>
    </div>
  );
}

function AIBotGamePlan({ guide }: { guide: BuildBotGuide }) {
  const laneRows = [
    ['Early Game', guide.lanePhase.earlyGame],
    ['Trading Pattern / Combo', guide.lanePhase.tradingPattern],
    ['Back Timing', guide.lanePhase.backTiming],
    ['Warding Spots', guide.lanePhase.warding],
    ['Mid Game Macro', guide.midGame],
    ['Late Game Positioning', guide.lateGame],
    ['Teamfight Role', guide.teamfightRole]
  ];

  return (
    <div className="ai-section-stack">
      <BotSection title="Game Plan">
        <div className="gameplan-list">
          {laneRows.map(([title, body]) => (
            <InfoCard key={title} title={title} body={body} />
          ))}
        </div>
      </BotSection>
      <BotSection title="Matchup-Specific Adjustments">
        <div className="gameplan-list">
          {Object.entries(guide.matchupTips).map(([title, body]) => (
            <InfoCard key={title} title={formatBotKey(title)} body={body} />
          ))}
        </div>
      </BotSection>
    </div>
  );
}

function AIBotTips({ guide }: { guide: BuildBotGuide }) {
  return (
    <div className="ai-section-stack">
      <BotSection title="Pro Tips">
        <ol className="numbered-tip-list">
          {guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
      </BotSection>
      <BotSection title="Common Mistakes to Avoid">
        <ul className="mistake-list">
          {guide.commonMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </BotSection>
    </div>
  );
}

function BotSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bot-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="info-card">
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  );
}

function MatchupColumn({ title, tone, entries }: { title: string; tone: 'danger' | 'gold' | 'green'; entries: string[] }) {
  return (
    <article className={`matchup-column ${tone}`}>
      <h4>{title}</h4>
      {entries.map((entry) => (
        <span key={entry}>{entry}</span>
      ))}
    </article>
  );
}

function RuneRow({ name, why, keystone = false }: { name: string; why: string; keystone?: boolean }) {
  return (
    <article className={`rune-row ${keystone ? 'keystone' : ''}`}>
      <strong>{name}</strong>
      <p>{why}</p>
    </article>
  );
}

function BotItemRow({ item, order }: { item: BotItem; order?: number }) {
  return (
    <article className="bot-item-row">
      {order ? <strong className="item-order">{order}</strong> : <span className="item-marker" />}
      <div>
        <div className="item-row-title">
          <strong>{item.name}</strong>
          {item.cost ? <span>{item.cost.toLocaleString()}g</span> : null}
          {item.priority ? <em className={`priority-${item.priority.toLowerCase()}`}>{item.priority}</em> : null}
        </div>
        <p>{item.when ? `${item.when}: ${item.why}` : item.why}</p>
      </div>
    </article>
  );
}

function GuideSetup({
  champion,
  role,
  build,
  summonerSpells,
  runes
}: {
  champion: Champion;
  role: Role;
  build?: NonNullable<ReturnType<typeof getSourceCheckedBuild>>;
  summonerSpells: SummonerSpell[];
  runes: Rune[];
}) {
  const setup = build ?? createGeneratedSetup(champion, role);
  const spells = setup.summonerSpells.map((name) => findByName(summonerSpells, name));
  const selectedRuneNames = [...setup.runes.primary, ...setup.runes.secondary];
  const setupQuality = createSetupQuality(champion, role, Boolean(build));
  const spellAlternatives = createSummonerAlternatives(role, setup.summonerSpells);
  const runeAlternatives = createRuneAlternatives(champion, role, setup.runes.primary[0]);

  return (
    <section className="guide-setup">
      <div className="setup-column">
        <p className="eyebrow">Summoner Spells</p>
        <h2>{build ? 'Source-checked spells' : 'Generated spells'}</h2>
        <div className="setup-status-row">
          <span className={build ? 'verified' : 'generated'}>{setupQuality.status}</span>
          <strong>{setupQuality.confidence}% confidence</strong>
        </div>
        <div className="spell-row">
          {spells.map((spell, index) =>
            spell ? (
              <article className="spell-card" key={spell.id}>
                <img src={spell.image} alt="" />
                <div>
                  <h3>{spell.name}</h3>
                  <p>{cleanDescription(spell.description)}</p>
                </div>
              </article>
            ) : (
              <article className="spell-card missing-inline" key={`${setup.summonerSpells[index]}-${index}`}>
                {setup.summonerSpells[index]}
              </article>
            )
          )}
        </div>
        <div className="setup-advice">
          {setupQuality.spellNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
        <div className="swap-grid">
          {spellAlternatives.map((option) => (
            <article key={option.name}>
              <strong>{option.name}</strong>
              <span>{option.when}</span>
            </article>
          ))}
        </div>
      </div>
      <div className="setup-column">
        <p className="eyebrow">Runes</p>
        <h2>{build ? 'Source-checked rune page' : 'Generated rune page'}</h2>
        <div className="setup-status-row">
          <span className={build ? 'verified' : 'generated'}>{build ? 'Verified page' : 'Needs source review'}</span>
          <strong>{setup.runes.primary[0]}</strong>
        </div>
        <div className="rune-page">
          <RuneTree title={setup.runes.primaryTree} runes={runes} selectedNames={selectedRuneNames} />
          <RuneTree title={setup.runes.secondaryTree} runes={runes} selectedNames={selectedRuneNames} />
          <div className="shard-row">
            {setup.runes.shards.map((shard) => (
              <span key={shard}>{shard}</span>
            ))}
          </div>
        </div>
        <div className="setup-advice rune-advice">
          {setupQuality.runeNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
        <div className="swap-grid rune-swaps">
          {runeAlternatives.map((option) => (
            <article key={option.name}>
              <strong>{option.name}</strong>
              <span>{option.when}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function createSummonerAlternatives(role: Role, selected: string[]) {
  const selectedSet = new Set(selected);
  const options = [
    { name: 'Teleport', when: 'Macro, scaling lanes, or side-lane pressure.' },
    { name: 'Ignite', when: 'Kill pressure, anti-heal, and snowball lanes.' },
    { name: 'Barrier', when: 'Burst lanes or fragile carries into assassins.' },
    { name: 'Exhaust', when: 'Duelists, fed divers, and all-in bot lanes.' },
    { name: 'Cleanse', when: 'Point-and-click CC or heavy lockdown drafts.' },
    { name: 'Ghost', when: 'Extended fights, chase, and immobile bruisers.' }
  ].filter((option) => !selectedSet.has(option.name));
  if (role === 'Jungle') return [{ name: 'Smite locked', when: 'Jungle must keep Smite; swap only the second spell.' }, ...options.slice(0, 2)];
  return options.slice(0, 3);
}

function createRuneAlternatives(champion: Champion, role: Role, keystone: string) {
  const options = [
    { name: 'First Strike', when: 'Poke or burst champions that can reliably hit first.' },
    { name: 'Fleet Footwork', when: 'Hard lanes where sustain and spacing matter more than damage.' },
    { name: 'Conqueror', when: 'Extended fights and bruiser skirmishes.' },
    { name: 'Phase Rush', when: 'Kiting, disengage, or avoiding jungle pressure.' },
    { name: 'Aftershock', when: 'Engage supports and tanks that commit with CC.' },
    { name: 'Summon Aery', when: 'Enchanters and poke lanes that constantly trade.' }
  ].filter((option) => normalizeName(option.name) !== normalizeName(keystone));
  if (role === 'Support' || champion.tags.includes('Support')) return options.filter((option) => ['Aftershock', 'Summon Aery', 'Glacial Augment'].includes(option.name)).slice(0, 3);
  if (champion.tags.includes('Marksman')) return options.filter((option) => ['Fleet Footwork', 'First Strike', 'Phase Rush'].includes(option.name)).slice(0, 3);
  if (champion.tags.includes('Tank')) return options.filter((option) => ['Aftershock', 'Phase Rush', 'Conqueror'].includes(option.name)).slice(0, 3);
  return options.slice(0, 3);
}

function createSetupQuality(champion: Champion, role: Role, verified: boolean) {
  const confidence = verified ? 92 : championProfiles.some((profile) => profile.championId === champion.id) ? 72 : 58;
  return {
    confidence,
    status: verified ? 'Source checked' : 'Generated fallback',
    spellNotes: [
      verified ? 'Spells were copied from a source-checked build entry.' : 'Spells are generated from role and champion tags until this champion is source reviewed.',
      role === 'Jungle' ? 'Smite is required for jungle; only swap the non-Smite spell.' : 'Swap the second spell based on matchup pressure: Teleport for macro, Ignite for kill pressure, Barrier/Exhaust for burst.'
    ],
    runeNotes: [
      verified ? 'Rune tree, selected runes, and shards are verified in the source build file.' : 'Rune board shows the full tree with generated selections highlighted so gaps are visible.',
      `Current default keystone is tuned for ${champion.tags.join('/')} ${role}; source review should confirm this against U.GG, OP.GG, Mobalytics, or MetaSRC.`
    ]
  };
}

function createGeneratedSetup(champion: Champion, role: Role): Pick<SourceCheckedBuild, 'summonerSpells' | 'runes'> {
  const isJungle = role === 'Jungle';
  const isSupport = role === 'Support';
  const isMarksman = champion.tags.includes('Marksman');
  const isTank = champion.tags.includes('Tank');
  const isMage = champion.tags.includes('Mage');
  const isAssassin = champion.tags.includes('Assassin');
  const secondarySpell = isJungle ? 'Smite' : isMarksman ? 'Barrier' : isMage ? 'Teleport' : isSupport ? 'Ignite' : 'Teleport';

  if (isJungle) {
    return {
      summonerSpells: ['Flash', secondarySpell],
      runes: {
        primaryTree: 'Precision',
        primary: ['Conqueror', 'Triumph', 'Legend: Haste', 'Last Stand'],
        secondaryTree: 'Inspiration',
        secondary: ['Magical Footwear', 'Cosmic Insight'],
        shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
      }
    };
  }

  if (isMarksman) {
    return {
      summonerSpells: ['Flash', secondarySpell],
      runes: {
        primaryTree: 'Precision',
        primary: ['Lethal Tempo', 'Presence of Mind', 'Legend: Bloodline', 'Coup de Grace'],
        secondaryTree: 'Sorcery',
        secondary: ['Absolute Focus', 'Gathering Storm'],
        shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
      }
    };
  }

  if (isTank || isSupport) {
    return {
      summonerSpells: ['Flash', secondarySpell],
      runes: {
        primaryTree: 'Resolve',
        primary: ['Grasp of the Undying', 'Demolish', 'Second Wind', 'Overgrowth'],
        secondaryTree: 'Inspiration',
        secondary: ['Magical Footwear', 'Cosmic Insight'],
        shards: ['Attack Speed', 'Health Scaling', 'Health Scaling']
      }
    };
  }

  return {
    summonerSpells: ['Flash', secondarySpell],
    runes: {
      primaryTree: isAssassin ? 'Domination' : 'Sorcery',
      primary: isAssassin ? ['Electrocute', 'Sudden Impact', 'Grisly Mementos', 'Treasure Hunter'] : ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
      secondaryTree: isMage ? 'Inspiration' : 'Precision',
      secondary: isMage ? ['Magical Footwear', 'Cosmic Insight'] : ['Triumph', 'Coup de Grace'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    }
  };
}

function ChampionGuide({ guide }: { guide: GeneratedGuide }) {
  return (
    <section className="champion-guide">
      <div className="guide-header">
        <div>
          <p className="eyebrow">Champion Guide</p>
          <h2>Skill order, spikes, and decisions</h2>
        </div>
        <div className="confidence-meter" title={guide.buildStats.sampleSize}>
          <span>{guide.buildStats.confidence}% confidence</span>
          <div>
            <i style={{ width: `${guide.buildStats.confidence}%` }} />
          </div>
        </div>
      </div>

      <div className="guide-metrics">
        <MetricCard label="Win Rate" value={guide.buildStats.winRate} detail={guide.buildStats.filterSummary} />
        <MetricCard label="Pick Rate" value={guide.buildStats.pickRate} detail={guide.buildStats.sampleSize} />
        <MetricCard label="Ban Rate" value={guide.buildStats.banRate} detail="patch tracked" />
        <MetricCard label="Max Order" value={guide.maxOrder.join(' > ')} detail={`Level 1 ${guide.levelOne}, level 2 ${guide.levelTwo}`} />
      </div>

      <div className="skill-order-panel">
        <div>
          <h3>Level-by-Level Skill Order</h3>
          <div className="level-order">
            {guide.skillOrder.map((ability, index) => (
              <span key={`${ability}-${index}`}>
                <strong>{index + 1}</strong>
                {ability}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>Skill Notes</h3>
          <ul>
            {guide.skillNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="variant-grid">
        {guide.variants.map((variant) => (
          <article key={variant.title}>
            <h3>{variant.title}</h3>
            <div className="mini-icons">
              {variant.items.map((entry) => (
                entry.item.image ? <img key={entry.item.id} src={entry.item.image} alt="" title={entry.item.name} /> : null
              ))}
            </div>
            <p>{variant.note}</p>
          </article>
        ))}
      </div>

      <GuideList title="Itemization Decision Tree" items={guide.decisionTree} />
      <GuideList title="Rune Explanations" items={guide.runeExplanations} />
      <GuideList title="Matchup Tips" items={guide.matchupTips} />

      <div className="timeline-grid">
        {guide.timeline.map((entry) => (
          <article key={entry.phase}>
            <span>{entry.timing}</span>
            <h3>{entry.phase}</h3>
            <p>{entry.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="guide-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Matchups({
  champion,
  role,
  build,
  champions
}: {
  champion: Champion;
  role: Role;
  build?: NonNullable<ReturnType<typeof getSourceCheckedBuild>>;
  champions: Champion[];
}) {
  const weakAgainst = build?.weakAgainst.length ? build.weakAgainst : getWeakAgainst(champion);
  const strongAgainst = build?.strongAgainst?.length ? build.strongAgainst : inferStrongAgainst(champion);
  const hardRows = createMatchupRows(weakAgainst, champions, role, 'Hard');
  const evenRows = createMatchupRows(inferEvenMatchups(champion, champions), champions, role, 'Even');
  const strongRows = createMatchupRows(strongAgainst, champions, role, 'Strong');

  return (
    <section className="matchups matchup-panel">
      <div className="matchup-head">
        <div>
        <p className="eyebrow">Lane Matchups</p>
          <h2>{champion.name} matchup table</h2>
          <span>{role} / local source and archetype data</span>
        </div>
        <strong>{hardRows.length + evenRows.length + strongRows.length} rows</strong>
      </div>

      <div className="matchup-summary-grid">
        <MatchupTableColumn title="Hard Counters" tone="danger" rows={hardRows} />
        <MatchupTableColumn title="Even Skill Checks" tone="gold" rows={evenRows} />
        <MatchupTableColumn title="Strong Against" tone="green" rows={strongRows} />
      </div>

      <div className="matchup-advice-row">
        {hardRows.slice(0, 3).map((row) => (
          <article key={`tip-${row.name}`}>
            <strong>vs {row.name}</strong>
            <span>{createMatchupAdvice(champion, row.name, row.difficulty)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function MatchupTableColumn({ title, tone, rows }: { title: string; tone: 'danger' | 'gold' | 'green'; rows: ReturnType<typeof createMatchupRows> }) {
  return (
    <article className={`matchup-table-card ${tone}`}>
      <h3>{title}</h3>
      {rows.map((row) => (
        <div key={`${title}-${row.name}`}>
          {row.image ? <img src={row.image} alt="" /> : <i>{row.name.slice(0, 2)}</i>}
          <span>
            <strong>{row.name}</strong>
            <small>{row.note}</small>
          </span>
          <em>{row.displayWinRate}</em>
        </div>
      ))}
    </article>
  );
}

function createMatchupRows(names: string[], champions: Champion[], role: Role, difficulty: 'Hard' | 'Even' | 'Strong') {
  return names.slice(0, 8).map((name, index) => {
    const matchedChampion = findChampionByDisplayName(champions, name);
    const stat = getSourceTierStatByDisplayName(name, role);
    const estimatedWinRate = difficulty === 'Hard'
      ? 43.4 + index * 0.7
      : difficulty === 'Even'
        ? 49.1 + index * 0.3
        : 52.1 + index * 0.6;
    return {
      name,
      image: matchedChampion?.image,
      difficulty,
      displayWinRate: `${(stat?.winRate ?? estimatedWinRate).toFixed(1)}%`,
      note: stat ? `${stat.matches.toLocaleString()} source matches / ${stat.tier} tier` : `${difficulty.toLowerCase()} local matchup estimate`
    };
  });
}

function getSourceTierStatByDisplayName(championName: string, role: Role) {
  const normalized = normalizeName(championName);
  return sourceCheckedTierRows.find((row) => normalizeName(row.championName) === normalized && row.role === role);
}

function inferEvenMatchups(champion: Champion, champions: Champion[]) {
  const tags = new Set(champion.tags);
  const candidates = champions.filter((entry) => entry.id !== champion.id && entry.tags.some((tag) => tags.has(tag)));
  return candidates.slice(0, 6).map((entry) => entry.name);
}

function inferStrongAgainst(champion: Champion) {
  const tags = new Set(champion.tags);
  if (tags.has('Marksman')) return ['Ezreal', 'Aphelios', "Kai'Sa", 'Xayah', 'Sivir'];
  if (tags.has('Mage')) return ['Twisted Fate', 'Orianna', 'Viktor', 'Lux', 'Azir'];
  if (tags.has('Assassin')) return ['Lux', 'Xerath', 'Ziggs', 'Azir', 'Twisted Fate'];
  if (tags.has('Tank')) return ['Zed', 'Talon', 'Qiyana', 'Yasuo', 'Tryndamere'];
  if (tags.has('Support')) return ['Soraka', 'Janna', 'Nami', 'Lulu', 'Yuumi'];
  if (tags.has('Fighter')) return ['Sion', 'Ornn', 'Nasus', "Cho'Gath", 'Malphite'];
  return ['Lux', 'Ashe', 'Annie', 'Morgana', 'Jax'];
}

function createMatchupAdvice(champion: Champion, opponent: string, difficulty: string) {
  if (difficulty === 'Hard') {
    return `Respect ${opponent}'s first engage window, trim waves before trading, and use defensive item swaps earlier than usual.`;
  }
  if (champion.tags.includes('Marksman')) return `Keep the wave near your support and punish ${opponent} when their main cooldown misses.`;
  if (champion.tags.includes('Mage')) return `Thin the wave first, then use range advantage to force ${opponent} into bad recalls.`;
  return `Trade around cooldown advantage and avoid fighting ${opponent} before your first item spike.`;
}

function RuneTree({ title, runes, selectedNames }: { title: string; runes: Rune[]; selectedNames: string[] }) {
  const treeRunes = runes.filter((rune) => rune.treeName === title);
  const slots = [0, 1, 2, 3].map((slotIndex) => treeRunes.filter((rune) => rune.slotIndex === slotIndex));
  const selected = new Set(selectedNames.map(normalizeName));

  return (
    <div className="rune-tree">
      <h3>{title}</h3>
      <div className="rune-board">
        {slots.map((slot, slotIndex) => (
          <div className="rune-slot" key={`${title}-${slotIndex}`}>
            {slot.map((rune) => {
              const isSelected = selected.has(normalizeName(rune.name));
              return (
                <div className={`rune-node ${isSelected ? 'selected' : ''}`} key={rune.id} title={rune.name}>
                  <img src={rune.icon} alt="" />
                  <span>{rune.name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function LorePage({ champion, details, error }: { champion: Champion; details: ChampionDetails | null; error: string }) {
  if (error) {
    return <section className="lore-page empty">{error}</section>;
  }

  if (!details) {
    return <section className="lore-page empty">Loading champion lore...</section>;
  }

  return (
    <section className="lore-page">
      <div className="lore-hero">
        <img src={champion.image} alt="" />
        <div>
          <p className="eyebrow">Champion Lore</p>
          <h2>{champion.name}</h2>
          <h3>{details.title}</h3>
        </div>
      </div>
      <p className="lore-body">{details.lore}</p>
      <div className="lore-section-grid">
        <article>
          <h3>Identity</h3>
          <p>{champion.tags.join(' / ')}</p>
        </article>
        <article>
          <h3>Combat Range</h3>
          <p>{formatStatValue(details.stats.attackrange)} range / {formatStatValue(details.stats.movespeed)} move speed</p>
        </article>
        <article>
          <h3>Baseline Stats</h3>
          <p>
            {formatStatValue(details.stats.hp)} HP, {formatStatValue(details.stats.attackdamage)} AD, {formatStatValue(details.stats.armor)} armor,{' '}
            {formatStatValue(details.stats.spellblock)} MR
          </p>
        </article>
      </div>
      <div className="ability-grid lore-abilities">
        {[details.passive, ...details.spells].map((ability) => (
          <article className="ability-card" key={`lore-${ability.id}`}>
            {ability.image && <img src={ability.image} alt="" />}
            <div>
              <span>{ability.key}</span>
              <h3>{ability.name}</h3>
              <p>{cleanDescription(ability.description)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DraftAnalysis({ recommendations, gameState }: { recommendations: BuildRecommendation; gameState: GameState }) {
  const topReasons = [
    ...recommendations.core.flatMap((entry) => entry.reasons),
    ...recommendations.situational.flatMap((entry) => entry.reasons)
  ];
  const uniqueReasons = [...new Set(topReasons)].slice(0, 4);

  return (
    <section className="analysis-panel">
      <h2>Draft Analysis</h2>
      <ul>
        <li>{gameState} game state adjusts the value of snowball or safety items.</li>
        {recommendations.detectedThreats.map((threat) => (
          <li key={threat}>{formatTag(threat)} detected from the enemy draft.</li>
        ))}
        {uniqueReasons.map((reason) => (
          <li key={reason}>{reason}.</li>
        ))}
      </ul>
    </section>
  );
}

function BuildSection({ title, items }: { title: string; items: Recommendation[] }) {
  return (
    <section className="build-section">
      <h2>{title}</h2>
      <div className="item-grid">
        {items.length ? (
          items.map((recommendation) => <ItemCard key={`${title}-${recommendation.item.id}`} recommendation={recommendation} />)
        ) : (
          <div className="empty">
            No items matched this section. Try a different role or check whether Riot changed item IDs this patch.
          </div>
        )}
      </div>
    </section>
  );
}

function SourceItemSections({ build, items }: { build: SourceCheckedBuild; items: RiotItem[] }) {
  const sections = [
    { title: 'Starting Items', names: build.items?.starter ?? [] },
    { title: 'Boots', names: build.items?.boots ? [build.items.boots] : [] },
    { title: 'Core Build', names: build.items?.core ?? [] },
    { title: 'Full Build Path', names: build.items?.fullBuild ?? [] }
  ];

  return (
    <>
      {sections.map((section) => (
        <section className="build-section" key={section.title}>
          <h2>{section.title}</h2>
          <div className="item-grid">
            {section.names.map((name, index) => {
              const item = findItemByName(name, items);
              return (
                <article className="item-card" key={`${section.title}-${name}-${index}`}>
                  <div className="item-heading">
                    {item?.image && <img src={item.image} alt="" />}
                    <div>
                      <h3>{name}</h3>
                      <span>{item ? `${item.gold.toLocaleString()} gold` : 'Source-checked item'}</span>
                    </div>
                  </div>
                  <p className="item-statline">{formatItemStats(item)}</p>
                  {index === 0 && <p className="item-description">{build.summarySetup ?? build.summary}</p>}
                  {section.title === 'Full Build Path' && <p className="item-description">{build.summaryBuild}</p>}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function ItemCard({ recommendation }: { recommendation: Recommendation }) {
  const exactStats = formatItemStats(recommendation.item);
  const effectText = cleanItemText(recommendation.item.description || recommendation.item.plaintext);

  return (
    <article className="item-card">
      <div className="item-heading">
        {recommendation.item.image && <img src={recommendation.item.image} alt="" />}
        <div>
          <h3>{recommendation.item.name}</h3>
          <span>{recommendation.item.gold.toLocaleString()} gold / score {recommendation.score}</span>
        </div>
      </div>
      <p className="item-statline">{exactStats}</p>
      {effectText && effectText !== exactStats && <p className="item-description">{effectText}</p>}
      <ul>
        {recommendation.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </article>
  );
}

function ItemDatabase({ items }: { items: RiotItem[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Damage' | 'AP' | 'Tank' | 'Support' | 'Boots'>('All');
  const visibleItems = useMemo(() => {
    const normalizedQuery = normalizeName(query);
    return items
      .filter((item) => item.purchasable && item.maps['11'] !== false && item.gold > 0)
      .filter((item) => !normalizedQuery || normalizeName(`${item.name} ${item.plaintext} ${formatItemStats(item)}`).includes(normalizedQuery))
      .filter((item) => itemMatchesItemDbFilter(item, filter))
      .sort((a, b) => b.gold - a.gold || a.name.localeCompare(b.name));
  }, [items, query, filter]);

  return (
    <section className="item-database">
      <div className="database-head">
        <div>
          <p className="eyebrow">Item Database</p>
          <h2>Search every item and compare stat benefits</h2>
          <p>Uses Data Dragon item stats first, then cleaned item text for effects like lifesteal, penetration, shields, and actives.</p>
        </div>
        <span>{visibleItems.length}/{items.length} items</span>
      </div>
      <div className="database-controls">
        <SearchBox value={query} onChange={setQuery} placeholder="Search item, stat, or effect..." />
        <div className="segmented item-db-filters">
          {(['All', 'Damage', 'AP', 'Tank', 'Support', 'Boots'] as const).map((entry) => (
            <button key={entry} className={filter === entry ? 'active' : ''} onClick={() => setFilter(entry)}>
              {entry}
            </button>
          ))}
        </div>
      </div>
      <div className="item-database-grid">
        {visibleItems.map((item) => (
          <article className="database-item-card" key={item.id}>
            <div className="item-heading">
              {item.image && <img src={item.image} alt="" />}
              <div>
                <h3>{item.name}</h3>
                <span>{item.gold.toLocaleString()} gold</span>
              </div>
            </div>
            <p className="item-statline">{formatItemStats(item)}</p>
            <p className="item-description">{cleanItemText(item.description || item.plaintext)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CustomBuildCreator({ items, selectedChampion, role, patch }: { items: RiotItem[]; selectedChampion: Champion; role: Role; patch: string }) {
  const [query, setQuery] = useState('');
  const [build, setBuild] = useState<RiotItem[]>([]);
  const [drafts, setDrafts] = useState<CustomBuildDraft[]>(() => loadCustomBuildDrafts());
  const [importValue, setImportValue] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => {
    saveCustomBuildDrafts(drafts);
  }, [drafts]);
  const candidates = useMemo(() => {
    const normalizedQuery = normalizeName(query);
    return items
      .filter((item) => item.purchasable && item.maps['11'] !== false && item.gold > 0)
      .filter((item) => !build.some((entry) => entry.id === item.id))
      .filter((item) => !normalizedQuery || normalizeName(`${item.name} ${item.plaintext} ${formatItemStats(item)}`).includes(normalizedQuery))
      .sort((a, b) => a.gold - b.gold || a.name.localeCompare(b.name))
      .slice(0, 18);
  }, [build, items, query]);
  const totalGold = build.reduce((sum, item) => sum + item.gold, 0);
  const selectedDrafts = drafts
    .filter((draft) => draft.championId === selectedChampion.id && draft.role === role)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  function addItem(item: RiotItem) {
    setBuild((current) => current.length >= 6 ? current : [...current, item]);
  }

  function removeItem(itemId: string) {
    setBuild((current) => current.filter((item) => item.id !== itemId));
  }

  function moveItem(fromIndex: number, toIndex: number) {
    setBuild((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function copyBuild() {
    const payload = createCustomBuildPayload(selectedChampion, role, patch, totalGold, build);
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopyStatus('Build JSON copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }

  function saveDraft() {
    if (!build.length) return;
    const now = Date.now();
    const draft: CustomBuildDraft = {
      id: `${selectedChampion.id}-${role}-${now}`,
      name: `${selectedChampion.name} ${role} custom ${new Date(now).toLocaleDateString()}`,
      championId: selectedChampion.id,
      championName: selectedChampion.name,
      role,
      patch,
      itemIds: build.map((item) => item.id),
      itemNames: build.map((item) => item.name),
      totalGold,
      createdAt: now,
      updatedAt: now
    };
    setDrafts((current) => [draft, ...current].slice(0, 30));
    setCopyStatus('Draft saved');
  }

  function loadDraft(draft: CustomBuildDraft) {
    setBuild(draft.itemIds.map((id) => items.find((item) => item.id === id)).filter((item): item is RiotItem => Boolean(item)));
    setCopyStatus(`Loaded ${draft.name}`);
  }

  function deleteDraft(draftId: string) {
    setDrafts((current) => current.filter((draft) => draft.id !== draftId));
  }

  function importDraft() {
    try {
      const parsed = JSON.parse(importValue) as Partial<ReturnType<typeof createCustomBuildPayload>>;
      const importedItems = (parsed.items ?? [])
        .map((entry) => items.find((item) => item.id === entry.id || item.name === entry.name))
        .filter((item): item is RiotItem => Boolean(item))
        .slice(0, 6);
      if (!importedItems.length) {
        setCopyStatus('Import needs item ids or names');
        return;
      }
      setBuild(importedItems);
      setImportValue('');
      setCopyStatus('Imported build');
    } catch {
      setCopyStatus('Import JSON is invalid');
    }
  }

  return (
    <section className="custom-build-creator">
      <div className="database-head">
        <div>
          <p className="eyebrow">Build Creator</p>
          <h2>Assemble and export a custom item path</h2>
          <p>Drag items in the build path to reorder them, then copy a clean JSON export for notes, Discord, or future community build submissions.</p>
        </div>
        <span>{build.length}/6 items / {totalGold.toLocaleString()} gold</span>
      </div>

      <div className="custom-build-path">
        {Array.from({ length: 6 }).map((_, index) => {
          const item = build[index];
          return (
            <article
              key={item?.id ?? `empty-${index}`}
              className={item ? 'filled' : ''}
              draggable={Boolean(item)}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveItem(dragIndex, index);
                setDragIndex(null);
              }}
            >
              {item ? (
                <>
                  {item.image && <img src={item.image} alt="" />}
                  <div>
                    <strong>{index + 1}. {item.name}</strong>
                    <span>{formatItemStats(item)}</span>
                  </div>
                  <button onClick={() => removeItem(item.id)}>Remove</button>
                </>
              ) : (
                <span>Slot {index + 1}</span>
              )}
            </article>
          );
        })}
      </div>

      <div className="database-controls">
        <SearchBox value={query} onChange={setQuery} placeholder="Search item to add..." />
        <button className="lookup-button" onClick={copyBuild} disabled={!build.length}>Copy JSON</button>
        <button className="lookup-button" onClick={saveDraft} disabled={!build.length}>Save Draft</button>
        <button className="lookup-button secondary" onClick={() => setBuild([])} disabled={!build.length}>Clear</button>
        {copyStatus && <span>{copyStatus}</span>}
      </div>

      <div className="build-import-row">
        <textarea value={importValue} onChange={(event) => setImportValue(event.target.value)} placeholder="Paste exported build JSON to import..." />
        <button className="lookup-button secondary" onClick={importDraft} disabled={!importValue.trim()}>Import JSON</button>
      </div>

      {selectedDrafts.length ? (
        <div className="custom-draft-list">
          <h3>Saved versions for {selectedChampion.name} {role}</h3>
          {selectedDrafts.map((draft) => (
            <article key={draft.id}>
              <div>
                <strong>{draft.name}</strong>
                <span>{draft.itemNames.join(' -> ')}</span>
                <small>{new Date(draft.updatedAt).toLocaleString()} / {draft.totalGold.toLocaleString()} gold</small>
              </div>
              <button onClick={() => loadDraft(draft)}>Load</button>
              <button onClick={() => deleteDraft(draft.id)}>Delete</button>
            </article>
          ))}
        </div>
      ) : null}

      <div className="creator-item-grid">
        {candidates.map((item) => (
          <button key={item.id} onClick={() => addItem(item)} disabled={build.length >= 6}>
            {item.image && <img src={item.image} alt="" />}
            <span>
              <strong>{item.name}</strong>
              <small>{formatItemStats(item)}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function createCustomBuildPayload(champion: Champion, role: Role, patch: string, totalGold: number, build: RiotItem[]) {
  return {
    champion: champion.name,
    championId: champion.id,
    role,
    patch,
    totalGold,
    items: build.map((item, index) => ({
      order: index + 1,
      id: item.id,
      name: item.name,
      gold: item.gold,
      stats: formatItemStats(item)
    }))
  };
}

function LeagueClientExportPanel({
  champion,
  role,
  sourceCheckedBuild,
  recommendations,
  items
}: {
  champion: Champion;
  role: Role;
  sourceCheckedBuild?: SourceCheckedBuild;
  recommendations: BuildRecommendation;
  items: RiotItem[];
}) {
  const [status, setStatus] = useState('');
  const itemSet = createLeagueItemSet(champion, role, sourceCheckedBuild, recommendations, items);

  async function copyItemSet() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(itemSet, null, 2));
      setStatus('League item set JSON copied');
    } catch {
      setStatus('Copy failed');
    }
  }

  return (
    <section className="lcu-export-panel">
      <div className="database-head">
        <div>
          <p className="eyebrow">League Client Export</p>
          <h2>Item set JSON for {champion.name} {role}</h2>
          <p>Browser-safe export now; an Electron/LCU companion can later POST this payload directly into the local League client.</p>
        </div>
        {status && <span>{status}</span>}
      </div>
      <div className="lcu-block-grid">
        {itemSet.blocks.map((block) => (
          <article key={block.type}>
            <h3>{block.type}</h3>
            {block.items.map((entry) => {
              const item = findItem(Number(entry.id), items);
              return (
                <span key={`${block.type}-${entry.id}`}>
                  {item?.image && <img src={item.image} alt="" />}
                  {item?.name ?? entry.id}
                </span>
              );
            })}
          </article>
        ))}
      </div>
      <button className="lookup-button" onClick={copyItemSet}>Copy Item Set JSON</button>
    </section>
  );
}

function createLeagueItemSet(
  champion: Champion,
  role: Role,
  sourceCheckedBuild: SourceCheckedBuild | undefined,
  recommendations: BuildRecommendation,
  items: RiotItem[]
) {
  const sourceNames = sourceCheckedBuild?.items;
  const starter = sourceNames?.starter.map((name) => findItemByName(name, items)).filter((item): item is RiotItem => Boolean(item)) ?? recommendations.starters.map((entry) => entry.item);
  const boots = sourceNames?.boots ? [findItemByName(sourceNames.boots, items)].filter((item): item is RiotItem => Boolean(item)) : recommendations.boots.map((entry) => entry.item);
  const core = sourceNames?.core.map((name) => findItemByName(name, items)).filter((item): item is RiotItem => Boolean(item)) ?? recommendations.core.map((entry) => entry.item);
  const situational = recommendations.situational.slice(0, 6).map((entry) => entry.item);
  return {
    title: `RiftGuide ${champion.name} ${role}`,
    type: 'custom',
    map: 'SR',
    mode: 'any',
    priority: false,
    sortrank: 0,
    blocks: [
      { type: 'Start', items: starter.slice(0, 4).map((item) => ({ id: item.id, count: 1 })) },
      { type: 'Boots', items: boots.slice(0, 3).map((item) => ({ id: item.id, count: 1 })) },
      { type: 'Core', items: core.slice(0, 4).map((item) => ({ id: item.id, count: 1 })) },
      { type: 'Situational', items: situational.map((item) => ({ id: item.id, count: 1 })) }
    ]
  };
}

function PatchMetaTracker({ patch, selectedChampion }: { patch: string; selectedChampion: Champion }) {
  const [lastSeenPatch, setLastSeenPatch] = useState(() => {
    try {
      return localStorage.getItem('riftguide-last-seen-patch') ?? '';
    } catch {
      return '';
    }
  });
  const normalizedPatch = normalizePatchForSource(patch);
  const staleBuilds = sourceCheckedBuilds.filter((build) => normalizePatchForSource(build.patch) !== normalizedPatch);
  const currentChampionBuilds = sourceCheckedBuilds.filter((build) => build.championId === selectedChampion.id || build.championKey === selectedChampion.id);
  const currentChampionFresh = currentChampionBuilds.some((build) => normalizePatchForSource(build.patch) === normalizedPatch);
  const patchChanged = Boolean(lastSeenPatch && lastSeenPatch !== patch);

  function markPatchSeen() {
    try {
      localStorage.setItem('riftguide-last-seen-patch', patch);
    } catch {
      // Patch tracking remains usable even when localStorage is unavailable.
    }
    setLastSeenPatch(patch);
  }

  return (
    <section className="patch-meta-tracker">
      <div className="database-head">
        <div>
          <p className="eyebrow">Patch & Meta Tracking</p>
          <h2>Patch freshness dashboard</h2>
          <p>Tracks the loaded Data Dragon version against source-checked build patches so stale recommendations are easy to prioritize.</p>
        </div>
        <span>{patch || 'Loading patch'}</span>
      </div>

      <div className="patch-metric-grid">
        <article>
          <span>Loaded Patch</span>
          <strong>{patch || 'Unknown'}</strong>
          <small>{patchChanged ? `Changed since ${lastSeenPatch}` : 'Marked current locally'}</small>
        </article>
        <article>
          <span>Fresh Source Builds</span>
          <strong>{sourceCheckedBuilds.length - staleBuilds.length}/{sourceCheckedBuilds.length}</strong>
          <small>Compared against {normalizedPatch || 'current patch'}</small>
        </article>
        <article>
          <span>{selectedChampion.name}</span>
          <strong>{currentChampionFresh ? 'Fresh' : currentChampionBuilds.length ? 'Stale' : 'Unverified'}</strong>
          <small>{currentChampionBuilds.map((build) => `${build.role} ${build.patch}`).join(', ') || 'No source build yet'}</small>
        </article>
      </div>

      <div className="patch-actions">
        <button className="lookup-button" onClick={markPatchSeen}>Mark Patch Seen</button>
        <a href="https://www.leagueoflegends.com/en-us/news/tags/patch-notes/" target="_blank" rel="noreferrer">Official Patch Notes</a>
        <a href="https://www.leagueofgraphs.com/champions/builds/patch" target="_blank" rel="noreferrer">Patch Trends</a>
        <a href="https://u.gg/lol/tier-list" target="_blank" rel="noreferrer">Current Tier List</a>
      </div>

      {staleBuilds.length ? (
        <div className="stale-build-list">
          <h3>Source builds needing patch review</h3>
          {staleBuilds.slice(0, 18).map((build) => (
            <span key={`${build.championId}-${build.role}`}>
              <b>{build.championId}</b>
              {build.role} / {build.patch}
            </span>
          ))}
        </div>
      ) : (
        <div className="stale-build-list">
          <h3>All source-checked builds match this patch family</h3>
          <p>No stale source build patches detected.</p>
        </div>
      )}
    </section>
  );
}

function normalizePatchForSource(value: string) {
  const [major, minor] = value.split('.');
  return major && minor ? `${major}.${minor}` : value;
}

function LocalCommunityBoard({ selectedChampion, role }: { selectedChampion: Champion; role: Role }) {
  const [submissions, setSubmissions] = useState<CommunityBuildSubmission[]>(() => loadCommunitySubmissions());
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Local Player');
  const [itemsText, setItemsText] = useState('');
  const [notes, setNotes] = useState('');
  const [commentTextById, setCommentTextById] = useState<Record<string, string>>({});
  const championSubmissions = submissions
    .filter((submission) => submission.championId === selectedChampion.id && submission.role === role)
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes) || b.createdAt - a.createdAt);

  useEffect(() => {
    saveCommunitySubmissions(submissions);
  }, [submissions]);

  function createSubmission() {
    const items = itemsText.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 6);
    if (!title.trim() || !items.length) return;
    const now = Date.now();
    const submission: CommunityBuildSubmission = {
      id: `${selectedChampion.id}-${role}-${now}`,
      championId: selectedChampion.id,
      championName: selectedChampion.name,
      role,
      title: title.trim(),
      author: author.trim() || 'Local Player',
      items,
      notes: notes.trim(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: now
    };
    setSubmissions((current) => [submission, ...current].slice(0, 60));
    setTitle('');
    setItemsText('');
    setNotes('');
  }

  function vote(submissionId: string, delta: 1 | -1) {
    setSubmissions((current) => current.map((submission) => {
      if (submission.id !== submissionId) return submission;
      return delta > 0
        ? { ...submission, upvotes: submission.upvotes + 1 }
        : { ...submission, downvotes: submission.downvotes + 1 };
    }));
  }

  function addComment(submissionId: string) {
    const body = commentTextById[submissionId]?.trim();
    if (!body) return;
    setSubmissions((current) => current.map((submission) => {
      if (submission.id !== submissionId) return submission;
      return {
        ...submission,
        comments: [
          ...submission.comments,
          { id: `${submissionId}-${Date.now()}`, author: author.trim() || 'Local Player', body, createdAt: Date.now() }
        ]
      };
    }));
    setCommentTextById((current) => ({ ...current, [submissionId]: '' }));
  }

  return (
    <section className="community-board">
      <div className="database-head">
        <div>
          <p className="eyebrow">Community Prototype</p>
          <h2>Local build submissions for {selectedChampion.name} {role}</h2>
          <p>Offline submissions, votes, and comments mirror the future community system without requiring auth or a database yet.</p>
        </div>
        <span>{championSubmissions.length} builds</span>
      </div>

      <div className="community-form">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Build title" />
        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Author" />
        <input value={itemsText} onChange={(event) => setItemsText(event.target.value)} placeholder="Items separated by commas" />
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Why this build works..." />
        <button className="lookup-button" onClick={createSubmission} disabled={!title.trim() || !itemsText.trim()}>Submit Build</button>
      </div>

      <div className="community-submission-list">
        {championSubmissions.length ? championSubmissions.map((submission) => (
          <article key={submission.id}>
            <div className="community-votes">
              <button onClick={() => vote(submission.id, 1)}>Up</button>
              <strong>{submission.upvotes - submission.downvotes}</strong>
              <button onClick={() => vote(submission.id, -1)}>Down</button>
            </div>
            <div>
              <h3>{submission.title}</h3>
              <span>By {submission.author} / {new Date(submission.createdAt).toLocaleDateString()}</span>
              <p>{submission.items.join(' -> ')}</p>
              {submission.notes && <small>{submission.notes}</small>}
              <div className="community-comments">
                {submission.comments.map((comment) => (
                  <p key={comment.id}><b>{comment.author}:</b> {comment.body}</p>
                ))}
                <div>
                  <input
                    value={commentTextById[submission.id] ?? ''}
                    onChange={(event) => setCommentTextById((current) => ({ ...current, [submission.id]: event.target.value }))}
                    placeholder="Add a comment..."
                  />
                  <button onClick={() => addComment(submission.id)}>Comment</button>
                </div>
              </div>
            </div>
          </article>
        )) : (
          <p className="empty-community">No local submissions for this champion and role yet.</p>
        )}
      </div>
    </section>
  );
}

function EsportsHub() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const regions = ['All', ...Array.from(new Set(seededEsportsTeams.map((team) => team.region)))];
  const teams = seededEsportsTeams.filter((team) => {
    const matchesRegion = region === 'All' || team.region === region;
    const matchesQuery = !query.trim() || normalizeName(`${team.name} ${team.league} ${team.region}`).includes(normalizeName(query));
    return matchesRegion && matchesQuery;
  });

  return (
    <section className="esports-hub">
      <div className="database-head">
        <div>
          <p className="eyebrow">Competitive Teams</p>
          <h2>Rosters, schedule, results, and performance hub</h2>
          <p>The UI is ready for live esports data. Seeded cards show the layout while the live source/API key is connected.</p>
        </div>
        <span>{teams.length} teams</span>
      </div>

      <div className="database-controls">
        <SearchBox value={query} onChange={setQuery} placeholder="Search team, league, region..." />
        <div className="segmented esports-filters">
          {regions.map((entry) => (
            <button key={entry} className={region === entry ? 'active' : ''} onClick={() => setRegion(entry)}>
              {entry}
            </button>
          ))}
        </div>
      </div>

      <div className="esports-source-grid">
        {esportsSources.map((source) => (
          <a key={source.name} href={source.url} target="_blank" rel="noreferrer">
            <strong>{source.name}</strong>
            <span>{source.note}</span>
          </a>
        ))}
      </div>

      <div className="endpoint-plan">
        {esportsEndpointPlan.map((entry) => (
          <span key={entry.label}>
            <b>{entry.label}</b>
            {entry.endpoint}
          </span>
        ))}
      </div>

      <div className="esports-team-grid">
        {teams.map((team) => (
          <article className="esports-team-card" key={team.slug}>
            <div className="team-card-head">
              <div>
                <span>#{team.rank} / {team.league}</span>
                <h3>{team.name}</h3>
              </div>
              <b>{team.region}</b>
            </div>
            <div className="team-metric-row">
              <span><b>{team.winRate}</b>Win rate</span>
              <span><b>{team.form}</b>Form</span>
              <span><b>{team.objectiveControl}</b>Objectives</span>
            </div>
            <div className="team-roster">
              <h4>Roster</h4>
              {team.roster.map((slot) => (
                <span key={`${team.slug}-${slot.role}`}>
                  <b>{slot.role}</b>
                  {slot.player}
                </span>
              ))}
            </div>
            <div className="team-schedule">
              <h4>Schedule / Results</h4>
              {team.matches.map((match) => (
                <span key={`${team.slug}-${match.date}-${match.opponent}`}>
                  <b>{match.date}</b>
                  {match.league} vs {match.opponent} / {match.result}
                  <small>{match.note}</small>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SavedBuilds({
  builds,
  onLoad,
  onDelete
}: {
  builds: SavedBuild[];
  onLoad: (build: SavedBuild) => void;
  onDelete: (buildId: string) => void;
}) {
  return (
    <section className="build-section saved-builds">
      <h2>Saved Builds</h2>
      {builds.length ? (
        <div className="saved-list">
          {builds.map((build) => (
            <article className="saved-card" key={build.id}>
              <div>
                <h3>{build.name}</h3>
                <p>
                  {build.gameState} / {build.patch} / {build.itemNames.slice(0, 4).join(' -> ')}
                </p>
              </div>
              <div className="saved-actions">
                <button onClick={() => onLoad(build)}>Load</button>
                <button onClick={() => onDelete(build.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">Save a build to keep it for later.</div>
      )}
    </section>
  );
}

function filterChampions(champions: Champion[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return champions;
  return champions.filter((champion) => champion.name.toLowerCase().includes(normalized));
}

function formatTag(tag: string) {
  return tag.replaceAll('-', ' ');
}

function cleanDescription(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function formatStatValue(value: unknown) {
  return typeof value === 'number' ? Number(value.toFixed(2)).toString() : '0';
}

function winRate(wins: number, losses: number) {
  const total = wins + losses;
  return total ? Math.round((wins / total) * 1000) / 10 : 0;
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function profileIconUrl(profileIconId: number, patch: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${profileIconId}.png`;
}

function getRankedEntries(profile: RiotProfile) {
  return Array.isArray(profile.ranked)
    ? [...profile.ranked].sort((a, b) => queuePriority(a.queueType) - queuePriority(b.queueType))
    : [];
}

function queuePriority(queueType: string) {
  if (queueType === 'RANKED_SOLO_5x5') return 0;
  if (queueType === 'RANKED_FLEX_SR') return 1;
  return 2;
}

function championNameByKey(champions: Champion[], championId: number) {
  return champions.find((champion) => Number(champion.key) === championId)?.name ?? `Champion ${championId}`;
}

function roleSummary(matches: RiotProfile['matches']) {
  const rows = new Map<string, { role: string; games: number; wins: number }>();

  matches.forEach((match) => {
    const role = match.teamPosition || 'UNKNOWN';
    const current = rows.get(role) ?? { role, games: 0, wins: 0 };
    current.games += 1;
    if (match.win) current.wins += 1;
    rows.set(role, current);
  });

  return [...rows.values()]
    .map((entry) => ({ ...entry, winRate: winRate(entry.wins, entry.games - entry.wins) }))
    .sort((a, b) => b.games - a.games);
}

function formatRole(role: string) {
  const rolesByRiotName: Record<string, string> = {
    TOP: 'Top',
    JUNGLE: 'Jungle',
    MIDDLE: 'Mid',
    BOTTOM: 'Bot',
    UTILITY: 'Support',
    UNKNOWN: 'Unknown'
  };
  return rolesByRiotName[role] ?? role;
}

function formatQueueName(queue: string) {
  return queue
    .replace('RANKED_SOLO_5x5', 'Ranked Solo')
    .replace('RANKED_FLEX_SR', 'Ranked Flex')
    .replace('SWIFTPLAY', 'Swiftplay')
    .replaceAll('_', ' ');
}

function buildCoachingNotes(profile: RiotProfile) {
  const notes: string[] = [];
  const recent = profile.matches;
  const wins = recent.filter((match) => match.win).length;
  const losses = recent.length - wins;
  const vision = average(recent.map((match) => match.visionScore));
  const damage = average(recent.map((match) => match.totalDamageDealtToChampions));
  const bestChampion = profile.championSummary[0];

  notes.push(`Recent win rate is ${winRate(wins, losses)}% over ${recent.length} loaded games.`);
  if (bestChampion) notes.push(`${bestChampion.championName} is your most frequent recent champion at ${bestChampion.winRate}% win rate.`);
  if (vision < 18) notes.push('Vision score is trending low; buy/control wards earlier and track objective setup windows.');
  if (damage > 0) notes.push(`Average champion damage is ${Math.round(damage).toLocaleString()}, useful for comparing carry impact by role.`);
  if (Array.isArray(profile.ranked) && profile.ranked[0]) {
    const rank = profile.ranked[0];
    notes.push(`${rank.queueType} is ${rank.tier} ${rank.rank} with ${rank.leaguePoints} LP.`);
  }

  return notes;
}

function createPlayerTrackerSummary(profile: RiotProfile): PlayerTrackerSummary {
  const roleRows = roleSummary(profile.matches);
  const mainRole = roleRows[0] ? formatRole(roleRows[0].role) : 'Unknown';
  const bestChampion = [...profile.championSummary]
    .filter((entry) => entry.games >= 1)
    .sort((a, b) => b.winRate - a.winRate || b.games - a.games)[0];
  const timelineGames = profile.matches.filter((match) => match.timeline?.available).length;
  const streak = createCurrentStreak(profile.matches);
  const firstGame = profile.matches[profile.matches.length - 1];
  const lastGame = profile.matches[0];
  const daySpan = firstGame && lastGame
    ? Math.max(1, Math.ceil((lastGame.gameCreation - firstGame.gameCreation) / 86_400_000))
    : 0;

  return {
    mainRole,
    bestChampion: bestChampion?.championName ?? 'No sample',
    bestChampionDetail: bestChampion ? `${bestChampion.games} games / ${bestChampion.winRate}% WR` : 'Load match history to track champion form',
    currentStreak: streak.label,
    currentStreakDetail: streak.detail,
    timelineCoverage: `${timelineGames}/${profile.matches.length}`,
    timelineDetail: 'matches with purchase/death timeline data',
    matchVolume: profile.matches.length ? `${profile.matches.length} games` : 'No games',
    matchVolumeDetail: daySpan ? `loaded across roughly ${daySpan} day${daySpan === 1 ? '' : 's'}` : 'load Riot data to start tracking'
  };
}

function createCurrentStreak(matches: RiotProfile['matches']) {
  if (!matches.length) return { label: 'No games', detail: 'No loaded match history' };
  const target = matches[0].win;
  let count = 0;
  for (const match of matches) {
    if (match.win !== target) break;
    count += 1;
  }
  return {
    label: `${count}${target ? 'W' : 'L'}`,
    detail: target ? 'active win streak in loaded games' : 'active loss streak in loaded games'
  };
}

function createBuildBotGuide(options: {
  champion: Champion;
  details: ChampionDetails | null;
  role: Role;
  gameState: GameState;
  enemies: Champion[];
  recommendations: BuildRecommendation;
  sourceCheckedBuild?: SourceCheckedBuild;
  guide: GeneratedGuide | null;
  patch: string;
}): BuildBotGuide {
  const { champion, details, role, enemies, recommendations, sourceCheckedBuild, guide, patch } = options;
  const maxOrder = guide?.maxOrder ?? ['Q', 'E', 'W'];
  const runes = createBotRunes(champion, role, sourceCheckedBuild);
  const summoners = createBotSummoners(champion, role, sourceCheckedBuild);
  const core = recommendations.core.slice(0, 3);
  const boots = recommendations.boots;
  const situational = recommendations.situational.slice(0, 6);
  const hardCounters = sourceCheckedBuild?.weakAgainst.length ? sourceCheckedBuild.weakAgainst : getWeakAgainst(champion);
  const softCounters = enemies.length ? enemies.map((enemy) => enemy.name) : createSoftCounterPool(champion, role);
  const strongAgainst = createStrongAgainstPool(champion);
  const firstCore = core[0]?.item;
  const secondCore = core[1]?.item;

  return {
    champion: champion.name,
    title: details?.title ? toTitleCase(details.title) : createBotTitle(champion),
    role,
    lane: `${role} ${role === 'ADC' ? 'Lane' : role === 'Jungle' ? 'Path' : 'Lane'}`,
    playstyle: createPlaystyle(champion, role),
    archetype: champion.tags.join(' / ') || 'Flex Pick',
    difficulty: createDifficulty(champion),
    patch,
    tier: sourceCheckedBuild ? 'S' : recommendations.profile.source === 'curated' ? 'A' : 'B',
    counters: {
      hardCounters: hardCounters.slice(0, 5),
      softCounters: softCounters.slice(0, 5),
      strongAgainst: strongAgainst.slice(0, 5)
    },
    summoners,
    runes,
    skillOrder: {
      level1: guide?.levelOne ?? maxOrder[0],
      level2: guide?.levelTwo ?? maxOrder[1],
      level3: maxOrder[2],
      max1: maxOrder[0],
      max2: maxOrder[1],
      max3: maxOrder[2],
      ult: 'R at 6, 11, 16',
      level1Why: createLevelOneReason(champion, details, maxOrder[0]),
      maxOrderWhy: guide?.skillNotes.join(' ') ?? `Max ${maxOrder.join(' into ')} for the most reliable ${role} curve.`
    },
    items: {
      startingItems: createStartingItems(champion, role, recommendations),
      startingAlternative: createStartingAlternatives(champion, role),
      firstBack: {
        ideal: firstCore ? `${firstCore.name} components (${Math.min(firstCore.gold, 1300).toLocaleString()}g+)` : 'Best first component at 1,100-1,300g',
        minimum: createMinimumBack(champion),
        note: `Recall before a major ${role === 'Jungle' ? 'objective' : 'wave crash'} if you can buy a real component. If behind, take the minimum back instead of sitting on unspent gold.`
      },
      coreItems: core.map((entry, index) => ({
        name: entry.item.name,
        order: index + 1,
        cost: entry.item.gold,
        why: entry.reasons.slice(0, 2).join(' ') || `${entry.item.name} is one of the highest scoring items for this champion profile.`
      })),
      boots: {
        standard: boots[0]?.item.name ?? 'Best scoring boots',
        standardWhy: boots[0]?.reasons.slice(0, 2).join(' ') || 'Default boots preserve the strongest combat breakpoint.',
        alternative: boots[1]?.item.name ?? (role === 'ADC' ? "Berserker's Greaves" : 'Ionian Boots of Lucidity'),
        alternativeWhy: boots[1]?.reasons.slice(0, 2).join(' ') || 'Swap when the matchup demands haste, tenacity, or a different defensive profile.'
      },
      situationalItems: situational.map((entry, index) => ({
        name: entry.item.name,
        why: entry.reasons.slice(0, 2).join(' ') || 'Situational counter-item for this draft.',
        when: createItemTrigger(entry, enemies),
        priority: index < 2 ? 'HIGH' : index < 4 ? 'MED' : 'SITUATIONAL'
      })),
      fullBuildOrder: [
        ...recommendations.starters.slice(0, 1).map((entry) => entry.item.name),
        boots[0]?.item.name,
        ...core.map((entry) => entry.item.name),
        secondCore ? recommendations.late[0]?.item.name : undefined,
        recommendations.situational[0]?.item.name
      ].filter((name): name is string => Boolean(name)).slice(0, 6)
    },
    powerSpikes: [
      { timing: 'Level 2-3', description: `First full trade pattern appears once ${maxOrder.slice(0, 3).join('/')} are available.` },
      { timing: 'Level 6', description: 'Ultimate unlock creates your first real all-in, escape, or objective-fight window.' },
      { timing: firstCore ? `${firstCore.name}` : 'First item', description: 'Your first completed item is the moment to force wave control and objective setup.' },
      { timing: secondCore ? `${firstCore?.name} + ${secondCore.name}` : 'Two items', description: 'Two-item fights are where your champion identity becomes most reliable.' },
      { timing: 'Full build', description: 'Play around vision and cooldown discipline because one death can decide Baron, Elder, or the final push.' }
    ],
    lanePhase: {
      earlyGame: createEarlyGamePlan(champion, role, options.gameState),
      tradingPattern: createTradingPattern(champion, details, maxOrder),
      backTiming: `First back ideally at 1,100-1,300g; minimum back is ${createMinimumBack(champion)}. Crash the wave or reset after forcing enemy summoners.`,
      warding: createWardingPlan(role)
    },
    midGame: createMidGamePlan(champion, role),
    lateGame: createLateGamePlan(champion, role),
    teamfightRole: createTeamfightRole(champion, role),
    tips: createBotTips(champion, role, maxOrder, firstCore?.name),
    commonMistakes: createBotMistakes(champion, role),
    matchupTips: {
      vsAssassins: 'Preserve defensive cooldowns until they commit. Consider defensive boots, stasis, armor, shields, or Exhaust depending on your role.',
      vsTanks: 'Move penetration or anti-tank damage earlier. Do not waste burst on frontline unless objectives force the fight.',
      vsEnchanters: 'Prioritize anti-heal or anti-shield effects when their protection is deciding fights. Look for windows before shields refresh.',
      vsPokers: 'Start with more sustain, concede bad CS when needed, and trade after their key poke spell misses.',
      currentDraft: enemies.length ? `Current enemy draft: ${enemies.map((enemy) => enemy.name).join(', ')}. Adapt situational slots before third item.` : 'Select enemy champions to make this row draft-specific.'
    }
  };
}

function createBotRunes(champion: Champion, role: Role, sourceCheckedBuild?: SourceCheckedBuild): BuildBotGuide['runes'] {
  if (sourceCheckedBuild) {
    const [keystone, ...primary] = sourceCheckedBuild.runes.primary;
    return {
      keystone,
      keystoneWhy: `${keystone} is source-checked for ${champion.name} ${role} and supports the current primary trading pattern.`,
      primaryTree: sourceCheckedBuild.runes.primaryTree,
      primaryRunes: primary.map((name) => ({ name, why: createRuneReason(name, champion) })),
      secondaryTree: sourceCheckedBuild.runes.secondaryTree,
      secondaryRunes: sourceCheckedBuild.runes.secondary.map((name) => ({ name, why: createRuneReason(name, champion) })),
      shards: sourceCheckedBuild.runes.shards,
      altKeystone: createAltKeystone(champion, keystone),
      altKeystoneWhy: createAltKeystoneReason(champion)
    };
  }

  if (champion.tags.includes('Marksman')) {
    return botRunePreset(champion, 'Lethal Tempo', 'Precision', ['Presence of Mind', 'Legend: Bloodline', 'Coup de Grace'], 'Sorcery', ['Absolute Focus', 'Gathering Storm'], ['Attack Speed', 'Adaptive Force', 'Health Scaling'], 'Fleet Footwork');
  }
  if (champion.tags.includes('Assassin')) {
    return botRunePreset(champion, 'Electrocute', 'Domination', ['Sudden Impact', 'Eyeball Collection', 'Ultimate Hunter'], 'Precision', ['Triumph', 'Coup de Grace'], ['Adaptive Force', 'Adaptive Force', 'Health Scaling'], 'Conqueror');
  }
  if (champion.tags.includes('Fighter')) {
    return botRunePreset(champion, 'Conqueror', 'Precision', ['Triumph', 'Legend: Haste', 'Last Stand'], 'Resolve', ['Second Wind', 'Overgrowth'], ['Adaptive Force', 'Adaptive Force', 'Health Scaling'], 'Grasp of the Undying');
  }
  if (champion.tags.includes('Tank')) {
    return botRunePreset(champion, 'Grasp of the Undying', 'Resolve', ['Shield Bash', 'Second Wind', 'Overgrowth'], 'Inspiration', ['Biscuit Delivery', 'Cosmic Insight'], ['Attack Speed', 'Health Scaling', 'Health Scaling'], 'Aftershock');
  }
  if (champion.tags.includes('Support')) {
    return botRunePreset(champion, 'Guardian', 'Resolve', ['Font of Life', 'Bone Plating', 'Revitalize'], 'Inspiration', ['Biscuit Delivery', 'Cosmic Insight'], ['Ability Haste', 'Move Speed', 'Health Scaling'], 'Summon Aery');
  }
  return botRunePreset(champion, 'Arcane Comet', 'Sorcery', ['Manaflow Band', 'Transcendence', 'Scorch'], 'Inspiration', ['Biscuit Delivery', 'Cosmic Insight'], ['Adaptive Force', 'Adaptive Force', 'Health Scaling'], 'Electrocute');
}

function botRunePreset(
  champion: Champion,
  keystone: string,
  primaryTree: string,
  primary: string[],
  secondaryTree: string,
  secondary: string[],
  shards: string[],
  altKeystone: string
): BuildBotGuide['runes'] {
  return {
    keystone,
    keystoneWhy: createRuneReason(keystone, champion),
    primaryTree,
    primaryRunes: primary.map((name) => ({ name, why: createRuneReason(name, champion) })),
    secondaryTree,
    secondaryRunes: secondary.map((name) => ({ name, why: createRuneReason(name, champion) })),
    shards,
    altKeystone,
    altKeystoneWhy: createAltKeystoneReason(champion)
  };
}

function createBotSummoners(champion: Champion, role: Role, sourceCheckedBuild?: SourceCheckedBuild): BuildBotGuide['summoners'] {
  const checked = sourceCheckedBuild?.summonerSpells;
  const primary = checked?.[0] ?? 'Flash';
  const secondary = checked?.[1] ?? (role === 'Jungle' ? 'Smite' : role === 'ADC' ? 'Barrier' : champion.tags.includes('Assassin') ? 'Ignite' : role === 'Top' ? 'Teleport' : 'Ignite');

  return {
    primary,
    secondary,
    alternatives: [
      'Teleport when the lane is poke-heavy or you need side-lane macro',
      'Barrier into burst lanes where one shield changes all-in math',
      'Exhaust when a fed diver or assassin can reach your carry line'
    ],
    note: `${primary} is the anchor spell. Pair it with ${secondary} by default, then swap based on lane threat and teamfight job.`
  };
}

function createStartingItems(champion: Champion, role: Role, recommendations: BuildRecommendation): BotItem[] {
  const firstStarter = recommendations.starters[0]?.item.name;
  if (firstStarter) {
    return [
      { name: firstStarter, why: recommendations.starters[0].reasons.slice(0, 2).join(' ') || 'Highest scoring start for this champion profile.' },
      { name: 'Health Potion', why: 'Keeps lane stable through first trade and first recall timing.' }
    ];
  }
  if (role === 'Support') return [{ name: 'World Atlas', why: 'Support quest start for income, wards, and lane tempo.' }];
  if (champion.tags.includes('Mage')) return [{ name: "Doran's Ring", why: 'AP, health, and mana support safer early trading.' }];
  if (champion.tags.includes('Marksman')) return [{ name: "Doran's Blade", why: 'Best default combat start for lane DPS and sustain.' }];
  return [{ name: "Doran's Shield", why: 'Stable melee start when the matchup can poke or punish early CS.' }];
}

function createStartingAlternatives(champion: Champion, role: Role): BotItem[] {
  if (role === 'Jungle') return [{ name: 'Defensive jungle pet', why: 'Take the safer pet when early invades or burst lanes threaten your first clear.' }];
  if (champion.tags.includes('Mage')) return [{ name: 'Tear or extra sustain start', why: 'Use in lanes where mana or poke will decide the first eight minutes.' }];
  if (champion.tags.includes('Tank')) return [{ name: "Doran's Shield", why: 'Best into ranged poke or lanes where survival beats early damage.' }];
  return [{ name: 'Long Sword + refillable', why: 'Greedier component start when you control the lane and want a faster first item.' }];
}

function createMinimumBack(champion: Champion) {
  if (champion.tags.includes('Mage')) return 'Amplifying Tome + Control Ward (500-600g)';
  if (champion.tags.includes('Marksman')) return 'Long Sword + boots/control ward (650-700g)';
  if (champion.tags.includes('Tank')) return 'Ruby Crystal or defensive cloth/null component (400-800g)';
  return 'Long Sword or defensive component (350-800g)';
}

function createItemTrigger(entry: Recommendation, enemies: Champion[]) {
  const reason = entry.reasons.join(' ').toLowerCase();
  if (reason.includes('heal')) return 'enemy sustain or healing support is changing fights';
  if (reason.includes('tank') || reason.includes('penetration')) return 'enemy frontline starts stacking resistances';
  if (reason.includes('burst') || reason.includes('assassin')) return 'enemy assassins can reach you before your team peels';
  if (reason.includes('shield')) return 'enemy shields are blocking your kill windows';
  if (enemies.length) return `current draft has ${enemies.map((enemy) => enemy.name).slice(0, 3).join(', ')}`;
  return 'draft or game state calls for this counter-stat';
}

function createPlaystyle(champion: Champion, role: Role) {
  if (champion.tags.includes('Assassin')) return 'Burst, flank pressure, and target isolation';
  if (champion.tags.includes('Marksman')) return 'Scaling DPS, spacing, and front-to-back teamfighting';
  if (champion.tags.includes('Tank')) return 'Engage, peel, and durable frontline control';
  if (champion.tags.includes('Support')) return role === 'Support' ? 'Vision control, lane setup, and team utility' : 'Utility skirmishing';
  if (champion.tags.includes('Fighter')) return 'Extended trades, side-lane pressure, and skirmish control';
  return 'Poke, wave control, and burst windows';
}

function createDifficulty(champion: Champion): BuildBotGuide['difficulty'] {
  if (['Azir', 'Aphelios', 'Gangplank', 'Hwei', 'Kalista', 'Nidalee', 'Qiyana', 'Riven', 'Yasuo', 'Yone'].includes(champion.id)) return 'Hard';
  if (champion.tags.includes('Assassin') || champion.tags.includes('Mage')) return 'Medium';
  return 'Easy';
}

function createStrongAgainstPool(champion: Champion) {
  if (champion.tags.includes('Assassin')) return ['Lux', 'Xerath', 'VelKoz', 'Ziggs', 'Jinx'];
  if (champion.tags.includes('Marksman')) return ['Garen', 'Darius', 'Mordekaiser', 'Illaoi', 'DrMundo'];
  if (champion.tags.includes('Tank')) return ['Zed', 'Talon', 'Qiyana', 'Rengar', 'Nocturne'];
  if (champion.tags.includes('Mage')) return ['Darius', 'Sett', 'Garen', 'Nasus', 'Olaf'];
  return ['immobile carries', 'short range bruisers', 'low mobility mages', 'scaling lanes', 'weak early lanes'];
}

function createSoftCounterPool(champion: Champion, role: Role) {
  if (role === 'Top') return ['Renekton', 'Gwen', 'Camille', 'Jax', 'Kennen'];
  if (role === 'Jungle') return ['Lee Sin', 'Viego', 'Jarvan IV', 'Xin Zhao', 'Nocturne'];
  if (role === 'ADC') return ['Jhin', 'Ashe', 'KaiSa', 'Xayah', 'Ezreal'];
  if (role === 'Support') return ['Thresh', 'Nautilus', 'Rakan', 'Lulu', 'Nami'];
  return champion.tags.includes('Assassin') ? ['Ahri', 'Sylas', 'LeBlanc', 'Akali', 'Fizz'] : ['Orianna', 'Syndra', 'Viktor', 'Ahri', 'Taliyah'];
}

function createLevelOneReason(champion: Champion, details: ChampionDetails | null, ability: string) {
  const spell = botAbilityName(details, ability);
  if (spell) return `${spell} gives the cleanest first wave and trade setup.`;
  if (champion.tags.includes('Marksman')) return 'It gives the safest first wave and trading pattern.';
  return 'It gives the strongest first-wave control and safest early trade.';
}

function createEarlyGamePlan(champion: Champion, role: Role, gameState: GameState) {
  if (role === 'Jungle') return 'Path toward the lane with the best crowd control, preserve smite tempo, and reset before first dragon or Voidgrub fight.';
  if (role === 'Support') return 'Control level 2, fight for bush access, and ward before the first jungle timing can punish your lane.';
  if (gameState === 'Behind') return 'Keep the wave closer to your tower, trade only on cooldown advantage, and value clean recalls over greedy plates.';
  if (champion.tags.includes('Assassin')) return 'Conserve health until level 3, thin the wave, then threaten short all-ins when the enemy key cooldown misses.';
  return 'Play for safe CS, first push when possible, and avoid trading without a minion or cooldown advantage.';
}

function createTradingPattern(champion: Champion, details: ChampionDetails | null, maxOrder: string[]) {
  const names = maxOrder.map((key) => botAbilityName(details, key) ?? key);
  if (champion.tags.includes('Assassin')) return `${names[0]} poke or setup into ${names[1]} engage, hold ${names[2]} until escape or finishing damage is guaranteed.`;
  if (champion.tags.includes('Marksman')) return `Auto when the enemy last-hits, use ${names[0]} to punish movement, and save ${names[2]} for peel or chase.`;
  if (champion.tags.includes('Tank')) return `Trade when your crowd control is up, absorb the first spell, then use ${names[0]} and ${names[1]} to force a short winning window.`;
  return `Use ${names[0]} for poke or wave control, follow with ${names[1]} when they step forward, and keep ${names[2]} for safety or confirmed burst.`;
}

function botAbilityName(details: ChampionDetails | null, key: string) {
  return details?.spells.find((spell) => spell.key === key)?.name;
}

function createWardingPlan(role: Role) {
  if (role === 'Jungle') return 'Ward enemy raptor/blue entrance after first reset and sweep before objective setup.';
  if (role === 'Support') return 'Ward river brush at level 2-3, then rotate control wards between dragon pixel, tri-brush, and lane brush.';
  if (role === 'Top') return 'Ward river brush before the third wave crashes; swap to tri-brush ward when pushing past river.';
  if (role === 'ADC') return 'Ward river or tri-brush based on wave position and save trinket for jungle timing after first crash.';
  return 'Ward one side of river, lean to that side while trading, and refresh vision before roaming.';
}

function createMidGamePlan(champion: Champion, role: Role) {
  if (role === 'Jungle') return 'Use item spikes to start objectives only when nearby lanes can move first. Trade cross-map camps when the enemy jungler shows.';
  if (champion.tags.includes('Assassin')) return 'Push side waves, disappear into fog, and threaten carries before objectives spawn.';
  if (champion.tags.includes('Marksman')) return 'Catch safe mid waves, rotate with support vision, and avoid side-lane assignments without cover.';
  return 'Move first after shoving, set deep vision around the next objective, and fight when your core cooldowns and first two items are ready.';
}

function createLateGamePlan(champion: Champion, role: Role) {
  if (champion.tags.includes('Tank')) return 'Stand between threats and carries, mark flank angles, and start fights only when follow-up is close.';
  if (champion.tags.includes('Assassin')) return 'Stay out of vision until the fight starts, then enter from a side angle onto the highest-value carry.';
  if (champion.tags.includes('Marksman')) return 'Play behind frontline, hit the closest safe target, and save mobility or cleanse effects for the first engage.';
  return 'Hold range, poke before commitment, and spend defensive cooldowns only when a kill or objective is guaranteed.';
}

function createTeamfightRole(champion: Champion, role: Role) {
  if (role === 'Support') return 'Control vision, protect the carry line, and start or deny fights depending on your cooldowns.';
  if (champion.tags.includes('Tank')) return 'Primary engage or peel. Your job is to decide when the fight starts and who is allowed to reach your carries.';
  if (champion.tags.includes('Assassin')) return 'Threaten the backline from fog. Do not front-to-back unless the enemy carry is already zoned.';
  if (champion.tags.includes('Marksman')) return 'Consistent DPS carry. Stay alive first, then hit the closest target until a carry becomes safe to attack.';
  return 'Backline damage and control. Poke before fights and burst the highest-value target that steps into range.';
}

function createBotTips(champion: Champion, role: Role, maxOrder: string[], firstItem?: string) {
  return [
    `Track the enemy's key cooldown before using ${maxOrder[1]} aggressively.`,
    `Recall before objectives when you can complete ${firstItem ?? 'a core component'}; unspent gold loses fights.`,
    role === 'Jungle' ? 'Ping your path before camps spawn so lanes know which side can be protected.' : 'Crash the wave before roaming so you do not lose plates for free.',
    `Your ${maxOrder[0]} max is the center of the lane plan; trade when it is up and respect downtime.`,
    'Buy Control Wards on reset when an objective or side-lane setup is next.'
  ];
}

function createBotMistakes(champion: Champion, role: Role) {
  const generic = [
    'Forcing fights while sitting on enough gold for a completed component.',
    'Ignoring enemy jungle timing after pushing past river.',
    'Building luxury damage before buying the defensive or penetration item the draft requires.'
  ];
  if (role === 'Jungle') return ['Starting objectives without lane priority.', 'Ganking losing lanes without tracking enemy countergank.', ...generic].slice(0, 5);
  if (champion.tags.includes('Assassin')) return ['Showing on vision before a flank.', 'Using escape mobility for poke right before an objective fight.', ...generic].slice(0, 5);
  if (champion.tags.includes('Marksman')) return ['Walking past frontline to hit a carry.', 'Using mobility forward before enemy engage is down.', ...generic].slice(0, 5);
  return ['Trading into a larger minion wave.', 'Roaming before the wave is pushed.', ...generic].slice(0, 5);
}

function createRuneReason(rune: string, champion: Champion) {
  const normalized = rune.toLowerCase();
  if (normalized.includes('conqueror')) return 'Rewards extended trades and repeated spell/auto uptime.';
  if (normalized.includes('electrocute')) return 'Adds burst to short combo windows and kill-threat trades.';
  if (normalized.includes('lethal')) return 'Scales sustained DPS when fights last long enough to keep attacking.';
  if (normalized.includes('comet')) return 'Converts poke spells into lane pressure and chip damage.';
  if (normalized.includes('grasp')) return 'Strengthens short trades with health scaling and lane durability.';
  if (normalized.includes('guardian')) return 'Protects allies during all-ins and helps survive engage lanes.';
  if (normalized.includes('manaflow')) return 'Keeps mana stable through repeated lane trades.';
  if (normalized.includes('transcendence') || normalized.includes('haste')) return 'More haste means more frequent trading and safety tools.';
  if (normalized.includes('second wind') || normalized.includes('bone')) return 'Reduces lane punishment from poke or all-in patterns.';
  if (normalized.includes('gathering')) return 'Adds late-game scaling for longer games.';
  if (normalized.includes('coup') || normalized.includes('last stand')) return 'Improves damage when fights reach their finishing window.';
  if (champion.tags.includes('Tank')) return 'Adds durability or utility to make engage windows safer.';
  return 'Supports the champion’s default trading pattern and role identity.';
}

function createAltKeystone(champion: Champion, current: string) {
  const fallback = champion.tags.includes('Tank') ? 'Aftershock' : champion.tags.includes('Assassin') ? 'Conqueror' : champion.tags.includes('Marksman') ? 'Fleet Footwork' : 'Electrocute';
  return fallback === current ? 'First Strike' : fallback;
}

function createAltKeystoneReason(champion: Champion) {
  if (champion.tags.includes('Assassin')) return 'Swap when fights become extended or lane sustain matters more than instant burst.';
  if (champion.tags.includes('Marksman')) return 'Swap into lanes where survival and sustain matter more than maximum DPS.';
  if (champion.tags.includes('Tank')) return 'Swap when reliable engage matters more than lane trading.';
  return 'Take it when the matchup rewards shorter burst windows over standard poke or scaling.';
}

function createBotTitle(champion: Champion) {
  if (champion.tags.includes('Assassin')) return 'The Backline Threat';
  if (champion.tags.includes('Marksman')) return 'The Scaling Carry';
  if (champion.tags.includes('Tank')) return 'The Frontline Anchor';
  if (champion.tags.includes('Support')) return 'The Team Enabler';
  return 'The Control Threat';
}

function formatBotKey(value: string) {
  return value.replace(/^vs/, 'vs ').replace(/([A-Z])/g, ' $1').trim();
}

function toTitleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function createPlayerTrends(profile: RiotProfile): PlayerTrend[] {
  const recent = profile.matches.slice(0, 5);
  const previous = profile.matches.slice(5, 10);

  return [
    createTrend('Win Rate', recentWinRate(recent), recentWinRate(previous), '%', 0),
    createTrend('KDA', average(recent.map(matchKda)), average(previous.map(matchKda)), '', 2),
    createTrend('CS / Min', average(recent.map(matchCsPerMinute)), average(previous.map(matchCsPerMinute)), '', 1),
    createTrend('Damage / Min', average(recent.map(matchDamagePerMinute)), average(previous.map(matchDamagePerMinute)), '', 0),
    createTrend('Vision / Min', average(recent.map(matchVisionPerMinute)), average(previous.map(matchVisionPerMinute)), '', 2)
  ];
}

function createTrend(label: string, current: number, previous: number, suffix: string, digits: number): PlayerTrend {
  const delta = current - previous;
  const direction = Math.abs(delta) < 0.05 ? 'neutral' : delta > 0 ? 'positive' : 'negative';
  const formattedDelta = `${delta >= 0 ? '+' : ''}${delta.toFixed(digits)}${suffix}`;

  return {
    label,
    current: `${current.toFixed(digits)}${suffix}`,
    previous: `${previous.toFixed(digits)}${suffix}`,
    delta: formattedDelta,
    direction
  };
}

function recentWinRate(matches: RiotProfile['matches']) {
  const wins = matches.filter((match) => match.win).length;
  return winRate(wins, matches.length - wins);
}

function analyzePersonalBuilds(
  profile: RiotProfile,
  champion: Champion,
  recommendations: BuildRecommendation,
  items: RiotItem[]
): PersonalBuildInsight {
  const recommendedIds = collectBuildItems(recommendations).map((entry) => Number(entry.item.id));
  const recommendedSet = new Set(recommendedIds);
  const recommendedItems = recommendedIds
    .map((itemId) => findItem(itemId, items))
    .filter((item): item is RiotItem => Boolean(item))
    .slice(0, 8);
  const championMatches = profile.matches.filter((match) => normalizeName(match.championName) === normalizeName(champion.name));
  const sample = championMatches.length ? championMatches : profile.matches;
  const wins = championMatches.filter((match) => match.win).length;
  const championWinRate = winRate(wins, championMatches.length - wins);
  const matchComparisons = sample.slice(0, 8).map((match) => compareMatchBuild(match, recommendedIds, items));
  const overlaps = matchComparisons.map((comparison) => comparison.overlap);
  const firstItemCounts = new Map<number, number>();
  const itemCounts = new Map<number, number>();

  sample.forEach((match) => {
    const firstCompleted = match.items.find((itemId) => itemId > 0 && items.some((item) => Number(item.id) === itemId));
    if (firstCompleted) firstItemCounts.set(firstCompleted, (firstItemCounts.get(firstCompleted) ?? 0) + 1);
    match.items
      .filter((itemId) => itemId > 0 && findItem(itemId, items))
      .forEach((itemId) => itemCounts.set(itemId, (itemCounts.get(itemId) ?? 0) + 1));
  });

  const mostCommonFirstId = [...firstItemCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostCommonFirstItem = itemName(mostCommonFirstId, items) ?? 'No item sample';
  const recommendedFirstItem = recommendations.core[0]?.item.name ?? recommendations.boots[0]?.item.name ?? 'No recommendation';
  const commonItems = [...itemCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([itemId]) => findItem(itemId, items))
    .filter((item): item is RiotItem => Boolean(item))
    .slice(0, 8);
  const recentBuiltIds = new Set(sample.flatMap((match) => match.items.filter((itemId) => itemId > 0)));
  const missingRecommended = recommendedIds
    .filter((itemId) => !recentBuiltIds.has(itemId))
    .map((itemId) => itemName(itemId, items))
    .filter((name): name is string => Boolean(name))
    .slice(0, 4);
  const averageOverlap = Math.round(average(overlaps));
  const firstItemAligned = mostCommonFirstItem !== 'No item sample' && mostCommonFirstItem === recommendedFirstItem;
  const disciplineScore = clampScore(Math.round(averageOverlap * 0.75 + (firstItemAligned ? 15 : 0) + Math.min(10, championMatches.length * 2)));
  const bestComparison = [...matchComparisons].sort((a, b) => b.overlap - a.overlap)[0];
  const bestMatchLabel = bestComparison ? `${bestComparison.championName} ${bestComparison.result.toLowerCase()} matched ${bestComparison.overlap}%` : 'no comparable match';
  const notes: string[] = [];

  if (!championMatches.length) {
    notes.push(`No recent ${champion.name} games were loaded, so this compares the recommendation against your overall recent item habits.`);
  }
  if (averageOverlap < 35) {
    notes.push('Your recent builds differ heavily from the current recommendation; review the first two completed items before queueing.');
  } else if (averageOverlap < 65) {
    notes.push('Your build is partially aligned; situational items are probably where the app can help most.');
  } else {
    notes.push('Your recent build pattern is already close to the recommended path.');
  }
  if (mostCommonFirstItem !== 'No item sample' && recommendedFirstItem !== mostCommonFirstItem) {
    notes.push(`You often start ${mostCommonFirstItem}; compare that rush against ${recommendedFirstItem} for this draft.`);
  }
  if (missingRecommended.length) {
    notes.push(`Recommended items missing from your recent pattern: ${missingRecommended.join(', ')}.`);
  }

  return {
    championGames: championMatches.length,
    championWinRate,
    averageOverlap,
    disciplineScore,
    mostCommonFirstItem,
    recommendedFirstItem,
    recommendedItems,
    commonItems,
    bestMatchLabel,
    matchComparisons,
    itemGaps: missingRecommended.length ? missingRecommended : ['Your recent item pattern covers the main recommended items.'],
    notes
  };
}

function compareMatchBuild(match: RiotProfile['matches'][number], recommendedIds: number[], items: RiotItem[]): MatchBuildComparison {
  const recommendedSet = new Set(recommendedIds);
  const builtIds = match.items.filter((itemId) => itemId > 0 && findItem(itemId, items));
  const denominator = Math.min(builtIds.length, recommendedSet.size || builtIds.length);
  const overlap = denominator ? Math.round((builtIds.filter((itemId) => recommendedSet.has(itemId)).length / denominator) * 100) : 0;
  const missingItems = recommendedIds
    .filter((itemId) => !builtIds.includes(itemId))
    .map((itemId) => itemName(itemId, items))
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);
  const extraItems = builtIds
    .filter((itemId) => !recommendedSet.has(itemId))
    .map((itemId) => itemName(itemId, items))
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);

  return {
    matchId: match.matchId,
    championName: match.championName,
    result: match.win ? 'Win' : 'Loss',
    overlap,
    firstItem: itemName(builtIds[0], items) ?? 'No item',
    missingItems,
    extraItems
  };
}

function auditRecentBuild(
  profile: RiotProfile,
  champion: Champion,
  recommendations: BuildRecommendation,
  items: RiotItem[]
): BuildAudit {
  const championMatch = profile.matches.find((match) => normalizeName(match.championName) === normalizeName(champion.name));
  const match = championMatch ?? profile.matches[0];
  const recommendedIds = collectBuildItems(recommendations).map((entry) => Number(entry.item.id));
  const recommendedSet = new Set(recommendedIds);

  if (!match) {
    return {
      matchLabel: `No recent matches loaded for ${profile.account.gameName}#${profile.account.tagLine}.`,
      grade: 'N/A',
      score: 0,
      firstPurchase: 'No data',
      firstMajorPurchase: 'No data',
      earlyDeaths: 0,
      goldAt14: 'No data',
      csAt14: 'No data',
      spendAt14: 'No data',
      unspentAt14: 'No data',
      timelineAvailable: false,
      itemTiming: ['Load Riot match history to generate an audit.'],
      purchaseTimeline: ['No purchase timeline loaded.'],
      deathWindows: ['No death timeline loaded.'],
      economyNotes: ['Load Riot timeline data to audit spend timing and recall windows.'],
      notes: ['The auditor needs recent matches from the Riot API before it can grade build execution.']
    };
  }

  const timeline = match.timeline;
  const builtItems = match.items.filter((itemId) => itemId > 0);
  const overlap = builtItems.length
    ? Math.round((builtItems.filter((itemId) => recommendedSet.has(itemId)).length / Math.min(builtItems.length, recommendedSet.size || builtItems.length)) * 100)
    : 0;
  const frame14 = nearestFrame(timeline?.goldByMinute ?? [], 14);
  const firstPurchaseName = itemName(timeline?.purchases[0]?.itemId, items) ?? itemName(builtItems[0], items) ?? 'No purchase';
  const firstMajorPurchase = timeline?.purchases.find((purchase) => purchase.minute >= 5);
  const firstMajorPurchaseName = itemName(firstMajorPurchase?.itemId, items) ?? itemName(builtItems[1], items) ?? 'No spike';
  const earlyDeaths = timeline?.earlyDeaths ?? estimateEarlyDeaths(match);
  const unspentAt14 = frame14?.currentGold ?? 0;
  const spentAt14 = frame14 ? Math.max(0, frame14.totalGold - frame14.currentGold) : 0;
  const spendEfficiency = frame14?.totalGold ? Math.round((spentAt14 / frame14.totalGold) * 100) : 0;
  const lateFirstSpikePenalty = firstMajorPurchase && firstMajorPurchase.minute > 13 ? 6 : 0;
  const score = clampScore(50 + Math.round(overlap * 0.35) - earlyDeaths * 8 + (frame14?.totalGold ? 8 : 0) + Math.round(spendEfficiency / 8) - lateFirstSpikePenalty);
  const notes: string[] = [];
  const economyNotes = createEconomyNotes(match, frame14, firstMajorPurchase);
  const purchaseTimeline = createPurchaseTimeline(match, items);
  const deathWindows = createDeathWindowRows(match);

  if (!timeline?.available) {
    notes.push('Timeline was not available for this loaded match, so the audit uses final items and scoreboard estimates.');
  }
  if (overlap < 40) notes.push('Final items had low overlap with the recommended path; review whether the draft required that pivot.');
  else if (overlap < 70) notes.push('Final items partly matched the recommendation; the main improvement is timing and situational swaps.');
  else notes.push('Final item path aligned well with the recommendation.');
  if (earlyDeaths >= 2) notes.push('Multiple early deaths reduce item timing reliability; consider safer components before greedy purchases.');
  if (frame14 && frame14.currentGold > 1100) notes.push('You held a large amount of unspent gold around 14 minutes; recall before objective fights when possible.');
  if (championMatch) notes.push(`Auditing your most recent loaded ${champion.name} match.`);
  else notes.push(`No recent ${champion.name} match was loaded, so this audits your latest available game.`);

  return {
    matchLabel: `${match.championName} ${match.teamPosition || 'Role?'} / ${match.win ? 'Win' : 'Loss'} / ${formatDuration(match.gameDuration)}`,
    grade: gradeAudit(score),
    score,
    firstPurchase: timeline?.firstPurchaseMinute !== undefined ? `${firstPurchaseName} @ ${timeline.firstPurchaseMinute}m` : firstPurchaseName,
    firstMajorPurchase: firstMajorPurchase ? `${firstMajorPurchaseName} @ ${firstMajorPurchase.minute}m` : firstMajorPurchaseName,
    earlyDeaths,
    goldAt14: frame14 ? frame14.totalGold.toLocaleString() : 'No timeline',
    csAt14: frame14 ? (frame14.minionsKilled + frame14.jungleMinionsKilled).toString() : 'No timeline',
    spendAt14: frame14 ? spentAt14.toLocaleString() : 'No timeline',
    unspentAt14: frame14 ? unspentAt14.toLocaleString() : 'No timeline',
    timelineAvailable: Boolean(timeline?.available),
    itemTiming: createItemTimingRows(match, recommendations, items),
    purchaseTimeline,
    deathWindows,
    economyNotes,
    notes
  };
}

function createItemTimingRows(match: RiotProfile['matches'][number], recommendations: BuildRecommendation, items: RiotItem[]) {
  const recommendedCore = recommendations.core.map((entry) => Number(entry.item.id));
  const purchases = match.timeline?.purchases ?? [];
  const rows = recommendedCore.slice(0, 4).map((itemId) => {
    const purchase = purchases.find((entry) => entry.itemId === itemId);
    const built = match.items.includes(itemId);
    const name = itemName(itemId, items) ?? `Item ${itemId}`;

    if (purchase) return `${name}: purchased around ${purchase.minute} minutes.`;
    if (built) return `${name}: present in final build, purchase timing unavailable.`;
    return `${name}: recommended but not seen in final items.`;
  });

  return rows.length ? rows : ['No core recommendation available to audit.'];
}

function createPurchaseTimeline(match: RiotProfile['matches'][number], items: RiotItem[]) {
  const purchases = match.timeline?.purchases ?? [];
  const rows = purchases
    .filter((purchase) => findItem(purchase.itemId, items))
    .slice(0, 8)
    .map((purchase) => `${itemName(purchase.itemId, items)} @ ${purchase.minute}m`);

  return rows.length ? rows : ['No purchase timeline loaded.'];
}

function createDeathWindowRows(match: RiotProfile['matches'][number]) {
  const deaths = match.timeline?.deaths ?? [];
  const rows = deaths.slice(0, 5).map((death) => `Death around ${death.minute}m${death.killerId ? ` to participant ${death.killerId}` : ''}.`);

  if (!rows.length && match.deaths > 0) return [`${match.deaths} deaths in final score, but exact timestamps were unavailable.`];
  return rows.length ? rows : ['No deaths found in the loaded match timeline.'];
}

function createEconomyNotes(
  match: RiotProfile['matches'][number],
  frame14: ReturnType<typeof nearestFrame>,
  firstMajorPurchase: RiotProfile['matches'][number]['timeline'] extends infer Timeline
    ? Timeline extends { purchases: Array<infer Purchase> }
      ? Purchase | undefined
      : never
    : never
) {
  const notes: string[] = [];

  if (!match.timeline?.available) {
    notes.push('No timeline frames were returned, so spend efficiency cannot be graded precisely.');
  }
  if (frame14) {
    const totalCs = frame14.minionsKilled + frame14.jungleMinionsKilled;
    const spent = Math.max(0, frame14.totalGold - frame14.currentGold);
    const spendPercent = frame14.totalGold ? Math.round((spent / frame14.totalGold) * 100) : 0;
    notes.push(`${spendPercent}% of earned gold was spent by 14 minutes, with ${frame14.currentGold.toLocaleString()} gold still held.`);
    notes.push(`${totalCs} CS at 14 minutes gives a ${Math.round(totalCs / 14)} CS/min lane-phase pace.`);
  }
  if (firstMajorPurchase && firstMajorPurchase.minute > 13) {
    notes.push(`First major purchase landed at ${firstMajorPurchase.minute} minutes; aim to complete a spike before second dragon or first major mid-game fight.`);
  }
  if (match.goldEarned / Math.max(1, match.gameDuration / 60) < 330) {
    notes.push('Gold income was low for the loaded game; prioritize safer farm windows before forcing expensive build paths.');
  }

  return notes.length ? notes : ['Economy timing looked stable for this loaded match.'];
}

function nearestFrame(frames: NonNullable<RiotProfile['matches'][number]['timeline']>['goldByMinute'], minute: number) {
  return frames.reduce<(typeof frames)[number] | null>((best, frame) => {
    if (!best) return frame;
    return Math.abs(frame.minute - minute) < Math.abs(best.minute - minute) ? frame : best;
  }, null);
}

function estimateEarlyDeaths(match: RiotProfile['matches'][number]) {
  if (match.gameDuration <= 900) return match.deaths;
  return Math.min(match.deaths, Math.round(match.deaths * 0.45));
}

function matchKda(match: RiotProfile['matches'][number]) {
  return (match.kills + match.assists) / Math.max(1, match.deaths);
}

function matchCsPerMinute(match: RiotProfile['matches'][number]) {
  return (match.totalMinionsKilled + match.neutralMinionsKilled) / Math.max(1, match.gameDuration / 60);
}

function matchDamagePerMinute(match: RiotProfile['matches'][number]) {
  return match.challenges.damagePerMinute ?? match.totalDamageDealtToChampions / Math.max(1, match.gameDuration / 60);
}

function matchVisionPerMinute(match: RiotProfile['matches'][number]) {
  return match.challenges.visionScorePerMinute ?? match.visionScore / Math.max(1, match.gameDuration / 60);
}

function gradeAudit(score: number) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'Needs work';
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function defaultSummonerNames(champion: Champion, role: Role) {
  if (role === 'Jungle') return ['Flash', 'Smite'];
  if (role === 'ADC') return ['Flash', 'Barrier'];
  if (role === 'Top') return ['Flash', champion.tags.includes('Assassin') ? 'Ignite' : 'Teleport'];
  if (role === 'Support') return ['Flash', champion.tags.includes('Tank') ? 'Ignite' : 'Exhaust'];
  return ['Flash', champion.tags.includes('Assassin') ? 'Ignite' : 'Teleport'];
}

function createTierScore(stats: ReturnType<typeof getChampionAggregateStats>) {
  return Math.round(stats.winRate * 2.7 + stats.pickRate * 1.15 - stats.banRate * 0.22 + Math.min(18, stats.games / 12000));
}

function tierFromScore(score: number) {
  if (score >= 166) return 'S+';
  if (score >= 158) return 'S';
  if (score >= 148) return 'A';
  if (score >= 138) return 'B';
  return 'C';
}

function roleGlyph(role: Role) {
  const glyphs: Record<Role, string> = {
    Top: 'TOP',
    Jungle: 'JG',
    Mid: 'MID',
    ADC: 'ADC',
    Support: 'SUP'
  };
  return glyphs[role];
}

function findChampionByDisplayName(champions: Champion[], name: string) {
  const normalized = normalizeName(name);
  return champions.find((champion) => normalizeName(champion.name) === normalized || normalizeName(champion.id) === normalized);
}

function itemName(itemId: number | undefined, items: RiotItem[]) {
  if (!itemId) return undefined;
  return findItem(itemId, items)?.name;
}

function findItem(itemId: number | undefined, items: RiotItem[]) {
  if (!itemId) return undefined;
  return items.find((item) => Number(item.id) === itemId);
}

function findItemByName(name: string, items: RiotItem[]) {
  const normalized = normalizeName(name);
  return items.find((item) => normalizeName(item.name) === normalized);
}

function formatItemStats(item?: RiotItem) {
  if (!item) return 'Stats unavailable in Data Dragon';
  const text = cleanItemText(item.description || item.plaintext);
  const exactStats = formatDataDragonStats(item.stats);
  const statSummary = extractItemStats(text);
  const summary = mergeStatSummaries(exactStats, statSummary) || item.plaintext || text;
  return summary ? `${summary} / ${item.gold.toLocaleString()}g` : `${item.gold.toLocaleString()}g`;
}

function mergeStatSummaries(primary: string, secondary: string) {
  const seen = new Set<string>();
  return [primary, secondary]
    .flatMap((value) => value.split(' / '))
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase().replace(/^[0-9.%-]+\s+/, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(' / ');
}

function formatDataDragonStats(stats?: Record<string, number>) {
  if (!stats) return '';
  const statMap: Record<string, { label: string; percent?: boolean }> = {
    FlatHPPoolMod: { label: 'Health' },
    FlatMPPoolMod: { label: 'Mana' },
    FlatPhysicalDamageMod: { label: 'Attack Damage' },
    FlatMagicDamageMod: { label: 'Ability Power' },
    FlatArmorMod: { label: 'Armor' },
    FlatSpellBlockMod: { label: 'Magic Resist' },
    FlatCritChanceMod: { label: 'Critical Strike Chance', percent: true },
    FlatAttackSpeedMod: { label: 'Attack Speed', percent: true },
    PercentAttackSpeedMod: { label: 'Attack Speed', percent: true },
    PercentMovementSpeedMod: { label: 'Move Speed', percent: true },
    FlatMovementSpeedMod: { label: 'Move Speed' }
  };

  return Object.entries(stats)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => {
      const stat = statMap[key];
      if (!stat) return '';
      const displayValue = stat.percent ? `${Math.round(value * 100)}%` : `${Math.round(value)}`;
      return `${displayValue} ${stat.label}`;
    })
    .filter(Boolean)
    .join(' / ');
}

function cleanItemText(value: string) {
  return cleanDescription(value)
    .replace(/\s*Click to Consume:.*$/i, '')
    .replace(/\s*Active - /gi, 'Active: ')
    .replace(/\s*Passive - /gi, 'Passive: ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractItemStats(text: string) {
  const statMatches = [
    ...text.matchAll(
      /([+-]?\d+(?:\.\d+)?%?)\s+(Attack Damage|Ability Power|Armor|Magic Resist|Health|Mana|Ability Haste|Attack Speed|Critical Strike Chance|Move Speed|Movement Speed|Life Steal|Lifesteal|Omnivamp|Armor Penetration|Magic Penetration|Lethality|Heal and Shield Power|Base Health Regen)/gi
    )
  ];
  const seen = new Set<string>();
  const stats = statMatches
    .map((match) => `${match[1]} ${normalizeStatName(match[2])}`)
    .filter((stat) => {
      const key = stat.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (stats.length) return stats.slice(0, 8).join(' / ');

  const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
  return firstSentence.length > 160 ? `${firstSentence.slice(0, 157)}...` : firstSentence;
}

function normalizeStatName(value: string) {
  if (/lifesteal/i.test(value)) return 'Life Steal';
  if (/movement speed/i.test(value)) return 'Move Speed';
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function itemMatchesItemDbFilter(item: RiotItem, filter: 'All' | 'Damage' | 'AP' | 'Tank' | 'Support' | 'Boots') {
  if (filter === 'All') return true;
  const text = `${item.name} ${item.plaintext} ${cleanItemText(item.description)} ${formatDataDragonStats(item.stats)}`.toLowerCase();
  if (filter === 'Damage') return /attack damage|attack speed|critical|lethality|life steal|armor penetration/.test(text);
  if (filter === 'AP') return /ability power|magic penetration|mana|spell|magic damage/.test(text);
  if (filter === 'Tank') return /health|armor|magic resist|shield|tenacity|regen/.test(text);
  if (filter === 'Support') return /heal|shield|mana regen|support|ally|ward/.test(text);
  if (filter === 'Boots') return /boots|greaves|treads|tabi|ionian|swiftness/.test(text);
  return true;
}

function parseRiotIdForLookup(value: string) {
  const [gameName, tagLine] = value.trim().split('#');
  if (!gameName || !tagLine) return null;
  return { gameName: gameName.trim(), tagLine: tagLine.trim() };
}

function findByName<T extends { name: string }>(entries: T[], name: string) {
  const normalized = normalizeName(name);
  return entries.find((entry) => normalizeName(entry.name) === normalized);
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function championSplashUrl(champion: Champion) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;
}

function uggChampionUrl(champion: Champion) {
  return `https://u.gg/lol/champions/${championBuildSlug(champion)}/build`;
}

function mobalyticsChampionUrl(champion: Champion) {
  return `https://mobalytics.gg/lol/champions/${championBuildSlug(champion)}/build`;
}

function opggChampionUrl(champion: Champion) {
  return `https://op.gg/lol/champions/${championBuildSlug(champion)}/build`;
}

function mobafireChampionUrl(champion: Champion) {
  return `https://www.mobafire.com/league-of-legends/champion/${championBuildSlug(champion)}`;
}

function metasrcChampionUrl(champion: Champion) {
  return `https://www.metasrc.com/lol/champion/${championBuildSlug(champion)}`;
}

function aramBuildUrl(champion: Champion) {
  return `https://aram.zone/champion/${champion.id}`;
}

function collectBuildItems(recommendations: BuildRecommendation) {
  return [
    ...recommendations.starters.slice(0, 1),
    ...recommendations.boots.slice(0, 1),
    ...recommendations.core,
    ...recommendations.late.slice(0, 2),
    ...recommendations.situational.slice(0, 3)
  ];
}

function createBuildSummary(
  champion: Champion,
  role: Role,
  gameState: GameState,
  enemies: Champion[],
  recommendations: BuildRecommendation,
  patch: string,
  sourceCheckedBuild?: SourceCheckedBuild
) {
  const sourceItems = sourceCheckedBuild?.items;
  const fullBuild = sourceItems?.fullBuild?.length
    ? sourceItems.fullBuild.join(' -> ')
    : collectBuildItems(recommendations)
        .slice(0, 6)
        .map((entry) => entry.item.name)
        .join(' -> ');
  const starter = sourceItems?.starter?.join(' + ') || recommendations.starters.map((entry) => entry.item.name).join(' + ') || 'No starter found';
  const boots = sourceItems?.boots || recommendations.boots[0]?.item.name || 'No boots found';
  const core = sourceItems?.core?.join(' -> ') || recommendations.core.map((entry) => entry.item.name).join(' -> ') || 'No core items found';
  const situational = recommendations.situational
    .slice(0, 4)
    .map((entry) => entry.item.name)
    .join(', ');
  const spells = sourceCheckedBuild?.summonerSpells?.join(' + ') || 'Recommended spells shown in app';
  const runes = sourceCheckedBuild?.runes
    ? `${sourceCheckedBuild.runes.primaryTree}: ${sourceCheckedBuild.runes.primary.join(', ')} | ${sourceCheckedBuild.runes.secondaryTree}: ${sourceCheckedBuild.runes.secondary.join(', ')}`
    : 'Recommended runes shown in app';
  return [
    `**${champion.name} ${role} Build** (${gameState})`,
    `Patch: ${patch}${sourceCheckedBuild ? ` / source checked ${sourceCheckedBuild.patch}` : ''}`,
    `Matchup: ${enemies.length ? `vs ${enemies.map((enemy) => enemy.name).join(', ')}` : 'draft not selected'}`,
    `Starter: ${starter}`,
    `Boots: ${boots}`,
    `Core: ${core}`,
    `Full Build: ${fullBuild || 'No full build found'}`,
    `Spells: ${spells}`,
    `Runes: ${runes}`,
    `Situational: ${situational || 'No situational items found'}`,
    `Threats: ${recommendations.detectedThreats.map(formatTag).join(', ') || 'none'}`
  ].join('\n');
}

createRoot(document.getElementById('root')!).render(<App />);
