"""抖音签名工具"""

import os
import random
import urllib.parse
from py_mini_racer import MiniRacer


class BogusUtils:
    """抖音签名工具"""
    
    def __init__(self):
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        
        # 加载 JS 签名代码
        js_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'a_bogus.js')
        with open(js_path, 'r', encoding='utf-8') as f:
            js_code = f.read()
        
        self.ctx = MiniRacer()
        self.ctx.eval(js_code)
    
    def get_abogus(self, req_url: str, user_agent: str) -> str:
        """生成 a_bogus 签名"""
        query = urllib.parse.urlparse(req_url).query
        return self.ctx.call('generate_a_bogus', query, user_agent)
    
    def get_ms_token(self, length: int = 107) -> str:
        """生成随机 ms_token"""
        base_str = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789='
        return ''.join(random.choice(base_str) for _ in range(length))
