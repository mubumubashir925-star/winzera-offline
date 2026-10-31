from pathlib import Path
base=Path('android/app/src/main')
files=list((base/'java').rglob('MainActivity.java'))
if not files: raise SystemExit('MainActivity.java not found')
p=files[0]
s=p.read_text()
needle='public class MainActivity extends BridgeActivity {'
if needle not in s: raise SystemExit('Unexpected MainActivity template')
insert='''public class MainActivity extends BridgeActivity {
    private boolean diagnosticShown = false;

    private void checkWebStartup() {
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            if (isFinishing() || isDestroyed() || diagnosticShown) return;
            android.webkit.WebView web = getBridge() == null ? null : getBridge().getWebView();
            if (web == null) {
                showStartupDiagnostic("Native WebView is unavailable");
                return;
            }
            web.evaluateJavascript("(function(){try{var a=document.getElementById('app'),l=document.getElementById('loginScreen');return JSON.stringify({url:location.href,ready:document.readyState,app:a?getComputedStyle(a).display:'missing',login:l?getComputedStyle(l).display:'missing',splash:!!document.getElementById('splash'),scripts:document.scripts.length})}catch(e){return 'JS:'+e.message}})()", result -> {
                if (result == null || result.equals("null")) {
                    showStartupDiagnostic("WebView JavaScript did not respond");
                    return;
                }
                try {
                    String data = new org.json.JSONTokener(result).nextValue().toString();
                    org.json.JSONObject state = new org.json.JSONObject(data);
                    String app = state.optString("app", "missing");
                    String login = state.optString("login", "missing");
                    if ("none".equals(app) && "none".equals(login)) {
                        showStartupDiagnostic("App has not become visible.\\n" + data);
                    }
                } catch (Exception e) {
                    showStartupDiagnostic("Startup inspection: " + result);
                }
            });
        }, 14000);
    }

    private void showStartupDiagnostic(String detail) {
        if (diagnosticShown || isFinishing()) return;
        diagnosticShown = true;
        new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Winzera startup issue")
            .setMessage("The application did not open. No app data was cleared.\\n\\n" + detail)
            .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
            .show();
    }
'''
s=s.replace(needle,insert,1)
# existing safe-area onCreate is already injected by the earlier script
marker='super.onCreate(savedInstanceState);'
if marker not in s: raise SystemExit('Safe-area setup must run before native diagnostics')
s=s.replace(marker,marker+'\n        checkWebStartup();',1)
p.write_text(s)
print('Installed native Android startup diagnostic')
