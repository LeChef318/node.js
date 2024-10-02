const https = require('https');

const url = "https://data.sbb.ch/api/explore/v2.1/catalog/datasets/rail-traffic-information/records?select=title%2C%20description%2C%20published&order_by=published%20desc&limit=1"
let title = ""

async function getTrafficInfo(url) {
    https.get(url,(ans) => {
        let json
        ans.on("data", (data) => {
            json = data;
        });

        ans.on("end", () => {
                json = JSON.parse(json);
                result = json['results'][0]
                if (title != result['title']) {
                    console.log('\x1b[31m', result['title'], '\x1b[0m');
                    console.log('\x1b[33m', result['published'], '\x1b[0m');
                    console.log("");
                    console.log('\x1b[37m', result['description'], '\x1b[0m');
                    console.log("");
                    title = result['title'];
                }
                else {
                    console.log("nothing new...")
                }
                
        });

    }).on("error", (error) => {
        console.error(error.message);
    });
};

getTrafficInfo(url);
setInterval(getTrafficInfo, 5 * 60 * 1000, url)