# claude-demo-todo

A basic to-do app in vanilla JavaScript (no framework, no build step).

## Requirements

- Node.js >= 22.13

## Run

```sh
npm install
npm start
```

Then open http://localhost:8080. Opening `index.html` directly from disk does not work, because the app uses ES modules, which browsers only load over HTTP.

## Test

```sh
npm test
```

Runs the tests with Node's built-in test runner (using jsdom) and enforces 100 % coverage of `src/`.
