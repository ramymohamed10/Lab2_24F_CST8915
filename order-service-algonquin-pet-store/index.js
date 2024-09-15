// Import required modules
const express = require('express'); // Express is a minimal Node.js framework for building web applications.
const amqp = require('amqplib/callback_api'); // AMQP (Advanced Message Queuing Protocol) client library for RabbitMQ.
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing) middleware for handling cross-origin requests.
require('dotenv').config(); // Load environment variables from .env file in development

const app = express(); // Create an Express application instance.
app.use(express.json()); // Middleware to parse incoming JSON request bodies.

// Enable CORS (Cross-Origin Resource Sharing) for all routes
app.use(cors());

// Get the RabbitMQ URL and the port from environment variables
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING || 'amqp://localhost';  // Fallback to localhost if not defined
const PORT = process.env.PORT || 3000;  // Fallback to port 3000 if not defined

// Define a POST route for creating orders
app.post('/orders', (req, res) => {
  const order = req.body; // Extract the order data from the request body.
  
  // Connect to RabbitMQ server
  amqp.connect(RABBITMQ_CONNECTION_STRING, (err, conn) => {
    if (err) {
      // If an error occurs while connecting to RabbitMQ, send a 500 status and error message.
      return res.status(500).send('Error connecting to RabbitMQ');
    }

    // Once connected to RabbitMQ, create a channel to communicate with it.
    conn.createChannel((err, channel) => {
      if (err) {
        // If an error occurs while creating a channel, send a 500 status and error message.
        return res.status(500).send('Error creating channel');
      }

      const queue = 'order_queue'; // Define the queue where the order will be sent.
      const msg = JSON.stringify(order); // Convert the order object to a JSON string.

      // Assert (create) the queue if it doesn't already exist.
      channel.assertQueue(queue, { durable: false });

      // Send the order message to the queue.
      channel.sendToQueue(queue, Buffer.from(msg));

      // Log the sent order to the console.
      console.log("Sent order to queue:", msg);

      // Send a response to the client confirming that the order was received.
      res.send('Order received');
    });
  });
});

// Start the server using the port from environment variables
app.listen(PORT, () => {
  console.log(`Order service is running on http://localhost:${PORT}`);
});
