import asyncio
import inspect
import re
import json
import time as sync_time
from concurrent.futures import ThreadPoolExecutor

class PythonExecutor:
    def __init__(self, websocket):
        self.websocket = websocket
        self.input_queue = asyncio.Queue()
        self.loop = asyncio.get_event_loop()
        self.active = False
        self.thread_pool = ThreadPoolExecutor(max_workers=1)
        self._output_buffer = []
        self._output_event = asyncio.Event()

    async def handle_input(self, prompt):
        await self.send_to_ws('input_request', {'prompt': prompt})
        return await self.input_queue.get()

    async def send_to_ws(self, msg_type, data):
        await self.websocket.send(json.dumps({
            'type': msg_type,
            'data': data
        }))

    def _thread_safe_print(self, *args, **kwargs):
        """Потокобезопасная версия print()"""
        output = " ".join(str(arg) for arg in args)
        if kwargs.get('end', '\n') != '\n':
            output += kwargs['end']
        else:
            output += '\n'
        
        self._output_buffer.append(output)
        self.loop.call_soon_threadsafe(self._output_event.set)

    async def _output_handler(self):
        """Асинхронная обработка вывода из буфера"""
        while self.active:
            await self._output_event.wait()
            self._output_event.clear()
            
            while self._output_buffer:
                output = self._output_buffer.pop(0)
                await self.send_to_ws('output', output)

    async def execute(self, code):
        self.active = True
        namespace = {
            '__builtins__': __builtins__,
            'print': self._thread_safe_print,
            'input': lambda p='': asyncio.run_coroutine_threadsafe(
                self.handle_input(p), self.loop).result(),
            'asyncio': asyncio,
            'time': sync_time
        }

        # Запускаем обработчик вывода
        output_task = asyncio.create_task(self._output_handler())

        try:
            if self._is_async_code(code):
                await self._execute_async_code(code, namespace)
            else:
                await self._execute_sync_code(code, namespace)
                
        except Exception as e:
            await self.send_to_ws('error', str(e))
        finally:
            self.active = False
            output_task.cancel()
            try:
                await output_task
            except asyncio.CancelledError:
                pass

    def _is_async_code(self, code):
        return 'async def' in code or 'await ' in code

    async def _execute_async_code(self, code, namespace):
        transformed_code = re.sub(r'asyncio\.run\(([^)]+)\)', r'\1', code)
        exec(transformed_code, namespace)
        await self._run_coroutines(namespace)

    async def _execute_sync_code(self, code, namespace):
        await self.loop.run_in_executor(
            self.thread_pool,
            lambda: exec(code, namespace)
        )

    async def _run_coroutines(self, namespace):
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