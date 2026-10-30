# Installing Sharingan TV on LG webOS

**Prerequisites:** compatible LG webOS TV, LG Developer Mode app and developer login, Node.js/npm, webOS CLI, computer and TV on the same network.

1. In the TV's Developer Mode app, sign in, enable Developer Mode and Key Server, and note the IP shown in TV network settings.
2. Install the CLI: `npm install -g @webos-tools/cli`.
3. Configure TV: `ares-setup-device`. Choose a device name (e.g. `myTV`), your own TV IP, port `9922`, username `prisoner`, and password-based/no SSH key until pairing as prompted by your CLI version.
4. Pair: `ares-novacom --device myTV --getkey` and follow the on-TV passphrase instructions.
5. Check connection: `ares-device --system-info --device myTV`.
6. In the repository's root directory run:
   ```sh
   ares-package .
   ares-install --device myTV com.sharingan.tv_1.6.4_all.ipk
   ares-launch --device myTV com.sharingan.tv
   ```
7. Use TV directional arrows / pointer. Select Themes or Settings at upper right. Press Back to close panels.

**Updating:** repeat packaging and installing with a version number greater than the current installed version. Developer Mode access is time-limited and may need renewal.

**Important:** this does **not** replace the native LG home screen, and it does not turn the TV on automatically.
