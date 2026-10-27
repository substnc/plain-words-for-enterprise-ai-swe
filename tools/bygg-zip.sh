#!/bin/bash
# Packar mappen extension/ till en zip som går att ladda upp i Chrome Web Store.
# manifest.json hamnar i zip-filens rot, som butiken kräver. Versionen läses
# från manifest.json, så höj den där innan varje ny uppladdning.
# Svephjälpen sweep-frame.js är bara för utvecklarversionen. Den tas bort ur
# zip-filen och ur manifestet här.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(python3 -c 'import json;print(json.load(open("extension/manifest.json"))["version"])')
OUT="plain-words-for-enterprise-ai-swe-$VERSION.zip"
node tests/check-texts.js >/dev/null
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp -R extension/. "$TMP/"
rm -f "$TMP/sweep-frame.js"
find "$TMP" -name '.DS_Store' -delete
python3 - "$TMP/manifest.json" <<'EOF'
import json, sys
p = sys.argv[1]
m = json.load(open(p))
for cs in m["content_scripts"]:
    cs["js"] = [f for f in cs["js"] if f != "sweep-frame.js"]
open(p, "w").write(json.dumps(m, indent=2, ensure_ascii=False) + "\n")
EOF
rm -f "$OUT"
(cd "$TMP" && zip -q -r -X "$OLDPWD/$OUT" . -x '.*' -x '__MACOSX/*')
echo "Klar: $OUT"
unzip -l "$OUT"
