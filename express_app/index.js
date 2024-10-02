const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('What are you doing here?')
})

app.get('/json', (req, res) => {
    res.json(data)
})

app.all('/*', (req, res) => {
    res.status(404).end()
})


data ={
    "array": [
      1,
      2,
      3
    ],
    "boolean": true,
    "color": "gold",
    "null": null,
    "number": 123,
    "object": {
      "a": "b",
      "c": "d"
    },
    "string": "Hello World"
  }






app.listen(3000, () => {
  console.log("I'm listening...")
})