# 需求文档

## 简介

蛋糕OA系统（Cake OA System）是基于现有 Spring Boot 项目的新功能模块，旨在为蛋糕店提供订单管理、移动端H5浏览以及周年回访提醒功能。系统以订单为核心，每次客户订购蛋糕时记录一条订单，客户信息（姓名、手机号等）直接嵌入订单记录中，无需独立的客户表或客户管理模块。回访模块根据订单中的订购日期，在次年同期自动生成回访任务，提醒管理员联系客户促进复购。

## 术语表

- **蛋糕OA系统（Cake_OA_System）**：基于 Spring Boot 构建的蛋糕店办公自动化系统，包含订单管理、移动端适配和周年回访功能
- **订单管理模块（Order_Module）**：负责订单记录的增删改查的子系统，订单记录中直接包含客户信息
- **订单（Order）**：一次蛋糕订购记录，包含客户姓名、手机号、蛋糕类型、订购日期、价格、收货地址、备注等信息
- **回访模块（Revisit_Module）**：负责根据订单的订购日期在次年同期自动生成和管理回访任务的子系统
- **回访任务（Revisit_Task）**：系统根据订单的订购日期自动生成的周年回访提醒记录，包含关联订单信息、回访日期和处理状态
- **H5页面（H5_Page）**：适配移动端浏览器的响应式网页，支持在手机浏览器中正常访问和操作
- **RESTful API（REST_API）**：遵循 REST 架构风格的 HTTP 接口，使用标准 HTTP 方法和 JSON 数据格式

## 需求

### 需求 1：订单管理

**用户故事：** 作为蛋糕店管理员，我希望能够记录和管理每一笔蛋糕订单，以便追踪客户订购记录并提供更好的服务。

#### 验收标准

1. THE Order_Module SHALL 提供订单创建功能，订单信息包含：客户姓名、手机号、蛋糕类型、订购日期、价格、收货地址、备注
2. THE Order_Module SHALL 提供订单列表的分页查询功能，每页默认显示 10 条记录
3. WHEN 管理员输入客户姓名或手机号进行搜索时，THE Order_Module SHALL 返回匹配的订单列表
4. WHEN 管理员修改订单信息并提交时，THE Order_Module SHALL 更新对应订单记录并返回更新成功的确认信息
5. WHEN 管理员删除一条订单时，THE Order_Module SHALL 将该订单标记为已删除状态（逻辑删除），而非物理删除数据
6. WHEN 管理员查看订单详情时，THE Order_Module SHALL 展示该订单的完整信息，包含客户姓名、手机号、蛋糕类型、订购日期、价格、收货地址和备注
7. THE Order_Module SHALL 允许同一手机号创建多条订单记录，不对手机号进行去重校验


### 需求 2：周年回访提醒

**用户故事：** 作为蛋糕店管理员，我希望系统能在客户订蛋糕的周年日期自动提醒我回访客户，以便促进客户复购和维护客户关系。

#### 验收标准

1. THE Revisit_Module SHALL 根据每条订单的订购日期，在次年同一日期自动生成一条回访任务
2. THE Revisit_Task SHALL 包含以下信息：关联订单编号、客户姓名、手机号、原订购日期、回访日期、回访状态
3. WHEN 回访日期到达当天时，THE Revisit_Module SHALL 在管理员的回访任务列表中展示该条待处理的回访任务
4. WHEN 管理员将回访任务标记为已完成时，THE Revisit_Module SHALL 更新该回访任务的状态为已完成，并记录完成时间
5. THE Revisit_Module SHALL 提供回访任务列表的分页查询功能，支持按回访状态（待处理、已完成）筛选
6. WHEN 管理员查看回访任务详情时，THE Revisit_Module SHALL 展示关联订单的完整信息，包含客户姓名、手机号、蛋糕类型和原订购日期
7. IF 订单被逻辑删除，THEN THE Revisit_Module SHALL 不为该订单生成新的回访任务
8. WHEN 一条订单创建成功后，THE Revisit_Module SHALL 自动计算次年同期日期并创建对应的回访任务记录

### 需求 3：RESTful API 设计

**用户故事：** 作为前端开发者，我希望后端提供规范的 RESTful API 接口，以便前端页面能够方便地调用后端服务进行数据交互。

#### 验收标准

1. THE REST_API SHALL 使用标准 HTTP 方法：GET 用于查询、POST 用于创建、PUT 用于更新、DELETE 用于删除
2. THE REST_API SHALL 使用 JSON 格式作为请求和响应的数据格式
3. THE REST_API SHALL 对订单资源使用路径 `/api/orders` 作为基础端点
4. THE REST_API SHALL 对回访任务资源使用路径 `/api/revisits` 作为基础端点
5. WHEN 请求成功时，THE REST_API SHALL 返回对应的 HTTP 状态码：200（查询成功）、201（创建成功）、204（删除成功）
6. WHEN 请求参数校验失败时，THE REST_API SHALL 返回 HTTP 400 状态码，并在响应体中包含具体的错误字段和错误描述
7. WHEN 请求的资源不存在时，THE REST_API SHALL 返回 HTTP 404 状态码，并在响应体中包含资源未找到的提示信息
8. THE REST_API SHALL 对分页查询接口支持 `page`（页码）和 `size`（每页条数）查询参数
9. THE REST_API SHALL 在分页查询响应中包含：当前页数据列表、总记录数、总页数、当前页码

### 需求 4：H5 移动端适配

**用户故事：** 作为蛋糕店管理员，我希望能够在手机浏览器上正常使用系统的核心功能，以便在外出时也能管理订单和查看回访任务。

#### 验收标准

1. THE H5_Page SHALL 采用响应式布局，适配 320px 至 768px 宽度的移动端屏幕
2. THE H5_Page SHALL 提供订单列表查看、订单创建和订单详情查看功能
3. THE H5_Page SHALL 提供回访任务列表查看和回访任务标记完成功能
4. WHEN 在移动端浏览器中访问系统时，THE H5_Page SHALL 自动适配当前屏幕宽度，无需手动缩放即可正常操作
5. THE H5_Page SHALL 确保所有可点击元素的最小触控区域为 44px × 44px
6. WHEN 网络请求正在进行时，THE H5_Page SHALL 展示加载状态指示器，防止用户重复提交