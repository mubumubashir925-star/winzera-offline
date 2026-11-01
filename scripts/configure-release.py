from pathlib import Path
import os,base64,re
root=Path('android')
(root/'winzera-release.jks').write_bytes(base64.b64decode(os.environ['KEYSTORE_B64']))
p=root/'app/build.gradle'
s=p.read_text()
major,minor,patch=map(int,os.environ['VERSION'].split('.'))
version_code=major*1000000+minor*10000+patch*100+int(os.environ['BUILD_NUMBER'])%100
if version_code <= 10023:
    raise ValueError('Refusing downgrade: versionCode must exceed installed v2.0.1 (10023)')
s,n=re.subn(r'versionCode\s+\d+','versionCode '+str(version_code),s,count=1)
if n != 1:
    raise ValueError('Could not update Android versionCode')
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
