const http = require("http");
const fs = require("fs");
const requests = require("requests");
require('dotenv').config(); // Load environment variables

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY || "your_default_api_key";

// Check if home.html exists to avoid errors
let homeFile;
try {
    homeFile = fs.readFileSync("home.html", "utf-8");
} catch (error) {
    console.error("Error: home.html file not found!");
    process.exit(1);
}

const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
    temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
    temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);
    return temperature;
};

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        requests(
            `https://api.openweathermap.org/data/2.5/weather?q=Gorakhpur&appid=${API_KEY}`
        )
            .on("data", (chunk) => {
                const objData = JSON.parse(chunk);
                const arrData = [objData];
                const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join("");
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(realTimeData);
            })
            .on("end", (err) => {
                if (err) console.log("Connection closed due to errors", err);
                res.end();
            });
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
    }
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
