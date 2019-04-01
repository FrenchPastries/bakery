# Bakery

Bakery is a service registry, built with [MilleFeuille](https://github.com/frenchpastries/millefeuille), to handle a lot of services in a micro-services architecture. It is made as an NPM module to let everyone use it into its own stack.

Because it is thought to integrate with the French Pastries stack, and handle pastries, which makes it a perfect Bakery!

# Getting Started

Getting started with Bakery is simple and easy.

```bash
# For Yarn users
yarn add @frenchpastries/bakery
```

```bash
# For NPM users
npm install --save @frenchpastries/bakery
```

Once you got the package locally, fire your text editor, open an `src/main.js` file, and start the server.

```javascript
const Bakery = require('@frenchpastries/bakery')

const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL, 10)
const HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT, 10)

const closeBakery = Bakery.create({
  heartbeatInterval: HEARTBEAT_INTERVAL,
  heartbeatTimeout: HEARTBEAT_TIMEOUT,
  port: 8080, // This field is optional, and defaults to 8080.
})

process.on('SIGINT', () => {
  closeBakery()
})
```

Run `node src/main.js`, and try to reach `localhost:8080`. You should see the bakery output the list of services registered. Right now, nothing is registered, but that’s the correct behavior! As you can see, the bakery only expect three options: `heartbeatInterval`, `heartbeatTimeout`, and `port`. The two first ones are concerns for the heartbeat. We’ll explore more on this later. The last one indicates on which port the server should open. It is optional and defaults to 8080 (just like MilleFeuille!).

# How does it works?

> More on that later…

# Bakery Client for Services

> More on that later…

# Open Design Discussion

We want to maintain as much as possible discussions in PR and issues open to anyone. We think it's important to share why we're doing things and to discuss about how you use the framework and how you would like to use it!

# Contributing

You love Bakery? Feel free to contribute: open issues or propose pull requests! At French Pastries, we love hearing from you!
