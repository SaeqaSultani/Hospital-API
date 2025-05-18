import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Set up the data.json file to be used as a database
const dataJSON = JSON.parse(fs.readFileSync('data.json'));

// This allows your frontend to communicate with the backend
app.use(cors({
  origin: [
    'http://localhost:3000',                       // for local development
    // 'https://your-frontend-url.vercel.app'         // deployed frontend URL
  ]
}));
// Middleware to serve static files and parse request bodies
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

//Set up the get route for showing the data in the browser with the ability to filter by type and search
app.get('/hospitals', (req, res) => {
    const { type, search } = req.query;

    let results = dataJSON;
    if (type) {
        const filteredHospitals = dataJSON.filter(hospital => hospital.type === type);
        res.json(filteredHospitals);
      }

      if (search) {
        const keyword = search.toLowerCase();
    
        results = results.filter(hospital =>
          Object.values(hospital).some(value =>
            typeof value === 'string' &&
            value.toLowerCase().includes(keyword)
          )
        );
      }
       
      res.json(results);
      
});

//Set up the get route for showing the data randomly in the browser
app.get('/hospitals/random', (req, res) => {
    const randomIndex = Math.floor(Math.random() * dataJSON.length);
    const randomHospital = dataJSON[randomIndex];
    res.json(randomHospital);
});

//Set up the post route for adding new data to the json file
app.post('/hospitals', (req, res) => {
    const newHospital = req.body;
    const newId = Date.now().toString();
    newHospital._id = newId;
    dataJSON.push(newHospital);
    fs.writeFileSync('data.json', JSON.stringify(dataJSON, null, 2));
    res.send("Hospital added successfully!");
});

//Set up the get route for showing the data by id in the browser
app.get('/hospitals/:id', (req, res) => {
    const hospitalId = req.params.id;
    const hospital = dataJSON.find(h => h._id === hospitalId);
    if (hospital) {
        res.json(hospital);
    } else {
        res.status(404).send("Hospital not found!");
    }
});

//Set up the put and route for updating 
app.put('/hospitals/:id', (req, res) => {
    const hospitalId = req.params.id;
    const hospitalIndex = dataJSON.findIndex(h => h._id === hospitalId);
    if (hospitalIndex !== -1) {
        dataJSON[hospitalIndex] = {...dataJSON[hospitalIndex], ...req.body};
        fs.writeFileSync('data.json', JSON.stringify(dataJSON, null, 2));
        res.send("Hospital updated successfully!");
    } else {
        res.status(404).send("Hospital not found!");
    }
});

//Set up the delete route for deleting data from the json file
app.delete('/hospitals/:id', (req, res) => {
    const hospitalId = req.params.id;
    const hospitalIndex = dataJSON.findIndex(h => h._id === hospitalId);
    if (hospitalIndex !== -1) {
        dataJSON.splice(hospitalIndex, 1);
        fs.writeFileSync('data.json', JSON.stringify(dataJSON, null, 2));
        res.send("Hospital deleted successfully!");
    } else {
        res.status(404).send("Hospital not found!");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});