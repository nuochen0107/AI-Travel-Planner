# AI 智能旅行规划助手

## 项目简介

AI 智能旅行规划助手是一款利用人工智能技术，旨在简化旅行规划过程的创新应用。通过深入理解用户需求，本应用能够自动生成个性化、详细的旅行路线和建议，并提供实时的旅行辅助，让每一次旅行都充满乐趣和轻松。

## 核心功能

1.  **智能行程规划**
    *   **语音/文字输入：** 用户可以通过语音或文字输入旅行目的地、日期、预算、同行人数、旅行偏好（例如：“我想去日本，5 天，预算 1 万元，喜欢美食和动漫，带孩子”）。
    *   **AI 自动生成：** AI 将根据用户输入，自动规划包括交通、住宿、景点、餐厅等详细行程，并考虑用户偏好进行个性化推荐。
    *   **地图交互展示：** 以地图为主的交互界面，直观清晰地展示行程，并支持行程的编辑和调整。

2.  **费用预算与管理**
    *   **AI 预算分析：** AI 根据行程信息估算各项开销，并提供预算分配建议。
    *   **旅行开销记录：** 支持手动或语音输入旅行期间的各项开销。
    *   **费用报表：** 生成旅行费用统计报表，清晰展示各项开销占比。

3.  **用户管理与数据存储**
    *   **注册登录系统：** 用户可以注册、登录，并保存和管理多份旅行计划。
    *   **云端行程同步：** 旅行计划、偏好设置、费用记录等数据自动云端同步，方便多设备查看和修改。

## 技术栈 (Web)

*   **语音识别：** 基于科大讯飞或其他语音识别 API。
*   **地图导航：** 基于高德地图 API 或百度地图 API，提供地理位置服务和导航功能。
*   **数据库/认证：** 推荐使用 Supabase 或 Firebase Authentication 和 Firestore，或其他合适的后端服务。
*   **行程规划和费用预算：** 通过大语言模型 (LLM) API 完成，LLM API 可选 (如 OpenAI GPT 系列、Google Gemini 系列、文心一言等)。
*   **UI/UX：** 地图为主的交互界面，清晰的行程展示，美观的图片。

## 快速开始

### 1. 环境准备

*   确保您已安装 Docker。
*   获取所需的 API Key，包括语音识别、地图导航和您选择的大语言模型 API Key。

### 2. 获取 Docker 镜像

您可以从阿里云镜像仓库下载预构建的 Docker 镜像。请替换 `<your_aliyun_registry>` 和 `<image_name>:<tag>` 为实际的仓库地址和镜像信息。

```bash
docker pull <your_aliyun_registry>/<image_name>:<tag>
```

或者，如果您从 GitHub 克隆了项目，可以自行构建 Docker 镜像：

```bash
git clone https://github.com/your-username/AI-Travel-Planner.git
cd AI-Travel-Planner
docker build -t ai-travel-planner .
```

### 3. 运行 Docker 容器

运行 Docker 容器时，您需要通过环境变量传入 API Key。请将以下命令中的占位符替换为您的实际 API Key。

```bash
docker run -d \
  -p 80:80 \
  -e SPEECH_RECOGNITION_API_KEY="your_speech_recognition_api_key" \
  -e MAP_API_KEY="your_map_api_key" \
  -e LLM_API_KEY="your_llm_api_key" \
  -e SUPABASE_URL="your_supabase_url" \
  -e SUPABASE_ANON_KEY="your_supabase_anon_key" \
  ai-travel-planner
```

**注意：**

*   `-p 80:80` 将容器的 80 端口映射到主机的 80 端口，您可以根据需要修改。
*   请根据您实际使用的技术栈和 API 服务，添加或修改相应的环境变量。
*   **如果您使用的不是阿里云的 API Key，请务必将您的 API Key 填写在此 README 文档中，并确保其在未来 3 个月内可用，以供助教批改作业使用。**

### 4. 访问应用

容器启动后，您可以通过浏览器访问 `http://localhost` (如果您使用了 `-p 80:80` 映射) 来使用 AI 智能旅行规划助手。

## API Key 管理注意事项

**重要提示：**

*   **切勿将任何 API Key 硬编码在代码中！** 尤其是在公开的 GitHub 仓库中。
*   本项目建议通过环境变量或配置文件（如 `.env` 文件）来管理 API Key。
*   在程序设置页面增加一个输入 Key 的输入窗口，允许用户自行配置 API Key，是更安全和灵活的做法。

## GitHub 提交记录

本项目将保留尽可能多、详细的 GitHub 提交记录，以便追溯开发过程和代码变更。

## 自动化部署 (可选)

本项目可以通过 GitHub Actions 配置 CI/CD 流程，实现自动化构建 Docker 镜像并推送到阿里云镜像仓库。具体配置请参考 GitHub Actions 官方文档和阿里云容器镜像服务文档。