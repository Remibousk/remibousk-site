#!/usr/bin/env bash
# Regenerate homepage logo-hover hero clips + posters.
# Run from repo root: bash site/scripts/make-hero-videos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VID_SRC="$ROOT/public/videos"
IMG_SRC="$ROOT/public/images"
OUT="$ROOT/public/videos/hero"
POSTERS="$OUT/posters"

mkdir -p "$OUT" "$POSTERS"

ENCODE=(-c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -an -movflags +faststart)

echo "==> Summ (copy/trim existing mobile-app clip → 880px, ≤2MB)"
# Source is already ~1.3MB; scale to 880 for the hero slot and keep length.
ffmpeg -y -i "$VID_SRC/summ-mobile-app.mp4" \
  -vf "scale=880:-2" \
  "${ENCODE[@]}" \
  "$OUT/summ.mp4"

echo "==> SiteMinder (best continuous ~11s from ExperienceTimeline source)"
# Leave D0E9… in place for ExperienceTimeline; cut a mid clip for the hero.
ffmpeg -y -ss 4 -i "$VID_SRC/D0E9BRHgnR3KlzVeJsBmbbppn1c.mp4" -t 11 \
  -vf "scale=880:-2" \
  "${ENCODE[@]}" \
  "$OUT/siteminder.mp4"

# If still over 1.5MB, bump CRF.
SM_SIZE=$(wc -c < "$OUT/siteminder.mp4")
if [ "$SM_SIZE" -gt 1572864 ]; then
  echo "    SiteMinder ${SM_SIZE}B > 1.5MB — re-encode CRF 30"
  ffmpeg -y -ss 4 -i "$VID_SRC/D0E9BRHgnR3KlzVeJsBmbbppn1c.mp4" -t 11 \
    -vf "scale=880:-2" \
    -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -an -movflags +faststart \
    "$OUT/siteminder.mp4"
fi

# Ken Burns helpers: upscale 2× then zoompan ping-pong (5s out / 5s back) at 30fps.
# d=300 frames → 10s. z goes 1.00→1.06 then back. Slight X/Y drift.
kenburns() {
  local src="$1"
  local dest="$2"
  local out_h="$3"
  # Upscale first (lanczos) so zoompan samples a denser grid (less jitter).
  ffmpeg -y -loop 1 -i "$src" -t 10 -r 30 \
    -vf "scale=iw*2:ih*2:flags=lanczos,zoompan=z='if(lt(on\,150)\,1+0.06*on/150\,1.06-0.06*(on-150)/150)':x='iw/2-(iw/zoom/2)+8*sin(2*PI*on/300)':y='ih/2-(ih/zoom/2)+6*cos(2*PI*on/300)':d=300:s=880x${out_h}:fps=30" \
    "${ENCODE[@]}" \
    "$dest"
}

echo "==> IBM (Ken Burns from banking iPads still)"
# Source is PNG data despite .jpg extension. Aspect 1210×688 ≈ 880×500.
kenburns "$IMG_SRC/G9pb1THiFESi6YMzG6x6UPGdV0.jpg" "$OUT/ibm.mp4" 500

echo "==> Vivant (Ken Burns from Superb dashboard)"
# Aspect 1679×1286 ≈ 880×674.
kenburns "$IMG_SRC/phsLJguxgze0zFxEPYZuwZB03I.png" "$OUT/vivant.mp4" 674

echo "==> Posters (first frame, 880px, jpg q≈4)"
for name in summ siteminder ibm vivant; do
  ffmpeg -y -i "$OUT/${name}.mp4" -frames:v 1 -vf "scale=880:-2" \
    -q:v 4 -update 1 "$POSTERS/${name}.jpg"
done

echo "==> Sizes"
ls -lh "$OUT"/*.mp4 "$POSTERS"/*.jpg
echo "Done."
