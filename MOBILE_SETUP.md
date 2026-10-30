# Winzera Android & iOS

This branch preserves the original root web app. Capacitor packages it for mobile.

## Android (GitHub Actions)
Open Actions > Android Debug APK > Run workflow on mobile-app. Download the debug APK artifact after a successful build. Debug APKs are for testing, not Play Store release.

## Local setup
Use Node.js 22 and npm. Run npm ci, npm run mobile:prepare, then npx cap add android or npx cap add ios, followed by npx cap sync. Android needs Android Studio and an SDK; iOS needs macOS, Xcode, and signing for distribution.

## Important
This is an initial native wrapper. Test local storage, backup/import, PDF downloads, file sharing, QR, WebRTC, offline startup, and device back navigation on real devices before treating it as production-ready. Browser-installed PWA data is not automatically migrated into the native app. Export a backup from the existing PWA before switching.
