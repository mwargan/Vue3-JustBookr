// Load the book.json so we can use it to compare the returned data
import type { Book } from "../../src/types/book";
import type { Post } from "../../src/types/post";

describe("Book Test", () => {
  let book: Book;
  let posts: Post[];
  let otherEditions: Book[];

  before(() => {
    cy.fixture("book.json").then((sale) => {
      book = sale;
    });
    cy.fixture("posts.json").then((sale) => {
      posts = sale;
    });
    cy.fixture("otherEditions.json").then((sale) => {
      otherEditions = sale.data;
    });
  });

  beforeEach(() => {
    cy.handleUnauthenticatedUser();

    cy.intercept(
      "GET", // Route all GET requests
      "/api/v1/books/" + book.isbn, // that have a URL that matches '/users/*'
      {
        fixture: "book",
      }
    );

    cy.intercept(
      "GET", // Route all GET requests
      "/api/v1/posts?isbn=" +
        book.isbn +
        "&paginate=false&available=true&active=true&university=16763",
      {
        fixture: "posts",
      }
    ).as("getPosts");

    cy.intercept("GET", "/api/v1/suggestions/other-editions/" + book.isbn, {
      fixture: "otherEditions",
    });

    cy.intercept(
      "GET",
      `/api/v1/book-notifications?user=1&university=16763&isbn=${book.isbn}`,
      {
        body: {
          data: [],
        },
      }
    ).as("bookNotifications");

    cy.intercept("POST", `/api/v1/textbooks/${book.isbn}/views`, {
      statusCode: 201,
    }).as("bookView");

    cy.visit("/books/" + book.isbn);
  });

  it("shows the book page", () => {
    // Confirm that the book title is present on the page based on the book-title from the book.json fixture
    cy.get("h1").should("contain", book["book-title"]);

    // There should be a link to the author
    cy.get("a").should("contain", book.author);

    // Somewhere there should be the edition
    cy.get("main").should("contain", book.edition);

    // There should be an image of the book with an alt tag of the book title
    cy.get("img").should("have.attr", "alt", book["book-title"]);

    // There should be a label > input with a role of switch (to toggle notifications)
    cy.get("label > input[role=switch]").should("exist");

    // Since we are logged out, the switch should be unchecked
    cy.get("form label > input[role=switch]").should("not.be.checked");

    // There should be a button to sell a copy
    cy.get('[data-cy="sell-button"]').should("exist");

    // The sell button should contain the book.average_price
    cy.get('[data-cy="sell-button"]').should("contain", book.average_price);

    // There should be an article with the posts[0] user name, price, and post-description
    // The name should be a link to the user
    cy.get("article a").should("contain", posts[0].user.name);
    cy.get("article a").should(
      "have.attr",
      "href",
      "/users/" + posts[0].user["user-id"]
    );

    cy.get("article").should("contain", posts[0].price);

    cy.get("article").should("contain", posts[0]["post-description"]);

    // There should be an article with Amazon in the header
    cy.get("article header").should("contain", "Amazon");

    // There should be an article containing the intercepted otherEditions[0].edition
    cy.get("article").should("contain", otherEditions[0].edition);
    cy.get("article").should("contain", otherEditions[0]["book-title"]);

    // The page title should contain the book title
    cy.title().should("contain", book["book-title"]);
  });

  it("shows authentication modal when clicking on notification toggle when logged out", () => {
    // Click the notification toggle
    cy.get("form label > input[role=switch]").click();

    // There should be a dialog element with an open attribute
    cy.get("body > dialog").should("be.visible");

    // The dialog should have an email input
    cy.get("dialog input[type=email]").should("exist");
  });

  it("can enable notifications", () => {
    cy.handleAuthenticatedUser();

    cy.intercept("POST", "/api/v1/book-notifications", {
      fixture: "createdNotification",
      statusCode: 201,
    }).as("createNotification");

    cy.reload();

    // Click the notification toggle
    cy.get("form label > input[role=switch]").click();

    // The request should contain the book.isbn
    cy.wait("@createNotification")
      .its("request.body")
      .should("include", {
        isbn: Number(book.isbn),
      });

    // The switch should be checked
    cy.get("form label > input[role=switch]").should("be.checked");
  });

  it("shows sell modal", () => {
    // Click the sell button
    cy.get('[data-cy="sell-button"]').click();

    // There should be a dialog element with an open attribute
    cy.get("body > dialog").should("be.visible");

    // The dialog should have an email input
    cy.get("body > dialog input[name=price]").should("exist");
  });

  it("shows authentication modal after attempting to sell a book when logged out", () => {
    // Click the sell button
    cy.get('[data-cy="sell-button"]').click();

    // Fill in the description and price
    cy.get("dialog input[name=price]").type("10");
    cy.get("dialog textarea[name=description]").type(
      "Test description goes here"
    );

    // Click the sell button
    cy.get("dialog button").click();

    // There should be a dialog element with an open attribute
    cy.get("body > dialog").should("be.visible");

    // The dialog should have an email input
    cy.get("dialog input[type=email]").should("exist");
  });

  it("can sell a book", () => {
    // Log in
    cy.handleAuthenticatedUser();

    cy.intercept("POST", "/api/v1/posts", { fixture: "createdOrder" }).as(
      "createOrder"
    );

    // Reload the page
    cy.reload();

    // Click the sell button
    cy.get('[data-cy="sell-button"]').click();

    // Fill in the description and price
    cy.get("dialog input[name=price]").type("10");
    cy.get("dialog textarea[name=description]").type(
      "Test description goes here"
    );

    // Click the sell button
    cy.get("dialog button").click();

    // There should be a request made to get the posts
    cy.wait("@getPosts");
  });
});
