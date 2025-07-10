# editor/routing.py
from django.urls import re_path
from .consumers import (
    PythonConsumer, 
    JSConsumer, 
    JavaConsumer, 
    c_consumer,
    cpp_consumer,
    csharp_consumer,
    php_consumer,
    go_consumer
)

websocket_urlpatterns = [
    re_path(r'ws/editor/python/$', PythonConsumer.as_asgi()),
    re_path(r'ws/editor/javascript/$', JSConsumer.as_asgi()),
    re_path(r'ws/editor/java/$', JavaConsumer.as_asgi()),
    re_path(r'ws/c/$', c_consumer.CCodeConsumer.as_asgi()),  # Обратите внимание на /c/ вместо /c
    re_path(r'ws/cpp/$', cpp_consumer.CppConsumer.as_asgi()),
    re_path(r'ws/csharp/$', csharp_consumer.CSharpConsumer.as_asgi()),
    re_path(r'ws/php/$', php_consumer.PhpConsumer.as_asgi()),  
    re_path(r'ws/go/$', go_consumer.GoConsumer.as_asgi()),  

]