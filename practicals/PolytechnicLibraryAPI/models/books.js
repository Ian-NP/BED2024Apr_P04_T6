import sql from "mssql";
import dbConfig from "../dbConfig";

class Book {
    constructor(book_id, title, author, availability) {
        this.book_id = book_id;
        this.title = title;
        this.author = author;
        this.availability = availability;
    }

    static async getAllBooks() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Books`;
    
        const request = connection.request();
        const result = await request.query(sqlQuery);
    
        connection.close();

        const books = result.recordset.map(
            (row) => new Book(row.id, row.title, row.author, row.availability)
        )
    
        return books;
    }

    static async getBookById(book_id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Books WHERE book_id = @book_id`; // Parameterized query

        const request = connection.request();
        request.input("book_id", book_id);
        const result = await request.query(sqlQuery);
        
        connection.close();

        return result.recordset[0]
            ? new Book( // If book found
                result.recordset[0].book_id,
                result.recordset[0].title,
                result.recordset[0].author,
                result.recordset[0].availability
            ) 
            : null; // Handle book not found
    }

    static async createBook(newBookData){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO Books (title, author, availability) VALUES (@title, @author, @availability); SELECT SCOPE_IDENTITY() AS book_id`;
        
        const request = connection.request();
        request.input("title", newBookData.title);
        request.input("author", newBookData.author);
        request.input("availability", newBookData.availability);

        const result = await request.query(sqlQuery);

        connection.close();
        const book_id = result.recordset[0].book_id;

        // Retrieve the newly created book using its ID
        return this.getBookById(book_id);
    }

    static async updateBook(book_id, newAvailability) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
        
            // Construct the complete SQL query
            const sqlQuery = `UPDATE Books SET availability = @availability WHERE book_id = @book_id`; 
        
            const request = connection.request();
            request.input("book_id", book_id);
            request.input("availability", newAvailability);
        
            await request.query(sqlQuery);
        
            return await this.getBookById(book_id); // returning the updated book data
        } catch (error) {
            throw new Error(`Failed to update book: ${error.message}`);
        } finally {
            if (connection) {
                connection.close();
            }
        }
    }

    static async deleteBook(book_id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Books WHERE book_id = @book_id`;

        const request = connection.request();
        request.input("book_id", book_id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; // Indicate success based on the affected rows
    }

    static async searchBooks(searchTerm){
        const connection = await sql.connect(dbConfig);

        try{
            const query = `
            SELECT *
            FROM Books
            WHERE title LIKE '%${searchTerm}%'
            OR author LIKE '%${searchTerm}%'
            `;

            const result = await connection.request().query(query);
            return result.recordset.map(
                (row) => new Book(row.book_id, row.title, row.author, row.availability)
            ); // Convert rows to Book objects
        } catch(error){
            throw new Error("Error searching books");
        } finally{
            await connection.close();
        }
    }
}

module.exports = Book;
