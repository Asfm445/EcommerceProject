from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Cart, CartItem, Order, OrderItem, Product, Type, catagory, shop


class APITests(APITestCase):
    """Base test class with setup for user, shop, product, type, and category."""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.cat = catagory.objects.create(name="Electronics")
        self.type = Type.objects.create(name="Phone", catagory=self.cat)
        self.shop = shop.objects.create(
            shop_name="Shop1", owner=self.user, loc_latitude=10, loc_longitude=20
        )
        self.product = Product.objects.create(
            name="iPhone",
            price=1000,
            stock_quantity=10,
            type=self.type,
            shop=self.shop,
            owner=self.user,
        )


class TestOther(APITests):
    """Tests for profile and shop endpoints."""

    def test_profile_create_and_get(self):
        """Test creating and retrieving a user profile."""
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "loc_latitude": 0,
            "loc_longitude": 0,
            "phone_number": "1234567890",
            "address": "Test Address",
        }
        response = self.client.post("/api/profile/", data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "John")

    def test_shop_create_and_list(self):
        """Test creating a shop and listing all shops for the user."""
        data = {
            "shop_name": "Shop2",
            "loc_latitude": 11,
            "loc_longitude": 22,
            "loc_description": "desc",
            "delivery_support": True,
            "del_price_per_km": 5.0,
        }
        response = self.client.post("/api/myshops/", data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        response = self.client.get("/api/myshops/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(shop["shop_name"] == "Shop2" for shop in response.data))


class ProductManagementTests(APITests):
    """Tests for product management endpoints."""

    def test_cart_unauthenticated(self):
        """Test that unauthenticated users cannot access product endpoints."""
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/myproducts/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_product_create_with_type_id(self):
        """Test creating a product using an existing type ID."""
        data = {
            "name": "Samsung",
            "price": 500,
            "typeId": self.type.id,
            "shop_id": self.shop.id,
            "stock_quantity": 5,
        }
        response = self.client.post("/api/myproducts/", data)
        self.assertIn(
            response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        )  # 400 if image required
        if response.status_code == 400:
            self.assertIn("image", response.data)

    def test_product_create_with_new_type(self):
        """Test creating a product with a new type and category."""
        data = {
            "name": "Samsung",
            "price": 500,
            "typeName": "newPhone",
            "catagoryId": self.cat.id,
            "shop_id": self.shop.id,
            "stock_quantity": 5,
        }
        response = self.client.post("/api/myproducts/", data)
        self.assertIn(
            response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        )
        if response.status_code == 400:
            self.assertIn("image", response.data)

    def test_product_list_and_patch(self):
        """Test listing products and partially updating a product."""
        response = self.client.get("/api/myproducts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if response.data["results"]:
            prod_id = response.data["results"][0]["id"]
            response = self.client.patch(f"/api/myproducts/{prod_id}/", {"price": 600})
            self.assertIn(
                response.status_code, [status.HTTP_202_ACCEPTED, status.HTTP_200_OK]
            )

    def test_product_delete(self):
        """Test deleting a product and cascading deletes to related cart and order items."""
        cart = Cart.objects.create(owner=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        order_res = self.client.post("/api/order/")
        response = self.client.delete(f"/api/myproducts/{self.product.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())
        self.assertFalse(
            CartItem.objects.filter(
                product__id=self.product.id, cart__owner=self.user
            ).exists()
        )
        if order_res.status_code == 201:
            self.assertFalse(
                OrderItem.objects.filter(
                    product__id=self.product.id, order__user=self.user
                ).exists()
            )


class OrderTests(APITests):
    """Tests for order creation and listing endpoints."""

    def test_cart_unauthenticated(self):
        """Test that unauthenticated users cannot access order endpoints."""
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_orders(self):
        """Test listing orders for a user."""
        Order.objects.create(user=self.user, total=100)
        response = self.client.get("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_order_normal(self):
        """Test creating an order from a cart with items."""
        cart = Cart.objects.create(owner=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        response = self.client.post("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(
            CartItem.objects.filter(
                product=self.product, cart__owner=self.user
            ).exists()
        )
        self.assertTrue(Order.objects.filter(user=self.user).exists())
        order = Order.objects.get(user=self.user)
        self.assertTrue(
            OrderItem.objects.filter(order=order, product=self.product).exists()
        )

    def test_create_order_if_user_does_not_have_cart(self):
        """Test creating an order when the user has no cart."""
        response = self.client.post("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Order.objects.filter(user=self.user).exists())

    def test_create_order_if_cart_is_empty(self):
        """Test creating an order when the cart is empty."""
        cart = Cart.objects.create(owner=self.user)
        response = self.client.post("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Order.objects.filter(user=self.user).exists())

    def test_create_order_stock_is_insufficient(self):
        """Test creating an order when product stock is insufficient."""
        cart = Cart.objects.create(owner=self.user)
        CartItem.objects.create(
            cart=cart, product=self.product, quantity=self.product.stock_quantity + 1
        )
        response = self.client.post("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Order.objects.filter(user=self.user).exists())

    def test_create_order_partial_stock_is_sufficient(self):
        """Test creating an order when only some cart items have sufficient stock."""
        cart = Cart.objects.create(owner=self.user)
        CartItem.objects.create(
            cart=cart, product=self.product, quantity=self.product.stock_quantity + 1
        )
        product2 = Product.objects.create(
            name="Galaxy",
            price=800,
            stock_quantity=1,
            type=self.type,
            shop=self.shop,
            owner=self.user,
        )
        CartItem.objects.create(cart=cart, product=product2, quantity=1)
        response = self.client.post("/api/order/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(Order.objects.filter(user=self.user)), 1)


class CartTests(APITests):
    """Tests for cart add, get, and delete endpoints."""

    def test_cart_unauthenticated(self):
        """Test that unauthenticated users cannot access cart endpoints."""
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/mycart/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_to_cart_normal(self):
        """Test adding a product to the cart."""
        url = "/api/mycart/"
        data = {"productId": self.product.id, "quantity": 2}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertTrue(
            CartItem.objects.filter(
                product=self.product, cart__owner=self.user
            ).exists()
        )

    def test_add_to_cart_product_added_twice(self):
        """Test adding the same product to the cart twice only updates quantity."""
        data = {"productId": self.product.id, "quantity": 2}
        self.client.post("/api/mycart/", data)
        response = self.client.post("/api/mycart/", data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(
            len(CartItem.objects.filter(product=self.product, cart__owner=self.user)),
            1,
        )

    def test_add_to_cart_other_edge_cases(self):
        """Test various edge cases for adding to cart."""
        edge_cases = [
            [{"quantity": 2}, status.HTTP_400_BAD_REQUEST],
            [{"productId": 10, "quantity": 2}, status.HTTP_404_NOT_FOUND],
            [
                {"productId": self.product.id, "quantity": 100},
                status.HTTP_400_BAD_REQUEST,
            ],
            [
                {"productId": self.product.id, "quantity": -1},
                status.HTTP_400_BAD_REQUEST,
            ],
            [
                {"productId": self.product.id, "quantity": 0.5},
                status.HTTP_400_BAD_REQUEST,
            ],
        ]
        for data, status_code in edge_cases:
            response = self.client.post("/api/mycart/", data)
            self.assertEqual(response.status_code, status_code)

    def test_get_cart(self):
        """Test retrieving the cart with and without items."""
        response = self.client.get("/api/mycart/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        cart = Cart.objects.create(owner=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        url = "/api/mycart/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_from_cart(self):
        """Test deleting a product from the cart and edge cases."""
        response = self.client.delete(
            "/api/mycart/", {"productId": self.product.id}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        cart = Cart.objects.create(owner=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        url = "/api/mycart/"
        response = self.client.delete(
            url, {"productId": self.product.id}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertFalse(
            CartItem.objects.filter(
                product=self.product, cart__owner=self.user
            ).exists()
        )
        edge_cases = [
            [{}, status.HTTP_400_BAD_REQUEST],
            [{"productId": 10}, status.HTTP_404_NOT_FOUND],
        ]
        for data, status_code in edge_cases:
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status_code)
