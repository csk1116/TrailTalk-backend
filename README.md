# TrailTalk

TrailTalk is a Node.js application that uses Express.js and MongoDB to manage posts. This project includes routes for creating, retrieving, updating, and deleting posts, as well as upvoting posts.

## Prerequisites

- Node.js
- MongoDB
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/trailtalk.git
    cd trailtalk
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your MongoDB URI and database name:
    ```plaintext
    MONGO_URI=your_mongodb_uri
    DB_NAME=trailtalk
    PORT=5002
    ```

## Running the Application

1. Start the MongoDB server if it's not already running.

2. Start the application:
    ```sh
    npm start
    ```

3. The server will be running on `http://localhost:5002`.

## API Endpoints

### Create a new post
- **URL:** `/api/posts`
- **Method:** `POST`
- **Body:** FormData object representing the post
  - `title`: string
  - `content`: string
  - `tags`: JSON string array
  - `secretKey`: string
  - `userId`: string
  - `image`: file (optional)
  - `imageUrl`: string (optional)
- **Response:** Created post object

### Get all posts
- **URL:** `/api/posts`
- **Method:** `GET`
- **Response:** Array of post objects

### Get a single post by ID
- **URL:** `/api/posts/:id`
- **Method:** `GET`
- **Response:** Post object

### Update a post by ID
- **URL:** `/api/posts/:id`
- **Method:** `PUT`
- **Body:** FormData object representing the updated post
  - `title`: string
  - `content`: string
  - `tags`: JSON string array
  - `secretKey`: string
  - `userId`: string
  - `image`: file (optional)
  - `imageUrl`: string (optional)
- **Response:** Updated post object

### Delete a post by ID
- **URL:** `/api/posts/:id`
- **Method:** `DELETE`
- **Body:** JSON object containing the secret key
  - `secretKey`: string
- **Response:** Success message

### Upvote a post
- **URL:** `/api/posts/:id/upvote`
- **Method:** `POST`
- **Response:** Updated post object with incremented upvotes

## Project Structure

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.