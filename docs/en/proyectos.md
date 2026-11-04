# Projects

[Español](../es/proyectos.md)

`/proyectos/` lists the PROCIENCIA-funded projects that are physics or have
physicists on their team. It shows who leads them, at which organisation, when
and with how much money. A profile shows its own under «Proyectos con fondos
públicos», marked «Líder» where that person leads.

## Data

`data/grants.json` is not edited by hand: it is generated outside this
repository, from the
[PROCIENCIA Observatorio](https://observatorio.prociencia.gob.pe/subvenciones).
It takes the scientific research, equipment and innovation grants.

Each project has `id` (the grant number), `title`, `programme`, `contest`,
`organisation`, `place`, `region`, `start`, `end`, `amount` (in soles), `area`
(the OCDE sub-area), `discipline`, `keywords`, `physics_area`, `leader`,
`members`, `team_total` and `url`, which points to its Observatorio page.
`place` is the id of a place in `data/physicists.json` when the organisation's
name matches it. `leader` and `members` are profile slugs: only team members
with a profile are kept, and `team_total` counts everyone. A project has no
state: it is running until `end` has passed.

## When a project is physics

A project is listed when its OCDE sub-area is physical sciences, or when its
leader or a team member is on the physicists map. The Observatorio page shows
only the first ten team members, so a physicist further down does not count. An
Observatorio name, «SURNAMES ,GIVEN NAMES», matches a profile when every surname
and the first given name appear in the profile's name, and it matches only one.

## Views

- **Año de inicio**: projects by the year they started. «En curso» marks those
  that end after the date of the site's last build.
- **Organización**: projects by organisation. One with fewer than three joins
  «Otras organizaciones». An organisation links to its page when it has `place`.
