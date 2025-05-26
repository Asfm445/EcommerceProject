from django.urls import path

from . import views

urlpatterns = [
    path("", views.productListView.as_view()),
    path("myproducts/", views.productCreateListView.as_view(), name="product_list"),
    path("mycart/", views.AddToCart.as_view()),
    path("order/", views.CreateListOrder.as_view()),
    path("orderforseller/", views.orderForSeller.as_view()),
    path("types/<int:id>/", views.TypeListView.as_view()),
    path("catagories/", views.catagoryListView.as_view()),
]
