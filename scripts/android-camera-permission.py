from pathlib import Path
p=Path('android/app/src/main/AndroidManifest.xml')
s=p.read_text()
permission='<uses-permission android:name="android.permission.CAMERA" />'
if permission not in s:
    s=s.replace('<application ',permission+'\n    <application ',1)
p.write_text(s)
print('Ensured Android CAMERA permission for native photo and QR scanner')
