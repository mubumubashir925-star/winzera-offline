from pathlib import Path
from PIL import Image
source = Image.open('icons/icon-512.png').convert('RGBA')
res = Path('android/app/src/main/res')
for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    dest = res / ('mipmap-' + density)
    dest.mkdir(parents=True, exist_ok=True)
    for name in ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']:
        source.resize((size,size),Image.Resampling.LANCZOS).save(dest/name)
# Avoid generated adaptive launcher layers hiding the supplied icon.
xml = res/'mipmap-anydpi-v26'
if xml.exists():
    for f in xml.glob('ic_launcher*.xml'):
        f.unlink()
print('Applied Winzera PWA icon to Android launcher resources')
