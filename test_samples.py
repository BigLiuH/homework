"""
教师作业批改助手系统 - 测试样例
运行方式：python test_samples.py
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

# ==================== 测试样例数据 ====================

SAMPLES = {
    # ==================== 语文作文批改 ====================
    "语文_作文批改": {
        "subject": "语文",
        "content": """题目：那一刻，我长大了

每个人的成长都有一个转折点，对我来说，那个转折点发生在一个普通的雨天。

那天下午放学，天空突然下起了大雨。我站在校门口，看着同学们一个个被家长接走，心里既焦急又委屈。爸爸出差了，妈妈生病在家，我想今天肯定没人来接我了。

正当我准备冒雨跑回家时，一个熟悉的身影出现在雨幕中。是妈妈！她撑着一把伞，脸色苍白，脚步有些踉跄，但还是来了。雨水打湿了她的半边身子，因为她把伞偏向了我这一边。

"妈，你怎么来了？你还在生病呢！"我着急地说。
妈妈笑了笑说："下雨了，怕你淋着。"

那一刻，我的眼泪和雨水混在一起。我突然明白，原来长大不是年龄的增长，而是懂得了父母的爱是无私的，懂得了自己也应该为他们做些什么。

从那以后，我开始学着照顾妈妈，给她倒水、提醒她吃药。我知道，那一刻，我真的长大了。"""
    },

    # ==================== 数学作业批改 ====================
    "数学_作业批改": {
        "subject": "数学",
        "content": """1. 解方程：3x + 5 = 20
解：3x = 20 - 5
3x = 15
x = 5

2. 解方程：2(x - 3) = 10
解：2x - 3 = 10
2x = 13
x = 6.5

3. 一个长方形的周长是36厘米，长是宽的2倍，求长和宽。
解：设宽为x，则长为2x
2(x + 2x) = 36
2(3x) = 36
6x = 36
x = 6
宽为6厘米，长为12厘米

4. 计算：(-2)³ + 3 × (-1)²⁰²⁴
解：(-2)³ + 3 × (-1)²⁰²⁴
= -8 + 3 × 1
= -8 + 3
= -5

5. 甲乙两地相距360千米，一辆汽车从甲地出发，每小时行驶60千米，行驶了2小时后，剩下的路程要在2小时内走完，每小时需要行驶多少千米？
解：已行驶路程 = 60 × 2 = 120千米
剩余路程 = 360 - 120 = 240千米
每小时需要行驶 = 240 ÷ 2 = 120千米
答：每小时需要行驶120千米。"""
    },

    # ==================== 英语作文批改 ====================
    "英语_作文批改": {
        "subject": "英语",
        "content": """My Favorite Season

My favorite season is autumn. I like autumn because the weather is cool and comfortable.

In autumn, the leaves turn yellow and red. They look very beautiful. I often go to the park with my family on weekends. We like to flying kites in the park. The wind is gentle and make us feel happy.

Autumn is also harvest season. There are many fruits in autumn, like apples, pears and oranges. I very like eating apples. My mother always buy a lot of fruits in autumn.

Last autumn, I went to the countryside with my grandparents. We picked apples together. It was my first time to pick apples. I was very exciting. The apples was very sweet.

I hope autumn can last longer. I think autumn is the best season in a year. Everyone should enjoy the beautiful autumn."""
    },

    # ==================== 学情分析（多份数学作业） ====================
    "数学_学情分析": {
        "subject": "数学",
        "content": """【张三】
1. 解方程：2x + 6 = 14
解：2x = 14 - 6
2x = 8
x = 4 ✓

2. 解方程：3(x + 2) = 15
解：3x + 6 = 15
3x = 9
x = 3 ✓

3. 计算：(-3)² + (-2)³
= 9 + (-8)
= 1 ✓

【李四】
1. 解方程：2x + 6 = 14
解：2x = 14 + 6
2x = 20
x = 10 ✗

2. 解方程：3(x + 2) = 15
解：3x + 2 = 15
3x = 13
x = 13/3 ✗

3. 计算：(-3)² + (-2)³
= -9 + (-8)
= -17 ✗

【王五】
1. 解方程：2x + 6 = 14
解：2x = 14 - 6
2x = 8
x = 4 ✓

2. 解方程：3(x + 2) = 15
解：3x + 6 = 15
3x = 9
x = 3 ✓

3. 计算：(-3)² + (-2)³
= 9 + (-8)
= 1 ✓

【赵六】
1. 解方程：2x + 6 = 14
解：2x = 14 - 6
2x = 8
x = 4 ✓

2. 解方程：3(x + 2) = 15
解：3x + 6 = 15
3x = 9
x = 3 ✓

3. 计算：(-3)² + (-2)³
= 9 + 8
= 17 ✗

【孙七】
1. 解方程：2x + 6 = 14
解：2x = 14 - 6
2x = 8
x = 2 ✗

2. 解方程：3(x + 2) = 15
解：3x + 6 = 15
3x = 9
x = 3 ✓

