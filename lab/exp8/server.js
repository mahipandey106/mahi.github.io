const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// --- MongoDB Configuration ---
// !!! IMPORTANT: REPLACE THIS WITH YOUR ACTUAL CONNECTION STRING !!!
const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(uri);

const DB_NAME = "ShoppingCenterDB";
const ITEMS_COLLECTION = "inventory";

// --- Middleware ---
app.use(cors()); // Allow frontend (running on a different port) to access this API
app.use(express.json()); // Enable the server to parse JSON bodies

let inventoryCollection;

// --- Database Connection Function ---
async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB connected successfully.");
        const db = client.db(DB_NAME);
        inventoryCollection = db.collection(ITEMS_COLLECTION);
    } catch (e) {
        console.error("Failed to connect to MongoDB:", e);
        process.exit(1);
    }
}

// --- API Endpoints (CRUD) ---

// READ: Get Stock Report (Task: Stock Report)
app.get('/api/items', async (req, res) => {
    try {
        const items = await inventoryCollection.find({}).toArray();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve stock report." });
    }
});

// CREATE: Add Item (Task: Add an item)
app.post('/api/items', async (req, res) => {
    const newItem = req.body;
    // Simple validation
    if (!newItem.name || !newItem.price || newItem.stock === undefined) {
        return res.status(400).json({ message: "Missing required fields: name, price, or stock." });
    }
    
    // Convert price and stock to correct types
    newItem.price = parseFloat(newItem.price);
    newItem.stock = parseInt(newItem.stock, 10);

    try {
        const result = await inventoryCollection.insertOne(newItem);
        res.status(201).json({ 
            message: "Item added successfully.", 
            item: { ...newItem, _id: result.insertedId }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to add item." });
    }
});

// UPDATE: Update Item Detail (Task: Update an item detail / Handle Sale)
app.put('/api/items/:id', async (req, res) => {
    const itemId = req.params.id;
    const updateData = req.body;

    // Use $set for general updates (price, name) and $inc for stock changes (sales/restock)
    const updateObject = {};
    if (updateData.name) updateObject.name = updateData.name;
    if (updateData.price) updateObject.price = parseFloat(updateData.price);

    const modifierObject = {};
    if (updateData.stockChange) {
        // stockChange can be positive (restock) or negative (sale)
        modifierObject.$inc = { stock: parseInt(updateData.stockChange, 10) };
    }
    if (Object.keys(updateObject).length > 0) {
        modifierObject.$set = updateObject;
    }
    
    if (Object.keys(modifierObject).length === 0) {
        return res.status(400).json({ message: "No valid update fields provided." });
    }

    try {
        const result = await inventoryCollection.updateOne(
            { _id: new ObjectId(itemId) },
            modifierObject
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Item not found." });
        }
        res.status(200).json({ message: "Item updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to update item." });
    }
});


// DELETE: Delete Item (Task: Delete an item)
app.delete('/api/items/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        const result = await inventoryCollection.deleteOne({ _id: new ObjectId(itemId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Item not found." });
        }
        res.status(200).json({ message: "Item deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete item." });
    }
});

// --- Start Server ---
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});