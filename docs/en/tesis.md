# Theses

[Español](../es/tesis.md)

`/tesis/` lists the bachelor's and master's theses and the professional
sufficiency works of the Faculty of Physical Sciences. Each has its page at
`/tesis/<number>/`, where the number is that of the Cybertesis handle.

## Data

`data/theses.json` is a copy of three collections of Cybertesis, the San Marcos
repository. It is not edited by hand: it is generated outside this repository.
`fetched` keeps the date of the copy. Each thesis has title, authors, advisers,
jury, year, degree, area, topics, abstract, handle and licence.

The PDF is not copied. The page links the Cybertesis record, which holds the
full text and its licence.

The area is the first OECD code of the record. `areas` keeps the label of each
code used, according to the vocabulary of
[pe-repo](https://purl.org/pe-repo/ocde/ford).

## Names and profiles

Cybertesis writes names as `Surnames, Names`. Each author and adviser carries in
`slugs` the forms in which the site could name them: all the names or the first,
with both surnames or the first. The partial `data/person-page.html` looks up
each slug in `/personas/` and returns the first page that exists. If none
exists, the name appears without a link.

An adviser's ORCID is kept only if the record names a single adviser, because
Cybertesis lists the ORCIDs apart from the names and in no fixed order.

## Defences

`data/defences.json` gathers the defence invitations the faculty published on
its Facebook page. It is not edited by hand either: it is generated outside this
repository. Each defence has candidate, degree, title, date, month, jury, thesis
and a link to the invitation.

`date` is the day the invitation states, if it does. The month comes from the
post's date or, if the copy has none, from the photo's number, which grows with
time: it is interpolated between the posts that have a date.

`thesis` is the Cybertesis number when an author shares two words of the name
with the candidate, one of them a surname. The degree picks the collection and
the year closest to the invitation picks the record. This survives a misspelled
name and someone with both a bachelor's and a master's thesis.

The jury keeps the role the invitation states: Presidente, Miembro, Miembro
externo, Miembro suplente, Asesor or Coasesor. Defences from Fluid Mechanics
Engineering do not enter, because their theses are not in the physics
collections.

The page of a linked thesis shows its jury by role, the date and the invitation.
Each jury member's profile lists their defences under "Jurado de
sustentaciones", without those they advised, which already appear under "Tesis
asesoradas".

## Views

The list groups by area, by year, by adviser or by defence. An area with fewer
than eight works goes into "Otras áreas", where each row says its area. The view
by adviser shows those who advised three works or more. The defences view groups
the invitations by year; each row opens the thesis if it is already in
Cybertesis and the invitation if not.

A thesis page ends with the talks, theses and articles on its subject, if there
are any (see [related content](grabaciones.md#related-content)).
