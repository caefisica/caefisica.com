# Physicists

[Español](../es/fisicos.md)

Each person in `data/physicists.json` has their page at `/personas/<slug>/` (see
[people](contenido.md#people)). To write about someone, create
`content/personas/<slug>/index.md` with the same `slug` as the JSON: that page
replaces the generated one and the same template adds the JSON data to it. It
reads like an encyclopedia article: each fact links a public source.

## Sources

`sources` is the list of sources, in the order they are numbered. Each has
`key`, `title` and `url`. The `timeline` entries cite them with `cite`, and the
text with the `cite` shortcode:

```markdown
Volvió a la PUCP en 2015 {{</* cite "orcid" */>}}.
```

A key that is not in `sources` stops the build.

Good sources are the ORCID record, the university's page, a university press
release and the OpenAlex profile. A LinkedIn profile works for degrees and
posts, but needs an account to view: cite an open source first if there is one.
From LinkedIn take only degrees, posts and the fields of work the person names
in their "About", as a short list in our own words (`fields` in the JSON), never
their text; also no publications, photos or contact details.

## Front matter

| Field            | Content                                                 |
| ---------------- | ------------------------------------------------------- |
| `role`           | Current post and institution.                           |
| `fields`         | Research fields. The list shows the first two.          |
| `studied`        | Universities where they studied.                        |
| `collaborations` | Experiments or collaborations.                          |
| `timeline`       | `years`, `text` and `cite` (list of keys).              |
| `sources`        | See above.                                              |
| `openalex`       | `ids` (OpenAlex authors) and `maxAuthors`.              |
| `images`         | Optional photo. Without it, the page shows the initial. |

## Photo

Only a photo with a free licence (Wikimedia Commons) or sent by the person.
Photos from universities and the press have rights reserved.

## Publications

`bun run researchers` queries OpenAlex and writes
`data/researchers/<slug>.json`: total works and citations, and the six most
cited works with at most `maxAuthors` authors. An author can have several
profiles in OpenAlex; `ids` adds them up. `maxAuthors` leaves out the papers of
the large collaborations, which hundreds of people sign. Run it again to update
the data and commit the JSON.

## Press

`data/press.yaml` lists the press articles written by a person or about them:
`person` (the profile folder), outlet, date, title, link, `author` if they
signed it and `video` if it is a video. The profile shows them under "En la
prensa", newest first. An article enters only if it names the person with an
institution that matches their profile; the same name is not enough. A video
enters if an outlet or an institution publishes it (RPP, Andina, TV Perú, a
university) and it is a news item or an interview; a talk or a seminar goes in
recordings, and a personal channel does not count.

## Physicists map

`/fisicos/` draws a globe with the institutions where the people in
`data/physicists.json` studied or worked, and below it the same information as a
list, which shows by institution, by area, by training or by person.

`data/physicists.json` is not edited by hand: it is generated outside this
repository. To correct a person, open an issue. `fetched` keeps the date of the
copy.

### Who enters

The map gathers the world of physics, not only physicists. Someone enters who:

- has a finished degree in physics, astrophysics, biophysics or geophysics from
  a university in Peru;
- works in physics with another training (a remote-sensing engineer at the space
  agency, a chemist in a materials lab), provided their work is research or that
  of a specialist in a physical science;
- is on the staff of the Physics Section of the PUCP, whatever their degree.

Meteorology and physical oceanography count as atmospheric and ocean physics.
Routine forecasting and geology without geophysics do not. A degree in progress
does not count, nor one in physical education, physical therapy or teaching.

### Data

`source` says where each person comes from: `ctivitae`, `pucp`, `orcid` or
`web`. With `web`, `site` names the site of `url`. `track` says which training
each person comes from, and the view by training groups them. OpenAlex gives the
area, from the topics of their publications, and the output (`works_count` and
`cited_by`). `places` lists the institutions with their coordinates (`lat` and
`lon` null if they have no location). `people` lists each person with:

| Field       | Use                                                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `degree`    | Their highest degree, "Doctorado en física", or null without a degree.                                                                                                                                                                                             |
| `track`     | Their training: physics, geophysics, engineering or other.                                                                                                                                                                                                         |
| `studied`   | Their degrees, with institution, level and years.                                                                                                                                                                                                                  |
| `works`     | Their current posts.                                                                                                                                                                                                                                               |
| `jobs`      | All their posts, for the profile's trajectory.                                                                                                                                                                                                                     |
| `path`      | Their route: each stop with its institution and what they did there.                                                                                                                                                                                               |
| `area`      | The area according to OpenAlex, or null with few indexed publications.                                                                                                                                                                                             |
| `fields`    | Optional: the fields named in their LinkedIn "About".                                                                                                                                                                                                              |
| `orcid`     | Their ORCID, or null without one.                                                                                                                                                                                                                                  |
| `links`     | Optional: their other profiles, each with `kind` and `url`. `kind` is a research profile (`inspire`, `scholar`, `lattes`…), a channel (`linkedin`, `github`, `youtube`) or `web`. They come from the person's ORCID or CTI Vitae page, or we checked them by hand. |
| `wikipedia` | Optional: their Wikipedia article, in Spanish if there is one. It enters if their Wikidata item carries their ORCID, or if we checked by hand that the article is about them and not a namesake.                                                                   |

A study the person lists as in progress on their ORCID enters `works` and `jobs`
as "Estudiante de…", to the present, when its institution has a row in `places`
and the person holds no current post there yet. So someone in a graduate
programme shows among those at that institution today.

A PUCP profile gives the degree and the institution but not the years, so those
profiles order the degrees by level.

The route follows the career in order: each degree and each post, current or
past, by its first year. In the same year, the degree goes before the post, and
an entry without a year follows the previous one. Someone who returns to an
institution passes through it again in the route. A post enters only if its
institution has a row in `places`: universities, research centres,
observatories, hospitals and technical state agencies. Companies, schools,
ministries and banks stay in the profile's trajectory, not in the route. The
list by institution separates those who work there today ("Trabajan") from those
who worked there before ("Trabajaron").

The profile's trajectory sorts the degrees and posts of `studied` and `jobs` by
their first year and groups consecutive entries at one institution under it. An
article with `timeline` replaces it with its cited list.

When an institution is chosen, the globe draws the route of each person who
studied or worked there. A name in that list, or the address
`/fisicos/#ruta-<slug>`, opens the person's card in the panel and draws only
their route.

`content/personas/_content.gotmpl` creates a page per person at
`/personas/<slug>/`, with what the JSON says. This way the data stays in view
when CTI Vitae does not respond. The page uses the photo in
`static/images/personas/` if it exists; the rule of the Photo section applies
here too. Without a photo, it shows the initials of the name and the first
surname.

When the JSON gains an institution outside Peru, run `bun run landmask`. It
rewrites `assets/maps/land.bin` with the detailed coastline around each
institution. The globe draws its first dots about 1° apart, so 0.2° keeps the
coast smooth there. Zoomed in, Peru and the box around each place abroad switch
to 0.01°, about a kilometre.

### Format of `land.bin`

`assets/js/physicists-map.ts` draws the globe from these land masks. The file is
little-endian:

| Field         | Type  | Content                                       |
| ------------- | ----- | --------------------------------------------- |
| count         | `u8`  | Number of masks.                              |
| `kind`        | `u8`  | `0` land, `1` Peru's territory.               |
| south, west   | `i32` | Edges of the mask, in hundredths of a degree. |
| cells         | `u16` | Cells per degree.                             |
| width, height | `u16` | Size of the mask in cells.                    |
| length        | `u32` | Bytes its rows take.                          |
| rows          | —     | South to north; see below.                    |

Each mask repeats the fields from `kind`. A row is a run of LEB128 varints:
alternate outside and inside run lengths, starting outside and summing to the
width. A cell is inside when its centre is inside the polygons.
