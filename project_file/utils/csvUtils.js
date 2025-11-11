const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvFilePath = './users.csv';

const readUsers = () => {
    return new Promise((resolve, reject) => {
        const users = [];
        if (!fs.existsSync(csvFilePath)) return resolve(users);

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => users.push(data))
            .on('end', () => resolve(users))
            .on('error', (err) => reject(err));
    });
};

const addUser = async (user) => {
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            {id: 'id', title: 'id'},
            {id: 'email', title: 'email'},
            {id: 'password', title: 'password'}
        ],
        append: fs.existsSync(csvFilePath)
    });
    await csvWriter.writeRecords([user]);
};

module.exports = { readUsers, addUser };
