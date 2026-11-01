// Filters a page of grouped rows by the words typed: a row stays when its text
// holds every word, ignoring case and accents. A group with no row left hides,
// with its jump link, and its count recounts what stays.
const root = document.querySelector<HTMLElement>(".filtered");
const input = root?.querySelector<HTMLInputElement>(".list-filter");

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

if (root && input) {
  const groups = [...root.querySelectorAll<HTMLElement>(".section-group")].map(
    (section) => ({
      section,
      count: section.querySelector<HTMLElement>(".count"),
      link: root.querySelector<HTMLElement>(
        `.list-jump a[href="#${section.id}"]`,
      ),
      rows: [...section.querySelectorAll<HTMLElement>(".rows > li")].map(
        (row) => ({ row, text: fold(row.textContent ?? "") }),
      ),
    }),
  );
  const empty = root.querySelector<HTMLElement>(".list-empty");

  function apply(): void {
    const words = fold(input!.value).split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const group of groups) {
      let n = 0;
      for (const { row, text } of group.rows) {
        const match = words.every((word) => text.includes(word));
        row.hidden = !match;
        if (match) n++;
      }
      group.section.hidden = n === 0;
      if (group.link) group.link.hidden = n === 0;
      if (group.count) {
        const { singular, plural } = group.count.dataset;
        group.count.textContent = `${n} ${n === 1 ? singular : plural}`;
      }
      shown += n;
    }
    if (empty) empty.hidden = shown > 0;
  }

  input.hidden = false;
  input.addEventListener("input", apply);
}
