# A3 Workbench prototype

A single-page version of the A3 dashboard that needs no install, database or sign-in. It is for gathering early feedback from colleagues while the full app in [src](../../src) is built. It does not replace the app and shares no code with it.

You fill in the header and the seven problem-solving sections in a form. The page lays them out as a one-page A3 in NHS styling, with these charts:

- a run chart with the gap to standard shaded
- a goal bullet chart
- a 5 Whys chain and a fishbone
- an effect against effort matrix
- a Gantt chart
- a chart of predicted against actual results

Coach notes under each section flag the common mistakes listed in the A3 knowledge base. **Download PDF** saves the A3 as one landscape A3 page.

## Two ways to use it

| | Hosted copy on claude.ai | Opened from this folder |
| --- | --- | --- |
| Who can open it | People the owner shares it with | Anyone with the files |
| Where edits are saved | On the hosted page, for everyone who opens it | In that person's browser only |
| Comments | Comment button on each section | Not available |
| PDF | Download PDF | Download PDF |

Share the hosted copy with colleagues for live feedback. Use the files here to keep the prototype under version control, or to try it locally:

```sh
cd prototype/a3-workbench
python3 -m http.server 8000
```

Then open http://localhost:8000. The page loads `a3.json` from the same folder, so opening `index.html` straight from disk shows a blank A3 instead of the example.

## Files

- [index.html](index.html) is the whole prototype: styles, form, A3 layout and charts. The PDF export loads html2canvas 1.4.1 and jsPDF 2.5.1 from cdnjs when first used.
- [a3.json](a3.json) holds the starting A3s. It contains one synthetic example, "Late lab results delay ER discharges". Keep real or sensitive A3s out of this file.

## Keeping the two copies in step

The hosted copy is published from the body of `index.html`, which is everything between `<body>` and `</body>`. When you change the prototype, change it here first, then republish the hosted copy from the same content. Edits made on the hosted page live only there and are not copied back into this repository.
