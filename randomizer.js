/* Fire Red (USA, BPRE) encounter and starter randomizer. */
(function attachFireRedRandomizer(global) {
  const WILD_HEADERS = 0x3c9cb8;
  const ROM_BASE = 0x08000000;
  const HEADER_SIZE = 20;
  const SPECIES_COUNT = 386;

  function gameCode(bytes) { return String.fromCharCode(...bytes.slice(0xac, 0xb0)); }
  function revision(bytes) { return bytes[0xbc]; }
  function rngFor(seed) {
    let state = 2166136261;
    for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
    return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296; };
  }
  function offset(view, address, length) {
    const pointer = view.getUint32(address, true);
    return pointer >= ROM_BASE && pointer < ROM_BASE + length ? pointer - ROM_BASE : null;
  }
  function assertSupported(bytes) {
    if (bytes.byteLength < WILD_HEADERS + HEADER_SIZE) throw new Error('The selected file is too small to be Fire Red.');
    if (!/^BPR[A-Z]$/.test(gameCode(bytes))) throw new Error('Built-in randomizing supports official Pokémon FireRed ROMs only.');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (findWildHeaders(view, bytes) === null || findStarters(view, bytes) === null) throw new Error('Could not identify this FireRed ROM layout safely.');
  }
  function findWildHeaders(view, bytes) {
    // USA keeps this table at a known location; other official releases are located structurally.
    const candidates = [WILD_HEADERS];
    for (let address = 0; address + HEADER_SIZE * 12 < bytes.byteLength; address += 4) {
      if (address !== WILD_HEADERS && offset(view, address + 4, bytes.byteLength) !== null) candidates.push(address);
    }
    for (const start of candidates) {
      let rows = 0; let address = start;
      for (; address + HEADER_SIZE <= bytes.byteLength && rows < 1000; address += HEADER_SIZE) {
        if (bytes[address] === 0xff && bytes[address + 1] === 0xff) break;
        if (offset(view, address + 4, bytes.byteLength) === null) break;
        rows += 1;
      }
      if (rows >= 20 && bytes[address] === 0xff && bytes[address + 1] === 0xff) return start;
    }
    return null;
  }
  function findStarters(view, bytes) {
    for (let address = 0; address + 18 <= Math.min(bytes.byteLength, 0x40000); address += 1) {
      if (view.getUint16(address, true) === 1 && view.getUint16(address + 8, true) === 4 && view.getUint16(address + 16, true) === 7) return [address, address + 8, address + 16];
    }
    return null;
  }
  function describeSupport(source) {
    const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
    assertSupported(bytes);
    return { gameCode: gameCode(bytes), revision: revision(bytes), region: gameCode(bytes) === 'BPRE' ? 'USA' : 'International' };
  }
  function species(rng, previous) { let result; do result = 1 + Math.floor(rng() * SPECIES_COUNT); while (result === previous); return result; }
  function encounters(view, bytes, rng) {
    const changed = new Set(); let header = findWildHeaders(view, bytes);
    for (; header + HEADER_SIZE <= bytes.byteLength; header += HEADER_SIZE) {
      if (bytes[header] === 0xff && bytes[header + 1] === 0xff) break;
      for (const pointer of [4, 8, 12, 16]) {
        const info = offset(view, header + pointer, bytes.byteLength);
        if (info === null) continue;
        const mons = offset(view, info + 4, bytes.byteLength);
        if (mons === null || mons + 48 > bytes.byteLength) continue;
        for (let slot = 0; slot < 12; slot += 1) {
          const address = mons + slot * 4 + 2;
          if (!changed.has(address)) { view.setUint16(address, species(rng, view.getUint16(address, true)), true); changed.add(address); }
        }
      }
    }
    if (header === null || header >= bytes.byteLength) throw new Error('Could not read the FireRed encounter table.');
    return changed.size;
  }
  function starters(view, bytes, rng) {
    const chosen = [];
    for (const address of findStarters(view, bytes)) { let next; do next = species(rng, 0); while (chosen.includes(next)); view.setUint16(address, next, true); chosen.push(next); }
    return chosen;
  }
  function randomize(buffer, options) {
    const bytes = new Uint8Array(buffer.slice(0)); assertSupported(bytes);
    const view = new DataView(bytes.buffer), rng = rngFor(options.seed);
    const result = { encounterSlots: 0, starters: [] };
    if (options.encounters) result.encounterSlots = encounters(view, bytes, rng);
    if (options.starters) result.starters = starters(view, bytes, rng);
    return { buffer: bytes.buffer, result };
  }
  global.FireRedRandomizer = { randomize, assertSupported, describeSupport };
}(window));
