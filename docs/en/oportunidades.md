# Opportunities

[Español](../es/oportunidades.md)

`/oportunidades/` is an archive of job calls, not a job board. It shows who
hires physicists in Peru, which degrees and skills they ask for, and in which
months they usually open internships. It keeps closed calls and calls from past
years too, because the calendar is built from them.

## Data

`data/opportunities.json` is not edited by hand: it is generated outside this
repository, by one script per source that copies its portal and reads the PDF
terms. The sources are:

- the job portals of IGP, SENAMHI, INAIGEM and ITP;
- the gob.pe calls of IPEN, INACAL, IMARPE, INGEMMET, INEN and OSINERGMIN;
- the PDF terms of UNSA and UNJFSC;
- the Bumeran ads that accept a physics degree.

Each call has `id`, `source`, `employer`, `kind`, `number`, `title`,
`published`, `closes`, `place`, `stipend`, `vacancies` and `url`, which points
to the terms the employer published. `published` is a `YYYY-MM-DD` date, or the
year alone when the source gives nothing more.

A call that asks for physics also keeps `physics: true`, `fields` (the
physics-family degrees it accepts), `skills` (the skills its terms name) and
`degrees`, an excerpt of the degree requirements with contact details removed.
It also keeps what its terms say about the job and the selection, when they can
be read:

- `duties` and `knowledge`: up to six items each, copied from the terms'
  functions and required knowledge;
- `stages`: the selection stages it names, in the order of a SERVIR call
  (curricular review, knowledge test, psychological test, interview), each with
  its `weight` in the final score when the terms give one;
- `days`: the days from publication to the last step of its schedule.

A PDF that lists several posts gives each post its own duties and knowledge, and
the whole call's stages and schedule. Other calls keep only the fields listed
above, because the calendar and the employer counts need nothing more. Only the
Bumeran ads that ask for physics are kept.

## When a call asks for physics

The rule reads only the degree passages of the terms, because the rest of the
document mentions «salud física» or «archivo físico». It accepts physics,
engineering physics, medical physics, geophysics, astrophysics and biophysics.
It drops «física» when the word next to it means something else: physical
therapy, physical education, physical security, natural person. Scanned terms
have no text to read and count as not asking for physics.

A Bumeran ad has no degree section, so its rule is stricter: the word counts
only when a degree cue such as «bachiller», «egresado», «carrera», «docente» or
«ingeniero» comes shortly before it in the same sentence. That drops «modelo de
datos físico», «tienda física» and «información geoquímica y geofísica».

## Views

- **Piden física**: the calls that ask for physics, by employer. An employer
  with fewer than three joins «Otros empleadores», where each row names its
  employer.
- **Calendario de prácticas**: per employer, a table of years by months with how
  many internship calls it published, physics or not. Below it, the months with
  calls in the most years, when one has calls in two years or more.
- **Habilidades**: each skill, how many physics calls name it, and which
  employers.
- **Empleadores**: the state and universities on one side and companies on the
  other, with their number of calls, the year of the first and the date of the
  last. An employer links to its own page, below, or else to its organisation
  page when a place in `data/physicists.json` has that short name.

## Employer pages

`content/oportunidades/_content.gotmpl` makes one page per employer with a
physics call, except Bumeran companies, at `/oportunidades/<short name>/`. Its
title is the place's full name when `data/physicists.json` has one.
`layouts/oportunidades/single.html` draws it:

- the facts under the lead sum up pay, schedule length, usual months, places and
  the organisation page;
- **Qué piden** counts the degrees and skills across its physics calls;
- **Cómo es el proceso** lists the stages its terms name, how many calls name
  each and the weight that repeats most;
- **Cuándo publica** is the year-by-month table of all its calls;
- **Convocatorias** shows each physics call with its duties, knowledge, stages
  and a link to the terms. Each call's anchor is its `id`, and the rows on
  `/oportunidades/` link there.

The sections live in `layouts/_partials/oportunidades/employer-sections.html`.
`tally.html` counts a list of names, `calendar.html` draws the year-by-month
table for both the list and the employer page, and `employer-name.html` links a
short name to its page.
