from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('game/', views.game_view, name='game'),
    path('game/submit/', views.submit_game, name='submit_game'),
    path('game/hint/', views.get_hint, name='get_hint'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('chat/', views.chat_view, name='chat'),
    path('chat/send/', views.send_message, name='send_message'),
    path('chat/messages/', views.get_messages, name='get_messages'),
]
