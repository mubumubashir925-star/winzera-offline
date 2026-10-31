from pathlib import Path
files=list(Path('android/app/src/main/java').rglob('MainActivity.java'))
if not files: raise SystemExit('MainActivity.java missing')
p=files[0];s=p.read_text()
needle='public class MainActivity extends BridgeActivity {'
if needle not in s: raise SystemExit('Unexpected MainActivity.java')
s=s.replace(needle,needle+'''
    @Override
    public void onBackPressed() {
        // Exit the Android activity instead of navigating WebView history.
        finish();
    }
''',1)
p.write_text(s)
print('Android back button now exits the activity')
