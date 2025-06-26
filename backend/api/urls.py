from django.urls import path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter

schema_view = get_schema_view(
    openapi.Info(
        title="Ecommerce API",
        default_version="v1",
        description="API documentation for your Ecommerce project",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

from . import views

urlpatterns = [
    path("", views.productListView.as_view()),
    # path("myproducts/", views.productCreateListView.as_view(), name="product_list"),
    path("mycart/", views.AddToCart.as_view()),
    path("order/", views.CreateListOrder.as_view()),
    path("orderforseller/", views.orderForSeller.as_view()),
    path("orderitemforseller/", views.orderItemForSeller.as_view()),
    path("types/<int:id>/", views.TypeListView.as_view()),
    path("catagories/", views.catagoryListView.as_view()),
    path("profile/", views.profile.as_view()),
    path("myshops/", views.myshops.as_view()),
    path("orderitemforbuyer/", views.orderItemForBuyer.as_view()),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
router = DefaultRouter()
router.register(r"myproducts", views.ProductViewSet, basename="myproducts")
urlpatterns += router.urls
