# Hero particle quality review

Reviewed 7 September 2026 in the existing particle-effect worktree.

The Opera House is now the Design scene. Its supplied 1536 × 1024 artwork is encoded as a lossless WebP with the original transparency and aspect ratio. It uses the existing particle simulation, morphs, pointer interaction, keyboard selection and dismissal. Colour input is sampled using luminance rather than the red channel alone.

## Assessment

The concept is strong: the shared particle material and spatially ordered morphs connect the five interests into one system. The whole set is not yet at the standard of a finished leading-studio portfolio interaction. Subject clarity and consistency are more valuable next steps than increasing visual turbulence.

| Scene | Assessment | Next art-direction improvement |
| --- | --- | --- |
| Design | The strongest architectural silhouette. The sails remain identifiable in the particle material; the transparent background avoids a rectangular image boundary. | Preserve sharp sail edges and dark glass recesses. A restrained reveal progressing up the shells could give it an architectural rhythm. |
| Product | Clear silhouette and a meaningful unfolding action. Fine metal detail is lost in the grain. | Give the blades a more deliberate stagger and brief final hold; preserve the body as a stable visual anchor during opening. |
| Discovery | The weakest fit with the set. The full-frame moving clip reads as a noisy rectangle, while the other scenes are isolated objects. | Re-art-direct the source into a single isolated discovery subject or prepare a foreground matte. Retain the existing clip until that creative change is chosen. |
| Strategy | Recognizable compass outline, but the face and needle compete with particle grain. | Increase local contrast around the needle and reduce face detail. One deliberate needle sweep followed by a rest would communicate direction more clearly than constant movement. |
| Build | Recognizable Macintosh silhouette; small screen marks are much weaker than the case outline. | Enlarge the meaningful screen strokes and reduce the amount of tiny code. End the typing action on a readable composition with a restrained cursor. |

## Improvements implemented

- Added the Opera House Design scene and correct greyscale sampling for colour artwork.
- Balanced sampling and duplicate distribution to reduce bright clumps and dark holes; reduced random ink-weight variation.
- Reduced pointer radius, throw, swirl and velocity transfer. The affected radius also scales to the subject, protecting smaller compositions.
- Increased settling damping, reduced idle flow and clip-induced turbulence, and shortened trails and launch jitter.
- Reduced the desktop particle ceiling from 60,000 to 36,000. Tablet counts now scale above the small-phone budget with width squared. This reduces maximum simulation work; it is not a measured frame-rate guarantee.
- Reduced-motion mode now uses static images: the fully open knife and a selected still frame for clips, including completed typing for Build. It stops its animation loop after the brief fade and redraws on resize/theme changes.
- Fixed delayed scene loads that could overwrite a reselected scene or revive an effect after dismissal. Failed asset requests can retry.
- Kept the tuning workbench opt-in with `?tune`, and made chip labels announce Show/Hide accurately.

## Highest-value next steps

1. Unify the source art. Discovery's rectangular footage is the largest remaining visual inconsistency. Author each source around a clear silhouette and one focal detail.
2. Separate fine detail from atmospheric particles. A GPU renderer with a crisp core and a sparse, softer moving fringe would preserve recognizability without adding uniform noise. Keep the current Canvas renderer as a compatibility fallback.
3. Profile representative phones and high-DPI screens before selecting a final rendering budget. The current renderer writes a CPU pixel buffer every active frame at one backing pixel per CSS pixel; both bandwidth and high-DPI detail limit it. Target the actual refresh-rate budget with headroom, and adapt quality using measurements.
4. Give each scene its own reveal timing, contrast curve and resting composition within the shared motion system. Avoid perpetual motion that competes with the headline.
5. Add visible asset-failure fallback posters and decode larger sprite sheets during idle time. Cache retry is fixed, but an unavailable asset still has no visible fallback.

## Validation

- Production export passed, including TypeScript checks and all nine generated pages.
- Ten regression tests passed: loading cancellation, reselect races, retry, reduced-motion sleep/redraw/dismissal, clip poster selection, finished rig pose, colour versus sheet luminance, visibility pause/cleanup, tablet budgets, and empty silhouettes.
- Inspected all five scenes in the local browser, confirmed Design selection and Escape dismissal, and checked the phone breakpoint. The tablet density issue found during inspection was corrected and the updated Opera House was visually rechecked.
- Not measured: physical-device GPU/CPU traces, sustained battery impact, or frame-time percentiles. Reduced-motion behavior is covered by deterministic engine tests rather than changing the user's OS setting.

Run the regression checks from `site`: `node --test tests/hero-particles.test.mjs`.
