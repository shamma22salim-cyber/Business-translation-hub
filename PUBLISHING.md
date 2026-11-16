# Publishing the website on GitHub Pages

The site is plain HTML, CSS and JavaScript. It needs no server code, no paid service and no student accounts. Free GitHub Pages hosting is enough.

## Files

- index.html, style.css, app.js: the page. Normally not edited.
- glossary.json: all terminology, review items and labels. This is the file instructors edit.
- GUIDE.md: how to add terms. PUBLISHING.md: this file.
- .nojekyll: an empty file that tells GitHub Pages to serve the files as they are. Keep it.

## Publish (no software needed)

1. Sign in to GitHub. Create a **new repository**, for example `business-glossary`. Choose **Public**. Free Pages hosting generally requires a public repository; check GitHub's current plan rules.
2. In the repository, choose **Add file**, then **Upload files**. Upload every file from the zip, including `.nojekyll`. If your device hides files that start with a dot, add `.nojekyll` afterwards with **Add file**, then **Create new file**, and name it `.nojekyll`.
3. Select **Commit changes**.
4. Open the repository **Settings**, then **Pages**. Under the build and deployment source, choose **Deploy from a branch**. Select branch **main** and folder **/ (root)**, then **Save**.
5. Wait a minute or two. The address appears on the same page. It normally looks like `https://YOUR-USERNAME.github.io/business-glossary/`.
6. Open the address and check that the terms load and the search works.

GitHub may move menu items over time. If a menu differs, see GitHub's own Pages documentation.

## Update later

Edit glossary.json in the repository (see GUIDE.md) and commit the change. The site updates after a minute or two. If you still see old content, refresh the page twice.

## Preview on your own computer

Opening index.html by double-click will **not** work, because browsers block a page from reading glossary.json that way. Use a small local server instead. With Python installed, open a terminal in the site folder and run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Troubleshooting

- **"Could not load glossary.json":** the file is missing, in a different folder, or the page was opened by double-click.
- **"glossary.json is not valid JSON":** a comma, bracket or quote is wrong. Look near the last entry you edited.
- **404 page:** Pages is not switched on yet, or the files are inside a subfolder. index.html must be at the top level of the repository.
- **Blank list, no message:** JavaScript is turned off or app.js was not uploaded.
