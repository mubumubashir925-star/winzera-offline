from pathlib import Path
files=list(Path('android/app/src/main/java').rglob('MainActivity.java'))
if not files: raise SystemExit('MainActivity.java missing')
p=files[0]
s=p.read_text()
needle='public class MainActivity extends BridgeActivity {'
if needle not in s: raise SystemExit('Unexpected MainActivity.java')
s=s.replace(needle,needle+'''
    private boolean winzeraBackInProgress = false;

    private void handleWinzeraBack() {
        if (winzeraBackInProgress) return;
        winzeraBackInProgress = true;
        android.webkit.WebView web = getBridge() == null ? null : getBridge().getWebView();
        if (web == null) { winzeraBackInProgress = false; return; }
        web.evaluateJavascript(
            "(function(){try{if(typeof window.winzeraNativeBack==='function'){return window.winzeraNativeBack()?'handled':'exit'}return 'handled'}catch(e){return 'handled'}})()",
            result -> {
                winzeraBackInProgress = false;
                if (result != null && result.contains("exit")) {
                    finish();
                }
            }
        );
    }

    private void installWinzeraBackHandler() {
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleWinzeraBack();
            }
        });
    }
''',1)
marker='super.onCreate(savedInstanceState);'
if marker not in s: raise SystemExit('Expected onCreate from safe-area patch')
s=s.replace(marker,marker+'\n        installWinzeraBackHandler();',1)
p.write_text(s)
print('Installed AndroidX back dispatcher callback for gesture and button navigation')
