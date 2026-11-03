# Research groups

[Español](../es/grupos.md)

`/grupos/` has one page for each group in `data/groups.json`. The adapter
`content/grupos/_content.gotmpl` creates the pages; there are no content files
per group. The index groups them by university.

## Which groups enter

Every group of the Faculty of Physical Sciences of the UNMSM enters, and any
UNMSM or PUCP group that someone from the
[physicists map](fisicos.md#physicists-map) coordinates or belongs to. A name
links a profile only when its words match those of a single profile, ignoring
accents and particles; two words are not enough.

## Data

| Field         | Content                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`          | The university and the group's acronym, like `unmsm-gimna`. It is the path of its page.                      |
| `institution` | The `id` of its place in `data/physicists.json`; links its organisations page.                               |
| `members`     | Name, `role` (`Coordinador`), degree and `slug` if they have a profile. The PUCP gives only the coordinator. |
| `lines`       | The research lines (UNMSM).                                                                                  |
| `projects`    | Title, code and call year of each registered project (UNMSM).                                                |
| `research`    | `count`: works since `works_from` by members with OpenAlex; `works`: the most recent.                        |

A UNMSM project code starts with the letter of the area (A health, B basic
sciences, C engineering, D business, E humanities and social sciences), followed
by the two digits of the call year and the two of the faculty (13 is Physical
Sciences), and ends with a suffix that gives the programme. `programme` keeps
that programme's acronym and `programmes`, at the root of the file, its name. A
code without a suffix has no `programme`: it can be PCONFIGI or an unfunded
project.

No emails, phones or offices are kept: only public professional data.

## People

`layouts/_partials/grupos/person-groups.html` shows a person's groups on their
profile, and each university's page in `/organizaciones/` lists its groups. The
old page `/unmsm/facultad/gi/` keeps the VRIP list from 2022 and links this
section.

## Update

The tools live outside this repository: they copy the groups from the UNMSM
Vice-Rectorate for Research and Graduate Studies and from the PUCP directory,
look up their publications in OpenAlex and write `data/groups.json`.
