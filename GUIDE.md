# Guide: adding new terminology

All terms live in one file: **glossary.json**. You do not need to edit the HTML, CSS or JavaScript.

## 1. What an entry looks like

```json
{
 "topic": "Banking and finance",
 "en": "interest rate",
 "ar": "سعر الفائدة / معدل الفائدة",
 "status": "C",
 "flagged": true,
 "source": "BEA, BAE",
 "note": "BEA gives سعر الفائدة. BAE gives معدل الفائدة. Both kept; instructor to choose.",
 "context": { "type": "definition", "text": "short quotation from the course material" }
}
```

| Field | Required | Meaning |
|---|---|---|
| topic | yes | Must match a name in the `topics` list at the top of the file, spelled exactly the same. |
| en | yes | The English term, as written in the course material. |
| ar | yes | The Arabic term, as written in the course material. Separate options with ` / `. |
| status | yes | `C`, `S` or `AI` (see section 3). |
| flagged | yes | `true` if the translation needs review, otherwise `false` (no quotes). |
| source | yes | Source codes and slide or page, for example `EM s3` or `BEA, MSX`. |
| note | no | Review note. Use `""` if none. Required in practice when `flagged` is `true`. |
| context | no | A definition or example quoted from the course text, or `null`. |

## 2. How to add a term

1. Search the glossary first. If the term exists, add the new source to its `source` field instead of making a duplicate.
2. Open **glossary.json** (on GitHub: open the file, then select the pencil icon).
3. Copy an existing entry and paste it right after the last entry of the same topic.
4. Edit the fields.
5. Check the commas: one comma between entries, **no comma after the last entry** in the list.
6. Use plain straight quotes `"` around every field. Curly quotes break the file. Inside a text, curly quotes “ ” and ’ are fine.
7. Save (on GitHub: select **Commit changes**). The site updates after a minute or two.

If the file has a mistake, the website shows a message instead of the glossary. If an entry is incomplete or uses an unknown topic or status, a red box at the top of the Glossary tab lists the problems.

## 3. Status labels

- **C**: the Arabic and English are paired explicitly in a course file.
- **S**: the Arabic appears in a course text (usually a parallel version) but is not set out as a glossary pair.
- **AI**: AI suggestion. The materials give no Arabic for this term.

No entry is marked instructor-approved, because no file says that any translation is approved. To add a new label (for example, an approved label), add it to `meta.statusLabels` and `meta.statusShort` in glossary.json. In style.css, add one line such as `.b.APPROVED{color:var(--c)}` using the same name.

## 4. Rules for accuracy

- Do not change the wording of a course term. Copy it exactly, including source typos. Mention a typo in `note` or in the Review section.
- `context` is for text **quoted from the course materials** only. Use `"type": "definition"` for a definition and `"example"` for an example sentence. If the materials have neither, use `"context": null`.
- Where the Arabic and English course texts differ, do not correct either one. Add an item under `review` and flag the term.

## 5. Other additions

- **New topic:** add its name to the `topics` list, then use the same spelling in each entry.
- **New source file:** add a short code and the file name to `meta.sources`, for example `"MK2": "Marketing 2.docx"`. Use the code in `source`.
- **New discrepancy:** add an item to an existing group in `review`, or add a new group with a `title` and a list of `items`.
- **Page title, About text:** edit `meta.title`, `meta.subtitle` and `meta.about`.
