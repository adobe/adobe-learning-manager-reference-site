/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
'use strict';

/**
 * CI coverage pipeline — runs the test suite exactly once and enforces both
 * coverage gates from that single run:
 *
 *   1. Total coverage    — jest.config.js global thresholds (whole codebase).
 *   2. Changed-line gate — statements/branches/functions/lines coverage on the
 *                          lines added/modified vs BASE_BRANCH must meet each
 *                          metric's threshold (see METRICS below).
 *
 * Step 1 also writes coverage/coverage-final.json (json reporter), which step 2
 * reads — so the suite never runs twice.
 *
 *   - git diff --name-only  →  changed source files
 *   - git diff -U0          →  changed line ranges per file
 *   - coverage-final.json   →  Istanbul hit-count map
 *   - cross-reference each changed line against the statement/branch/fn maps
 *
 * Env vars:
 *   BASE_BRANCH          Destination/target branch (e.g. develop). REQUIRED for
 *                        the changed-line gate — if unset, that gate is skipped
 *                        and only the total-coverage gate runs.
 *   SOURCE_BRANCH        Source/head branch of the PR. Optional — defaults to
 *                        the current working tree (HEAD), which also picks up
 *                        uncommitted changes when running locally.
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_BRANCH = process.env.BASE_BRANCH; // destination; unset → gate skipped
const SOURCE_BRANCH = process.env.SOURCE_BRANCH; // source; unset → working tree
const repoRoot = path.resolve(__dirname, '../..');
const uiFrontendRoot = path.resolve(__dirname, '..');
const COVERAGE_FILE = path.join(uiFrontendRoot, 'coverage', 'coverage-final.json');

// Metric definitions drive the computation, the report, and the gate. Each
// metric carries its own changed-line threshold (branch coverage is harder to
// hit, so it gets a lower bar).
const METRICS = [
  { key: 'stmts', label: 'Stmts', name: 'statements', threshold: 85 },
  { key: 'branches', label: 'Branches', name: 'branches', threshold: 80 },
  { key: 'funcs', label: 'Funcs', name: 'functions', threshold: 85 },
  { key: 'lines', label: 'Lines', name: 'lines', threshold: 85 },
];

const git = args => execSync(`git ${args}`, { cwd: repoRoot, encoding: 'utf8' });
const rate = (covered, total) => (total === 0 ? 100 : (covered / total) * 100);
const fmtRate = (covered, total) => rate(covered, total).toFixed(1);

function refExists(ref) {
  try {
    execSync(`git rev-parse --verify --quiet ${ref}`, { cwd: repoRoot, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Always resolve to the remote-tracking ref (origin/<branch>), never a local
// branch — the local branch may be stale, while CI fetches origin fresh.
function resolveOriginRef(branch) {
  const ref = `origin/${branch}`;
  if (refExists(ref)) return ref;
  console.error(
    `\nRef '${ref}' not found.\n` +
      `Fetch it before this step, e.g.:\n` +
      `  git fetch --no-tags origin ${branch}\n` +
      `or set the branch to one that exists on origin.`
  );
  process.exit(1);
}

// Resolved inside checkDiffCoverage() (only when BASE_BRANCH is set). The diff
// is `git diff <MERGE_BASE> <DIFF_SOURCE>`:
// BASE_REF     — origin/<dest>, used for display only.
// MERGE_BASE   — merge-base(dest, source); the commit we diff FROM, so only the
//                changes the source introduced are counted.
// DIFF_SOURCE  — the side we diff TO: origin/<source> when SOURCE_BRANCH is set,
//                or '' (the working tree, incl. uncommitted) otherwise.
let BASE_REF;
let MERGE_BASE;
let DIFF_SOURCE;

// ─── Step 1: run the suite once ──────────────────────────────────────────────
// Enforces jest.config global thresholds and writes coverage-final.json.

function runTests() {
  const result = spawnSync(
    'node',
    [
      'scripts/test.js',
      '--watchAll=false',
      '--ci',
      '--coverage',
      '--collectCoverage',
      '--coverageReporters=text-summary',
      '--coverageReporters=json',
    ],
    { cwd: uiFrontendRoot, stdio: 'inherit', env: process.env }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// ─── Step 2a: changed source files ───────────────────────────────────────────

function getChangedFiles() {
  let raw;
  try {
    raw = git(`diff ${MERGE_BASE} ${DIFF_SOURCE} --name-only --diff-filter=ACMR`);
  } catch (e) {
    console.error(`git diff failed: ${e.message}`);
    process.exit(1);
  }
  return raw
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter(f => /^ui\.frontend\/src\/.*\.(ts|tsx|js|jsx)$/.test(f))
    .filter(f => !f.endsWith('.d.ts'))
    .filter(f => !/(\.spec|\.test)\.(ts|tsx|js|jsx)$/.test(f))
    .filter(f => !f.includes('/__tests__/'))
    .filter(f => !f.includes('/src/tests/'));
}

// ─── Step 2b: changed line ranges per file ───────────────────────────────────
// Parses `@@ -old +new_start,new_count @@` hunk headers from `git diff -U0`.

function getChangedLineRanges(repoFiles) {
  const hunkRe = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
  const result = {};
  for (const file of repoFiles) {
    let diff = '';
    try {
      diff = git(`diff ${MERGE_BASE} ${DIFF_SOURCE} -U0 -- "${file}"`);
    } catch (_) {}
    const ranges = [];
    let m;
    while ((m = hunkRe.exec(diff)) !== null) {
      const start = parseInt(m[1], 10);
      // count absent → single line; count 0 → pure deletion (skip)
      const count = m[2] !== undefined ? parseInt(m[2], 10) : 1;
      if (count > 0) ranges.push({ start, end: start + count - 1 });
    }
    result[file] = ranges;
  }
  return result;
}

// ─── Step 2c: cross-reference Istanbul data with changed line ranges ──────────

function findFileCoverage(coverageData, repoFile) {
  const rel = repoFile.replace(/^ui\.frontend\//, '');
  for (const [abs, data] of Object.entries(coverageData)) {
    if (abs.endsWith('/' + rel) || abs.endsWith(path.sep + rel)) return data;
  }
  return null;
}

// Counts covered/total for each metric, restricted to the changed line ranges.
function countFileCoverage(cov, ranges) {
  const { statementMap, s, branchMap = {}, b = {}, fnMap = {}, f = {} } = cov;
  const inRange = line => ranges.some(r => line >= r.start && line <= r.end);

  // Statements — and lines are derived from them in the same pass: a line is
  // "covered" if ≥1 statement starting on it was hit. Lines with no statement
  // (comments, blanks, braces) are excluded, matching Istanbul's own logic.
  const stmts = { covered: 0, total: 0 };
  const lineHit = {};
  for (const [id, loc] of Object.entries(statementMap)) {
    const line = loc.start.line;
    if (!inRange(line)) continue;
    const hit = s[id] > 0;
    stmts.total++;
    if (hit) stmts.covered++;
    lineHit[line] = lineHit[line] || hit;
  }
  const lines = {
    total: Object.keys(lineHit).length,
    covered: Object.values(lineHit).filter(Boolean).length,
  };

  // Branches — each branch has N locations (if/else = 2, switch = N).
  const branches = { covered: 0, total: 0 };
  for (const [id, br] of Object.entries(branchMap)) {
    br.locations.forEach((loc, i) => {
      if (!loc || !inRange(loc.start.line)) return;
      branches.total++;
      if ((b[id]?.[i] || 0) > 0) branches.covered++;
    });
  }

  // Functions — keyed by the declaration line (function keyword / arrow).
  const funcs = { covered: 0, total: 0 };
  for (const [id, fn] of Object.entries(fnMap)) {
    const line = (fn.decl || fn.loc)?.start.line;
    if (!line || !inRange(line)) continue;
    funcs.total++;
    if ((f[id] || 0) > 0) funcs.covered++;
  }

  return { stmts, branches, funcs, lines };
}

function computeDiffCoverage(coverageData, changedLineRanges) {
  const totals = Object.fromEntries(
    METRICS.map(m => [m.key, { covered: 0, total: 0 }])
  );
  const fileRows = [];

  for (const [repoFile, ranges] of Object.entries(changedLineRanges)) {
    if (ranges.length === 0) continue;
    const cov = findFileCoverage(coverageData, repoFile);
    if (!cov) continue;

    const counts = countFileCoverage(cov, ranges);
    if (!METRICS.some(m => counts[m.key].total > 0)) continue;

    for (const { key } of METRICS) {
      totals[key].covered += counts[key].covered;
      totals[key].total += counts[key].total;
    }
    fileRows.push({ file: repoFile.replace('ui.frontend/src/', ''), ...counts });
  }

  return { totals, fileRows };
}

// ─── Step 2d: report ─────────────────────────────────────────────────────────

function printReport({ totals, fileRows }) {
  const FILE_W = 54;
  const COL_W = 18;
  const TOTAL_W = FILE_W + COL_W * METRICS.length;

  const cell = ({ covered, total }) => `${covered}/${total} (${fmtRate(covered, total)}%)`;
  const truncate = s => (s.length > FILE_W ? '…' + s.slice(-(FILE_W - 1)) : s);
  const rule = () => console.log('─'.repeat(TOTAL_W));
  const row = (label, get) =>
    console.log(
      String(label).padEnd(FILE_W) +
        METRICS.map(m => String(get(m)).padStart(COL_W)).join('')
    );

  console.log('');
  rule();
  row('File', m => m.label);
  rule();
  for (const r of fileRows) row(truncate(r.file), m => cell(r[m.key]));
  rule();
  row('TOTAL (changed lines only)', m => cell(totals[m.key]));
  row('Gate', m => {
    const th = m.threshold;
    const pass = rate(totals[m.key].covered, totals[m.key].total) >= th;
    return `${pass ? 'PASS' : 'FAIL'} (>=${th}%)`;
  });
  rule();
}

// ─── Step 2: changed-line coverage gate ──────────────────────────────────────

function checkDiffCoverage() {
  if (!BASE_BRANCH) {
    console.log('\nBASE_BRANCH not set — skipping changed-line coverage gate.');
    return;
  }
  BASE_REF = resolveOriginRef(BASE_BRANCH);

  // Source side: a given branch (committed tip) or the working tree (HEAD).
  const sourceRef = SOURCE_BRANCH ? resolveOriginRef(SOURCE_BRANCH) : 'HEAD';
  DIFF_SOURCE = SOURCE_BRANCH ? sourceRef : ''; // '' → diff base against working tree
  const sourceLabel = SOURCE_BRANCH ? sourceRef : 'working tree (HEAD)';

  try {
    MERGE_BASE = git(`merge-base ${BASE_REF} ${sourceRef}`).trim();
  } catch {
    MERGE_BASE = BASE_REF; // no common ancestor — diff directly against the ref
  }

  const repoFiles = getChangedFiles();
  if (repoFiles.length === 0) {
    console.log(`\nNo source files changed (${sourceLabel} vs ${BASE_REF}). Skipping diff coverage.`);
    return;
  }

  const thresholds = METRICS.map(m => `${m.name} ${m.threshold}%`).join(', ');
  console.log(`\nDiff coverage: ${sourceLabel} vs ${BASE_REF}`);
  console.log(`Thresholds: ${thresholds}`);
  console.log(`Source files changed: ${repoFiles.length}`);

  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error(`\nNo coverage data at ${COVERAGE_FILE} after the test run. Aborting.`);
    process.exit(1);
  }

  const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
  const changedLineRanges = getChangedLineRanges(repoFiles);
  const report = computeDiffCoverage(coverageData, changedLineRanges);

  printReport(report);

  const failed = METRICS.filter(
    m => rate(report.totals[m.key].covered, report.totals[m.key].total) < m.threshold
  );

  if (failed.length > 0) {
    const detail = failed
      .map(
        m =>
          `${m.name} ${fmtRate(report.totals[m.key].covered, report.totals[m.key].total)}% < ${m.threshold}%`
      )
      .join(', ');
    console.log(`\nFAILED: ${detail} on changed lines.`);
    process.exit(1);
  }

  console.log('\nPASSED: All diff coverage metrics met their thresholds.');
}

// ─── Main ────────────────────────────────────────────────────────────────────

runTests();
checkDiffCoverage();
