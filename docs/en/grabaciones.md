# Talks

[Español](../es/grabaciones.md)

`/grabaciones/` lists the seminars, colloquia, lectures, Faculty Council
sessions and thesis defences of the faculty, of the Physics Section of the PUCP
and of physics groups at the UNI and the UNT. The menu and the title call it
"Charlas". Each talk has its own page, which plays the video from its original
site. The site hosts no video.

## Pages

The front page has one row per series: name, organiser, years, and how many
talks it has and how many with video. A series is what repeats with the same
organiser. Each row opens `/grabaciones/<series>/`, which
`content/grabaciones/_content.gotmpl` creates from `series`. That page groups
the talks by year, newest first. The title of each row opens the talk's page,
and the name of the origin links the original: the YouTube video, the Educast
page, the Facebook post or the invitation. A talk without video is dimmed, so
the series stays complete without hiding which ones can be watched. Each year
carries its count with the noun ("26 charlas"), because a number beside the year
reads as part of it.

Above the years there is a bar with a filter and one link per year; from `md` up
it sticks under the header. The filter (`assets/js/list-filter.ts`) keeps the
rows that contain all the words typed, ignoring case and accents, and hides the
years left empty with their link. Without JavaScript the field does not appear
and the links still work.

Defences and outreach are not series: they are single events with no common
organiser. Their recordings appear directly on the front page, below the list of
series.

A talk's page is at `/grabaciones/<series>/<id>/`, or at `/grabaciones/<id>/` if
it belongs to no series. The id is lowercase, because Hugo lowercases paths. The
page gives the title, the speakers with their affiliation, the date, the series
and the player, and below it a card with the original, the invitation and the
Educast summary. By origin:

- **YouTube**, **Facebook** and **Drive** show the thumbnail with a button; when
  pressed, `assets/js/player.ts` loads the YouTube player (without cookies) or
  the Google Drive one. Until then the page requests nothing from those sites.
- **Educast** plays the mp4 in the site's own player (`assets/js/video.ts`): the
  controls float over a shadow and hide after two seconds without moving the
  pointer; the timeline shows what has loaded and, on hover, the minute
  underneath; there are volume, speed, picture-in-picture and full screen. The
  keys are YouTube's: space or K, M, F, P, arrows (5 s), J and L (10 s) and the
  digits (tenths of the video). The browser remembers where each video stopped,
  and the start button offers to continue from there, because a colloquium lasts
  one or two hours. Without JavaScript the browser's controls remain. The
  thumbnail is the Educast page's image.
- **Invitation**: a notice that there is no video, with the link to the
  invitation.

The player's width adjusts so it fits whole under the title within the window's
height.

## Data

`data/recordings.json` is not edited by hand: it is generated outside this
repository. To correct a talk, open an issue. `fetched` keeps the date of the
copy.

`series` gives for each series its name, organiser (empty for those that are not
series), the word that counts its rows ("charlas" or "sesiones"), the number of
talks and of videos, and the first and last year. It is sorted by number of
videos. Each record has series, title, date, month, minutes, link, origin and
speakers. A record's id is unique ignoring case.

| Origin       | What enters                                                                               | Own fields                                    |
| ------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| `facebook`   | Videos from the faculty's page of 15 minutes or more, with a public copy on Drive.        | `post`: the Facebook post.                    |
| `youtube`    | Videos of 15 minutes or more from each channel that is a series; no classes or workshops. | `invitation`, if the video matches one.       |
| `educast`    | The PUCP video archive.                                                                   | `url` (mp4), `page` (Educast page), `poster`. |
| `drive`      | Recordings that a seminar site links on its recordings page.                              | `url` (Drive player), `page`.                 |
| `invitation` | Talks announced without video, with title and speaker.                                    | `invitation`: the link to the invitation.     |

Common rules:

- Two uploads of the same day with the same title and almost the same duration
  are one record. If the durations differ, they are parts and are numbered.
- A video that matches an invitation (same speaker, less than three months
  apart) takes its title and speakers, and links the invitation.
- An invitation does not enter if a video of the same series, less than three
  months apart, already has a speaker with the same first name and another word
  in common.
- `date` is the day the invitation states, if it does; otherwise the row shows
  the month. The month comes from the post's date or, if the copy has none, from
  the photo's number, as for defences (see [theses](tesis.md)).

## Speakers and people

A speaker carries `slug` when their name matches a single person in
`data/physicists.json` or, if none matches, a single one in `data/people.toml`:
the first name must be the same and each word of the name must be in the slug.
Talks name people in short form, and the registries use the full name. If there
are two matches in the same registry, the name appears without a link.

The profile lists that person's talks under "Charlas", with their series.

## Related content

A talk's page and a thesis page end with up to three "Charlas relacionadas",
three "Tesis relacionadas" and three "Artículos relacionados" from the
[journal](revista.md). An article has no page of its own, so its row links the
DOI. They come from `data/related.json`, which is not edited by hand either: it
is generated outside this repository. The multilingual-e5-large model turns each
talk (title and Educast summary), each thesis and each article (title) into a
vector. A pair enters when its similarity reaches 0.35. Below that cut, pairs no
longer share a subject. Faculty Council sessions do not enter, because they have
no subject.

`related.json` is generated after `recordings.json`, `theses.json` and
`journal.json`. If it names something that is no longer there, the page skips
it.
