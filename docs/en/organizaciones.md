# Organisations

[Español](../es/organizaciones.md)

`/organizaciones/` has one page for each place in `places` of
`data/physicists.json`: the universities, institutes, state bodies, hospitals
and companies where someone from the [physicists map](fisicos.md#physicists-map)
studied or works. The adapter `content/organizaciones/_content.gotmpl` creates
the pages; there are no content files per organisation.

## Data

Each place has `kind`: `universidad`, `instituto`, `estado`, `hospital` or
`empresa`. The index groups by kind, in the order of
`layouts/_partials/organizaciones/kinds.html`, which also gives their names.

A Peruvian place that OpenAlex records also has `research`:

| Field      | Content                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `openalex` | The institution in OpenAlex. Its campuses and laboratories count as its own.                    |
| `count`    | Works since `research_from` with an author of the institution and a main topic in physics.      |
| `works`    | The most recent: title, DOI, year, journal and the first authors plus those who have a profile. |
| `authors`  | The authors who appear most in those works, with `slug` if they have a profile.                 |

"Physics" is the subfield of the main topic: physics and astronomy, geophysics,
atmospheric sciences, planetary sciences and radiology, where medical physics
falls. The authors include co-authors from other institutions.

## People

`layouts/_partials/fisicos/place-groups.html` splits the people of a place into
Pregrado, Posgrado, Trabajan and Trabajaron, and `fisicos/place-people.html`
shows them. `/fisicos/` and the organisation page use both, so they show the
same. The route and the timeline of a profile link each organisation's page.

## Update

The data come from the same tools as the physicists map. A new organisation
enters when someone on the map studied or works there.
