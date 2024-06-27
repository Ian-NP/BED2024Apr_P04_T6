import Book from "../models/books";

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.getAllBooks();
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving books");
    }
};

const getBookById = async (req, res) => {
    const bookId = parseInt(req.params.id);
    try {
        const book = await Book.getBookById(bookId);
        if (!book) {
            return res.status(404).send("Book not found");
        }
        return res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving book");
    }
};

const createBook = async (req, res) => {
    const newBook = req.body;
    try {
        const createdBook = await Book.createBook(newBook);
        res.status(201).json(createdBook);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating book");
    }
};

const updateBook = async (req, res) => {
    const bookId = parseInt(req.params.id);
    const newBookData = req.body;

    try {
        const updatedBook = await Book.updateBook(bookId, newBookData);
        if (!updatedBook) {
            return res.status(404).send("Book not found");
        }
        res.json(updatedBook);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating book");
    }
};

const deleteBook = async (req, res) => {
    const bookId = parseInt(req.params.id);

    try {
        const deleteBook = await Book.deleteBook(bookId);
        if (!deleteBook) {
            return res.status(404).send("Book not found");
        }
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting book");
    }
};

const searchBooks = async (req, res) => {
    const searchTerm = req.query.searchTerm; // Extract search term from query params

    try {
        const books = await Book.searchBooks(searchTerm);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error searching books" });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
};
