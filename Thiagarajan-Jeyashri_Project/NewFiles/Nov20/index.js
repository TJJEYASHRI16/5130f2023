import express from "express";
// import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;
import bodyParser from 'body-parser';

const port = 3011;
const app = express();
app.use(express.static("public/"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const exportPath = path.join(process.cwd(), 'export');

//database
const db = new Client({
  user: "postgres",
  host: "127.0.0.1", // or 'localhost'
  database: "consistify",
  password: "rootpassword",
  port: 5432
});

db.connect();


// const exportAllPages = async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Get all EJS template names
//   const ejsTemplates = fs.readdirSync('./views').filter(file => file.endsWith('.ejs'));


//   // Export each EJS template to static HTML
//   for (const ejsTemplate of ejsTemplates) {
//     const htmlTemplateName = ejsTemplate.replace('.ejs', '.html');

//     try {
//       await page.goto(`http://localhost:${port}/${ejsTemplate.replace('.ejs', '')}`);
//       const content = await page.content();
//       const outputPath = path.join(exportPath, htmlTemplateName);
//       fs.writeFileSync(outputPath, content);
//       console.log(`Exported ${htmlTemplateName}`);
//     } catch (error) {
//       console.error(`Error exporting ${htmlTemplateName}:`, error);
//     }
//   }

//   await browser.close();
// };

// app.get('/export', async (req, res) => {
//   await exportAllPages();
//   res.send('HTML export complete.');
// });

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.get("/newuser", (req, res) => {
  res.render("newuser.ejs");
});


//new user
app.post("/addUser", async (req,res)=>{
  const { firstName, lastName, email, category, age } = req.body;
  console.log(req.body);
  try {
    // Retrieve cat_id from categories table based on the selected category
    console.log("Before database query");
    const catresult = await db.query("SELECT cat_id FROM categories WHERE name = $1", [category]);
    console.log("after database query");
    const catId = catresult.rows[0]?.cat_id; // Retrieve the first row's cat_id
    console.log(catId);
    if (!catId) {
      console.error("Category not found:", category);
      return res.status(400).send("Category not found");
    }
    const result = await db.query(
      "INSERT INTO useracc (first_name, last_name, email, category, age) VALUES ($1, $2, $3, $4, $5)",
      [firstName, lastName, email, catId, age]
    );

    console.log("User added successfully:");
    res.redirect(`/homepage?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&category=${encodeURIComponent(category)}&age=${encodeURIComponent(age)}`);

 // Redirect to the home page or any other page after successful submission
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Internal Server Error");
  }
})



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/homepage", (req, res) => {
  // Access query parameters from the URL
  const { firstName, lastName, email, category, age } = req.query;

  // Render the homepage.ejs template and pass the user details as locals
  res.render("homepage.ejs", { firstName, lastName, email, category, age });
});

app.get("/calendar", (req, res) => {
  // Access query parameters from the URL
  
  // console.log(req.query);
  const activityName  = req.query.activity;
  // Render the homepage.ejs template and pass the user details as locals
  res.render("calendar.ejs", {activityName});
});


app.get("/existinguser",async (req, res) => {
  res.render("existinguser.ejs");
});

app.post("/checkUser",async (req, res) => {
  const { firstName, lastName, email} = req.body;
  try {
    // Check if the user exists in the useracc table
    const result = await db.query(
      "SELECT * FROM useracc WHERE first_name = $1 AND last_name = $2 AND email = $3",
      [firstName, lastName, email]
    );
      console.log(result);
      if (result.rows.length > 0) {
        const user = result.rows[0]; // Assuming the first row contains user details
        const { category, age } = user;
  
        return res.redirect(`/homepage?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&category=${encodeURIComponent(category)}&age=${encodeURIComponent(age)}`);
      }
  
      // If user does not exist, handle accordingly (e.g., redirect to a different page)
      res.send("User not found"); // You can customize this response
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).send("Internal Server Error");
    }
  });