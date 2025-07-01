from django.contrib.auth.models import User
from django.db import transaction
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    Product,
    Profile,
    Type,
    catagory,
    shop,
)
from .serializer import (
    CatagorySerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
    ProfileSerializer,
    ShopSerializer,
    TypeSerializer,
    userSerializer,
)


class createUserView(generics.CreateAPIView):
    """
    API view for creating a new user.

    This view allows any user to create a new account. It uses the
    UserSerializer to validate and save the user data.
    """

    queryset = User.objects.all()
    serializer_class = userSerializer
    permission_classes = [AllowAny]


class productListView(generics.ListAPIView):
    """
    get:
    List all products with stock > 0.

    Optional query params:
        - type_id: Filter products by type.

    Returns:
        - 200: List of products.
    """

    serializer_class = ProductSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def get_queryset(self):
        type_id = self.request.query_params.get("type_id")
        queryset = Product.objects.filter(stock_quantity__gt=0)
        if type_id:
            queryset = queryset.filter(type__id=type_id)
        return queryset


class AddToCart(APIView):
    """
    get:
    Retrieve all items in the authenticated user's cart (paginated).

    post:
    Add a product to the cart or update its quantity.
    Body params:
        - productId (int, required)
        - quantity (int, optional, default=1)

    delete:
    Remove a product from the cart.
    Body params:
        - productId (int, required)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve all items in the authenticated user's cart.
        """
        if not Cart.objects.filter(owner=request.user).exists():
            return Response(
                {"message": "cart does not exist"}, status=status.HTTP_404_NOT_FOUND
            )
        cartItems = CartItem.objects.filter(cart=request.user.cart).distinct()
        paginator = PageNumberPagination()
        paginated_qs = paginator.paginate_queryset(cartItems, request)
        serializer = OrderItemSerializer(paginated_qs, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """
        Add a product to the cart or update its quantity.
        """
        data = request.data
        if Cart.objects.filter(owner=request.user).exists():
            cart = Cart.objects.get(owner=request.user)
        else:
            cart = Cart(owner=request.user)
            cart.save()
        if "quantity" in data:
            quantity = data["quantity"]
        else:
            quantity = 1
        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            raise ValidationError({"message": "invalid quantity"})
        if quantity < 1:
            raise ValidationError({"message": "invalid quantity"})
        if "productId" not in data:
            return Response(
                {"message": "the data should contain product id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Product.objects.filter(id=data["productId"]).exists():
            prod = Product.objects.get(id=data["productId"])
            if CartItem.objects.filter(product=prod, cart=cart).exists():
                if prod.stock_quantity < quantity:
                    return Response(
                        {"message": "there is not enough stock"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                cart_item = CartItem.objects.get(product=prod, cart=cart)
                cart_item.quantity = quantity
                cart_item.save()
                return Response(
                    {"message": "cart is updated"}, status=status.HTTP_202_ACCEPTED
                )
            if prod.stock_quantity < quantity:
                return Response(
                    {"message": "there is not enough stock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item = CartItem(product=prod, cart=cart, quantity=quantity)
            cart_item.save()
            return Response(status=status.HTTP_202_ACCEPTED)

        return Response(
            {"message": "product does not exist"},
            status=status.HTTP_404_NOT_FOUND,
        )

    def delete(self, request):
        """
        Remove a product from the cart.
        """
        data = request.data
        if "productId" not in data:
            return Response(
                {"message": "product id must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Cart.objects.filter(owner=request.user).exists():
            cart = Cart.objects.get(owner=request.user)
            if CartItem.objects.filter(
                cart=cart, product__id=data["productId"]
            ).exists():
                cart_item = CartItem.objects.get(
                    cart=cart, product__id=data["productId"]
                )
                cart_item.delete()
                return Response(status=status.HTTP_202_ACCEPTED)
            return Response(
                {"message": "cart item not found"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            {"message": "you don't have cart to delete from"},
            status=status.HTTP_404_NOT_FOUND,
        )


class CreateListOrder(generics.ListCreateAPIView):
    """
    get:
    List all orders for the authenticated user.

    post:
    Create a new order from the user's cart.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        """
        List all orders for the authenticated user.
        """
        return Order.objects.filter(user=self.request.user)

    def post(self, request):
        """
        Create a new order from the user's cart.
        """
        with transaction.atomic():
            order = Order(user=request.user, total=0)
            order.save()
            if Cart.objects.filter(owner=request.user).exists():
                cart = Cart.objects.get(owner=request.user)
                items = CartItem.objects.filter(cart=cart)
                order_items = []
                for i in items:
                    if i.product.stock_quantity >= i.quantity:
                        i.product.stock_quantity -= i.quantity
                        i.product.save()
                        order_item = OrderItem(
                            order=order, product=i.product, quantity=i.quantity
                        )
                        order_items.append(order_item)
                        order.total += i.quantity * i.product.price
                        i.delete()
                # print(len(order_items))
                if order_items:
                    OrderItem.objects.bulk_create(order_items)
                else:
                    raise ValidationError({"message": "your cart does not have items"})
                order.save()
                return Response(
                    {"message": "cart items ordered"}, status=status.HTTP_201_CREATED
                )
            raise ValidationError({"message": "you don't have cart to order from"})


class orderItemForBuyer(generics.ListAPIView):
    """
    get:
    List all order items for a specific order (buyer view).

    Query params:
        - order_id (int, required): The order to retrieve items for.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = OrderItemSerializer

    def get_queryset(self):
        """
        List all order items for a specific order.
        """
        order_id = self.request.query_params.get("order_id")
        if not order_id:
            return Response(
                {"message": "provide an order id"}, status=status.HTTP_400_BAD_REQUEST
            )
        return OrderItem.objects.filter(order__id=order_id)


class orderForSeller(generics.ListAPIView):
    """
    API view to list all orders for a seller's shop.

    Requires authentication.
    Query params:
        - shop_id: ID of the shop to filter orders.
    Returns:
        - Paginated list of orders for the given shop.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        shop_id = self.request.query_params.get("shop_id")
        if not shop_id:
            return Response(
                {"message": "provide shop id"}, status=status.HTTP_400_BAD_REQUEST
            )
        return Order.objects.filter(order_items__product__shop_id=shop_id).distinct()


class orderItemForSeller(APIView):
    """
    API view to list and update order items for a seller's shop.

    GET:
        - Query params:
            - shop_id: ID of the shop (required)
            - order_id: ID of the order (optional, filters items by order)
        - Returns paginated order items for the shop (optionally filtered by order).

    PATCH:
        - Request body must include 'id' of the order item to update.
        - Partially updates the order item.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop_id = request.query_params.get("shop_id")
        order_id = request.query_params.get("order_id")
        queryset = OrderItem.objects.filter(product__shop__id=shop_id)
        if order_id:
            queryset = queryset.filter(order__id=order_id)
        paginator = PageNumberPagination()
        paginated_qs = paginator.paginate_queryset(queryset, request)
        serializer = OrderItemSerializer(paginated_qs, many=True)
        return paginator.get_paginated_response(serializer.data)

    def patch(self, request):
        if "id" not in request.data:
            return Response(
                {"message": "order id must provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if OrderItem.objects.filter(id=request.data["id"]).exists():
            order = OrderItem.objects.get(id=request.data["id"])
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serilizer = OrderItemSerializer(order, data=request.data, partial=True)
        if serilizer.is_valid():
            serilizer.save()
            return Response(status=status.HTTP_202_ACCEPTED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class TypeListView(generics.ListAPIView):
    """
    API view to list all types for a given category.

    Query params:
        - id: ID of the category (from URL kwargs)
    Returns:
        - List of types for the given category.
    """

    serializer_class = TypeSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        id = self.kwargs["id"]
        return Type.objects.filter(catagory__id=id)


class catagoryListView(generics.ListAPIView):
    """
    API view to list all categories.

    Returns:
        - List of all categories.
    """

    serializer_class = CatagorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return catagory.objects.all()


class profile(APIView):
    """
    API view to get or create/update the user's profile.

    GET:
        - Returns the authenticated user's profile.

    POST:
        - Creates or updates the user's profile with provided data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            prof = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(prof)
            return Response(serializer.data)
        except Exception:
            return Response(
                {"message": "profile did not created yet!"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def post(self, request):
        data = request.data
        usr = request.user
        serializer = ProfileSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=usr)
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors)


class myshops(APIView):
    """
    API view to list or create shops for the authenticated user.

    GET:
        - Returns all shops owned by the user.

    POST:
        - Creates a new shop for the user with provided data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        usr = request.user
        obj = shop.objects.filter(owner=usr)
        serializer = ShopSerializer(obj, many=True)
        return Response(serializer.data)

    def post(self, request):
        usr = request.user
        data = request.data
        serializer = ShopSerializer(data=data)
        print(serializer)
        if serializer.is_valid():
            serializer.save(owner=usr)
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products.

    - Lists products for the authenticated user (optionally filtered by shop).
    - Allows creation, partial update, and deletion of products.
    - Handles type and shop assignment logic.
    """

    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        shop_id = self.request.query_params.get("shop_id")
        queryset = Product.objects.filter(owner=user)
        if shop_id:
            queryset = queryset.filter(shop__id=shop_id)
        return queryset

    @swagger_auto_schema(
        operation_description="List all products for the authenticated user (optionally filtered by shop).",
        manual_parameters=[
            openapi.Parameter(
                "shop_id",
                openapi.IN_QUERY,
                description="Shop ID to filter products",
                type=openapi.TYPE_INTEGER,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new product.",
        request_body=ProductSerializer,
        responses={201: ProductSerializer},
    )
    def create(self, request):
        data = request.data
        # Handle type and shop logic as before
        if "typeId" in data:
            try:
                type_obj = Type.objects.get(id=data["typeId"])
            except Type.DoesNotExist:
                return Response(
                    {"message": "type not found"}, status=status.HTTP_404_NOT_FOUND
                )
        elif "catagoryId" in data and "typeName" in data:
            try:
                type_catagory = catagory.objects.get(id=data["catagoryId"])
                type_obj = Type.objects.create(
                    catagory=type_catagory, name=data["typeName"]
                )
            except catagory.DoesNotExist:
                return Response(
                    {"message": "catagory does not exist"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"message": "you must provide type"}, status=status.HTTP_400_BAD_REQUEST
            )

        if "shop_id" in data and shop.objects.filter(id=data["shop_id"]).exists():
            this_shop = shop.objects.get(id=data["shop_id"])
        else:
            return Response(
                {"message": "shop not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user, type=type_obj, shop=this_shop)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        data = request.data
        instance = self.get_object()
        type_obj = None
        if "typeId" in data:
            try:
                type_obj = Type.objects.get(id=data["typeId"])
            except Type.DoesNotExist:
                return Response(
                    {"message": "type not found"}, status=status.HTTP_404_NOT_FOUND
                )
        elif "catagoryId" in data and "typeName" in data:
            try:
                type_catagory = catagory.objects.get(id=data["catagoryId"])
                type_obj = Type.objects.create(
                    catagory=type_catagory, name=data["typeName"]
                )
            except catagory.DoesNotExist:
                return Response(
                    {"message": "catagory does not exist"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            if type_obj:
                serializer.save(type=type_obj)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
