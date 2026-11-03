# Journal

[Español](../es/revista.md)

`/revista/` lists every article of the journal of the Faculty of Physical
Sciences of the UNMSM in three views: by area, by issue, newest first, and by
author, for those who signed three articles or more. An author's name opens
their profile when they have one; the title opens the full text.
`layouts/revista/list.html` builds the page from `data/journal.json`, and
`layouts/_partials/revista/person.html` shows on each profile the articles the
person signed.

## Data

| Field      | Content                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| `fetched`  | The date of each copy: `crossref` and `sisbib`.                                      |
| `issues`   | One issue per row: `volume`, `number` (`1-2` if double), `year` and its `articles`.  |
| `articles` | Title, `url` of the full text, `doi` and `pages` if present, `area` and its authors. |
| `authors`  | Name and `slug` if they have a profile. An article without a DOI carries `byline`.   |

Crossref is the main source: the journal has registered a DOI per article
since 1998. The archive of the San Marcos library, on sisbib, adds the articles
from 1998 to 2011 that have no DOI. Their `byline` is the printed signature,
with initials, and links no profiles.

An author links their profile by ORCID, or by name with the rule of the
[groups](grupos.md#which-groups-enter): their words match those of a single
profile, and two words are not enough.

`area` comes from the primary topic OpenAlex gives an article with a DOI, mapped
to an area of physics. An article without a DOI, or one OpenAlex does not
classify, has no `area` and shows under "Sin área". An area with fewer than
eight articles joins the others under "Otras áreas".

Some old issues were registered in Crossref years later, with the registration
date. `year` is the year of the volume; it stays empty when it is later than
that of a higher volume.

## Update

The tools live outside this repository. They copy Crossref, the sisbib archive
and the OpenAlex topics, and write `data/journal.json`. The journal's site asks
to confirm that you are human, so nothing is copied from it.
