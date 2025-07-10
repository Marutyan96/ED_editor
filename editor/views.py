from django.shortcuts import render
import docker
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def index_view(request):
    return render(request, 'index.html')   

def javascript_editor(request):
    return render(request, 'javascript.html')

def java_editor(request):
    return render(request, 'java.html')

def html_editor(request):
    return render(request, 'html_editor.html')

def c_editor(request):
    return render(request, 'c.html')

def cpp_editor(request):
    return render(request, 'cplusplus_editor.html')

def csharp_editor(request):
    return render(request, 'csharp_editor.html')

def php_editor(request):
    return render(request, 'php_editor.html')

def go_editor(request):
    return render(request, 'go.html')

@csrf_exempt
def run_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code', '')
        client = docker.from_client()
        try:
            container = client.containers.run(
                'python:3.9-slim',
                command=['python', '-c', code],
                detach=True,
                mem_limit='128m',
                cpu_period=100000,
                cpu_quota=50000,
                network_disabled=True
            )
            output = container.logs().decode('utf-8')
            container.remove()
            return JsonResponse({'output': output})
        except Exception as e:
            return JsonResponse({'output': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)