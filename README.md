# Countries API

A robust backend service built with NestJS and TypeORM, designed to fetch, store, and serve comprehensive data about countries. The API provides endpoints for filtering countries, refreshing data from external sources, and even generating a dynamic summary image of key statistics.

---

### Features

- **Data Aggregation**: Fetches and combines country data from [REST Countries](https://restcountries.com/) and currency exchange rates from [ExchangeRate-API](https://www.exchangerate-api.com/).
- **Dynamic Filtering & Sorting**: Efficiently query the country database by region, currency, or sort by estimated GDP.
- **Dynamic Image Generation**: Creates and serves a PNG image summarizing the total number of countries and the top 5 by estimated GDP using the `sharp` library.
- **Database Persistence**: Utilizes TypeORM and a MySQL database to reliably store and manage country information.
- **Structured & Validated**: Employs DTOs and `class-validator` for robust and predictable API request handling.

### Technologies Used

| Technology                                                 | Description                              |
| ---------------------------------------------------------- | ---------------------------------------- |
| [TypeScript](https://www.typescriptlang.org/)              | Superset of JavaScript for type safety   |
| [Node.js](https://nodejs.org/)                             | JavaScript runtime environment           |
| [NestJS](https://nestjs.com/)                              | A progressive Node.js framework          |
| [TypeORM](https://typeorm.io/)                             | ORM for TypeScript and JavaScript        |
| [MySQL](https://www.mysql.com/)                            | Relational database management system    |
| [Sharp](https://sharp.pixelplumbing.com/)                  | High-performance image processing        |
| [Jest](https://jestjs.io/)                                 | Testing framework for JavaScript         |
| [ESLint](https://eslint.org/) / [Prettier](https://prettier.io/) | Code linting and formatting            |

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/PaulAjii/hngxiii-stage2-countries-api.git
    cd hngxiii-stage2-countries-api
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a `.env` file in the root directory and populate it with your database credentials and server configuration.
    ```bash
    cp .env.example .env
    ```
    Then, edit the `.env` file.

4.  **Run the Application**
    ```bash
    # Development mode
    npm run start:dev
    ```

### Environment Variables
To run this project, you will need to add the following environment variables to your `.env` file:

-   `PORT`: The port the application will listen on.
-   `DB_HOST`: The hostname of your database server.
-   `DB_PORT`: The port of your database server.
-   `DB_USERNAME`: The username for database access.
-   `DB_PASSWORD`: The password for the database user.
-   `DB_DATABASE`: The name of the database.

**Example `.env` file:**
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secret_password
DB_DATABASE=countries_db
```

## API Documentation

### Base URL
The API endpoints are available under the server's root URL.
Example: `http://localhost:3000`

### Endpoints
#### GET /countries
Retrieves a list of countries, with optional filtering and sorting.

**Request**:
Query Parameters (all optional):
- `region` (string): Filters countries by region (e.g., `Africa`, `Europe`).
- `currency` (string): Filters countries by currency code (e.g., `USD`, `NGN`).
- `sort` (string): Sorts the results. Use `gdp_asc` for ascending or `gdp_desc` for descending order of estimated GDP.

**Response**:
`200 OK` - An array of country objects.
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139587,
    "currency_code": "NGN",
    "exchange_rate": 411.5,
    "estimated_gdp": 751198256.74,
    "flag_url": "https://restcountries.eu/data/nga.svg",
    "last_refreshed_at": "2024-07-28T10:30:00.000Z"
  }
]
```

**Errors**:
- `500 Internal Server Error`: If there is a problem retrieving data from the database.

---
#### GET /countries/:name
Retrieves a single country by its exact name.

**Request**:
URL Parameter:
- `name` (string, required): The full name of the country.

**Response**:
`200 OK` - A single country object.
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139587,
  "currency_code": "NGN",
  "exchange_rate": 411.5,
  "estimated_gdp": 751198256.74,
  "flag_url": "https://restcountries.eu/data/nga.svg",
  "last_refreshed_at": "2024-07-28T10:30:00.000Z"
}
```

**Errors**:
- `400 Bad Request`: If the `name` parameter is missing.
- `404 Not Found`: If no country with the specified name is found.

---
#### POST /countries/refresh
Fetches the latest country and exchange rate data from external APIs and updates the database. This is a long-running task.

**Request**:
No request payload is required.

**Response**:
`201 Created`: A successful response indicates the refresh process has started. No body is returned.

**Errors**:
- `503 Service Unavailable`: If external APIs (REST Countries or ExchangeRate-API) are unreachable.
- `500 Internal Server Error`: If there is a database error during the transaction.

---
#### GET /countries/image
Returns a dynamically generated PNG image summarizing country statistics.

**Request**:
No request payload is required.

**Response**:
`200 OK` - A PNG image file.
Headers: `Content-Type: image/png`

**Errors**:
- `404 Not Found`: If the summary image has not been generated yet (e.g., before the first `/countries/refresh` call).

---
#### DELETE /countries/:name
Deletes a specific country from the database.

**Request**:
URL Parameter:
- `name` (string, required): The full name of the country to delete.

**Response**:
`204 No Content`: The country was successfully deleted. No body is returned.

**Errors**:
- `400 Bad Request`: If the `name` parameter is invalid or missing.
- `404 Not Found`: If the specified country does not exist.

---
#### DELETE /countries
Deletes all countries from the database.

**Request**:
No request payload is required.

**Response**:
`204 No Content`: All countries were successfully deleted. No body is returned.

**Errors**:
- `404 Not Found`: If there are no countries in the database to delete.

---
#### GET /status
Provides the total count of countries in the database and the timestamp of the last data refresh.

**Request**:
No request payload is required.

**Response**:
`200 OK` - A status object.
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2024-07-28T10:30:00.000Z"
}
```
If the database is empty:
```json
{
  "total_countries": 0,
  "last_refreshed_at": null
}
```

**Errors**:
- `500 Internal Server Error`: If there is a problem querying the database.

---

### Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

### License
This project is licensed under the UNLICENSED License.

### Author
**Paul Aji**

-   **Twitter**: [@your_twitter_handle](https://twitter.com/your_twitter_handle)
-   **LinkedIn**: [your_linkedin_profile](https://linkedin.com/in/your_linkedin_profile)

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
</p>

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)