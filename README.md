# Fire Red Randomizer Emulator

This is a browser launcher for a **legally obtained, user-supplied Game Boy Advance ROM**. It uses EmulatorJS to run the selected `.gba` file in the browser; no ROM is included, uploaded, or stored by this repository.

Choose a legally obtained FireRed `.gba` file, select the randomizer options and seed, then launch. The randomizer accepts official FireRed game codes (`BPR*`), identifies the wild-table and original starter pattern structurally, and supports USA plus international revisions without assuming one fixed regional offset. The in-browser randomizer makes a temporary copy of the ROM, randomizing wild-encounter tables and the three starters before the emulator starts. The original file is not changed, uploaded, or stored.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`, choose a `.gba` file, configure the seed and options, then select **Randomize & Launch**. Select **Download Randomized ROM** to save the verified, separately named copy instead. An internet connection is required the first time because the EmulatorJS runtime is loaded from its CDN.

## Test

```bash
node test/randomizer.test.js
```

## Controls

| Game Boy Advance | Keyboard |
| --- | --- |
| D-pad | Arrow keys |
| A | Z |
| B | X |
| Start | Enter |
| Select | Shift |
