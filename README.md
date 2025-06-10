# Full Stack Web Application with React and Django REST Framework

! TaskManagementSystem

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction  

Designed a comprehensive full-stack ecommerce application that facilitates essential ecommerce functionalities. Sellers can upload their products, while users can browse products, add them to their cart, and place orders. Additionally, sellers can view orders and manage deliveries efficiently. The backend is developed using Django REST Framework to create robust APIs for data management, while the frontend utilizes React to provide an interactive and responsive user experience.


## Features

 -User registration and authentication for both buyers and sellers</li>
 -Product upload functionality for sellers</li>
 -Shopping cart management for users</li>
 -Order placement and tracking</li>
 -Responsive design for optimal user experience across devices</li>
 -Admin dashboard for managing products and orders</li>

## Technologies Used

- **Frontend:**
  - React
  - Axios (for API calls)
  - Material-UI (for styling)

- **Backend:**
  - Django
  - Django REST Framework
  - PostgreSQL
  - JWT (for authentication)

## Installation

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm (Node Package Manager)
- Python 3.x
- pip (Python Package Installer)
- PostgreSQL (if using PostgreSQL)

### Clone the Repository
bash
git clone https://github.com/Asfm445/EcommerceProject.git
cd EcommerceProject

### Frontend Setup

1. Navigate to the frontend directory:

bash cd frontend
   

3. Install dependencies:

bash npm install

4. Start the development server:
bash npm run dev
### Backend Setup

1. Navigate to the backend directory:
  bash cd backend
2. Create a virtual environment:
bash
   python -m venv venv
   source venv/bin/activate  # On Windows use venv\Scripts\activate
3. Install dependencies:
bash
   pip install -r requirements.txt
   

4. Set up the database:
   create .env and replace information in env-example with True information

   
bash
   python manage.py migrate
   

5. Create a superuser (optional):

   
bash
   python manage.py createsuperuser
   

6. Start the Django server:

   
bash
   python manage.py runserver
   

## Usage

Once both the frontend and backend servers are running, you can access the application at http://localhost:3000 (frontend) and http://localhost:8000 (backend).

## API Endpoints

Here are some of the key API endpoints available in this application:

| Method | Endpoint                              | Description                                         | Auth Required |
|--------|---------------------------------------|-----------------------------------------------------|--------------|
| GET    | /api/                                 | List all products                                   | No           |
| GET    | /api/myproducts/                      | List products owned by the authenticated user       | Yes          |
| POST   | /api/myproducts/                      | Create a new product                                | Yes          |
| GET    | /api/mycart/                          | Get the current user's cart                         | Yes          |
| POST   | /api/mycart/                          | Add or update a product in the cart                 | Yes          |
| DELETE | /api/mycart/                          | Remove a product from the cart                      | Yes          |
| GET    | /api/order/                           | List all orders for the authenticated user          | Yes          |
| POST   | /api/order/                           | Create an order from the user's cart                | Yes          |
| GET    | /api/orderforseller/                  | List all order items for the seller's products      | Yes          |
| PATCH  | /api/orderforseller/                  | Update an order item (e.g., status)                 | Yes          |
| GET    | /api/types/<int:id>/                  | List all types for a given category                 | No           |
| GET    | /api/catagories/                      | List all categories                                 | No           |
| DELETE | /api/delete/product/?productId=ID     | Delete a product by its ID (query param)            | Yes          |
## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (git checkout -b feature/YourFeature).
3. Make your changes and commit them (git commit -m 'Add new feature').
4. Push to the branch (git push origin feature/YourFeature).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for checking out this project! Feel free to reach out with any questions or feedback.
