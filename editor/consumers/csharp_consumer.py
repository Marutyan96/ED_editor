# code_editor/editor/consumers/csharp_consumer.py

import json
import subprocess
import tempfile
import os
from channels.generic.websocket import AsyncWebsocketConsumer

class CSharpConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        code = data['code']

        # Создаем временный файл в специальной директории для C#
        temp_dir = os.getenv('CSHARP_TEMP_DIR', '/tmp/csharp_temp')
        os.makedirs(temp_dir, exist_ok=True)
        
        with tempfile.NamedTemporaryFile(
            suffix='.cs',
            dir=temp_dir,
            delete=False
        ) as tmp:
            tmp.write(code.encode('utf-8'))
            tmp_path = tmp.name

        try:
            # Компиляция
            compile_process = subprocess.run(
                ['mcs', tmp_path, '-out:' + tmp_path + '.exe'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if compile_process.returncode != 0:
                await self.send(text_data=json.dumps({
                    'error': compile_process.stderr
                }))
                os.unlink(tmp_path)
                return

            # Запуск
            run_process = subprocess.run(
                ['mono', tmp_path + '.exe'],
                capture_output=True,
                text=True,
                timeout=10
            )

            await self.send(text_data=json.dumps({
                'output': run_process.stdout,
                'error': run_process.stderr
            }))

        except subprocess.TimeoutExpired:
            await self.send(text_data=json.dumps({
                'error': 'Execution time exceeded (timeout)'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))
        finally:
            # Удаляем временные файлы
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            if os.path.exists(tmp_path + '.exe'):
                os.unlink(tmp_path + '.exe')