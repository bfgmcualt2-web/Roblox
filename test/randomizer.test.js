const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('randomizer.js', 'utf8'), context);

const rom = new ArrayBuffer(0x400000);
const bytes = new Uint8Array(rom);
const view = new DataView(rom);
bytes.set(Buffer.from('BPRE'), 0xac);
const headers = 0x3c9cb8;
const info = 0x3c5000;
const slots = 0x3c5100;
for (let row = 0; row < 20; row += 1) view.setUint32(headers + row * 20 + 4, 0x08000000 + info, true);
view.setUint32(info + 4, 0x08000000 + slots, true);
bytes[headers + 20 * 20] = bytes[headers + 20 * 20 + 1] = 0xff;
for (let slot = 0; slot < 12; slot += 1) view.setUint16(slots + slot * 4 + 2, slot + 1, true);
view.setUint16(0x169bb, 1, true);
view.setUint16(0x169c3, 4, true);
view.setUint16(0x169cb, 7, true);

const result = context.window.FireRedRandomizer.randomize(rom, { seed: 'fixture', encounters: true, starters: true });
const repeated = context.window.FireRedRandomizer.randomize(rom, { seed: 'fixture', encounters: true, starters: true });
if (result.result.encounterSlots !== 12) throw new Error('wild encounter table was not fully patched');
if (result.result.starters.length !== 3 || new Set(result.result.starters).size !== 3) throw new Error('starters were not randomized distinctly');
if (Buffer.compare(Buffer.from(result.buffer), Buffer.from(repeated.buffer)) !== 0) throw new Error('seed is not deterministic');
if (view.getUint16(slots + 2, true) !== 1) throw new Error('original ROM was changed');
console.log('randomizer fixture passed');

for (const revision of [0, 1]) {
  bytes[0xbc] = revision;
  const support = context.window.FireRedRandomizer.describeSupport(rom);
  if (support.gameCode !== 'BPRE' || support.revision !== revision || support.region !== 'USA') {
    throw new Error(`BPRE revision ${revision} was not identified`);
  }
}
console.log('BPRE revision detection passed');

bytes.set(Buffer.from('BPRP'), 0xac);
const international = context.window.FireRedRandomizer.describeSupport(rom);
if (international.region !== 'International' || international.gameCode !== 'BPRP') throw new Error('international FireRed layout was not identified');
console.log('international FireRed detection passed');
