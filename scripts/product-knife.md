# Product knife

The model is authored with Blender 5.2.1 and displayed with Three.js. It uses
separate meshes for the scales, liners, fasteners, tools, and keyring. Each tool
has an animated hinge. Blue is based on the Product chip's #297CDB, with a packed
micro-normal texture for the soft-touch surface.

## Files

- `assets/3d/product-swiss-army-knife.blend`: editable Blender scene, lights,
camera, materials, and folding keyframes. The repository ignores `assets/`;
  this local source can be regenerated with the script below.
- `site/public/models/product-swiss-army-knife.glb`: browser model with animation
  and embedded material textures, about 647 KiB.
- `site/public/images/product-knife-poster.png`: transparent Blender render,
  used while loading or if WebGL/model loading is unavailable.
- `scripts/build-product-knife.py`: reproducible model construction and export.

From the repository root on macOS:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/build-product-knife.py
```

This overwrites the generated Blender file, GLB, and poster. Preserve a copy
before editing the Blender scene manually. The four tools unfold with staggered
starts between frames 1–45; frames through 90 hold the open pose at 60 fps.

The revised source uses domed handle scales, finer brushed-metal normals,
machined pivot details, and a fuller tool silhouette. The previous model and
poster are preserved locally in `assets/3d/previous/`.

## Hero behavior

Hover or keyboard-focus Product to reveal the model above the hero copy.
Move away, blur the button, or press Escape to dismiss it. On devices without
hover, tapping toggles the preview. Reduced motion shows the open pose without
folding or turning. The reveal settles after about 1.15 seconds; there is no
continuous floating. The model never captures pointer events or shifts the text.

The renderer uses a dark studio environment with shaped reflection panels,
restrained fill, and neutral tone mapping to retain blue saturation. An
orthographic camera fits the open model's bounds into the available space above
the copy, including at narrow widths. The stage is capped at 580px on desktop.

Three.js and the GLB load on first interaction. Rendering stops after the reveal
settles and pauses while the preview is inactive, outside the viewport, or in a
hidden browser tab. GPU resources are released when the component unmounts.
The poster appears on a slow or failed model load and on WebGL failure; ordinary
loads avoid flashing the open poster before the folding animation.

The integration lives in `site/src/components/Hero/ProductKnife.tsx`,
`Hero.tsx`, and `Hero.module.css`. Run `npm run build` in `site/` to verify types
and regenerate the static site.
