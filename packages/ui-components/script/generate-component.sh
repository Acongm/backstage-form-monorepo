#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供组件名称${NC}"
    echo "使用方法: ./generate-component.sh <ComponentName>"
    echo "示例: ./generate-component.sh CompanyInfoForm"
    exit 1
fi

# 获取组件名称
COMPONENT_NAME=$1

# 验证组件名称格式（首字母大写）
if ! [[ $COMPONENT_NAME =~ ^[A-Z][a-zA-Z0-9]*$ ]]; then
    echo -e "${RED}错误: 组件名称必须是 PascalCase 格式（首字母大写）${NC}"
    echo "示例: CompanyInfoForm, UserSettings, ProductCard"
    exit 1
fi

# 获取脚本所在目录的父目录（ui-components）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
UI_COMPONENTS_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# 定义路径
TEMPLATE_DIR="$UI_COMPONENTS_DIR/src/components/UserProfileForm"
TARGET_DIR="$UI_COMPONENTS_DIR/src/components/$COMPONENT_NAME"
INDEX_FILE="$UI_COMPONENTS_DIR/src/index.ts"

# 检查模板是否存在
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo -e "${RED}错误: 模板目录不存在: $TEMPLATE_DIR${NC}"
    exit 1
fi

# 检查目标组件是否已存在
if [ -d "$TARGET_DIR" ]; then
    echo -e "${RED}错误: 组件 '$COMPONENT_NAME' 已存在${NC}"
    exit 1
fi

echo -e "${BLUE}开始生成组件: $COMPONENT_NAME${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 复制模板目录
echo -e "${GREEN}✓${NC} 复制模板文件..."
cp -r "$TEMPLATE_DIR" "$TARGET_DIR"

# 删除不需要的文件
rm -f "$TARGET_DIR/CODE_TEMPLATE.md"
rm -f "$TARGET_DIR/README.md"

# 替换文件内容中的 UserProfileForm 为新组件名
echo -e "${GREEN}✓${NC} 更新组件名称..."

# 遍历所有文件并替换内容
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
    # macOS 使用 sed -i '' 
    # Linux 使用 sed -i
    # Windows Git Bash 使用 sed -i
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/UserProfileForm/$COMPONENT_NAME/g" "$file"
    else
        sed -i "s/UserProfileForm/$COMPONENT_NAME/g" "$file"
    fi
done

# 更新 config/index.ts 中的描述
CONFIG_FILE="$TARGET_DIR/config/index.ts"
if [ -f "$CONFIG_FILE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/用户资料表单组件/${COMPONENT_NAME}组件/g" "$CONFIG_FILE"
    else
        sed -i "s/用户资料表单组件/${COMPONENT_NAME}组件/g" "$CONFIG_FILE"
    fi
fi

# 更新主 index.ts 文件，添加导出
echo -e "${GREEN}✓${NC} 更新主 index.ts..."

# 检查是否已经导出
if grep -q "export.*$COMPONENT_NAME" "$INDEX_FILE"; then
    echo -e "${BLUE}ℹ${NC} 组件已在 index.ts 中导出"
else
    # 在文件末尾添加导出（确保有换行）
    echo "" >> "$INDEX_FILE"
    echo "export { default as $COMPONENT_NAME } from './components/$COMPONENT_NAME';" >> "$INDEX_FILE"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ 组件生成成功!${NC}"
echo ""
echo "组件路径: $TARGET_DIR"
echo "已自动导出至: $INDEX_FILE"
echo ""
echo "接下来的步骤:"
echo "  1. 修改 i18n 文件 (zh.ts, en.ts) 中的翻译文本"
echo "  2. 修改 data/index.ts 添加组件所需的数据"
echo "  3. 修改 pages/index.tsx 实现组件的具体逻辑"
echo "  4. 修改 utils/index.ts 添加工具函数"
echo ""
