# Documentation

Reference material for Fake News Detector. Start with the root
[`README.md`](../README.md) for the overview and quickstart, then dig in here.

| File                                   | What's inside                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`ddd-summary.md`](ddd-summary.md)     | The domain reference: aggregates, entities, invariants, lifecycles, enums, domain processes, and the role-based permission matrix. |
| [`api.md`](api.md)                     | Every HTTP endpoint with its required permission.                                                                                  |
| [`art-direction.md`](art-direction.md) | Visual identity, palette, and the list of screens to design.                                                                       |
| [`class/`](class/)                     | Class diagrams (PlantUML) — domain model and relationships.                                                                        |
| [`usecase/`](usecase/)                 | Use-case diagrams (PlantUML) — functionality by actor.                                                                             |
| [`sequence/`](sequence/)               | Sequence diagrams (PlantUML) — interaction flows.                                                                                  |
| [`erd/`](erd/)                         | Entity-relationship diagrams (PlantUML) — database schema.                                                                         |

Each UML directory ships a `*-simple` and a `*-full` variant. Render the
`.puml` files with any PlantUML tool (e.g. the PlantUML VS Code extension or
`plantuml file.puml`).
