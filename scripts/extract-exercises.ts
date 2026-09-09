import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Exercise, ExerciseMode } from '../src/types/exercise.ts';

const RUSTLINGS_DIR = '/home/bashar-khan/rust/rustlings';
const CARGO_TOML = path.join(RUSTLINGS_DIR, 'Cargo.toml');
const EXERCISES_DIR = path.join(RUSTLINGS_DIR, 'exercises');
const SOLUTIONS_DIR = '/tmp/rustlings-6.5.0/solutions';
const OUTPUT_JSON = path.join(process.cwd(), 'src/data/exercises.json');

function formatTitle(name: string): string {
  const m = name.match(/^([a-zA-Z_]+?)(\d+)$/);
  if (m) {
    const [, word, num] = m;
    const words = word.replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
    return `${words} ${num}`;
  }
  return name.replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
}

function formatCategoryTitle(cat: string): string {
  const name = cat.replace(/^\d+_/, '');
  return name.replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
}

async function main() {
  console.log('Reading Cargo.toml in TypeScript...');
  const cargoContent = fs.readFileSync(CARGO_TOML, 'utf-8');

  const matches: Array<{ name: string; relPath: string }> = [];
  const regex = /name\s*=\s*"([^"]+)",\s*path\s*=\s*"exercises\/([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cargoContent)) !== null) {
    matches.push({ name: match[1], relPath: match[2] });
  }

  console.log(`Found ${matches.length} exercises in Cargo.toml.`);

  const categories = fs
    .readdirSync(EXERCISES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();

  const categoryOrderMap = new Map<string, number>();
  categories.forEach((cat, idx) => categoryOrderMap.set(cat, idx + 1));

  const categoryReadmes = new Map<string, string>();
  for (const cat of categories) {
    const readmePath = path.join(EXERCISES_DIR, cat, 'README.md');
    if (fs.existsSync(readmePath)) {
      categoryReadmes.set(cat, fs.readFileSync(readmePath, 'utf-8').trim());
    } else {
      categoryReadmes.set(cat, '');
    }
  }

  const exercises: Exercise[] = [];
  console.log('Processing exercises, hints, and solutions with TypeScript...');

  for (let idx = 0; idx < matches.length; idx++) {
    const { name, relPath } = matches[idx];
    const exerciseFile = path.join(EXERCISES_DIR, relPath);
    const cat = relPath.split('/')[0];

    const starterCode = fs.readFileSync(exerciseFile, 'utf-8');

    // Extract official hint via rustlings CLI
    let hint = '';
    try {
      const res = spawnSync('rustlings', ['hint', name], {
        cwd: RUSTLINGS_DIR,
        encoding: 'utf-8',
        timeout: 5000,
      });
      let rawHint = (res.stdout || '').trim();
      if (rawHint.includes('Press ENTER to continue')) {
        rawHint = rawHint.split('Press ENTER to continue').pop()?.trim() || '';
      }
      hint = rawHint;
    } catch (e) {
      console.warn(`Warning: failed to get hint for ${name}:`, e);
    }

    // Read solution code
    let solutionCode = '';
    const solFile = path.join(SOLUTIONS_DIR, relPath);
    if (fs.existsSync(solFile)) {
      solutionCode = fs.readFileSync(solFile, 'utf-8');
    }

    const mode: ExerciseMode = starterCode.includes('#[test]') ? 'test' : 'run';

    // Parse top comments for instructions
    const instructionsLines: string[] = [];
    for (const line of starterCode.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) {
        instructionsLines.push(trimmed.replace(/^\/\/\s*/, ''));
      } else if (trimmed === '') {
        continue;
      } else {
        break;
      }
    }
    const instructions = instructionsLines.join('\n');

    const exerciseObj: Exercise = {
      id: name,
      title: formatTitle(name),
      order: idx + 1,
      category: cat,
      categoryTitle: formatCategoryTitle(cat),
      categoryOrder: categoryOrderMap.get(cat) ?? 99,
      categoryReadme: categoryReadmes.get(cat) ?? '',
      path: `exercises/${relPath}`,
      filename: path.basename(relPath),
      mode,
      instructions,
      hint,
      starterCode,
      solutionCode: solutionCode || starterCode,
    };

    exercises.push(exerciseObj);

    if ((idx + 1) % 15 === 0 || idx + 1 === matches.length) {
      console.log(`Processed ${idx + 1}/${matches.length} exercises...`);
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(exercises, null, 2), 'utf-8');

  console.log(`TypeScript script successfully generated ${OUTPUT_JSON} with ${exercises.length} exercises!`);
}

main().catch(console.error);
