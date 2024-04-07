const { Book, User } = require("../models");
const fetch = require('node-fetch');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
      }
      throw new AuthenticationError("Not logged in");
    },
    searchGoogleBooks: async (_, { query }) => {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
      const data = await response.json();
      return data.items.map((item) => ({
        bookId: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        description: item.volumeInfo.description,
        image: item.volumeInfo.imageLinks?.thumbnail,
        link: item.volumeInfo.infoLink,
      }));
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: input } },
          { new: true }
        );

        // Save the book to local storage
        localStorage.setItem(
          "savedBooks",
          JSON.stringify(updatedUser.savedBooks)
        );

        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        // Remove the book from local storage
        let savedBooks = JSON.parse(localStorage.getItem("savedBooks"));
        savedBooks = savedBooks.filter((book) => book.bookId !== bookId);
        localStorage.setItem("savedBooks", JSON.stringify(savedBooks));

        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
