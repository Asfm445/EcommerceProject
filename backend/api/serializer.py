from django.contrib.auth.models import User
from rest_framework import serializers

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


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}


class userSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "profile"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "image", "price", "stock_quantity", "type", "shop"]
        # extra_kwargs = {"owner": {"write_only": True}}\
        depth = 1


class CartItemSerilizer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity"]
        depth = 1


class CartSerializer(serializers.ModelSerializer):
    # items = CartItemSerilizer(many=True)

    class Meta:
        model = Cart
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = OrderItem
        fields = ["id", "quantity", "product", "status"]


class OrderSerializer(serializers.ModelSerializer):
    user = userSerializer()

    class Meta:
        model = Order
        fields = ["created_at", "id", "total", "user"]


class TypeSerializer(serializers.ModelSerializer):
    # products = ProductSerializer(many=True)

    class Meta:
        model = Type
        fields = ["id", "name"]


class CatagorySerializer(serializers.ModelSerializer):
    # types = TypeSerializer(many=True)

    class Meta:
        model = catagory
        fields = "__all__"


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = shop
        fields = "__all__"
        extra_kwargs = {"owner": {"read_only": True}}

    # del_price_per_km = serializers.FloatField(required=False)
