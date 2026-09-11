const fileInput = document.querySelector('#romFile');
const fileName = document.querySelector('#fileName');
const launchButton = document.querySelector('#launch');
const launcher = document.querySelector('#launcher');
const emulatorSection = document.querySelector('#emulatorSection');
const runningName = document.querySelector('#runningName');
const seedInput = document.querySelector('#seed');
let romFile;

fileInput.addEventListener('change', () => {
  const [selected] = fileInput.files;
  if (!selected) return;
  const hasGbaExtension = selected.name.toLowerCase().endsWith('.gba');
  romFile = hasGbaExtension ? selected : undefined;
  fileName.textContent = hasGbaExtension ? selected.name : 'Please choose a .gba file';
  launchButton.disabled = !hasGbaExtension;
});

function showLoadError() {
  document.querySelector('#game').innerHTML = '<p style="color:#fff;font:14px DM Mono,monospace;padding:35px;text-align:center;line-height:1.7">The emulator runtime could not be loaded.<br>Please check your connection and refresh the page.</p>';
}

launchButton.addEventListener('click', async () => {
  if (!romFile) return;
  launchButton.disabled = true;
  launchButton.firstChild.textContent = 'RANDOMIZING… ';
  let randomized;
  try {
    randomized = FireRedRandomizer.randomize(await romFile.arrayBuffer(), {
      seed: seedInput.value.trim() || 'KANTO-1996',
      encounters: document.querySelector('#randomEncounters').checked,
      starters: document.querySelector('#randomStarters').checked
    });
  } catch (error) {
    fileName.textContent = error.message;
    launchButton.disabled = false;
    launchButton.firstChild.textContent = 'RANDOMIZE & LAUNCH ';
    return;
  }
  const gameUrl = URL.createObjectURL(new Blob([randomized.buffer], { type: 'application/octet-stream' }));
  runningName.textContent = romFile.name.toUpperCase();
  launcher.classList.add('hidden');
  emulatorSection.classList.remove('hidden');
  document.querySelector('#game').innerHTML = '<p style="color:#fff;font:14px DM Mono,monospace">Loading GBA emulator…</p>';

  // EmulatorJS consumes these globals when its loader script is evaluated.
  window.EJS_player = '#game';
  window.EJS_core = 'gba';
  window.EJS_gameUrl = gameUrl;
  window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded = true;
  window.EJS_color = '#c83232';

  const loader = document.createElement('script');
  loader.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  loader.async = true;
  loader.onerror = showLoadError;
  document.body.append(loader);
});

document.querySelector('#close').addEventListener('click', () => window.location.reload());
