const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const filesDir = path.join(__dirname, "files");


app.get("/", (req, res) => {
    fs.readdir(filesDir, (err, files) => {
        if (err) {
            console.error("Error reading files directory:", err);

            return res.status(500).send("Unable to load notes.");
        }

        res.render("index", {
            files: files
        });
    });
});


app.get("/file/:filename", (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(filesDir, filename);

    fs.readFile(filePath, "utf8", (err, fileContent) => {
        if (err) {
            console.error("Error reading note:", err);

            return res.status(404).send("Note not found.");
        }

        res.render("show", {
            files: fileContent
        });
    });
});

app.post("/create", (req, res) => {
    const { title, details } = req.body;

    if (!title || !details) {
        return res.status(400).send("Title and details are required.");
    }

    
    const safeTitle = title
        .trim()
        .replace(/[^a-zA-Z0-9-_]/g, "");

    if (!safeTitle) {
        return res.status(400).send("Invalid note title.");
    }

    const filename = `${safeTitle}.txt`;
    const filePath = path.join(filesDir, filename);

    fs.writeFile(filePath, details, "utf8", (err) => {
        if (err) {
            console.error("Error creating note:", err);

            return res.status(500).send(
                "Notes cannot be permanently saved on Vercel yet. Please connect a database or persistent storage."
            );
        }

        res.redirect("/");
    });
});


module.exports = app;