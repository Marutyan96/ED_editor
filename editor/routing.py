# editor/routing.py
from django.urls import re_path
from .consumers import PythonConsumer, JSConsumer, JavaConsumer



websocket_urlpatterns = [
    re_path(r'ws/editor/python/$', PythonConsumer.as_asgi()),
    re_path(r'ws/editor/javascript/$', JSConsumer.as_asgi()),
    re_path(r'ws/editor/java/$', JavaConsumer.as_asgi()),

]