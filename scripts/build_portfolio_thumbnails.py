"""Generate the viewer's optional small thumbnails. Uses existing Pillow build dependency."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
output=root/'assets/thumbnails'
output.mkdir(exist_ok=True)
for source in sorted((root/'assets/portfolio').glob('page-*.webp')):
    with Image.open(source) as image:
        image.thumbnail((360,260),Image.Resampling.LANCZOS)
        image.save(output/source.name,'WEBP',quality=76,method=6)
print('Portfolio thumbnails generated.')
