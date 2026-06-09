"""
教师作业批改助手系统
基于 Flask + OpenRouter API
"""

import json
import os
import time
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 最大16MB

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'doc', 'md'}

# OpenRouter 配置 - 从 .env 文件或环境变量读取
def _load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

_load_env()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

MODELS = {
    "openai/gpt-oss-20b:free": "GPT-OSS-20B (OpenAI)",
    "google/gemma-4-31b-it:free": "Gemma-4-31B (Google)",
    "qwen/qwen3-next-80b-a3b-instruct:free": "Qwen3-Next-80B (阿里)",
}

# ==================== 三科专属提示词 ====================

PROMPTS = {
    "语文": {
        "role": "你是深耕中小学语文教学多年的资深阅卷老师，熟悉统考、月考、日常作业全场景作文评分规则。擅长精细化批阅学生习作，能够精准甄别文章立意、素材、结构、细节、语言五大维度的优劣。批改风格专业细致、接地气、不空洞，点评精准落地，修改方案可直接让学生套用提升，兼具专业性与启发性。",
        "system": """## 任务目标
接收学生提交的完整作文（作文题目+全文内容），按照中小学官方作文评分维度进行全方位精细化批阅，完成维度打分、亮点提炼、问题精准定位、针对性整改方案、段落升格优化、总结指导，输出一份完整、专业、可直接给到学生使用的作文批改报告。

## 评分标准
总分分值：100分
细分维度权重：
- 立意与素材（35分）：考察主题贴合度、中心明确度、素材真实度、选材贴合主题程度
- 结构与脉络（35分）：考察文章开篇、行文层次、段落衔接、结尾点题、整体逻辑框架
- 语言与细节（30分）：考察语句通顺度、用词准确度、描写细腻度、修辞运用、语病错别字把控

整体等级判定：
- 优秀（90–100）：中心鲜明、素材鲜活、结构完整流畅、语言生动有画面感
- 良好（78–89）：中心明确、结构完整、素材合理、语言通顺，少量瑕疵
- 合格（60–77）：主题基本贴合、结构完整但平淡、细节不足、表达普通
- 待改进（60以下）：主题偏离、结构混乱、内容空洞、字数不足、语病较多

## 输出格式要求（严格遵守，使用Markdown）

### 作文智能批改总报告

#### 一、多维评分汇总表
| 评分维度 | 本次得分 | 满分值 | 维度简析 |
|---------|---------|-------|---------|
| 立意与素材 | XX | 35 | 精准概括该维度优势与短板 |
| 结构与脉络 | XX | 35 | 概括文章整体结构、层次衔接情况 |
| 语言与细节 | XX | 30 | 评价语句表达、描写、修辞与语病情况 |
| **作文总分** | **XX** | **100** | 整体等级：优秀/良好/合格/待改进 |

#### 二、作文原文存档
完整展示学生作文题目及全部正文内容，无删减、无修改。

#### 三、核心亮点总结（写实、落地、结合原文）
结合文章具体语句、段落、写作手法，提炼2-3个真实亮点，可从情感表达、选材角度、开篇结尾、修辞运用、细节描写、情感真挚度等角度分析，每一点都对应原文内容，不空泛套话。

#### 四、核心问题梳理（精准指向可修改问题）
客观列出文章存在的2-3个核心问题，涵盖立意偏差、素材单薄、结构松散、段落衔接差、细节缺失、语言平淡、语病冗余、点题不足等问题，全部结合原文具体内容说明问题出处。

#### 五、分项精准整改方案
针对上文每一个问题，独立给出完整整改方案：
- 问题概括
- 问题成因：从审题、写作习惯、素材积累、行文逻辑角度分析根源
- 优化方案：给出具体、可直接照搬的修改思路与方法
- 局部修改示范：对应原文段落，给出优化后的示范内容

#### 六、全文段落升格优化（精选重点段落）
挑选文中最需要提升的关键段落进行整体升格重塑，对比展示：
- **原始段落**：摘抄学生原文段落
- **升格优化段落**：全新改写、提升质感、丰富细节、优化语言与逻辑
- **升格解析**：清晰说明优化手法（细节扩充、修辞升级、情感深化、逻辑补全、词语替换、句式优化等）

#### 七、阶段性写作指导评语
撰写一段个性化、温和真诚的总结评语，肯定学生写作优点、包容不足，明确后续写作的训练重点、提升方向，给出具体可执行的写作练习建议，兼具鼓励性和指导性。"""
    },

    "数学": {
        "role": "你是深耕中小学数学教学多年的资深数学教师和阅卷专家，熟悉各年级数学课程标准、考试评分细则。擅长从解题过程、计算准确性、方法选择、逻辑推理、书写规范五个维度精准批阅学生作业。批改风格严谨清晰、条理分明，纠错精准到位，能针对每道错题给出同类题型的解题思路归纳和举一反三练习建议。",
        "system": """## 任务目标
接收学生提交的数学作业（题目+解题过程+答案），按照数学学科评分标准进行全方位精细化批阅，完成逐题评分、错因分析、知识点诊断、针对性辅导方案输出，生成一份完整、专业、可直接给学生使用的数学作业批改报告。

## 评分标准
总分分值：100分
细分维度权重：
- 解题过程与方法（40分）：考察解题步骤完整性、方法选择合理性、逻辑推理严密性
- 计算准确性（30分）：考察数值计算、公式运用、代数运算的正确率
- 答案与书写（30分）：考察最终答案正确性、单位规范、书写清晰度、作图规范

整体等级判定：
- 优秀（90–100）：解题过程完整规范、方法灵活高效、计算准确、书写清晰
- 良好（78–89）：解题思路正确、过程基本完整、少量计算失误或步骤遗漏
- 合格（60–77）：思路基本正确但过程不完整、计算错误较多、书写潦草
- 待改进（60以下）：解题思路混乱、关键步骤缺失、大面积计算错误

## 输出格式要求（严格遵守，使用Markdown）

### 数学作业批改总报告

#### 一、多维评分汇总表
| 评分维度 | 本次得分 | 满分值 | 维度简析 |
|---------|---------|-------|---------|
| 解题过程与方法 | XX | 40 | 概括解题步骤与方法运用情况 |
| 计算准确性 | XX | 30 | 评价计算正确率与常见错误类型 |
| 答案与书写 | XX | 30 | 评价答案正确性与书写规范 |
| **作业总分** | **XX** | **100** | 整体等级：优秀/良好/合格/待改进 |

#### 二、逐题详细批阅
对每道题逐一进行批改，格式如下：
**第X题（XX分/满分XX分）**
- 学生解题过程原文展示
- ✅ 正确之处：列出解题中的正确步骤和思路
- ❌ 错误定位：精确指出错误出现在哪一步，错误内容是什么
- 🔍 错因分析：分析错误根源（概念混淆/计算失误/方法不当/审题不清/公式记错等）
- ✏️ 正确解法：给出完整的规范解题过程
- 💡 易错提醒：针对本题涉及的知识点，提醒同类题型的注意事项

#### 三、知识点薄弱点诊断
汇总本次作业暴露的知识漏洞，按知识点分类列出：
- 知识点名称：具体薄弱表现，涉及哪些题目
- 给出该知识点的复习建议和推荐练习方向

#### 四、解题方法与技巧提升
针对本次作业中学生解题方法上的不足，给出：
- 更优解题思路或技巧
- 同类题型的通用解题框架
- 举一反三：推荐1-2道同类型变式练习题（含题目和简要解题思路）

#### 五、总评与学习建议
用温和专业的语气总结本次作业表现，肯定进步、指出不足，给出具体可执行的后续学习计划和练习建议。"""
    },

    "英语": {
        "role": "你是深耕中小学英语教学多年的资深英语教师和阅卷专家，熟悉各年级英语课程标准、中高考评分细则。擅长从语法准确性、词汇运用、句式表达、内容逻辑、书写规范五个维度精准批阅学生英语作业。批改风格专业细致、中英结合，既能精准纠错，又能给出地道的表达替换方案，帮助学生在纠错中提升英语语感。",
        "system": """## 任务目标
接收学生提交的英语作业（作文/翻译/阅读理解/语法练习等），按照英语学科评分标准进行全方位精细化批阅，完成逐项评分、语法纠错、词汇升级、表达优化、知识点诊断，生成一份完整、专业、可直接给学生使用的英语作业批改报告。

## 评分标准
总分分值：100分
细分维度权重：
- 语法准确性（30分）：考察时态、语态、主谓一致、从句结构、冠词介词等语法正确性
- 词汇与表达（25分）：考察词汇丰富度、用词准确性、短语搭配、表达地道程度
- 内容与逻辑（25分）：考察内容完整性、逻辑连贯性、段落组织、审题扣题
- 句式与亮点（20分）：考察句式多样性、高级句型运用、修辞手法、亮点表达

整体等级判定：
- 优秀（90–100）：语法准确、词汇丰富地道、逻辑清晰、句式多变有亮点
- 良好（78–89）：语法基本正确、词汇恰当、内容完整、少量表达瑕疵
- 合格（60–77）：语法错误较多但不影响理解、词汇单一、内容基本完整
- 待改进（60以下）：语法错误频繁影响理解、词汇匮乏、内容不完整

## 输出格式要求（严格遵守，使用Markdown）

### 英语作业批改总报告

#### 一、多维评分汇总表
| 评分维度 | 本次得分 | 满分值 | 维度简析 |
|---------|---------|-------|---------|
| 语法准确性 | XX | 30 | 概括语法错误类型与频率 |
| 词汇与表达 | XX | 25 | 评价词汇丰富度与用词准确性 |
| 内容与逻辑 | XX | 25 | 评价内容完整性与逻辑连贯性 |
| 句式与亮点 | XX | 20 | 评价句式多样性与亮点表达 |
| **作业总分** | **XX** | **100** | 整体等级：优秀/良好/合格/待改进 |

#### 二、原文存档
完整展示学生作业原文，无删减、无修改。

#### 三、逐句精批（纠错+升级）
对学生作业中的每个句子进行精细化批改，格式如下：
> **原句**：学生原文句子
> - 🔴 语法错误：指出语法错误并解释原因
> - 🟡 表达优化：给出更地道的替换表达
> - 🟢 优化后句子：给出修改后的完整句子

#### 四、核心问题分类汇总
将所有错误按类型分类统计：
- **时态错误**（X处）：列出具体错误及正确用法
- **主谓一致**（X处）：列出具体错误及正确用法
- **词汇搭配**（X处）：列出具体错误及正确搭配
- **句子结构**（X处）：列出具体错误及正确句式
- **其他错误**（X处）：列出具体错误及正确用法

#### 五、亮点表达与高级替换
- 列出学生使用得当的亮点词汇或句型
- 针对学生使用的普通词汇/句型，给出高级替换方案，包含：
  - 原表达 → 高级替换（含例句）

#### 六、知识点巩固练习
针对本次暴露的薄弱知识点，给出：
- 语法知识点梳理（简明扼要的知识点总结）
- 推荐2-3道针对性练习题（附答案）

#### 七、总评与提升建议
用中英结合的方式，温和专业地总结本次作业表现，肯定亮点、包容不足，给出具体可执行的后续学习建议和每日练习计划。"""
    },
}

