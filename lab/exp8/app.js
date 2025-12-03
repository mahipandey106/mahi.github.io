// Task 1: Create a connection to MongoDB
const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Database and Collection names
const DB_NAME = "ShoppingCenterDB";
const STUDENTS_COLLECTION = "students";
const ITEMS_COLLECTION = "items";

/**
 * Task 2 & 3: Application for students details and search
 */
async function runStudentApp() {
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const students = db.collection(STUDENTS_COLLECTION);
        console.log("Connected successfully to MongoDB.");

        // --- Task 2: Store Student Details (C - Create) ---
        console.log("\n--- Task 2: Storing Student Details ---");
        const studentDetails = [
            { name: "Alice Smith", rollNo: "CS001", dept: "CS", score: 85 },
            { name: "Bob Johnson", rollNo: "EC005", dept: "EC", score: 92 },
            { name: "Charlie Brown", rollNo: "CS010", dept: "CS", score: 78 }
        ];

        // Inserting the students (using insertMany for efficiency)
        const insertResult = await students.insertMany(studentDetails);
        console.log(`Inserted ${insertResult.insertedCount} student documents.`);
        
        // --- Task 3: Search Students based on criteria (R - Read/Search) ---
        console.log("\n--- Task 3: Searching Students (Dept: CS, Score > 80) ---");
        
        const searchCriteria = {
            dept: "CS",
            score: { $gt: 80 } // Find documents where score is Greater Than 80
        };

        const matchingStudents = await students.find(searchCriteria).toArray();

        if (matchingStudents.length > 0) {
            console.log("Found students matching criteria:");
            matchingStudents.forEach(s => console.log(`- ${s.name} (${s.rollNo}), Score: ${s.score}`));
        } else {
            console.log("No students found matching the search criteria.");
        }

    } catch (e) {
        console.error("An error occurred in the Student App:", e);
    } 
    // Do not close client here, let the main function handle it
}

/**
 * Task 4: Shopping Center Inventory Application (CRUD)
 */
async function runShoppingCenterApp() {
    try {
        const db = client.db(DB_NAME);
        const items = db.collection(ITEMS_COLLECTION);
        console.log("\n--- Task 4: Shopping Center Inventory App ---");
        
        // Ensure collection is empty for fresh data
        await items.deleteMany({});
        
        // 1. Add an Item (C - Create)
        console.log("1. Adding an Item (Monitor)...");
        await items.insertOne({ name: "Monitor", price: 15000, stock: 50, category: "Electronics" });

        // 2. Update an Item Detail (U - Update)
        console.log("2. Updating Monitor price and stock...");
        await items.updateOne(
            { name: "Monitor" },
            { $set: { price: 14500, stock: 45 } }
        );

        // 3. Stock Report (R - Read All)
        console.log("3. Generating Stock Report:");
        const stockReport = await items.find({}).toArray();
        stockReport.forEach(item => console.log(`- ${item.name}: Price ${item.price}, Stock ${item.stock}`));
        
        // 4. Sale/Decrease Stock (Implicit Update)
        console.log("4. Simulating a Sale (selling 5 Monitors)...");
        await items.updateOne(
            { name: "Monitor" },
            { $inc: { stock: -5 } } // Use $inc to decrement stock
        );
        
        // Verify stock
        const updatedMonitor = await items.findOne({ name: "Monitor" });
        console.log(`   New Monitor Stock: ${updatedMonitor.stock}`);

        // 5. Delete an Item (D - Delete)
        console.log("5. Deleting an Item (if one existed)...");
        const deleteResult = await items.deleteOne({ name: "Old Shelf" });
        if (deleteResult.deletedCount > 0) {
             console.log("   Successfully deleted item.");
        } else {
             console.log("   Item to delete was not found, nothing deleted.");
        }

    } catch (e) {
        console.error("An error occurred in the Shopping Center App:", e);
    }
}

// Main execution function
async function main() {
    try {
        await runStudentApp();
        await runShoppingCenterApp();
    } catch (e) {
        console.error("Application failed:", e);
    } finally {
        await client.close();
        console.log("\nMongoDB connection closed.");
    }
}

main();