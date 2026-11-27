"""Copy icons/sprite.svg symbols into index.html (ids prefixed ic-), between the ICONS markers.
Run after build.py:  python3 icons/inject.py"""
import re,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
sp=(root/"icons/sprite.svg").read_text()
syms=re.sub(r'<symbol id="([^"]+)"',r'<symbol id="ic-\1"',re.search(r'<svg[^>]*>(.*)</svg>',sp,re.S).group(1))
block='<!-- ICONS:start (gerado por icons/inject.py) --><svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'+syms+'</svg><!-- ICONS:end -->'
p=root/"index.html";h=p.read_text()
if "<!-- ICONS:start" in h: h=re.sub(r'<!-- ICONS:start.*?<!-- ICONS:end -->',lambda m:block,h,flags=re.S)
else: h=h.replace('<svg width="0" height="0"',block+'\n<svg width="0" height="0"',1)
p.write_text(h)
