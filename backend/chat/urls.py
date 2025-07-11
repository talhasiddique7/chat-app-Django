from django.urls import path
from . import views

urlpatterns = [
    path('messages/<str:room_name>/', views.MessageList.as_view(), name='message-list'),
]
