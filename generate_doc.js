const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents, Bookmark
} = require("docx");

// ===== 样式常量 =====
const BLUE = "2E5090";
const LIGHT_BLUE = "D6E4F0";
const DARK = "333333";
const GRAY = "666666";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

// ===== 辅助函数 =====
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  const runOpts = { text, font: "Microsoft YaHei", size: 22, color: DARK, ...opts };
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun(runOpts)],
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    alignment: opts.align || AlignmentType.LEFT,
    ...opts,
    children: runs.map(r => new TextRun({ font: "Microsoft YaHei", size: 22, color: DARK, ...r })),
  });
}

function bullet(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80, line: 340 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 22, color: DARK })],
  });
}

function numbered(text, ref = "numbers", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80, line: 340 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 22, color: DARK })],
  });
}

function headerCell(text, width) {
  return new TableCell({
    borders: BORDERS,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 20, color: "FFFFFF" })],
    })],
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders: BORDERS,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: CELL_MARGINS,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text, font: "Microsoft YaHei", size: 20, color: opts.color || DARK, bold: opts.bold })],
    })],
  });
}

function spacer(height = 200) {
  return new Paragraph({ spacing: { after: height }, children: [] });
}

// ===== 文档内容 =====
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Microsoft YaHei", size: 22, color: DARK } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: BLUE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Microsoft YaHei", color: BLUE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Microsoft YaHei", color: "3B6CB5" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers2",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ==================== 封面 ====================
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        spacer(3000),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "教师作业批改助手系统", font: "Microsoft YaHei", size: 56, bold: true, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "AI Smart Homework Grading Assistant", font: "Microsoft YaHei", size: 28, color: GRAY })],
        }),
        spacer(600),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 1 } },
          children: [],
        }),
        spacer(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "产 品 说 明 书", font: "Microsoft YaHei", size: 40, bold: true, color: BLUE })],
        }),
        spacer(1200),
        richPara([
          { text: "版本号：V1.0", size: 22, color: GRAY },
        ], { align: AlignmentType.CENTER }),
        richPara([
          { text: "发布日期：2026年6月", size: 22, color: GRAY },
        ], { align: AlignmentType.CENTER }),
        richPara([
          { text: "技术栈：Python Flask + OpenRouter API + HTML5", size: 22, color: GRAY },
        ], { align: AlignmentType.CENTER }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ==================== 正文 ====================
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 1 } },
            children: [new TextRun({ text: "教师作业批改助手系统 - 产品说明书", font: "Microsoft YaHei", size: 16, color: GRAY })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 1 } },
            children: [
              new TextRun({ text: "- ", font: "Microsoft YaHei", size: 16, color: GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16, color: GRAY }),
              new TextRun({ text: " -", font: "Microsoft YaHei", size: 16, color: GRAY }),
            ],
          })],
        }),
      },
      children: [
        // ===== 目录 =====
        heading("目  录"),
        new TableOfContents("", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第一章：产品概述 ====================
        heading("第一章  产品概述"),

        heading("1.1 产品简介", HeadingLevel.HEADING_2),
        para("教师作业批改助手系统是一款基于人工智能技术的智能教育辅助工具，旨在帮助中小学教师高效完成作业批改和学情分析工作。系统集成了多个先进的大语言模型（LLM），通过精心设计的学科专属提示词，为语文、数学、英语三科提供专业、细致、可落地的作业批改服务。"),
        para("系统采用 B/S 架构，教师只需通过浏览器访问即可使用，无需安装任何软件。支持多模型自由切换，教师可根据需求选择最适合的 AI 模型进行批改。"),

        heading("1.2 核心价值", HeadingLevel.HEADING_2),
        bullet("效率提升：将传统人工批改数小时的工作压缩至分钟级别完成"),
        bullet("专业输出：每科配备资深教师角色设定和精细化评分维度，批改报告专业可落地"),
        bullet("学情洞察：支持批量作业分析，自动生成班级学情报告和教学建议"),
        bullet("灵活定制：支持自定义角色设定和评价要求，满足不同教学场景需求"),
        bullet("零门槛使用：浏览器直接访问，无需安装部署"),

        heading("1.3 系统访问地址", HeadingLevel.HEADING_2),
        richPara([
          { text: "AI Agent 在线访问链接：", bold: true, size: 24 },
        ]),
        new Paragraph({
          spacing: { after: 200 },
          children: [new ExternalHyperlink({
            children: [new TextRun({ text: "http://localhost:5000", style: "Hyperlink", size: 24, font: "Microsoft YaHei" })],
            link: "http://localhost:5000",
          })],
        }),
        para("（注：当前为本地部署版本，教师在本机浏览器中访问即可使用。如需局域网内其他设备访问，请将 localhost 替换为本机 IP 地址。）"),

        heading("1.4 技术架构", HeadingLevel.HEADING_2),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2500, 6526],
          rows: [
            new TableRow({ children: [headerCell("组件", 2500), headerCell("技术说明", 6526)] }),
            new TableRow({ children: [cell("后端框架", 2500, { shading: LIGHT_BLUE }), cell("Python Flask - 轻量级 Web 框架", 6526)] }),
            new TableRow({ children: [cell("前端技术", 2500, { shading: LIGHT_BLUE }), cell("HTML5 + CSS3 + JavaScript（原生，无框架依赖）", 6526)] }),
            new TableRow({ children: [cell("AI 引擎", 2500, { shading: LIGHT_BLUE }), cell("OpenRouter API（统一多模型调用网关）", 6526)] }),
            new TableRow({ children: [cell("可用模型", 2500, { shading: LIGHT_BLUE }), cell("GPT-OSS-20B / Gemma-4-31B / Qwen3-Next-80B（均为免费模型）", 6526)] }),
            new TableRow({ children: [cell("覆盖学科", 2500, { shading: LIGHT_BLUE }), cell("语文、数学、英语", 6526)] }),
            new TableRow({ children: [cell("核心功能", 2500, { shading: LIGHT_BLUE }), cell("智能作业批改、班级学情分析", 6526)] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第二章：功能模块详解 ====================
        heading("第二章  功能模块详解"),

        heading("2.1 作业批改模块", HeadingLevel.HEADING_2),

        heading("2.1.1 语文作文批改", HeadingLevel.HEADING_3),
        para("语文批改模块采用资深阅卷教师角色设定，针对中小学作文进行全方位精细化批阅。系统从三大维度进行评分："),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2200, 1200, 5626],
          rows: [
            new TableRow({ children: [headerCell("评分维度", 2200), headerCell("满分值", 1200), headerCell("考察要点", 5626)] }),
            new TableRow({ children: [cell("立意与素材", 2200, { shading: LIGHT_BLUE }), cell("35分", 1200, { align: AlignmentType.CENTER }), cell("主题贴合度、中心明确度、素材真实度、选材贴合主题程度", 5626)] }),
            new TableRow({ children: [cell("结构与脉络", 2200, { shading: LIGHT_BLUE }), cell("35分", 1200, { align: AlignmentType.CENTER }), cell("开篇吸引力、行文层次、段落衔接、结尾点题、整体逻辑框架", 5626)] }),
            new TableRow({ children: [cell("语言与细节", 2200, { shading: LIGHT_BLUE }), cell("30分", 1200, { align: AlignmentType.CENTER }), cell("语句通顺度、用词准确度、描写细腻度、修辞运用、语病错别字", 5626)] }),
          ],
        }),
        spacer(100),
        para("批改报告包含七大板块：多维评分汇总表、作文原文存档、核心亮点总结、核心问题梳理、分项精准整改方案（含局部修改示范）、重点段落升格优化（原文与升格对比）、阶段性写作指导评语。"),

        heading("2.1.2 数学作业批改", HeadingLevel.HEADING_3),
        para("数学批改模块采用资深数学教师和阅卷专家角色设定，注重解题过程的完整性和逻辑性。评分维度如下："),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2200, 1200, 5626],
          rows: [
            new TableRow({ children: [headerCell("评分维度", 2200), headerCell("满分值", 1200), headerCell("考察要点", 5626)] }),
            new TableRow({ children: [cell("解题过程与方法", 2200, { shading: LIGHT_BLUE }), cell("40分", 1200, { align: AlignmentType.CENTER }), cell("解题步骤完整性、方法选择合理性、逻辑推理严密性", 5626)] }),
            new TableRow({ children: [cell("计算准确性", 2200, { shading: LIGHT_BLUE }), cell("30分", 1200, { align: AlignmentType.CENTER }), cell("数值计算、公式运用、代数运算的正确率", 5626)] }),
            new TableRow({ children: [cell("答案与书写", 2200, { shading: LIGHT_BLUE }), cell("30分", 1200, { align: AlignmentType.CENTER }), cell("最终答案正确性、单位规范、书写清晰度", 5626)] }),
          ],
        }),
        spacer(100),
        para("批改报告包含五大板块：多维评分汇总表、逐题详细批阅（含错因分析和正确解法）、知识点薄弱点诊断、解题方法与技巧提升（含举一反三变式题）、总评与学习建议。"),

        heading("2.1.3 英语作业批改", HeadingLevel.HEADING_3),
        para("英语批改模块采用资深英语教师和阅卷专家角色设定，中英结合批改，精准纠错的同时给出地道表达替换方案。评分维度如下："),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2200, 1200, 5626],
          rows: [
            new TableRow({ children: [headerCell("评分维度", 2200), headerCell("满分值", 1200), headerCell("考察要点", 5626)] }),
            new TableRow({ children: [cell("语法准确性", 2200, { shading: LIGHT_BLUE }), cell("30分", 1200, { align: AlignmentType.CENTER }), cell("时态、语态、主谓一致、从句结构、冠词介词等", 5626)] }),
            new TableRow({ children: [cell("词汇与表达", 2200, { shading: LIGHT_BLUE }), cell("25分", 1200, { align: AlignmentType.CENTER }), cell("词汇丰富度、用词准确性、短语搭配、表达地道程度", 5626)] }),
            new TableRow({ children: [cell("内容与逻辑", 2200, { shading: LIGHT_BLUE }), cell("25分", 1200, { align: AlignmentType.CENTER }), cell("内容完整性、逻辑连贯性、段落组织、审题扣题", 5626)] }),
            new TableRow({ children: [cell("句式与亮点", 2200, { shading: LIGHT_BLUE }), cell("20分", 1200, { align: AlignmentType.CENTER }), cell("句式多样性、高级句型运用、修辞手法", 5626)] }),
          ],
        }),
        spacer(100),
        para("批改报告包含七大板块：多维评分汇总表、原文存档、逐句精批（纠错+升级）、核心问题分类汇总、亮点表达与高级替换方案、知识点巩固练习（含练习题）、总评与提升建议。"),

        heading("2.2 学情分析模块", HeadingLevel.HEADING_2),
        para("学情分析模块支持教师批量输入多份学生作业数据，系统自动进行横向对比分析，生成班级整体学情报告。分析报告包含以下内容："),
        bullet("整体概况：统计整体完成情况、平均掌握程度，用数据量化"),
        bullet("常见问题汇总：按频率排序列出最高发的错误类型和典型表现"),
        bullet("知识点薄弱点：分析学生普遍薄弱的知识点或能力维度"),
        bullet("学生分层分析：将学生分为优秀/良好/待提高三个层次，列出各自特点"),
        bullet("教学建议：针对发现的问题，给出具体的教学改进方案和课堂活动建议"),

        heading("2.3 高级自定义功能", HeadingLevel.HEADING_2),

        heading("2.3.1 自定义角色设定", HeadingLevel.HEADING_3),
        para("每位教师可以自定义 AI 批改助手的角色设定，以适应不同的教学风格和场景需求。例如："),
        bullet("设定为耐心温柔的小学教师，用鼓励的方式指出问题"),
        bullet("设定为严格要求的中考阅卷老师，按考试标准评分"),
        bullet("设定为善于启发的教研组长，侧重方法引导"),

        heading("2.3.2 自定义评价要求", HeadingLevel.HEADING_3),
        para("教师可以在标准评分维度之外，添加个性化的评价重点关注项。例如："),
        bullet("重点关注文章的开头是否吸引人"),
        bullet("检查标点符号使用是否规范"),
        bullet("特别关注解题过程的书写规范性"),
        bullet("重点分析学生的审题能力"),

        heading("2.4 多模型切换", HeadingLevel.HEADING_2),
        para("系统集成三个免费 AI 模型，教师可自由切换："),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3000, 2000, 4026],
          rows: [
            new TableRow({ children: [headerCell("模型名称", 3000), headerCell("来源", 2000), headerCell("特点", 4026)] }),
            new TableRow({ children: [cell("GPT-OSS-20B", 3000, { shading: LIGHT_BLUE }), cell("OpenAI", 2000), cell("均衡性能，适合通用批改场景", 4026)] }),
            new TableRow({ children: [cell("Gemma-4-31B", 3000, { shading: LIGHT_BLUE }), cell("Google", 2000), cell("谷歌最新模型，语言理解能力强", 4026)] }),
            new TableRow({ children: [cell("Qwen3-Next-80B", 3000, { shading: LIGHT_BLUE }), cell("阿里", 2000), cell("中文理解能力突出，推荐语文批改使用", 4026)] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第三章：功能操作详细说明 ====================
        heading("第三章  功能操作详细说明"),

        heading("3.1 系统启动与访问", HeadingLevel.HEADING_2),

        heading("3.1.1 启动步骤", HeadingLevel.HEADING_3),
        numbered("打开命令行终端（CMD / PowerShell / 终端）"),
        numbered("进入项目目录：cd homework-grader"),
        numbered("安装依赖：pip install -r requirements.txt"),
        numbered("启动服务：python app.py"),
        numbered("终端显示 \"Running on http://0.0.0.0:5000\" 表示启动成功"),
        numbered("打开浏览器，访问 http://localhost:5000"),

        heading("3.1.2 页面布局说明", HeadingLevel.HEADING_3),
        para("系统页面分为以下区域："),
        bullet("顶部标题栏：显示系统名称和标语"),
        bullet("配置栏：学科选择（语文/数学/英语）和模型选择（三个AI模型）"),
        bullet("功能切换区：作业批改 和 学情分析 两个功能标签页"),
        bullet("主操作区：输入框、高级设置、提交按钮和结果展示区"),

        heading("3.2 作业批改操作流程", HeadingLevel.HEADING_2),

        heading("3.2.1 基本操作步骤", HeadingLevel.HEADING_3),
        numbered("选择学科：在顶部配置栏的「学科」下拉框中，选择对应学科（语文/数学/英语）"),
        numbered("选择模型：在「模型」下拉框中选择要使用的 AI 模型"),
        numbered("输入作业：在「粘贴学生作业内容」文本框中，粘贴完整的作业内容（包含题目和学生作答）"),
        numbered("（可选）展开「高级设置」，填写自定义角色设定或评价要求"),
        numbered("点击「开始批改」按钮"),
        numbered("等待 AI 处理（通常 10-60 秒），结果将在下方自动展示"),

        heading("3.2.2 语文作文批改示例", HeadingLevel.HEADING_3),
        para("操作步骤："),
        numbered("学科选择「语文」"),
        numbered("在输入框中粘贴作文内容，格式示例：", "numbers2"),
        spacer(60),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "题目：那一刻，我长大了", font: "Microsoft YaHei", size: 20, color: GRAY, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "每个人的成长都有一个转折点。对我来说，那个转折点发生在一个雨天......", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        spacer(60),
        numbered("点击「开始批改」，等待生成批改报告", "numbers2"),
        para("输出结果将包含：多维评分汇总表、核心亮点、核心问题、分项整改方案、段落升格优化、写作指导评语。"),

        heading("3.2.3 数学作业批改示例", HeadingLevel.HEADING_3),
        para("操作步骤："),
        numbered("学科选择「数学」"),
        numbered("在输入框中粘贴数学作业，格式示例："),
        spacer(60),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "1. 解方程 3x + 5 = 20", font: "Microsoft YaHei", size: 20, color: GRAY, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "解：3x = 20 - 5", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "3x = 15", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "x = 5", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        spacer(60),
        numbered("点击「开始批改」，等待生成批改报告"),
        para("输出结果将包含：多维评分汇总表、逐题详细批阅（含错因分析和正确解法）、知识点薄弱点诊断、举一反三变式题。"),

        heading("3.2.4 英语作业批改示例", HeadingLevel.HEADING_3),
        para("操作步骤："),
        numbered("学科选择「英语」"),
        numbered("在输入框中粘贴英语作业（作文/翻译/练习均可），格式示例："),
        spacer(60),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "My Summer Vacation", font: "Microsoft YaHei", size: 20, color: GRAY, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "Last summer, I went to Beijing with my family. We visited the Great Wall and ate many delicious food...", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        spacer(60),
        numbered("点击「开始批改」，等待生成批改报告"),
        para("输出结果将包含：多维评分汇总表、逐句精批（语法纠错+表达升级）、错误分类汇总、高级替换方案、巩固练习题。"),

        heading("3.3 学情分析操作流程", HeadingLevel.HEADING_2),

        heading("3.3.1 基本操作步骤", HeadingLevel.HEADING_3),
        numbered("点击页面顶部的「学情分析」标签页"),
        numbered("选择学科和 AI 模型"),
        numbered("在输入框中粘贴多名学生的作业数据，用【学生姓名】标记区分每位学生"),
        numbered("（可选）展开「高级设置」，填写自定义角色设定或分析要求"),
        numbered("点击「开始分析」按钮"),
        numbered("等待 AI 处理，生成班级学情分析报告"),

        heading("3.3.2 输入格式规范", HeadingLevel.HEADING_3),
        para("学情分析要求输入多份作业数据，建议 3 份以上。推荐格式如下："),
        spacer(60),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "【张三】", font: "Microsoft YaHei", size: 20, color: GRAY, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "学生作业内容...", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "【李四】", font: "Microsoft YaHei", size: 20, color: GRAY, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "学生作业内容...", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "【王五】", font: "Microsoft YaHei", size: 20, color: GRAY, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: "学生作业内容...", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        spacer(60),
        para("输出结果将包含：整体概况、常见问题汇总、知识点薄弱点、学生分层分析、教学建议。"),

        heading("3.4 高级设置使用说明", HeadingLevel.HEADING_2),

        heading("3.4.1 自定义角色设定", HeadingLevel.HEADING_3),
        para("在批改或分析界面中，点击「高级设置」展开面板，在「自定义角色设定」文本框中输入您期望的 AI 角色描述。例如："),
        bullet("你是一位耐心温柔的小学三年级语文老师，善于用鼓励和表扬的方式指出学生的问题，语气亲切温和"),
        bullet("你是一位严格的中考数学阅卷老师，严格按照中考评分标准给分，不放过任何细节错误"),
        bullet("你是一位注重实际应用的英语老师，关注学生的语言运用能力而非纯语法正确性"),
        para("留空则使用系统默认的学科专家角色。"),

        heading("3.4.2 自定义评价要求", HeadingLevel.HEADING_3),
        para("在「自定义评价要求」文本框中，输入您希望 AI 特别关注的评价维度或要求。例如："),
        bullet("重点关注文章的开头是否吸引人，结尾是否有升华"),
        bullet("检查标点符号使用是否规范，特别是逗号和句号的使用"),
        bullet("特别关注解题过程的书写规范性，步骤是否清晰完整"),
        bullet("重点分析学生的审题能力，是否存在答非所问的情况"),
        para("这些要求将被附加到标准评分维度之后，AI 会在批改过程中重点关注。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第四章：常见问题与注意事项 ====================
        heading("第四章  常见问题与注意事项"),

        heading("4.1 常见问题", HeadingLevel.HEADING_2),

        heading("Q1: 点击批改后提示 \"API 调用失败: 429\"", HeadingLevel.HEADING_3),
        para("A: 这是 OpenRouter 免费模型的请求频率限制。系统已内置自动重试机制（最多3次），如仍失败，请等待 30 秒后重试，或切换到其他模型。"),

        heading("Q2: 批改结果不够详细或格式混乱", HeadingLevel.HEADING_3),
        para("A: 不同模型的输出质量可能有差异。建议："),
        bullet("尝试切换到 Qwen3-Next-80B 模型（中文能力更强）"),
        bullet("确保输入的作业内容完整，包含题目要求"),
        bullet("在自定义评价要求中明确您希望看到的批改重点"),

        heading("Q3: 学情分析输入多少份作业比较合适？", HeadingLevel.HEADING_3),
        para("A: 建议至少输入 3 份以上作业，5-10 份效果最佳。作业数量越多，分析结果越具有统计意义和参考价值。"),

        heading("Q4: 支持哪些类型的作业？", HeadingLevel.HEADING_3),
        para("A: 系统支持文字类作业的批改，包括但不限于："),
        bullet("语文：作文、阅读理解、造句、仿写等"),
        bullet("数学：计算题、应用题、证明题等（需包含解题过程）"),
        bullet("英语：作文、翻译、语法练习、阅读理解等"),

        heading("4.2 使用注意事项", HeadingLevel.HEADING_2),
        bullet("请确保输入的作业内容完整，包含题目要求和学生的完整作答"),
        bullet("AI 批改结果仅供参考，最终评分请以教师专业判断为准"),
        bullet("免费模型有请求频率限制，如遇 429 错请耐心等待后重试"),
        bullet("建议在网络稳定的环境下使用，单次请求超时时间为 120 秒"),
        bullet("学生的作业数据仅在当次会话中使用，不会被存储或用于训练模型"),

        spacer(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 1 } },
          spacing: { before: 200, after: 100 },
          children: [],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "教师作业批改助手系统 V1.0", font: "Microsoft YaHei", size: 20, color: GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "AI Smart Homework Grading Assistant", font: "Microsoft YaHei", size: 18, color: GRAY })],
        }),
      ],
    },
  ],
});

// ===== 生成文件 =====
const outPath = "F:/实训/homework-grader/教师作业批改助手系统_产品说明书.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Document generated: " + outPath);
});
