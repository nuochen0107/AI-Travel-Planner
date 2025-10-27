**项目计划文档 (PLAN)**

**项目名称：** AI 智能旅行规划助手

**版本：** 1.0

**日期：** 2024年7月22日

---

**1. 项目概述**

本项目旨在开发一款 AI 智能旅行规划助手，通过人工智能技术简化旅行规划过程，为用户提供个性化、高效、便捷的旅行体验。核心功能包括智能行程规划、费用预算与管理、用户管理与数据存储。

---

**2. 项目阶段与里程碑 (总计15天)**

本项目将采用敏捷开发模式，分为3个迭代周期，每个周期5天。

**迭代一：规划、设计与基础架构 (Day 1 - Day 5)**

*   **目标：** 完成项目规划、技术选型、数据库设计，并搭建前后端基础框架，实现用户注册登录功能。

*   **Day 1: 需求与设计细化**
    *   **任务：**
        *   深入理解 PRD，细化功能点。
        *   完成技术设计文档 (TDD) 初稿：确定前后端技术栈、整体架构、模块划分。
        *   设计数据库表结构（用户表、旅行计划表、行程详情表、费用记录表等）。
        *   设计核心 API 接口规范。
    *   **技术栈：** Markdown (文档), Draw.io/Lucidchart (架构图), SQL DDL (数据库设计)。

*   **Day 2: 前端项目初始化与UI原型**
    *   **任务：**
        *   初始化前端项目 (例如：React + Vite)。
        *   配置路由、状态管理 (例如：React Router, Zustand/Redux)。
        *   设计并实现关键页面的 UI/UX 原型 (例如：首页、行程规划页、登录注册页)。
        *   集成 UI 组件库 (例如：Ant Design / Material-UI)。
    *   **技术栈：** React/Vue/Angular, Vite/Webpack, React Router/Vue Router, Zustand/Redux, Ant Design/Material-UI。

*   **Day 3: 后端项目初始化与认证服务**
    *   **任务：**
        *   初始化后端项目 (例如：Node.js + Express/NestJS)。
        *   配置项目结构、依赖管理。
        *   集成用户认证服务 (例如：Supabase Auth / Firebase Authentication)。
        *   实现用户注册、登录、登出 API。
    *   **技术栈：** Node.js/Python/Go, Express/NestJS/Django/Flask/Gin, Supabase Auth/Firebase Authentication。

*   **Day 4: 数据库集成与用户数据管理**
    *   **任务：**
        *   集成数据库 (例如：Supabase PostgreSQL / Firebase Firestore)。
        *   实现用户基本信息 CRUD (创建、读取、更新、删除) API。
        *   实现旅行计划的创建、读取、更新、删除 API (仅限用户关联)。
    *   **技术栈：** Supabase PostgreSQL/Firebase Firestore, ORM (如 Prisma/Sequelize for Node.js, Django ORM/SQLAlchemy for Python)。

*   **Day 5: 前后端联调与基础测试**
    *   **任务：**
        *   联调前端注册登录与后端认证 API。
        *   联调前端旅行计划列表与后端 API。
        *   编写用户认证模块的单元测试。
        *   编写旅行计划管理模块的单元测试。
    *   **技术栈：** Jest/React Testing Library (前端), Mocha/Chai (Node.js 后端), Postman/Insomnia (API 测试)。

**迭代二：核心功能开发 (Day 6 - Day 10)**

*   **目标：** 实现智能行程规划的核心逻辑，包括大语言模型集成、地图展示，以及费用预算与管理功能。

*   **Day 6: 大语言模型 (LLM) 集成**
    *   **任务：**
        *   选择并集成 LLM API (例如：Google Gemini API)。
        *   开发后端 LLM 代理服务，负责安全地调用 LLM API 并处理请求/响应。
        *   实现基于文本输入的初步行程生成逻辑 (例如：接收目的地、日期、偏好，返回初步行程建议)。
    *   **技术栈：** Node.js/Python/Go (后端), Google Gemini API/OpenAI GPT API/文心一言 API。

*   **Day 7: 智能行程规划 - 地图集成与展示**
    *   **任务：**
        *   前端集成地图 SDK (例如：高德地图 JavaScript API / 百度地图 JavaScript API)。
        *   在地图上展示 LLM 生成的行程点。
        *   实现地图的缩放、拖动、点击事件。
        *   开发行程详情展示组件。
    *   **技术栈：** React/Vue/Angular (前端), 高德地图 JS API/百度地图 JS API。

*   **Day 8: 智能行程规划 - 语音输入与优化**
    *   **任务：**
        *   前端集成语音识别 SDK (例如：科大讯飞 Web API)。
        *   实现语音输入旅行需求，并将其转换为文本发送给后端 LLM 代理服务。
        *   优化 LLM 提示词 (Prompt Engineering)，提高行程生成质量。
        *   实现行程的初步编辑和保存功能。
    *   **技术栈：** React/Vue/Angular (前端), 科大讯飞 Web API, LLM Prompt Engineering。

