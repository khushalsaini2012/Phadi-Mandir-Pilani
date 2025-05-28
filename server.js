// Dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this line

// Initialize Express and SQLite
const app = express();
const port = 8001;
const db = new sqlite3.Database('temple_db.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDb();
    }
});

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); // Add this line to enable CORS for all routes

// Create tables if they don't exist and populate predefined_responses if empty
function initializeDb() {
    db.serialize(() => {
        // Create tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS predefined_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL UNIQUE,
            response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Check if predefined_responses is empty before inserting
        db.get('SELECT COUNT(*) as count FROM predefined_responses', (err, row) => {
            if (err) {
                console.error('Error checking predefined_responses count:', err.message);
                return;
            }

            if (row.count === 0) {
                console.log('Populating predefined_responses table...');
                // Initialize predefined responses
                const responses = [
                    ['hello', 'Namaste! How may I assist you with information about our temple?'],
                    ['hi', 'Namaste! How may I assist you with information about our temple?'],
                    ['namaste', 'Namaste! How may I assist you with information about our temple?'],
                    ['location', 'Our temple is located at [Temple Address]. We are situated in a peaceful environment with ample parking facilities.'],
                    ['timing', 'The temple is open from 6:00 AM to 8:30 PM daily. Aarti timings are: Morning 7:00 AM, Evening 7:00 PM.'],
                    ['parking', 'We have a spacious parking area that can accommodate up to 100 vehicles. Parking is free for devotees.'],
                    ['prasad', 'Prasad is distributed after every aarti. Special prasad is available on festivals and weekends.'],
                    ['contact', 'You can reach us at [Phone Number] or email us at [Email]. Our office hours are 9:00 AM to 6:00 PM.'],
                    ['festival', 'Please check our temple calendar for upcoming festivals and events. We celebrate all major Hindu festivals with great devotion.'],
                    ['donation', 'Donations can be made at the temple office or online through our website. All donations are tax-deductible.'],
                    ['dress', 'We recommend wearing traditional and modest attire when visiting the temple.'],
                    ['photography', 'Photography is allowed in the temple premises except in the main sanctum. Please be mindful of other devotees.'],
                    ['rules', 'Please maintain silence, remove shoes before entering, and avoid bringing food items inside the temple premises.']
                ];

                const stmt = db.prepare('INSERT INTO predefined_responses (keyword, response) VALUES (?, ?)');
                responses.forEach(([keyword, response]) => {
                    stmt.run(keyword.toLowerCase(), response, (err) => {
                        if (err) {
                            console.error('Error inserting predefined response:', err.message);
                        }
                    });
                });
                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing statement:', err.message);
                    } else {
                        console.log('Predefined responses populated.');
                    }
                });
            } else {
                console.log('Predefined responses table already populated.');
            }
        });
    });
}

// API endpoint to get predefined responses (for potential admin panel or debugging)
app.get('/api/predefined-responses', (req, res) => {
    db.all('SELECT keyword, response FROM predefined_responses', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Message handling endpoint
app.post('/api/messages', (req, res) => {
    console.log('Received request for /api/messages');
    const { message } = req.body;
    console.log('User message received:', message);

    if (!message) {
        console.error('No message received in request body');
        return res.status(400).json({ error: 'Message is required' });
    }
    const lowerMessage = message.toLowerCase().trim();
    console.log('Processed lowerMessage:', lowerMessage);

    // Check predefined responses (including greetings)
    console.log('Attempting exact match for keyword:', lowerMessage);
    db.get('SELECT response FROM predefined_responses WHERE keyword = ?',
        [lowerMessage],
        (err, row) => {
            if (err) {
                console.error('Error during exact match query:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                console.log('Exact match found. Response:', row.response);
                return saveAndReturnResponse(message, row.response, res);
            }

            console.log('No exact match found. Attempting partial match for:', lowerMessage);
            // Try partial matches
            db.get(
                'SELECT response FROM predefined_responses WHERE ? LIKE "%" || keyword || "%" ORDER BY LENGTH(keyword) DESC LIMIT 1',
                [lowerMessage],
                (err, partialRow) => {
                    if (err) {
                        console.error('Error during partial match query:', err.message);
                        return res.status(500).json({ error: err.message });
                    }

                    const responseText = partialRow
                        ? partialRow.response
                        : "I'm sorry, I don't have information about that. Please contact the temple office for assistance.";
                    
                    if (partialRow) {
                        console.log('Partial match found. Response:', responseText);
                    } else {
                        console.log('No partial match found. Using default response.');
                    }
                    saveAndReturnResponse(message, responseText, res);
                }
            );
        }
    );
});

// API endpoint to get events
app.get('/api/events', (req, res) => {
    // In a real application, you would fetch events from the database
    const sampleEvents = [
        {
            id: 1,
            title: 'Special Puja Ceremony',
            event_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days from now
            description: 'Join us for a special puja ceremony for peace and prosperity.'
        },
        {
            id: 2,
            title: 'Community Feast (Bhandara)',
            event_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 14 days from now
            description: 'A community feast will be organized. All are welcome.'
        }
    ];
    res.json(sampleEvents);
});

// Helper function
function saveAndReturnResponse(userMessage, botResponse, res) { // Renamed parameters for clarity
    console.log(`Saving and returning response. User: "${userMessage}", Bot: "${botResponse}"`);
    db.run('INSERT INTO messages (user_message, response) VALUES (?, ?)',
        [userMessage, botResponse],
        function(err) {
            if (err) {
                console.error('Error saving message to DB:', err.message);
                // Still attempt to send response to user even if DB save fails
            } else {
                console.log('Message saved to DB. Insert ID:', this.lastID);
            }
            res.json({ response: botResponse });
        }
    );
}

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Error handling
process.on('SIGINT', () => {
    console.log('SIGINT signal received. Closing database connection...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database on SIGINT:', err.message);
        } else {
            console.log('Database connection closed successfully via SIGINT handler.');
        }
        console.log('Exiting process now via SIGINT handler.');
        process.exit(0);
    });
});

