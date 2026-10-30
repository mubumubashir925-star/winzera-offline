from pathlib import Path
import re

base = Path('android/app/src/main')
activity = base / 'java/app/winzera/offline/MainActivity.java'
if not activity.exists():
    candidates = list((base / 'java').rglob('MainActivity.java'))
    if not candidates:
        raise SystemExit('MainActivity.java not found')
    activity = candidates[0]
text = activity.read_text()
if 'WindowCompat.setDecorFitsSystemWindows' not in text:
    text = text.replace('public class MainActivity extends BridgeActivity {', '''public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        androidx.core.view.WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(android.graphics.Color.rgb(26, 10, 46));
        getWindow().setNavigationBarColor(android.graphics.Color.rgb(26, 10, 46));
        getWindow().getDecorView().setSystemUiVisibility(0);
    }
''')
activity.write_text(text)
# On Android 15+, explicitly opt out of enforced edge-to-edge for this
# legacy web layout until the web UI is fully safe-area aware.
manifest = base / 'AndroidManifest.xml'
s = manifest.read_text()
s = s.replace('<application ', '<application android:windowOptOutEdgeToEdgeEnforcement="true" ', 1)
manifest.write_text(s)
print('Applied native Android status/navigation safe-area settings')
