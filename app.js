const starters = [
  ['Charmander', '🔥', 'fire', 'A bold start for a hot-blooded journey.'],
  ['Squirtle', '💧', 'water', 'Cool-headed and ready for every route.'],
  ['Bulbasaur', '🌿', 'grass', 'Steady growth for a surprising adventure.'],
  ['Pikachu', '⚡', 'electric', 'A bright spark for an unpredictable Kanto.'],
  ['Eevee', '✨', 'electric', 'Potential in every step of the way.']
];

const seedInput = document.querySelector('#seed');
const starterName = document.querySelector('#starterName');
const starterOrb = document.querySelector('#starterOrb');
const starterDescription = document.querySelector('#starterDescription');
const seedReadout = document.querySelector('#seedReadout');
const difficultyReadout = document.querySelector('#difficultyReadout');

function hashSeed(value) {
  return [...value].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}
function normalizeSeed(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'KANTO-1996';
}
function renderRun() {
  const seed = normalizeSeed(seedInput.value);
  seedInput.value = seed;
  const hash = Math.abs(hashSeed(seed));
  const starter = starters[hash % starters.length];
  starterName.textContent = starter[0];
  starterOrb.className = `starter-orb ${starter[2]}`;
  starterOrb.innerHTML = `<span>${starter[1]}</span>`;
  starterDescription.textContent = starter[3];
  seedReadout.textContent = seed;
  const randomized = document.querySelector('[data-choice="trainers"] .active').dataset.value === 'Randomized';
  difficultyReadout.textContent = randomized || !document.querySelector('#evolutions').checked ? 'CHALLENGER' : 'ADVENTURER';
}

document.querySelectorAll('.choice').forEach((button) => button.addEventListener('click', () => {
  const group = button.parentElement;
  group.querySelectorAll('.choice').forEach((choice) => choice.classList.remove('active'));
  button.classList.add('active');
}));
document.querySelector('#settingsForm').addEventListener('submit', (event) => { event.preventDefault(); renderRun(); document.querySelector('.result-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
document.querySelector('#dice').addEventListener('click', () => { seedInput.value = `KANTO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; renderRun(); });
document.querySelector('#copyButton').addEventListener('click', async (event) => {
  const code = `${seedReadout.textContent} · ${document.querySelector('[data-choice="encounters"] .active').dataset.value} · ${difficultyReadout.textContent}`;
  try { await navigator.clipboard.writeText(code); event.currentTarget.innerHTML = 'RUN CODE COPIED ✓'; setTimeout(() => { event.currentTarget.innerHTML = 'COPY RUN CODE <span>⧉</span>'; }, 1600); } catch { event.currentTarget.textContent = code; }
});
document.querySelector('#themeButton').addEventListener('click', () => document.body.classList.toggle('dark'));
renderRun();
