// Server ke saath socket.io connection bana rahe hain
const socket = io();

console.log("hello-World"); // Console me greeting print kar raha hai (bas testing ke liye)

// Check kar rahe hain ki browser location support karta hai ya nahi
if (navigator.geolocation) {
    // watchPosition baar-baar location track karta hai (live tracking)
    navigator.geolocation.watchPosition(
        (position) => {
            // Latitude aur Longitude nikal rahe hain
            const { latitude, longitude } = position.coords;
            // Server ko location bhej rahe hain via socket
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.log(error); // Agar koi error aaye to console me dikhaye
        },
        {
            enableHighAccuracy: true, // GPS ko accurate rakhne ke liye
            timeout: 5000,            // Max 5 sec wait karega
            maximumAge: 0             // Purani location accept nahi karega
        }
    );
}

// Leaflet.js ka map bana rahe hain, default view [0,0] pe set kiya hai with zoom level 16
const map = L.map("map").setView([0, 0], 16);

// OpenStreetMap se tiles le rahe hain (map ke liye background)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Vishal-Kumar" // Apna naam attribution me likha hai 
}).addTo(map);

// Sabhi users ke markers store karne ke liye object
const markers = {};

// Jab server se kisi user ki location aaye
socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;

    // Map ka center update karte hain iss location pe
    map.setView([latitude, longitude]);

    // Agar pehle se marker hai user ke liye, usko update kar do
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]); 
    } else {
        // Agar nahi hai to naya marker map pe add karo
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Jab koi user disconnect ho jaye
socket.on("user-disconnected", (id) => {
    // Uske marker ko map se hata do
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
