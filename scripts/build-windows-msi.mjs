#!/usr/bin/env node
/**
 * Windows MSI (WiX) — only supported on Windows hosts.
 * On macOS/Linux: triggers GitHub Actions or prints instructions.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = join(root, 'release', 'windows');

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: 'inherit', cwd: root, shell: process.platform === 'win32', ...opts });
}

function runCapture(cmd, args) {
  return spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
}

function copyMsiFrom(dir) {
  if (!existsSync(dir)) return null;
  const msi = readdirSync(dir).find((f) => f.endsWith('.msi'));
  if (!msi) return null;
  mkdirSync(releaseDir, { recursive: true });
  const dest = join(releaseDir, msi);
  copyFileSync(join(dir, msi), dest);
  return dest;
}

function buildOnWindows() {
  const r = run('npx', [
    'tauri',
    'build',
    '--target',
    'x86_64-pc-windows-msvc',
    '--bundles',
    'msi',
  ]);
  if (r.status !== 0) process.exit(r.status ?? 1);

  const candidates = [
    join(root, 'src-tauri', 'target', 'release', 'bundle', 'msi'),
    join(
      root,
      'src-tauri',
      'target',
      'x86_64-pc-windows-msvc',
      'release',
      'bundle',
      'msi',
    ),
  ];
  for (const dir of candidates) {
    const dest = copyMsiFrom(dir);
    if (dest) {
      console.log(`\nMSI copied to ${dest}`);
      return;
    }
  }
  console.log('\nBuild finished; check src-tauri/target/**/bundle/msi/');
}

async function triggerCiAndDownload() {
  const workflow = 'tauri-windows.yml';
  console.log('MSI cannot be built on macOS (WiX requires Windows).\n');
  console.log('Triggering GitHub Actions workflow…\n');

  const start = runCapture('gh', ['workflow', 'run', workflow, '--ref', 'main']);
  if (start.status !== 0) {
    console.error(start.stderr || start.stdout);
    printManualSteps();
    process.exit(1);
  }

  console.log('Waiting for workflow run…');
  await sleep(15000);

  let runId = null;
  for (let i = 0; i < 40; i++) {
    const list = runCapture('gh', [
      'run',
      'list',
      '--workflow',
      workflow,
      '--limit',
      '1',
      '--json',
      'databaseId,status,conclusion',
    ]);
    if (list.status === 0 && list.stdout) {
      try {
        const [run] = JSON.parse(list.stdout);
        if (run?.status === 'completed') {
          if (run.conclusion !== 'success') {
            console.error(`Workflow failed (conclusion: ${run.conclusion}).`);
            run('gh', ['run', 'view', String(run.databaseId), '--log']);
            process.exit(1);
          }
          runId = run.databaseId;
          break;
        }
      } catch {
        /* retry */
      }
    }
    await sleep(30000);
  }

  if (!runId) {
    console.error('Timed out waiting for workflow. Check Actions on GitHub.');
    process.exit(1);
  }

  mkdirSync(releaseDir, { recursive: true });
  const dl = run('gh', [
    'run',
    'download',
    String(runId),
    '-n',
    'enzo-windows-x64-msi',
    '-D',
    releaseDir,
  ]);
  if (dl.status !== 0) process.exit(dl.status ?? 1);

  const msi = readdirSync(releaseDir).find((f) => f.endsWith('.msi'));
  if (msi) console.log(`\nMSI saved to ${join(releaseDir, msi)}`);
}

function printManualSteps() {
  console.log(`
To build the MSI:

  1. On a Windows PC:
       npm run tauri:build:win:msi

  2. Via GitHub (after pushing this repo):
       gh auth login
       gh workflow run tauri-windows.yml
       gh run download --workflow tauri-windows.yml -n enzo-windows-x64-msi -D release/windows

  Or open GitHub → Actions → "Build Windows MSI (Tauri)" → Run workflow → download artifact.
`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

if (process.platform === 'win32') {
  buildOnWindows();
} else {
  await triggerCiAndDownload();
}
