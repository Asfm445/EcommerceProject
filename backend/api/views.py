from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import generics, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order, OrderItem, Product, Type, catagory
from .serializer import (
    CartSerializer,
    CatagorySerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
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
    serializer_class = ProductSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.all()


class productCreateListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Product.objects.filter(owner=user)

    def perform_create(self, serializer):
        data = self.request.data
        with transaction.atomic():
            if "typeId" in data:
                if Type.objects.filter(id=data["typeId"]).exists():
                    type = Type.objects.get(id=data["typeId"])
                else:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            elif "catagoryId" in data and "typeName" in data:
                if catagory.objects.filter(id=data["catagoryId"]).exists():
                    type_catagory = catagory.objects.get(id=data["catagoryId"])
                    type = Type(catagory=type_catagory, name=data["typeName"])
                    type.save()
                else:
                    return Response(
                        {"message": "catagory does not exist"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            else:
                return Response(
                    {"message": "you must provide type"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if serializer.is_valid():
                serializer.save(owner=self.request.user, type=type)
                return Response(status=status.HTTP_201_CREATED)
            else:
                # print(serializer.errors)
                return Response(serializer.errors)


class AddToCart(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not Cart.objects.filter(owner=request.user).exists():
            return Response(
                {"message": "cart does not exist"}, status=status.HTTP_404_NOT_FOUND
            )
        mycart = Cart.objects.get(owner=request.user)
        serilizer = CartSerializer(mycart)
        return Response(serilizer.data)

    def post(self, request):
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
        if "productId" not in data:
            return Response(
                {"nessage": "the data should contain product id"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Product.objects.filter(id=data["productId"]).exists():
            prod = Product.objects.get(id=data["productId"])
            if CartItem.objects.filter(product=prod, cart=cart).exists():
                cart_item = CartItem.objects.get(product=prod, cart=cart)
                cart_item.quantity = quantity
                cart_item.save()
                return Response(
                    {"message": "cart is updated"}, status=status.HTTP_202_ACCEPTED
                )
            cart_item = CartItem(product=prod, cart=cart, quantity=quantity)
            cart_item.save()
            return Response(status=status.HTTP_202_ACCEPTED)

        return Response(
            {"message": "product does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request):
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
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateListOrder(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if Order.objects.filter(user=request.user).exists():
            order = Order.objects.filter(user=request.user)
            serializer = OrderSerializer(order, many=True)
            return Response(serializer.data)
        return Response(
            {"message": "you don't have order"}, status=status.HTTP_404_NOT_FOUND
        )

    def post(self, request):
        with transaction.atomic():
            order = Order(user=request.user, total=0)
            order.save()
            if Cart.objects.filter(owner=request.user).exists():
                cart = Cart.objects.get(owner=request.user)
                items = CartItem.objects.filter(cart=cart)
                order_items = []
                for i in items:
                    order_item = OrderItem(
                        order=order, product=i.product, quantity=i.quantity
                    )
                    order_items.append(order_item)
                    order.total += i.quantity * i.product.price
                    i.delete()
                if order_items:
                    OrderItem.objects.bulk_create(order_items)
                order.save()
                return Response(
                    {"message": "cart items ordered"}, status=status.HTTP_201_CREATED
                )
            return Response(
                {"message": "you don't have cart to order from"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class orderForSeller(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = OrderItem.objects.filter(product__owner=request.user)
        serializer = OrderItemSerializer(queryset, many=True, include_order=True)
        return Response(serializer.data)

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
    serializer_class = TypeSerializer

    permission_classes = [AllowAny]

    def get_queryset(self):
        id = self.kwargs["id"]
        return Type.objects.filter(catagory__id=id)


class catagoryListView(generics.ListAPIView):
    serializer_class = CatagorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return catagory.objects.all()
