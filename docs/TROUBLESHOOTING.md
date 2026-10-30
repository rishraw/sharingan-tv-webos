# Troubleshooting

- **TV not found / pairing error:** ensure TV and computer are on the same network, Developer Mode and Key Server are enabled, TV IP is current, and the device configuration points to the correct host. Re-pair as needed. Never post credentials in a GitHub issue.
- **`ares-package` fails:** run it from the folder containing `appinfo.json`; check `ares --version` and Node.js availability.
- **An app tile won't launch:** the app must actually be installed on your TV, and the application ID may vary by region/firmware. Open Settings to customize an ID. Peacock was verified as `com.peacock.tv` on an LG C3.
- **All Apps doesn't show something:** the panel is a curated shortcut catalog, not a system-wide installed-app list. Commercial apps may be hidden from ordinary developer APIs.
- **Eye tracking seems offset:** eye coordinates were tuned on one LG C3 and specific artwork assets. Browser viewport, firmware and image scaling can change alignment. File an issue with a cropped image of just the on-screen eye region.
- **Magic Remote vs arrow focus:** only one tile should be highlighted; report if two tiles glow concurrently.
- **TV asks to exit when Back is pressed:** this is expected if no in-app panel is open; while Settings/Themes is open, Back should close it first.
- **No auto-start on power-up:** webOS doesn't expose a supported public default-launcher setting for this app. External automation is optional.
