# Sharingan TV — webOS

An unofficial, fan-made anime-themed **LG webOS TV launcher app** with six cinematic themes, animated eye details, a rolling clock, a customizable favorites dock, and remote-friendly navigation.

> **Not a replacement for LG Home.** This is a standalone app launched from webOS. It does not automatically open at power-on. This project is not affiliated with LG, Naruto, or any streaming provider.

## Features

- Themes: Itachi, Akatsuki, Kakashi, Sasuke, Madara, Naruto
- Eye tracking effects for Itachi, Sasuke, Kakashi, Madara (visual alignment varies by TV)
- D-pad / Magic Remote navigation, traveling focus glow, Back button closes menus
- Favorite app dock, All Apps catalog, locally saved preferences
- Launch shortcuts for YouTube, Netflix, Prime Video, Hulu, and Peacock (IDs and availability vary by model, firmware, and region)
- Settings to customize app IDs when necessary

## Compatibility

Tested by the original creator on an **LG C3** with a Developer Mode install. Other LG webOS models and versions are **not yet verified**. Requires a webOS TV with Developer Mode support and a computer with Node.js and the webOS CLI. This is **not** an Android TV launcher.

## Install from source

1. Create an account at [LG's webOS TV developer site](https://webostv.developer.lge.com/) and install the **Developer Mode** app on the TV. Sign in, enable Dev Mode and Key Server, and note the TV's network IP address. Keep the TV and computer on the same LAN.
2. Install [Node.js](https://nodejs.org/) and the [webOS CLI](https://webostv.developer.lge.com/develop/tools/cli-installation):
   ```sh
   npm install -g @webos-tools/cli
   ```
3. Register your TV as `myTV`:
   ```sh
   ares-setup-device
   ares-novacom --device myTV --getkey
   ```
   Follow prompts to supply the TV IP and pair with the on-screen passphrase. **Do not share your pairing key or passphrase.**
4. Clone or download this repository and enter its top-level folder (the one containing `appinfo.json`):
   ```sh
   git clone https://github.com/rishraw/sharingan-tv-webos.git
   cd sharingan-tv-webos
   ares-package .
   ares-install --device myTV com.sharingan.tv_1.6.4_all.ipk
   ares-launch --device myTV com.sharingan.tv
   ```
5. On the TV, use arrows or the pointer to select an app; press OK to launch. Use **Settings** to change a shortcut's ID if required.

For detailed instructions see [docs/INSTALL.md](docs/INSTALL.md). For common issues see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## Notes on app IDs

The following IDs were confirmed on one LG C3, **not universally guaranteed**: YouTube `youtube.leanback.v4`, Netflix `netflix`, Peacock `com.peacock.tv`. Prime Video and Hulu were also tested successfully using the candidate IDs in `script.js`. Installed commercial apps might not appear in developer CLI listings. The built-in **All Apps** menu is a curated shortcut catalog, **not** a comprehensive scan of installed applications.

## Startup automation

LG's standard webOS settings do not allow selecting this developer app as the boot launcher. An external always-on device can monitor the TV and launch it after power-on, but that is optional and not included. The TV's own Home screen might briefly display first.

## Development

The app uses vanilla HTML, CSS and JavaScript; no build step or Node.js dependencies are needed for the UI. `ares-package .` builds the `.ipk` package. Contributions and issue reports are welcome; please include model, webOS version, and steps to reproduce (without publishing private IP addresses or pairing credentials).

## Artwork, trademarks, and redistribution

**Review before public distribution:** the artwork depicts characters from the Naruto franchise. This project is unofficial fan work. The included theme assets are not asserted to be licensed by the franchise rights holders. **The MIT license in `LICENSE` applies to original source code only, not franchise characters, third-party logos or artwork.** If you distribute a public release or a compiled `.ipk`, make sure you have the necessary rights for every image and logo, or replace them with content you are permitted to distribute. See [ARTWORK-NOTICE.md](ARTWORK-NOTICE.md).

## License

Original code: MIT. Artwork and third-party trademarks: excluded; see [ARTWORK-NOTICE.md](ARTWORK-NOTICE.md).
