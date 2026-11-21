BUSENG KAIN TAYO! — CUSTOM SOUNDS
=================================
Put .mp3 files in this folder with these EXACT names:

  click.mp3     - pressing buttons
  coin.mp3      - getting paid
  error.mp3     - "can't do that"
  levelup.mp3   - level up / bought an upgrade
  ding.mp3      - food finished cooking / shop opened
  angry.mp3     - customer leaves angry
  sizzle.mp3    - cooking in the wok
  plop.mp3      - adding ingredient / picking up plates
  door.mp3      - customer walks in
  music.mp3     - background music (loops forever)

You don't need all of them. Any file that is missing uses the
built-in beep sound instead. Refresh the game page after adding files.

Where to get free sounds:
  - https://pixabay.com/sound-effects/   (free, no sign-up to download)
  - https://freesound.org/               (free account; check each license)
  - https://kenney.nl/assets?q=audio     (free game sound packs, CC0)
  - https://opengameart.org/             (check each license)

Tips:
  - Keep sound effects short (under 1 second) so they feel snappy.
  - If a file is .wav or .ogg, either convert it to .mp3, or change the
    file name in game.js (look for SOUND_FILES near the top).
  - Change loudness with SOUND_VOLUME and MUSIC_VOLUME in game.js.

  walang-kanin.mp4 - played when a customer asks for EXTRA RICE
                     (only 0:00-0:05 is used; change RICE_REQUEST_SOUND in game.js)
  bilisan-mo.mp4   - played when a customer's patience bar turns RED
                     (only 0:00-0:04 is used; change HURRY_SOUND / HURRY_AT in game.js)
  pagbabalik.mp4   - played when the karinderya OPENS (Buksan button)
                     (only 0:00-0:08 is used; change OPEN_SOUND in game.js)
  palimos.mp4      - pulubi says "Palimos po" (random event)
                     (only 0:00-0:06 is used; change PALIMOS_SOUND in game.js)
  order.mp4        - customer reaches the counter and ORDERS
                     (only 0:00-0:02 is used; change ORDER_SOUND in game.js)