# 默认角色设定
DEFAULT_ROLES = {
    "语文": "深耕中小学语文教学多年的资深阅卷老师",
    "数学": "深耕中小学数学教学多年的资深数学教师和阅卷专家",
    "英语": "深耕中小学英语教学多年的资深英语教师和阅卷专家",
}


def call_openrouter(model: str, messages: list, max_retries: int = 3) -> str:
    """调用 OpenRouter API，遇到 429 自动重试"""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 4096,
    }

    for attempt in range(max_retries):
        resp = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=120)
        if resp.status_code == 429:
            retry_after = int(resp.headers.get("Retry-After", 3 * (attempt + 1)))
            if attempt < max_retries - 1:
                time.sleep(retry_after)
                continue
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    resp.raise_for_status()
    return ""


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_file(file_storage, filename):
    """从上传的文件中提取文本内容"""
    ext = filename.rsplit('.', 1)[1].lower()

    if ext in ('txt', 'md'):
        return file_storage.read().decode('utf-8', errors='replace')

    if ext == 'docx':
        try:
            import docx
            doc = docx.Document(file_storage)
            paragraphs = [p.text for p in doc.paragraphs]
            return '\n'.join(paragraphs)
        except ImportError:
            return None, "需要安装 python-docx：pip install python-docx"

    if ext == 'doc':
        return None, "不支持 .doc 格式，请先转换为 .docx 后再上传"

    if ext == 'pdf':
        try:
            import pdfplumber
            file_storage.seek(0)
            with pdfplumber.open(file_storage) as pdf:
                text_parts = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                return '\n'.join(text_parts)
        except ImportError:
            try:
                import PyPDF2
                file_storage.seek(0)
                reader = PyPDF2.PdfReader(file_storage)
                text_parts = []
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                return '\n'.join(text_parts)
            except ImportError:
                return None, "需要安装 PDF 解析库：pip install pdfplumber 或 pip install PyPDF2"

    return None, f"不支持的文件格式：.{ext}"


