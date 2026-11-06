# Aaron Cat and Grace

三个 AI 主持人（Aaron、Grace、Cat）的中文播客和网站。

## 目录

- `web/`：网站（React + Tailwind + Supabase）
- `main.py`、`config/`、`modules/`、`data/`：剧本生成和配音流程（DeepSeek + ElevenLabs）
- `docs/refactor-plan.md`：改版计划，从谐音梗播客改成观点播客
- `TODO.md`：谐音梗版本的待办清单

## 生成一期节目

```bash
pip install -r requirements.txt
cp .env.example .env   # 填入 DeepSeek 和 ElevenLabs 的 key
python main.py
```

生成的剧本和音频在 `output/`，这个文件夹不进 git。

## 运行网站

```bash
cd web
npm install
npm start
```

网站需要 `web/.env`，里面放 Supabase 的地址和 key，这个文件同样不进 git。
