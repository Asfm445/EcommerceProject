from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import generics, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view
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
    CartSerializer,
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
    serializer_class = ProductSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def get_queryset(self):
        type_id = self.request.query_params.get("type_id")
        queryset = Product.objects.filter(stock_quantity__gt=0)
        if type_id:
            queryset = queryset.filter(type__id=type_id)
        return queryset


class productCreateListView(generics.GenericAPIView):
    serializer_class = ProductSerializer

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        shop_id = self.request.query_params.get("shop_id")
        if not shop_id:
            return Response(
                {"message": "shop must provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        products = Product.objects.filter(owner=user, shop__id=shop_id)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        print(data)
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
            if "shop_id" in data and shop.objects.filter(id=data["shop_id"]).exists():
                this_shop = shop.objects.get(id=data["shop_id"])
            else:
                return Response(
                    {"message": "shop not found"}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = self.get_serializer(data=data)
            print(serializer)
            if serializer.is_valid():
                serializer.save(owner=self.request.user, type=type, shop=this_shop)
                return Response(status=status.HTTP_201_CREATED)
            else:
                # print(serializer.errors)
                return Response(serializer.errors)

    def patch(self, request):
        data = request.data
        print(data)
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
                type = None
            obj = Product.objects.get(id=data["id"])
            serializer = self.get_serializer(obj, data=data, partial=True)
            print(serializer)
            if serializer.is_valid():
                print("sjhghgfhdgfdh")
                if type:
                    serializer.save(type=type)
                else:
                    serializer.save()

                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
            else:
                # print(serializer.errors)
                return Response(serializer.errors)

    def delete(self, request):
        product_id = request.query_params.get("productId")
        print(product_id)
        if product_id:
            product = Product.objects.get(id=product_id, owner=request.user)
            if product:
                product.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(
            {"message": "you have to provide productId"},
            status=status.HTTP_400_BAD_REQUEST,
        )


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
        with transaction.atomic():
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
                    if prod.stock_quantity < quantity - cart_item.quantity:
                        return Response(
                            {"message": "there is not enough stock"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    prod.substract_stock(quantity - cart_item.quantity)
                    prod.save()
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
                prod.substract_stock(quantity)
                prod.save()
                cart_item = CartItem(product=prod, cart=cart, quantity=quantity)
                cart_item.save()
                return Response(status=status.HTTP_202_ACCEPTED)

            return Response(
                {"message": "product does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
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
        shop_id = request.query_params.get("shop_id")
        if not shop_id:
            return Response(
                {"message": "provide shop id"}, status=status.HTTP_400_BAD_REQUEST
            )
        queryset = OrderItem.objects.filter(
            product__owner=request.user, product__shop__id=shop_id
        )
        serializer = OrderItemSerializer(
            queryset, many=True, context={"include_order": True}
        )
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
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        id = self.kwargs["id"]
        return Type.objects.filter(catagory__id=id)


class catagoryListView(generics.ListAPIView):
    serializer_class = CatagorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return catagory.objects.all()


class profile(APIView):
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