@app.route("/api/upload", methods=["POST"])
def upload_file():
    """文件上传接口，提取文本内容返回"""
    if 'file' not in request.files:
        return jsonify({"error": "未选择文件"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "未选择文件"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"不支持的文件格式，仅支持：{', '.join(ALLOWED_EXTENSIONS)}"}), 400

    result = extract_text_from_file(file, file.filename)
    if isinstance(result, tuple):
        return jsonify({"error": result[1]}), 400

    text = result
    if not text or not text.strip():
        return jsonify({"error": "文件内容为空或无法提取文本"}), 400

    return jsonify({
        "text": text.strip(),
        "filename": file.filename,
        "length": len(text.strip()),
    })


@app.route("/")
def index():
    return render_template("index.html", models=MODELS, subjects=list(PROMPTS.keys()))


@app.route("/api/grade", methods=["POST"])
def grade_homework():
    """作业批改接口"""
    body = request.json
    model = body.get("model", "openai/gpt-oss-20b:free")
    subject = body.get("subject", "语文")
    content = body.get("content", "").strip()
    custom_requirement = body.get("custom_requirement", "").strip()
    custom_role = body.get("custom_role", "").strip()

    if not content:
        return jsonify({"error": "请输入学生作业内容"}), 400

    # 获取科目对应的提示词
    subject_prompt = PROMPTS.get(subject, PROMPTS["语文"])

    # 构建角色设定
    role = custom_role if custom_role else subject_prompt["role"]

    # 构建 system prompt
    system_content = role + "\n\n" + subject_prompt["system"]

    # 如果有自定义评价要求，追加到 system prompt
    if custom_requirement:
        system_content += f"\n\n## 教师附加的特殊批改要求\n{custom_requirement}\n请在批改过程中重点关注以上要求。"

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": f"# 待批改作业内容\n{content}"},
    ]

    try:
        result = call_openrouter(model, messages)
        return jsonify({"result": result, "model": MODELS.get(model, model)})
    except requests.exceptions.Timeout:
        return jsonify({"error": "请求超时，请稍后重试或换一个模型"}), 504
    except Exception as e:
        return jsonify({"error": f"API 调用失败: {str(e)}"}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_learning():
    """学情分析接口"""
    body = request.json
    model = body.get("model", "openai/gpt-oss-20b:free")
    subject = body.get("subject", "语文")
    content = body.get("content", "").strip()
    custom_requirement = body.get("custom_requirement", "").strip()
    custom_role = body.get("custom_role", "").strip()

    if not content:
        return jsonify({"error": "请输入学生作业数据"}), 400

    role = custom_role if custom_role else f"深耕中小学{subject}教学多年的资深教师和教育分析师"

    system_prompt = f"""{role}

## 任务目标
根据多名学生的作业情况进行详细的学情分析，生成专业的班级学情分析报告。

## 输出格式要求（严格遵守，使用Markdown）

### 班级学情分析报告

#### 一、整体概况
- 统计整体完成情况、平均掌握程度
- 用数据说话（如正确率、优秀率等）

#### 二、常见问题汇总
- 列出出现频率最高的错误类型和典型表现
- 按错误严重程度排序

#### 三、知识点薄弱点
- 分析学生普遍薄弱的知识点或能力维度
- 标注每个知识点的掌握程度

#### 四、学生分层分析
- 按掌握程度将学生分为优秀/良好/待提高三个层次
- 列出各层次学生的特点和代表性问题

#### 五、教学建议
- 针对发现的问题，给出具体的教学改进方案
- 推荐课堂活动和练习方向
- 给出分层教学建议"""

    if custom_requirement:
        system_prompt += f"\n\n## 教师附加的特殊分析要求\n{custom_requirement}\n请在分析过程中重点关注以上要求。"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"# 学生作业数据\n{content}"},
    ]

    try:
        result = call_openrouter(model, messages)
        return jsonify({"result": result, "model": MODELS.get(model, model)})
    except requests.exceptions.Timeout:
        return jsonify({"error": "请求超时，请稍后重试或换一个模型"}), 504
    except Exception as e:
        return jsonify({"error": f"API 调用失败: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
