# Winzera Android APK update system

The existing Check for Updates button in the native Android app checks the latest public GitHub Release. If a newer APK is available, the user is asked to back up data before downloading it. Android will require the user to approve APK installation.

## Required one-time setup

Create a permanent Android signing keystore. Keep a secure backup of the keystore and passwords. Add these four GitHub Actions repository secrets (Settings > Secrets and variables > Actions):

- ANDROID_KEYSTORE_BASE64: base64-encoded keystore file
- ANDROID_KEYSTORE_PASSWORD: keystore password
- ANDROID_KEY_ALIAS: signing key alias
- ANDROID_KEY_PASSWORD: signing key password

Never commit the keystore or credentials. All future releases must use the same signing key and app ID.

## Publishing updates

GitHub Actions > Publish signed Android update > Run workflow > enter a new version such as 1.0.2. After successful build the APK is attached to a public GitHub Release. The app can then detect it via Check for Updates.

## Important migration

Existing GitHub Actions debug APKs are signed with a different key. Before installing the first signed release, export a backup of Winzera data. Uninstall the debug APK, install the signed release, then import the backup. Subsequent releases signed with the same permanent key can update in place.

iOS requires separate App Store or TestFlight distribution. The Android updater does not silently install APKs, and requires internet for checking and downloading updates.
