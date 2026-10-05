import type { CommunityBuildSubmission, CustomBuildDraft, SavedBuild } from './types';

const SAVED_BUILDS_KEY = 'lol-build-optimizer-saved-builds-v1';
const CUSTOM_BUILD_DRAFTS_KEY = 'lol-build-optimizer-custom-build-drafts-v1';
const COMMUNITY_SUBMISSIONS_KEY = 'lol-build-optimizer-community-submissions-v1';

/*
 * localStorage is convenient but untrusted: users can clear it, browser
 * extensions can mutate it, and older app versions may have written different
 * shapes. These helpers keep persistence errors contained so the UI can keep
 * running even when saved data is missing or malformed.
 */

export function loadSavedBuilds(): SavedBuild[] {
  try {
    const raw = localStorage.getItem(SAVED_BUILDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedBuild) : [];
  } catch {
    return [];
  }
}

export function saveSavedBuilds(builds: SavedBuild[]) {
  try {
    localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(builds));
  } catch {
    // If storage is full or blocked, the app should still remain usable.
  }
}

export function loadCustomBuildDrafts(): CustomBuildDraft[] {
  try {
    const raw = localStorage.getItem(CUSTOM_BUILD_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCustomBuildDraft) : [];
  } catch {
    return [];
  }
}

export function saveCustomBuildDrafts(drafts: CustomBuildDraft[]) {
  try {
    localStorage.setItem(CUSTOM_BUILD_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // Build creator history is helpful, but storage failures should not block the app.
  }
}

export function loadCommunitySubmissions(): CommunityBuildSubmission[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCommunitySubmission) : [];
  } catch {
    return [];
  }
}

export function saveCommunitySubmissions(submissions: CommunityBuildSubmission[]) {
  try {
    localStorage.setItem(COMMUNITY_SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch {
    // Local community prototype should fail softly when storage is unavailable.
  }
}

function isSavedBuild(value: unknown): value is SavedBuild {
  if (!value || typeof value !== 'object') return false;
  const build = value as SavedBuild;
  return typeof build.id === 'string' && typeof build.championId === 'string' && Array.isArray(build.enemyIds);
}

function isCustomBuildDraft(value: unknown): value is CustomBuildDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as CustomBuildDraft;
  return (
    typeof draft.id === 'string' &&
    typeof draft.championId === 'string' &&
    Array.isArray(draft.itemIds) &&
    Array.isArray(draft.itemNames) &&
    typeof draft.updatedAt === 'number'
  );
}

function isCommunitySubmission(value: unknown): value is CommunityBuildSubmission {
  if (!value || typeof value !== 'object') return false;
  const submission = value as CommunityBuildSubmission;
  return (
    typeof submission.id === 'string' &&
    typeof submission.championId === 'string' &&
    typeof submission.title === 'string' &&
    Array.isArray(submission.items) &&
    Array.isArray(submission.comments)
  );
}
