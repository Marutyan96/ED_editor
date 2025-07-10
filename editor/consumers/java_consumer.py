import json
import os
import subprocess
import uuid
import shutil
import re
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings

class JavaConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received message: {data}")
        if data['type'] == 'execute':
            code = data['code']
            message_id = data['messageId']
            result = await self.execute_java_code(code)
            response = {'messageId': message_id, 'message': result}
            print(f"Sending response: {response}")
            await self.send(text_data=json.dumps(response))

    async def execute_java_code(self, code):
        base_tmp_dir = settings.JAVA_TMP_DIR or '/tmp/java'
        execution_id = str(uuid.uuid4())
        tmp_dir = os.path.join(base_tmp_dir, execution_id)
        
        try:
            # Определяем имя класса с main()
            class_name = self.detect_main_class(code)
            if not class_name:
                return "Error: No class with main() method found"
            
            java_file = os.path.join(tmp_dir, f"{class_name}.java")
            print(f"Creating directory: {tmp_dir}")
            os.makedirs(tmp_dir, exist_ok=True)
            
            print(f"Writing code to: {java_file}")
            with open(java_file, 'w') as f:
                f.write(code)

            # Компиляция
            print(f"Compilation command: javac {java_file}")
            compile_process = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True,
                cwd=tmp_dir
            )
            
            print(f"Compilation return code: {compile_process.returncode}")
            if compile_process.returncode != 0:
                error_msg = compile_process.stderr or compile_process.stdout
                # Убираем из ошибки абсолютный путь к файлу, оставляя только имя файла
                error_msg = re.sub(rf'{re.escape(tmp_dir)}/', '', error_msg)
                return f"Compilation error:\n{error_msg}"

            # Запуск программы
            print(f"Running: java -cp {tmp_dir} {class_name}")
            run_process = subprocess.run(
                ["java", "-cp", tmp_dir, class_name],
                capture_output=True,
                text=True
            )
            
            print(f"Execution output: {run_process.stdout}")
            if run_process.returncode != 0:
                error_msg = run_process.stderr or run_process.stdout
                return f"Runtime error:\n{error_msg}"

            return run_process.stdout or "Program executed with no output"

        except Exception as e:
            print(f"Exception: {str(e)}")
            return f"Error: {str(e)}"

        finally:
            print(f"Deleting: {tmp_dir}")
            if os.path.exists(tmp_dir):
                shutil.rmtree(tmp_dir, ignore_errors=True)

    def detect_main_class(self, code):
        """
        Определяет имя класса с методом main()
        """
        class_pattern = r'public\s+class\s+(\w+)\s*{[^}]*public\s+static\s+void\s+main\s*\([^)]*\)'
        match = re.search(class_pattern, code, re.DOTALL)
        if match:
            return match.group(1)
        
        class_pattern = r'class\s+(\w+)\s*{[^}]*public\s+static\s+void\s+main\s*\([^)]*\)'
        match = re.search(class_pattern, code, re.DOTALL)
        if match:
            return match.group(1)
        
        return None
