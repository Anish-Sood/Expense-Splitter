# Expense Splitter

A full-stack web application designed to help users manage and split group expenses seamlessly. Create groups, add members, track spending, and easily settle debts with friends and family.

## Features

-   **User Authentication:** Secure user registration and login system using JWT.
-   **Group Management:**
    -   Create new expense groups for different purposes (e.g., trips, household).
    -   Add members to groups via their email address.
    -   View a list of all groups you are a member of.
-   **Expense Tracking:**
    -   Add detailed expenses with a description, amount, and category.
    -   Edit and delete your own expenses.
    -   Expenses are automatically timestamped and linked to the user who paid.
-   **Flexible Splitting Options:**
    -   **Equal:** Split the cost equally among all group members.
    -   **By Amount:** Specify the exact amount each member owes for a particular expense.
    -   **By Percentage:** Split the cost based on custom percentages for each member.
-   **Debt Settlement:**
    -   The application automatically calculates the simplest way to settle all debts within a group.
    -   View a clear list of who owes whom and how much.
-   **Spending Insights:**
    -   Visualize group spending by category with an interactive pie chart.

## Tech Stack

-   **Backend:**
    -   **Java:** Core programming language.
    -   **Spring Boot:** Framework for creating stand-alone, production-grade Spring-based Applications.
    -   **Spring Data JPA / Spring Data MongoDB:** For database interaction.
    -   **Maven / Gradle:** For build automation and dependency management.
    -   **MongoDB / SQL Database:** For data persistence.
    -   **JWT:** For stateless, secure user authentication.

-   **Frontend:**
    -   **React.js:** A JavaScript library for building user interfaces.
    -   **React Router:** For client-side routing and navigation.
    -   **Axios:** For making HTTP requests to the backend API.
    -   **React Chartjs 2 / Recharts:** For displaying data visualizations.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js and npm (or yarn) installed (for the frontend).
-   Java Development Kit (JDK) installed.
-   Maven installed.
-   MongoDB installed and running, or a MongoDB Atlas connection string.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd expense-splitter
    ```

2.  **Build the Backend:**
    Navigate to the backend directory and build the project using Maven or Gradle.
    ```sh
    cd backend
    mvn clean install 
    # or ./gradlew build
    ```

3.  **Configure Backend Environment:**
    In the `backend/src/main/resources` directory, configure your `application.properties` or `application.yml` file with your database connection string and JWT secret.
    ```properties
    # Example for application.properties
    server.port=8080
    spring.data.mongodb.uri=<your_mongodb_connection_string>
    jwt.secret=<your_jwt_secret>
    ```

4.  **Install Frontend Dependencies:**
    Navigate to the frontend directory and install the required packages.
    ```sh
    cd ../frontend
    npm install
    ```

5.  **Run the Application:**
    -   To start the backend server, run the following command from the `backend` directory:
        ```sh
        java -jar target/<your-app-name>.jar
        # Or run from your IDE
        ```
    -   To start the frontend development server, run the following command from the `frontend` directory:
        ```sh
        npm start
        ```

The application should now be running. The frontend will be accessible at `http://localhost:5173` and will proxy API requests to the backend server running on `http://localhost:8080`.
