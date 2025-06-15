import os

from django.contrib.auth.models import User
from django.db import models


def product_image_upload_path(instance, filename):
    return f"images/{instance.type}/{filename}"


class catagory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Type(models.Model):
    name = models.CharField(max_length=100)
    catagory = models.ForeignKey(
        catagory, on_delete=models.CASCADE, related_name="types"
    )

    def __str__(self):
        return self.name


class shop(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="myshops")
    shop_name = models.CharField(max_length=100)
    loc_latitude = models.FloatField()
    loc_longitude = models.FloatField()
    loc_description = models.CharField(max_length=500, blank=True, null=True)
    delivery_support = models.BooleanField(default=False)
    del_price_per_km = models.FloatField(default=0.0)

    def __str__(self):
        return self.shop_name


class Product(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to=product_image_upload_path)
    price = models.FloatField()
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="products_owner"
    )
    type = models.ForeignKey(
        Type,
        on_delete=models.CASCADE,
        related_name="products",
    )
    stock_quantity = models.IntegerField(default=1)
    shop = models.ForeignKey(shop, on_delete=models.CASCADE, related_name="products")

    def add_stock(self, num=1):
        self.stock_quantity += num
        self.save()

    def substract_stock(self, num=1):
        self.stock_quantity -= num
        self.save()

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        # Delete the image file from the filesystem
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        # Check if this is an update (i.e., not a new instance)
        if self.pk:
            try:
                old_image = Product.objects.get(pk=self.pk).image
            except Product.DoesNotExist:
                old_image = None

            # If the image has changed, delete the old one
            if old_image and old_image != self.image:
                if os.path.isfile(old_image.path):
                    os.remove(old_image.path)

        super().save(*args, **kwargs)


class Cart(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="cart_items"
    )
    quantity = models.PositiveIntegerField(default=1)


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    STATUS_CHOICES = [
        ("P", "Processing"),
        ("S", "Shipped"),
        ("D", "Delivered"),
    ]
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="order_items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="orders"
    )
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default="P")


class Profile(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    loc_latitude = models.FloatField()
    loc_longitude = models.FloatField()
    loc_description = models.CharField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=50, blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    def __str__(self):
        return f"{self.first_name}  {self.last_name}"
