# XITFORGE iOS build

The repository now includes an iOS Xcode project and a GitHub Actions workflow.

The workflow builds an **unsigned** IPA artifact on a macOS runner.
A signed IPA requires Apple signing/provisioning configured separately.
The iOS client currently reads the XITFORGE config API.

Before using a deployed API, replace `https://YOUR-DOMAIN.example`
in `ios/XITFORGE/WebViewController.m`.
