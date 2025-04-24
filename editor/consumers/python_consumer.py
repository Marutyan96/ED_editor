import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import inspect
import re

class PythonConsumer(AsyncWebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.input_queue = asyncio.Queue()
        self.loop = asyncio.get_running_loop()
        self.active = False

    async def connect(self):
        await self.accept()

    async def handle_input(self, prompt):
        await self.send(json.dumps({
            'type': 'input_request',
            'prompt': prompt
        }))
        return await self.input_queue.get()

    async def send_output(self, text):
        if text.strip():
            await self.send(json.dumps({
                'type': 'output',
                'data': text
            }))

    def create_print_function(self):
        async def async_print(*args, **kwargs):
            output = " ".join(str(arg) for arg in args)
            if kwargs.get('end', '\n') != '\n':
                output += kwargs['end']
            else:
                output += '\n'
            await self.send_output(output)
        
        return lambda *a, **k: asyncio.create_task(async_print(*a, **k))

    async def execute_code(self, code):
        self.active = True
        
        # Создаем окружение для выполнения
        namespace = {
            '__builtins__': __builtins__,
            'print': self.create_print_function(),
            'input': lambda p='': asyncio.run_coroutine_threadsafe(
                self.handle_input(p), self.loop).result(),
            'asyncio': asyncio
        }

        try:
            # Преобразуем код (убираем asyncio.run())
            transformed_code = re.sub(r'asyncio\.run\(([^)]+)\)', r'\1', code)
            
            # Выполняем код
            exec(transformed_code, namespace)
            
            # Находим и запускаем все корутины
            coroutines = []
            for name, obj in namespace.items():
                if inspect.iscoroutinefunction(obj):
                    coroutines.append(obj())
                elif inspect.iscoroutine(obj):
                    coroutines.append(obj)
                elif name == 'main' and callable(obj):
                    result = obj()
                    if inspect.iscoroutine(result):
                        coroutines.append(result)
            
            if coroutines:
                await asyncio.gather(*coroutines)
                
        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'data': str(e)
            }))
        finally:
            self.active = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'user_input':
            await self.input_queue.put(data['value'])
        elif data['type'] == 'execute_code':
            await self.execute_code(data['code'])

    async def disconnect(self, close_code):
        self.active = False
        await self.input_queue.put("")