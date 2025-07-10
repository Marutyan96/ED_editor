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
    path('c/', views.c_editor, name='c_editor'),
    path('cpp/', views.cpp_editor, name='cpp_editor'),
    path('csharp/', views.csharp_editor, name='csharp_editor'),
    path('php/', views.php_editor, name='php_editor'),
    path('go/', views.go_editor, name='go_editor'),

]