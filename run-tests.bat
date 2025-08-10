@echo off
chcp 65001 >nul
echo === Dev Forge 网站自动化测试 ===
echo.
echo 选择要运行的测试类型:
echo 1. JSON 工具测试
echo 2. Base64 工具测试
echo 3. 网站导航测试
echo 4. 可访问性测试
echo 5. 所有工具测试
echo 6. 所有测试
echo 7. 生成 HTML 报告
echo.
set /p choice=请输入选择 (1-7): 

if "%choice%"=="1" (
    echo 运行 JSON 工具测试...
    npx playwright test tests/json-tool.spec.ts --project=chromium
) else if "%choice%"=="2" (
    echo 运行 Base64 工具测试...
    npx playwright test tests/base64-tool.spec.ts --project=chromium
) else if "%choice%"=="3" (
    echo 运行网站导航测试...
    npx playwright test tests/dev-forge-tools.spec.ts --project=chromium
) else if "%choice%"=="4" (
    echo 运行可访问性测试...
    npx playwright test tests/accessibility-ux.spec.ts --project=chromium
) else if "%choice%"=="5" (
    echo 运行所有工具测试...
    npx playwright test tests/json-tool.spec.ts tests/base64-tool.spec.ts --project=chromium
) else if "%choice%"=="6" (
    echo 运行所有测试...
    npx playwright test --project=chromium
) else if "%choice%"=="7" (
    echo 生成 HTML 报告...
    npx playwright test --reporter=html
) else (
    echo 无效选择，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo 测试完成!
pause