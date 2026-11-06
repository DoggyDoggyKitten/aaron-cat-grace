"""
Module 2: Script Generation
Calls DeepSeek V3 to turn a list of jokes into a full 3-host dialogue script.
"""

import json
import os
import re
import time

from openai import OpenAI

from config.settings import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
    DEEPSEEK_TEMPERATURE,
    DEEPSEEK_MAX_TOKENS,
    OUTPUT_SCRIPT_DIR,
)


SYSTEM_PROMPT = """你是一个中文播客节目的AI剧本生成器。这档节目叫做《Aaron Cat and Grace》，有三位固定主持人，每期节目包含三个谐音梗，每位主持人讲一个，另外两位负责反应。

===== 三位主持人的人设 =====

【Aaron】
- 年龄：20-30岁，男生
- 性格：非常有活力，充满激情，说话语速快，喜欢用感叹号和叠词。讲到梗的时候会超级兴奋。会说一些年轻人的网络用语，比如"绝绝子"、"太上头了"。
- 说话风格示例："哇！！这个梗也太厉害了吧！我当时听到直接原地起飞！！"

【Grace】
- 年龄：30-40岁，女生
- 性格：冷幽默，语气永远淡淡的、冷冷的。她的吐槽是她最大的武器，经常用一句话直接戳穿一切。她不笑，但说的话让别人笑。
- 说话风格示例："……嗯。我现在的表情叫做：听懂了，但是不想笑。"

【Cat】
- 年龄：40-50岁，是一只猫，但有丰富的人生阅历
- 性格：谐音梗是猫的天赋，每次都能找到意想不到的谐音角度。同时非常喜欢在梗的结尾升华出人生哲理，一本正经地讲道理，让人哭笑不得。
- 说话风格示例："这个梗让我想到——人生，就像谐音梗，有时候差一个音，就是另一种命运。"

===== 节目结构 =====

每期节目分为两部分：

【第一部分：开场自我介绍】
segment 值为 "intro"，三位主持人依次简短介绍自己，顺序为 Aaron → Grace → Cat。
要求：
- 每人只说1-2句，简洁有趣，符合各自性格
- Aaron 的介绍要充满激情，带出节目名称《Aaron Cat and Grace》
- Grace 的介绍要冷淡，带一点自嘲
- Cat 的介绍要一本正经，顺便说一句人生哲理
- 整个 intro 控制在4-6句台词以内

【第二部分：谐音梗主体】
共三轮，每轮由一位主持人讲一个谐音梗，另外两位反应。
每轮的节奏建议如下：
- 讲梗人先做铺垫（1-2句），制造悬念
- 其他人可以在揭晓前插嘴猜测或追问
- 揭晓谜底后，先有一个短暂反应（1-3字的短句），再展开吐槽或升华
- 最后由 Cat 或 Grace 用一句话收尾，自然过渡到下一个梗

===== 对话自然度要求（非常重要）=====

这是一档轻松闲聊播客，三个人像朋友聊天，不是正式节目轮流发言。

1. 不强制轮流：同一个人可以连续出现2-3行，不需要每句话换人说。
2. 使用短句制造节奏感：笑点前后可以用1-5字的短句，例如：
   "等等。" / "哈？" / "不是吧。" / "……" / "这也行？" / "我就说嘛！"
3. 打断接话：用"——"结尾表示话没说完被打断，下一行由另一人接上。
4. 追问和反问：Aaron可以追问，Grace可以反问，Cat可以自言自语后被打断。
5. 发言长短不一：有时一句话很长，有时只有两三个字，避免每行长度差不多。
6. 每个segment里至少有一次两人连续对同一句话快速反应的情况。

===== 输出格式（严格遵守）=====

输出一个JSON数组，每个元素是一句台词：
[
  {
    "speaker": "Aaron / Grace / Cat",
    "text": "台词内容（纯中文，不含括号动作描述）",
    "emotion": "excited / dry / philosophical / laughing / teasing / normal",
    "segment": "intro / joke_1 / joke_2 / joke_3"
  }
]

===== 情感表达规范（严格遵守）=====

禁止在任何台词中出现"哈哈"、"哈哈哈"、"嘻嘻"、"呵呵"等笑声文字。
情感必须通过语言本身传达，具体替换方式如下：

- 笑到不行 → "不行了！"、"我真的不行了！！"、"绝了绝了！！"
- 无语/尴尬 → "……好。"、"我决定假装没听见。"、"行吧。"、"我无话可说。"
- 惊讶 → "等等等等——"、"这也行？"、"不是吧。"、"什么？！"
- 憋笑 → "嗯……"、"有点东西。"、"我承认……还挺好笑的。"
- 嘲笑/反讽（Grace专用） → "哦。"、"好厉害。"、"真的很有创意。"（语气冷淡）
- 捧场（Aaron专用） → "太强了！！"、"这个我要记下来！！"

===== 硬性规则 =====

1. 全程中文，口语化自然
2. 每个segment至少7句台词
3. 总台词数25-35句
4. Grace台词不用感叹号，只用句号
5. Aaron台词必须包含至少一个感叹号
6. Cat每个segment至少一句人生哲理
7. 任何台词中不得出现笑声文字（哈哈、嘻嘻等）
8. 禁止使用省略号（...或……），停顿感用短句和句号表达，例如用"好。"代替"……好。"，用"等等。"代替"……等等……"
9. 只输出JSON数组，不要markdown代码块或任何额外说明"""


