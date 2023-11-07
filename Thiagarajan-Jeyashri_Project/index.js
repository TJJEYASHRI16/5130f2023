import express from "express";
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
const port = 3011;
const app = express();
app.use(express.static("public/"));

const exportPath = path.join(process.cwd(), 'export');

const exportAllPages = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Get all EJS template names
  const ejsTemplates = fs.readdirSync('./views').filter(file => file.endsWith('.ejs'));


  // Export each EJS template to static HTML
  for (const ejsTemplate of ejsTemplates) {
    const htmlTemplateName = ejsTemplate.replace('.ejs', '.html');

    try {
      await page.goto(`http://localhost:${port}/${ejsTemplate.replace('.ejs', '')}`);
      const content = await page.content();
      const outputPath = path.join(exportPath, htmlTemplateName);
      fs.writeFileSync(outputPath, content);
      console.log(`Exported ${htmlTemplateName}`);
    } catch (error) {
      console.error(`Error exporting ${htmlTemplateName}:`, error);
    }
  }

  await browser.close();
};

app.get('/export', async (req, res) => {
  await exportAllPages();
  res.send('HTML export complete.');
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});