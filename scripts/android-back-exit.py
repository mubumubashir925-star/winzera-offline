from pathlib import Path
files=list(Path('android/app/src/main/java').rglob('MainActivity.java'))
if not files: raise SystemExit('MainActivity.java missing')
p=files[0];s=p.read_text()
needle='public class MainActivity extends BridgeActivity {'
if needle not in s: raise SystemExit('Unexpected MainActivity.java')
s=s.replace(needle,needle+'''
    private void handleWinzeraBack() {
        android.webkit.WebView web = getBridge() == null ? null : getBridge().getWebView();
        if (web == null) { finish(); return; }
        web.evaluateJavascript(
            "(function(){try{if(typeof window.winzeraNativeBack==='function'){return window.winzeraNativeBack()?'handled':'exit'}return 'exit'}catch(e){return 'handled'}})()",
            result -> {
                if (result != null && result.contains("exit")) finish();
            }
        );
    }

    @Override
    public void onBackPressed() {
        handleWinzeraBack();
    }
''',1)
p.write_text(s)
print('Android back button now consults Winzera navigation state')
