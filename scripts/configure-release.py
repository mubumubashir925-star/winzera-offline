from pathlib import Path
import os,base64,re
root=Path('android')
(root/'winzera-release.jks').write_bytes(base64.b64decode(os.environ['KEYSTORE_B64']))
p=root/'app/build.gradle'
s=p.read_text()
s=re.sub(r'versionCode\s+\d+','versionCode '+str(10000+int(os.environ['BUILD_NUMBER'])),s,count=1)
s=re.sub(r'versionName\s+"[^"]+"','versionName "'+os.environ['VERSION']+'"',s,count=1)
s=s.replace('android {','''android {
    signingConfigs {
        winzeraRelease {
            storeFile file("../winzera-release.jks")
            storePassword System.getenv("STORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
''',1)
s=s.replace('release {\n','release {\n            signingConfig signingConfigs.winzeraRelease\n',1)
p.write_text(s)
print('Release signing configured')
