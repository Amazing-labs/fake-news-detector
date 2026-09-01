# Documentation

Reference material for Fake News Detector. Start with the root
[`README.md`](../README.md) for the overview and quickstart, then dig in here.

| File                                   | What's inside                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`ddd-summary.md`](ddd-summary.md)     | The domain reference: aggregates, entities, invariants, lifecycles, enums, domain processes, and the role-based permission matrix. |
| [`api.md`](api.md)                     | Every HTTP endpoint with its required permission.                                                                                  |
| [`art-direction.md`](art-direction.md) | Visual identity, palette, and the list of screens to design.                                                                       |
| [`usecase/`](usecase/)                 | Use-case diagram — what the platform lets each role do.                                                                            |
| [`class/`](class/)                     | Class diagram — one responsibility per class.                                                                                      |
| [`mpd/`](mpd/)                         | Merise physical data model — the real PostgreSQL tables, and why Merise is used for it.                                            |
| [`sequence/`](sequence/)               | Sequence diagrams — the three chronological flows.                                                                                 |
| [`activity/`](activity/)               | Activity diagram — the director's arbitration workflow, step by step.                                                              |

## The diagram set

One figure per family, each sized to stay legible on a printed A4 page. The
alternate variants that used to sit beside them were removed: they duplicated
this content at a size no printer could resolve.

| Diagram                                                                | Purpose                                           | Render      | Print legibility |
| ---------------------------------------------------------------------- | ------------------------------------------------- | ----------- | ---------------- |
| [`usecase-essentiel`](usecase/usecase-essentiel.puml)                  | 13 use cases plus `S'authentifier`, by role.      | 994 × 1593  | ~5,3 pt          |
| [`class-fonctionnel`](class/class-fonctionnel.puml)                    | 14 classes, one responsibility each.              | 1113 × 1613 | ~5,2 pt          |
| [`mpd-essentiel`](mpd/mpd-essentiel.puml)                              | 10 PostgreSQL tables of the editorial circuit.    | 977 × 1416  | ~5,9 pt          |
| [`sequence-authentification`](sequence/sequence-authentification.puml) | A user signs in. Referenced by the three others.  | 603 x 600   | ~9,6 pt          |
| [`sequence-signalement`](sequence/sequence-signalement.puml)           | A citizen files a report.                         | 668 x 628   | ~8,7 pt          |
| [`sequence-prise-en-charge`](sequence/sequence-prise-en-charge.puml)   | A journalist opens an investigation on a subject. | 610 x 689   | ~9,5 pt          |
| [`sequence-arbitrage`](sequence/sequence-arbitrage.puml)               | The director arbitrates and publishes.            | 775 x 1793  | ~4,7 pt          |
| [`activity-arbitrage`](activity/activity-arbitrage.puml)               | The same arbitration, as a workflow.              | 1012 × 984  | ~5,7 pt          |

Legibility is the height of a 12 px glyph once the figure is scaled to a full A4
portrait page (17 × 24,7 cm of usable area).

## The three views describe one perimeter

The use-case, class and MPD figures are deliberately cut to the same scope, so
they can be read side by side:

**14 use cases → 14 classes → 10 tables.** The gap between classes and tables is
the flattened inheritance of `Acteur`: Citoyen, Vigie, Journaliste and Directeur
share the single `actors` table, discriminated by its `role` column.

Each family's `README.md` carries the coverage table proving that mapping in
both directions, plus the text meant to be pasted next to the figure in the
defense document.

## Rendering

Render the `.puml` files with any PlantUML tool (the VS Code extension, or
`plantuml file.puml`). The `.png` / `.svg` next to each `.puml` are committed so
the figures are readable straight from GitHub and from the defense document, but
the `.puml` remains the source: edit it and re-render, never touch a render by
hand.
