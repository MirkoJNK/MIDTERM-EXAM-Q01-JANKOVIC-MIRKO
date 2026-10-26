const express = require("express");

const fs = require("fs");

const path = require("path");

const app = express();

const file = path.join(__dirname, "data.json");



app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});



function getVisitors() {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}


function saveVisitors(visitors) {
    fs.writeFileSync(file, JSON.stringify(visitors, null, 2));
}

app.get("/api/visitors", (req, res) => {
    res.json(getVisitors());
});


app.get("/api/visitors/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid ID" });
    }

    const visitor = getVisitors().find(v => v.id === id);

    if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
});




app.post("/api/visitors", (req, res) => {
    const { visitor_name, purpose, person_to_visit, date } = req.body || {};

    if (![visitor_name, purpose, person_to_visit, date].every(
        value => typeof value === "string" && value.trim() !== ""
    )) {
        return res.status(400).json({ message: "All fields are required" });
    }


    
    const visitors = getVisitors();

    const id = visitors.reduce((max, v) => Math.max(max, v.id), 0) + 1;

    const visitor = {
        id,
        visitor_name: visitor_name.trim(),
        purpose: purpose.trim(),
        person_to_visit: person_to_visit.trim(),
        date: date.trim(),
        status: "Inside"
    };


    visitors.push(visitor);
    saveVisitors(visitors);

    res.status(201).json(visitor);
});



app.delete("/api/visitors/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid ID" });
    }

    const visitors = getVisitors();

    if (!visitors.some(v => v.id === id)) {
        return res.status(404).json({ message: "Visitor not found" });
    }

    saveVisitors(visitors.filter(v => v.id !== id));

    res.json({ message: "Visitor deleted successfully" });

});



app.use((err, req, res, next) => {
    const status = err.status >= 400 && err.status < 500 ? err.status : 500;

    res.status(status).json({
        message: status < 500 ? "Invalid request" : "Server error"
    });

});


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
