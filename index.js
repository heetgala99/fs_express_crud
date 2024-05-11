// creating http server - express

const express = require("express");
const _ = require("lodash");
const fs = require("fs").promises;
const bodyParser = require('body-parser');

const app = express();

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Path to the JSON file
const filePath = 'data.json';

// read file and get the data
const readFile = async () => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        // Parse the JSON data into a JavaScript object
        let jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err; // Re-throw the error to be caught by the caller
    }
};

// write or make changes in the file
const writeFile = async (jsonData = []) => {
    // Convert the modified JavaScript object back to JSON format
    const jsonContent = JSON.stringify(jsonData, null, 2); // 2-space indentation for readability

    // Write the modified data back to the JSON file
    fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Data added to the JSON file successfully.');
    });
};

// update an post the updated data
const updateData = (mode = 'post', actualData = [], newData = {}, index = 0) => {
    switch (mode) {
        case 'post':
            return [
                ...actualData,
                newData
            ];
        case 'put':
            actualData[index] = newData;
            return actualData;
        case 'delete':
            return _.remove(actualData, newData);
    }
};

// Define routes

// get kidney data
app.get('/', async (req, res) => {
    const data = await readFile();
    res.status(200).json({
        message: "success",
        count: _.size(data),
        data: data
    });
});

// add a new kidney
app.post('/add', async (req, res) => {
    const data = await readFile();
    const newData = updateData('post', data, req.body);
    await writeFile(newData);

    res.status(200).json({
        message: "successfully added new data",
        count: _.size(newData),
        data: newData
    });
});

// update a new kidney
app.put('/update', async (req, res) => {
    const data = await readFile();
    const name = req.query.name;
    const organ = req.query.organ;
    const findIndex = _.findIndex(data, d => (d.name === name && d.organ === organ));
    const newData = updateData('put', data, req.body, findIndex);
    await writeFile(newData);

    res.status(200).json({
        message: "successfully updated new data",
        count: _.size(newData),
        data: newData
    });
});

// delete a new kidney
app.delete('/delete', async (req, res) => {
    const data = await readFile();
    const newData = updateData('delete', data, req.body);
    await writeFile(newData);

    res.status(200).json({
        message: "successfully deleted new data",
        count: _.size(newData),
        data: newData
    });
});

const PORT = 6001;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
