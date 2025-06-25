from django.contrib import admin

from .models import CartItem, Order, OrderItem, Product, Type, catagory

admin.site.register(Product)
admin.site.register(catagory)
admin.site.register(Type)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(CartItem)