def build_user_prompt(jokes: list[dict]) -> str:
    lines = ["请根据以下三个谐音梗，生成本期节目的完整剧本。\n"]
    for i, joke in enumerate(jokes, 1):
        lines.append(f"【第{i}个梗】由 {joke['host']} 讲解")
        lines.append(f"  铺垫：{joke['setup']}")
        lines.append(f"  谜底：{joke['punchline']}")
        lines.append(f"  谐音说明：{joke['homophone_note']}\n")
    lines.append("请现在生成完整的JSON剧本数组。")
    return "\n".join(lines)


def call_deepseek(system_prompt: str, user_prompt: str, extra_messages: list = None) -> str:
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
    messages = [{"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}]
    if extra_messages:
        messages.extend(extra_messages)
    response = client.chat.completions.create(
        model=DEEPSEEK_MODEL,
        messages=messages,
        temperature=DEEPSEEK_TEMPERATURE,
        max_tokens=DEEPSEEK_MAX_TOKENS,
        stream=False,
    )
    return response.choices[0].message.content


def parse_script(raw: str) -> list[dict]:
    # Strip markdown code block wrappers if present
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    script = json.loads(cleaned)
    if not isinstance(script, list):
        raise ValueError("Expected a JSON array from DeepSeek")
    for line in script:
        for field in ("speaker", "text", "emotion", "segment"):
            if field not in line:
                raise ValueError(f"Missing field '{field}' in line: {line}")
    return script


def generate_script(jokes: list[dict]) -> list[dict]:
    user_prompt = build_user_prompt(jokes)

    for attempt in range(2):
        try:
            extra = None
            if attempt == 1:
                extra = [{"role": "assistant", "content": ""},
                         {"role": "user", "content": "请修正你的输出，只返回合法的JSON数组，不要任何额外说明。"}]
            raw = call_deepseek(SYSTEM_PROMPT, user_prompt, extra)
            return parse_script(raw)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"[Module 2] Attempt {attempt + 1} failed: {e}")
            if attempt == 1:
                raise RuntimeError("DeepSeek returned invalid JSON after 2 attempts.") from e
            time.sleep(1)

    raise RuntimeError("Script generation failed.")


def save_script(script: list[dict], episode_id: str) -> str:
    os.makedirs(OUTPUT_SCRIPT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_SCRIPT_DIR, f"{episode_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)
    return path
