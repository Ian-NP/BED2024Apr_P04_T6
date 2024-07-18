const Book = require("../models/books");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("Book.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("should retrieve all books from the database", async () => {
    const mockBooks = [
      {
        id: 1,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        availability: "Y",
      },
      {
        id: 2,
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        availability: "N",
      },
    ];

    // Mock SQL connection, request, and query
    const mockRequest = {
      query: jest.fn().mockResolvedValue({ recordset: mockBooks }), // Mock query to return mockBooks
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest), // Mock connection request to return mockRequest
      close: jest.fn().mockResolvedValue(undefined), // Mock close method
    };

    sql.connect.mockResolvedValue(mockConnection); // Mock SQL connection

    const books = await Book.getAllBooks(); // Call the method

    // Assertions
    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object)); // Ensure SQL connection was called
    expect(mockConnection.close).toHaveBeenCalledTimes(1); // Ensure connection was closed
    expect(books).toHaveLength(2); // Ensure correct number of books
    expect(books[0]).toBeInstanceOf(Book); // Ensure each item is an instance of Book
    expect(books[0].book_id).toBe(1); // Check id of first book
    expect(books[0].title).toBe("The Lord of the Rings"); // Check title of first book
    expect(books[0].author).toBe("J.R.R. Tolkien"); // Check author of first book
    expect(books[0].availability).toBe("Y"); // Check availability of first book

    // Assertions for the second book
    expect(books[1]).toBeInstanceOf(Book);
    expect(books[1].book_id).toBe(2);
    expect(books[1].title).toBe("The Hitchhiker's Guide to the Galaxy");
    expect(books[1].author).toBe("Douglas Adams");
    expect(books[1].availability).toBe("N");
  });

  it("should handle errors when retrieving books", async () => {
    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage)); // Mock SQL connection rejection

    await expect(Book.getAllBooks()).rejects.toThrow(errorMessage); // Expect getAllBooks to throw the error
  });
});


describe("Book.updateBook", () => {
    let connection;
    let request;
  
    beforeEach(() => {
      connection = {
        request: jest.fn().mockReturnThis(),
        close: jest.fn(),
      };
      request = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn(),
      };
      sql.connect = jest.fn().mockResolvedValue(connection);
      connection.request.mockReturnValue(request);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should update the availability of a book", async () => {
      // Arrange
      const book_id = 1;
      const newAvailability = 'Y';
      const updatedBook = { book_id, availability: newAvailability };
      
      request.query.mockResolvedValue({ rowsAffected: [1] });
      Book.getBookById = jest.fn().mockResolvedValue(updatedBook);
  
      // Act
      const result = await Book.updateBook(book_id, newAvailability);
  
      // Assert
      expect(sql.connect).toHaveBeenCalledWith(expect.anything());
      expect(connection.request).toHaveBeenCalledTimes(1);
      expect(request.input).toHaveBeenCalledWith("book_id", book_id);
      expect(request.input).toHaveBeenCalledWith("availability", newAvailability);
      expect(request.query).toHaveBeenCalledWith(
        "UPDATE Books SET availability = @availability WHERE book_id = @book_id"
      );
      expect(connection.close).toHaveBeenCalled();
      expect(Book.getBookById).toHaveBeenCalledWith(book_id);
      expect(result).toEqual(updatedBook);
    });
  
    it("should return null if book with the given id does not exist", async () => {
      // Arrange
      const book_id = 999;
      const newAvailability = true;
      
      request.query.mockResolvedValue({ rowsAffected: [0] });
      Book.getBookById = jest.fn().mockResolvedValue(null);
  
      // Act
      const result = await Book.updateBook(book_id, newAvailability);
  
      // Assert
      expect(sql.connect).toHaveBeenCalledWith(expect.anything());
      expect(connection.request).toHaveBeenCalledTimes(1);
      expect(request.input).toHaveBeenCalledWith("book_id", book_id);
      expect(request.input).toHaveBeenCalledWith("availability", newAvailability);
      expect(request.query).toHaveBeenCalledWith(
        "UPDATE Books SET availability = @availability WHERE book_id = @book_id"
      );
      expect(connection.close).toHaveBeenCalled();
      expect(Book.getBookById).toHaveBeenCalledWith(book_id);
      expect(result).toBeNull();
    });
  
    it("should throw an error if database error occurs", async () => {
      // Arrange
      const book_id = 1;
      const newAvailability = true;
      
      request.query.mockRejectedValue(new Error("Database error"));
  
      // Act & Assert
      await expect(Book.updateBook(book_id, newAvailability)).rejects.toThrow("Database error");
      expect(sql.connect).toHaveBeenCalledWith(expect.anything());
      expect(connection.request).toHaveBeenCalledTimes(1);
      expect(request.input).toHaveBeenCalledWith("book_id", book_id);
      expect(request.input).toHaveBeenCalledWith("availability", newAvailability);
      expect(request.query).toHaveBeenCalledWith(
        "UPDATE Books SET availability = @availability WHERE book_id = @book_id"
      );
      expect(connection.close).toHaveBeenCalled();
    });
  });
