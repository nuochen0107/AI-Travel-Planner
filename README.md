# AI 旅行规划师 (AI Travel Planner)

本项目设计了一个 Web 应用，旨在实现一个端到端的 AI 旅行助手。

## 一、说明

本软件旨在简化旅行规划过程。通过 AI 了解用户的个性化需求（如目的地、天数、预算、偏好、同行人数等），AI 会自动生成详细的旅行路线和建议，并提供地图可视化和实时的费用管理辅助。

## 二、核心功能

本项目已实现的核心功能模块如下：

### 1. 智能行程规划 (核心 1)
* **AI 智能生成**：用户输入旅行需求，后端调用大语言模型（阿里云通义千问）动态生成包含交通、住宿、景点、餐厅的完整 `JSON` 格式行程。
* **语音输入**：支持用户通过语音（基于 Web Speech API）输入需求，满足“语音功能一定要有”的要求。
* **地图可视化**：AI 返回的行程（包含 `lat/lng` 坐标）会自动在 Leaflet 地图上标记所有地点，并提供导航链接。

### 2. 费用预算与管理 (核心 2)
* **AI 预算分析**：AI 会在生成行程时，估算一个“总预算 (`total_estimated_cost`)”。
* **手动记账**：用户可以在“费用管理”页面，为某次特定的行程添加详细的开销记录（如餐饮、交通等），并保存到数据库。

### 3. 用户管理与数据存储 (核心 3)
* **认证系统**：基于 Supabase Auth 实现了完整的用户注册和登录功能。
* **云端行程同步**：
    * **保存**：用户生成的行程可以保存到 Supabase 云数据库，与用户 `user_id` 关联。
    * **查看/管理**：用户可以在“我保存的行程”页面查看、**修改**（备注）或**删除**自己的所有行程。
    * **数据同步**：行程 (`itineraries`) 和费用 (`expenses`) 数据均在云端同步。

## 三、技术栈 (Tech Stack)

本项目根据作业要求，最终选定的技术栈如下：

* **前端 (Frontend)**：`Vue 3` (使用 Vite)
* **后端 (Backend)**：`Node.js` (使用 Express)
* **数据库 / 认证 (DB / Auth)**：`Supabase` (替代 Firebase/Firestore)
* **地图 (Map)**：`Leaflet` + `OpenStreetMap` (替代高德/百度，以规避 `sKey` 限制)
* **AI 行程规划 (LLM)**：`阿里云通义千问 (DashScope)`
* **后端容器化 (Containerization)**：`Docker`
* **持续集成 (CI/CD)**：`GitHub Actions` (自动构建后端镜像并推送到阿里云 ACR)


## 快速开始

### 1. 环境准备

*   确保您已安装 Docker。
*   获取所需的 API Key，包括语音识别、地图导航和您选择的大语言模型 API Key。(作业所需docker已粘贴至pdf文件中)
*   您必须先安装 3 个核心软件：
1.	Git：用于下载代码。
2.	Node.js (LTS版)：用于运行前端。
3.	Docker Desktop：用于运行后端。

### 2. 获取 Docker 镜像

 GitHub 克隆了的项目，可以自行构建 Docker 镜像：

```bash
git clone https://github.com/nuochen0107/AI-Travel-Planner.git
cd AI-Travel-Planner
```
### 3. 配置前后端.env文件
* 具体API KEY内容在pdf中

### 4. 运行 Docker 容器

```bash
docker build -t ai-travel-backend .
docker run --rm -p 5000:4000 --env-file .env ai-travel-backend
```
### 5. 运行前端页面

```bash
npm run install
npm run dev
```
### 6. 访问应用
* 打开浏览器，访问运行前端时出现的网址， 即可使用 AI 智能旅行规划助手。
* 首次访问时，需要注册账号并登录。
