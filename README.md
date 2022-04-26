# User Game API

Simple game api that store user account, biodata, and game histories

### Prerequisites

1. [Git](https://git-scm.com/downloads)
    ```
    git --version
    ```
2. [Node.js](https://nodejs.org/en/)
    ```
    node -v
    ```
3. [PostgreSQL](https://www.postgresql.org/download/)
    ```
    psql --version
    ```

### How To Run In Local

1. Clone the repository
    ```
    git clone https://github.com/NaufalK25/user-game-api.git
    ```
2. Install dependencies
    ```
    npm install
    ```
3. Create a database
    ```
    npm run db-init
    ```
4. Run the server
    ```
    npm run dev
    ```

### Endpoint

#### User Gane

**GET** `/api/v1/user_games`

**POST** `/api/v1/user_games`

**GET** `/api/v1/user_game/:id`

**PATCH** `/api/v1/user_game/:id`

**DELETE** `/api/v1/user_game/:id`

#### User Game Biodata

**GET** `/api/v1/user_games/biodatas`

**POST** `/api/v1/user_games/biodatas`

**GET** `/api/v1/user_game/biodata/:id`

**PATCH** `/api/v1/user_game/biodata/:id`

**DELETE** `/api/v1/user_game/biodata/:id`

**GET** `/api/v1/user_game/:userGameId/biodata`

#### User Game History

**GET** `/api/v1/user_games/histories`

**POST** `/api/v1/user_games/histories`

**GET** `/api/v1/user_game/history/:id`

**PATCH** `/api/v1/user_game/history/:id`

**DELETE** `/api/v1/user_game/history/:id`

**GET** `/api/v1/user_game/:userGameId/history`
