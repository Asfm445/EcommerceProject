from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem, Product, Profile, Type, catagory


class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "image", "price", "stock_quantity", "type"]
        # extra_kwargs = {"owner": {"write_only": True}}\
        depth = 1


class CartItemSerilizer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity"]
        depth = 1


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerilizer(many=True)

    class Meta:
        model = Cart
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "quantity", "product", "status", "order"]
        depth = 1

    def __init__(self, *args, **kwargs):
        # Extract 'include_order' from kwargs, default to False
        self.include_order = kwargs.pop("include_order", False)
        super().__init__(*args, **kwargs)

    def to_representation(self, instance):
        # Get the default representation
        representation = super().to_representation(instance)

        # Conditionally include the 'order' field
        if not self.include_order:
            representation.pop("order", None)
        else:
            # Optionally customize the 'order' field representation
            representation["order"] = {
                "id": instance.order.id,
                "created_at": instance.order.created_at,
                "username": instance.order.user.username,
            }

        return representation


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["created_at", "id", "total", "order_items"]
        depth = 1

    # def create(self,data):


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


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        field = "__all__"
