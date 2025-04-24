from django.urls import path
from django.views.generic import RedirectView
from .views import index_view
from . import views

urlpatterns = [
    path('', RedirectView.as_view(url='python/'), name='home'),
    path('python/', index_view, name='index'),
    path('javascript/', views.javascript_editor, name='javascript_editor'),
    path('java/', views.java_editor, name='java_editor'),
    path('html/', views.html_editor, name='html_editor'),  # Новый URL

]