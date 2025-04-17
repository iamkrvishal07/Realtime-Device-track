// Express, Path, HTTP aur Socket.io ko import kar rahe hain
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

// Express app banaya
const app = express();
const PORT = 3000; // Port number jahan server chalega

// HTTP server banaya aur uske saath Socket.io integrate kiya
const server = http.createServer(app);
const io = socketio(server);

// EJS ko view engine set kiya (HTML jaisa template engine)
app.set("view engine", "ejs");

// Public folder ko static files ke liye set kiya (CSS, JS yahin se serve honge)
app.use(express.static(path.join(__dirname, "public")));

// Jab bhi koi client Socket.io se connect karega
io.on("connection", function(socket) {
    console.log("user is connected"); // Console me message dikhayega jab user connect kare

    // Jab client apni location bhejta hai
    socket.on("send-location", (data) => {
        // Check kar rahe hain ki latitude aur longitude hai ya nahi
        if (data.latitude && data.longitude) {
            // Agar data sahi hai to sabhi users ko location broadcast kar rahe hain
            io.emit("recieve-location", { id: socket.id, ...data });
        } else {
            // Agar data galat hai to error console me print karenge
            console.error("Invalid data received", data);
        }
    });

    // Jab user disconnect kare to sabko batana hai
    socket.on("disconnect", () => {
        // Sabhi connected clients ko batana ki yeh user disconnect ho gaya
        io.emit("user-disconnected", socket.id);
    });
});

// Root route "/" pe jab koi aaye to `index.ejs` render karo
app.get("/", function(req, res) {
    res.render("index");
});

// Server ko start karo aur console me link print karo
server.listen(PORT, function() {
    console.log("Server is running on http://localhost:" + PORT);
});