*   **Day 9: 费用预算与管理**
    *   **任务：**
        *   后端实现 AI 预算分析逻辑 (根据行程估算交通、住宿、餐饮等费用)。
        *   后端开发费用记录 API (支持类别、金额、日期、备注)。
        *   前端开发费用预算展示界面。
        *   前端开发费用记录输入界面 (支持手动输入)。
    *   **技术栈：** Node.js/Python/Go (后端), React/Vue/Angular (前端)。

*   **Day 10: 费用管理 - 语音输入与报表**
    *   **任务：**
        *   前端集成语音识别 SDK，实现语音输入费用记录。
        *   后端实现费用统计与报表生成逻辑。
        *   前端开发费用报表展示界面 (例如：饼图、柱状图)。
        *   编写费用管理模块的单元测试。
    *   **技术栈：** React/Vue/Angular (前端), 科大讯飞 Web API, Chart.js/ECharts (前端图表库)。

**迭代三：集成、测试与部署 (Day 11 - Day 15)**

*   **目标：** 完成所有功能模块的集成、全面的测试、Docker 化部署，并完善文档。

*   **Day 11: 功能集成与系统测试**
    *   **任务：**
        *   集成所有前端模块和后端 API。
        *   进行端到端 (E2E) 系统测试，确保所有功能按预期工作。
        *   修复集成过程中发现的 Bug。
    *   **技术栈：** Cypress/Playwright (E2E 测试工具)。

*   **Day 12: 性能优化与安全加固**
    *   **任务：**
        *   对关键接口进行性能测试，识别并优化瓶颈。
        *   检查 API Key 管理机制，确保其安全性 (环境变量、配置文件)。
        *   进行基本的安全漏洞扫描和修复。
        *   优化前端加载速度和响应性能。
    *   **技术栈：** JMeter/K6 (性能测试), Webpack/Vite (前端优化), 安全审计工具。

*   **Day 13: Docker 化与本地部署验证**
    *   **任务：**
        *   为前端应用编写 Dockerfile。
        *   为后端应用编写 Dockerfile。
        *   构建 Docker 镜像。
        *   在本地验证 Docker 镜像的运行和功能。
    *   **技术栈：** Docker。

*   **Day 14: 自动化部署 (CI/CD) 配置**
    *   **任务：**
        *   配置 GitHub Actions 工作流：
            *   代码提交后自动运行测试。
            *   代码合并到主分支后，自动构建 Docker 镜像。
            *   将 Docker 镜像推送到阿里云镜像仓库。
        *   编写详细的 Docker 运行指南，包含 API Key 配置说明。
    *   **技术栈：** GitHub Actions, Alibaba Cloud Container Registry。

*   **Day 15: 文档完善与最终交付**
    *   **任务：**
        *   最终审查 PRD、PLAN、README 文档，确保准确性和完整性。
        *   更新 README 文档，包含最新的 Docker 运行说明、API Key 配置和 GitHub 仓库地址。
        *   准备 PDF 提交文件。
        *   进行最终的功能演示和验收。
    *   **技术栈：** Markdown, PDF 生成工具。

---

**3. 技术栈选择 (详细)**

*   **前端：**
    *   **框架：** React (配合 TypeScript)
    *   **构建工具：** Vite
    *   **状态管理：** Zustand (轻量级且易于使用)
    *   **UI 组件库：** Ant Design (提供丰富的组件和良好的设计规范)
    *   **地图 SDK：** 高德地图 JavaScript API (国内常用，功能完善)
    *   **语音识别 SDK：** 科大讯飞 Web API (国内领先的语音技术)
    *   **图表库 (费用报表)：** ECharts (功能强大，可视化效果好)
    *   **E2E 测试：** Playwright

*   **后端：**
    *   **语言/框架：** Node.js + NestJS (基于 TypeScript，提供良好的模块化和可维护性)
    *   **数据库/认证：** Supabase (提供 PostgreSQL 数据库、Auth 认证、实时订阅等一站式服务)
    *   **大语言模型集成：** Google Gemini API (强大的多模态能力，持续迭代)
    *   **ORM：** Prisma (现代化的 ORM，支持 TypeScript，易于使用)
    *   **单元测试：** Jest

*   **DevOps：**
    *   **版本控制：** Git
    *   **代码托管：** GitHub
    *   **CI/CD：** GitHub Actions
    *   **容器化：** Docker
    *   **镜像仓库：** 阿里云容器镜像服务 (ACR)

---

**4. API Key 管理注意事项**

*   **切勿将任何 API Key 硬编码在代码中！**
*   所有 API Key 均通过环境变量进行配置。在 Docker 容器运行时，通过 `-e` 参数传入。
*   在程序设置页面提供输入 Key 的输入窗口，允许用户自行配置 API Key，并将其安全存储 (例如：加密后存储在用户数据库中)。
*   **如果使用的不是阿里云的 API Key，请务必在 README 文档中提供，并确保 3 个月内可用。**

---

**5. 风险管理**

*   **LLM 响应速度与准确性：** 持续优化 Prompt Engineering，考虑引入缓存机制。
*   **API 稳定性：** 对接多个 API 时，实现重试机制和熔断机制。
*   **语音识别准确率：** 针对不同口音和语速进行优化，提供文字输入作为备选。
*   **15天时间紧张：** 严格控制需求范围，优先实现核心功能，非核心功能可作为后续迭代。