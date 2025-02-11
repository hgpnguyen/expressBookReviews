const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length === 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const validUser = users.filter((user) => user.username === username && user.password === password);
    return validUser.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error loggin in" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    res.status(208).json({ message: "Invalid Login. Check username and password" })
  }

});

regd_users.post("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const { username } = req.session.authorization;
    if (review) {
        const book = books[isbn];
        if (!book) {
            return res.status(404).send({ message: "Book not found"});
        }
        book.reviews[username] = review;
        return res.status(200).json({message: "Review added"}); 
      }
      return res.status(400).send({ message: "Invalid. Need review to post"});
})

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const { username } = req.session.authorization;
  if (review) {
    const book = books[isbn];
    if (!book) {
        return res.status(404).send({ message: "Book not found"});
    }
    const oldReview = book.reviews[username];
    if (!oldReview) {
        return res.status(404).send({ message: "Review not found"});
    }
    book.reviews[username] = review;
    return res.status(200).json({message: "Review updated"}); 
  }
  return res.status(404).json({ message: "Invalid. Need review to update"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { username } = req.session.authorization;
    const book = books[isbn];
    if (book) {
        delete book.reviews[username];
        return res.status(200).json({ message: "Delete review successful" });
    } else {
        return res.status(404).send({ message: "Book not found"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
