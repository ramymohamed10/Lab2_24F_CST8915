use dotenv::dotenv; // Import dotenv to load environment variables from .env in local development.
use std::env; // Import the environment module to access environment variables.
use warp::Filter; // Import the warp web framework and the Filter trait for handling HTTP requests. // Import dotenv to load environment variables from .env in local development.

#[tokio::main] // This macro marks the main function as asynchronous and uses the Tokio runtime.
async fn main() {
    dotenv().ok(); // Load environment variables from .env, if present (only for local dev).

    // Fetch the port from the environment or default to 3030.
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "3030".to_string()) // Default to port 3030 if not specified.
        .parse::<u16>()
        .expect("PORT must be a valid number");

    // Create a CORS (Cross-Origin Resource Sharing) filter to allow access from any origin.
    // CORS is used to handle requests coming from different domains (e.g., the frontend running on another server).
    let cors = warp::cors()
        .allow_any_origin() // Allow requests from any domain (not restricted).
        .allow_methods(vec!["GET"]); // Restrict the allowed HTTP methods (in this case, only GET requests).

    // Define a route that listens for requests to the "/products" path.
    // When a GET request is made to "/products", the server will respond with a JSON array of product objects.
    let products = warp::path("products") // Define the "/products" path.
        .map(|| {
            // Map the request to a response that returns a JSON array of product objects.
            warp::reply::json(&vec![
                // Use `serde_json::json!` macro to create JSON objects representing the products.
                serde_json::json!({ "id": 1, "name": "Dog Food", "price": 19.99 }), // Product 1: Dog Food
                serde_json::json!({ "id": 2, "name": "Cat Food", "price": 34.99 }), // Product 2: Cat Food
                serde_json::json!({ "id": 3, "name": "Bird Seeds", "price": 10.99 }), // Product 3: Bird Seeds
            ])
        })
        .with(cors); // Apply the CORS filter to this route to allow cross-origin requests.

    // Start the web server using the port from environment variables or defaults.
    // The server will listen for incoming requests and route them to the "/products" path.
    warp::serve(products).run(([0, 0, 0, 0], port)).await; // Await the server to ensure it's running asynchronously.
}
