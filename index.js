const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Path to the data file
const dataFilePath = path.join(__dirname, 'data.json');

// Utility function to read the data from the file
const readDataFromFile = () => {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
};

// Utility function to write data to the file
const writeDataToFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// **Create a New Book (C)**
app.post('/books', (req, res) => {
    const { book_id, title, author, genre, year, copies } = req.body;

    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: 'All book fields are required.' });
    }

    const books = readDataFromFile();

    // Check if book already exists
    if (books.some(book => book.book_id === book_id)) {
        return res.status(400).json({ error: 'Book with this ID already exists.' });
    }

    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);
    writeDataToFile(books);

    res.status(201).json(newBook);
});

// **Retrieve All Books (R)**
app.get('/books', (req, res) => {
    const books = readDataFromFile();
    if (books.length === 0) {
        return res.status(404).json({ message: 'No books found.' });
    }
    res.status(200).json(books);
});

// **Retrieve a Specific Book by ID (R)**
app.get('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const books = readDataFromFile();
    const book = books.find(b => b.book_id === bookId);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    res.status(200).json(book);
});

// **Update Book Information (U)**
app.put('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const { title, author, genre, year, copies } = req.body;

    const books = readDataFromFile();
    const book = books.find(b => b.book_id === bookId);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    // Update book details with the provided fields
    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.year = year || book.year;
    book.copies = copies || book.copies;

    writeDataToFile(books);

    res.status(200).json(book);
});

// **Delete a Book (D)**
app.delete('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const books = readDataFromFile();
    const bookIndex = books.findIndex(b => b.book_id === bookId);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    books.splice(bookIndex, 1);
    writeDataToFile(books);

    res.status(200).json({ message: 'Book deleted successfully.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Library Management API is running on port ${PORT}`);
});