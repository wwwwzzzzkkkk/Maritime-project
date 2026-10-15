#!/bin/bash
cd "$(dirname "$0")"
echo "=== 正在同步 MAREG 双版本项目至 GitHub (wwwwzzzzkkkk/Maritime-project) ==="
git remote set-url origin https://github.com/wwwwzzzzkkkk/Maritime-project.git 2>/dev/null || git remote add origin https://github.com/wwwwzzzzkkkk/Maritime-project.git
git add .
git commit -m "feat: release dual-edition MAREG maritime compliance & digital twin platform (v3.4)"
git branch -M main
git push -u origin main
echo "=== 推送完成！请访问 https://github.com/wwwwzzzzkkkk/Maritime-project 查看 ==="
