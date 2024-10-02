import { createServer } from 'node:http';
import { readFile } from 'fs/promises';
import { createServer} from 'node:net'

const hostname = '127.0.0.1';
const port = 3000;
let jsonCache;

const loadJson = async () => {
  if (!jsonCache) {
    try {
      jsonCache = JSON.parse(await readFile("generated.json", "utf-8"))
    } catch (e) {
      console.log(`Could not read JSON: ${e.message}`);
    }
  }

  return jsonCache;
}

const srv = net.createServer()

const listenerFunction = async (req, res) => {
  try {
    const jsonData = await loadJson();
    if (!jsonData) {
      res.statusCode = 404;
      res.write('file not found');
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(jsonData));
    }
  } catch (e) {
    res.statusCode = 500;
    res.write('internal server error');
    console.log(e);
  }

  res.end();
};

const server = createServer(listenerFunction);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