3. 计算：(-3)² + (-2)³
= -9 + 8
= -1 ✗"""
    },

    # ==================== 学情分析（多份英语作业） ====================
    "英语_学情分析": {
        "subject": "英语",
        "content": """【Alice】
My Weekend
Last weekend, I went to the library with my friends. We read many interesting books. After that, we ate lunch at a restaurant. The food was delicious. I had a great weekend.

【Bob】
My Weekend
Last weekend, I goed to the library with my friends. We readed many interesting book. After that, we eat lunch at a restaurant. The food is delicious. I have a great weekend.

【Carol】
My Weekend
Last weekend, I went to the library with my friend. We read many interesting books. After that, we ate lunch at a restaurant. The food was very delicious. I had a wonderful weekend.

【David】
My Weekend
I go to library last weekend with friend. We read book. We eat food. It was good.

【Eve】
My Weekend
Last weekend, I went to the library with my friends. We read many interesting books and discussed them together. After that, we had lunch at a nice restaurant nearby. The food was delicious and the service was great. I really enjoyed my weekend."""
    },
}


def test_grade(sample_name, sample_data):
    """测试作业批改接口"""
    print(f"\n{'='*60}")
    print(f"📝 测试: {sample_name}")
    print(f"{'='*60}")

    try:
        resp = requests.post(
            f"{BASE_URL}/api/grade",
            json={
                "model": "openai/gpt-oss-20b:free",
                "subject": sample_data["subject"],
                "content": sample_data["content"],
            },
            timeout=120,
        )
        data = resp.json()
        if "error" in data:
            print(f"❌ 错误: {data['error']}")
        else:
            print(f"✅ 成功! 模型: {data.get('model', 'N/A')}")
            print(f"📄 结果预览 (前300字):")
            print(data["result"][:300] + "...")
    except Exception as e:
        print(f"❌ 请求异常: {e}")


def test_analyze(sample_name, sample_data):
    """测试学情分析接口"""
    print(f"\n{'='*60}")
    print(f"📊 测试: {sample_name}")
    print(f"{'='*60}")

    try:
        resp = requests.post(
            f"{BASE_URL}/api/analyze",
            json={
                "model": "openai/gpt-oss-20b:free",
                "subject": sample_data["subject"],
                "content": sample_data["content"],
            },
            timeout=120,
        )
        data = resp.json()
        if "error" in data:
            print(f"❌ 错误: {data['error']}")
        else:
            print(f"✅ 成功! 模型: {data.get('model', 'N/A')}")
            print(f"📄 结果预览 (前300字):")
            print(data["result"][:300] + "...")
    except Exception as e:
        print(f"❌ 请求异常: {e}")


def print_sample(sample_name, sample_data):
    """打印样例内容"""
    print(f"\n{'='*60}")
    print(f"📋 样例: {sample_name}")
    print(f"   学科: {sample_data['subject']}")
    print(f"{'='*60}")
    print(sample_data["content"][:500])
    if len(sample_data["content"]) > 500:
        print(f"... (共 {len(sample_data['content'])} 字)")
    print()


def main():
    print("=" * 60)
    print("教师作业批改助手系统 - 测试样例")
    print("=" * 60)

    while True:
        print("\n请选择操作：")
        print("  1. 查看所有测试样例")
        print("  2. 测试作业批改（语文）")
        print("  3. 测试作业批改（数学）")
        print("  4. 测试作业批改（英语）")
        print("  5. 测试学情分析（数学）")
        print("  6. 测试学情分析（英语）")
        print("  7. 运行全部测试")
        print("  0. 退出")

        choice = input("\n请输入选项编号: ").strip()

        if choice == "0":
            print("再见！")
            break
        elif choice == "1":
            for name, data in SAMPLES.items():
                print_sample(name, data)
        elif choice == "2":
            test_grade("语文_作文批改", SAMPLES["语文_作文批改"])
        elif choice == "3":
            test_grade("数学_作业批改", SAMPLES["数学_作业批改"])
        elif choice == "4":
            test_grade("英语_作文批改", SAMPLES["英语_作文批改"])
        elif choice == "5":
            test_analyze("数学_学情分析", SAMPLES["数学_学情分析"])
        elif choice == "6":
            test_analyze("英语_学情分析", SAMPLES["英语_学情分析"])
        elif choice == "7":
            print("\n🚀 开始运行全部测试...\n")
            test_grade("语文_作文批改", SAMPLES["语文_作文批改"])
            time.sleep(2)
            test_grade("数学_作业批改", SAMPLES["数学_作业批改"])
            time.sleep(2)
            test_grade("英语_作文批改", SAMPLES["英语_作文批改"])
            time.sleep(2)
            test_analyze("数学_学情分析", SAMPLES["数学_学情分析"])
            time.sleep(2)
            test_analyze("英语_学情分析", SAMPLES["英语_学情分析"])
            print(f"\n{'='*60}")
            print("✅ 全部测试完成！")
            print(f"{'='*60}")
        else:
            print("无效选项，请重新输入。")


if __name__ == "__main__":
    main()
