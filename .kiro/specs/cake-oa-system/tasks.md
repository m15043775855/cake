# 实现计划：蛋糕OA系统

## 概述

基于现有 Spring Boot 2.6.13 项目，按照三层架构（Controller → Service → Repository）逐步实现订单管理、周年回访提醒和 H5 移动端页面。先搭建基础设施（依赖、数据模型、异常处理），再实现核心业务逻辑，最后构建前端 H5 页面并完成集成。

## 任务

- [x] 1. 项目基础设施搭建
  - [x] 1.1 更新 pom.xml 添加所需依赖
    - 添加 Spring Data JPA (`spring-boot-starter-data-jpa`)
    - 添加 Hibernate Validator (`spring-boot-starter-validation`)
    - 添加 jqwik 属性测试框架 (`net.jqwik:jqwik:1.7.4`, scope=test)
    - _需求: 3.2, 3.6_

  - [x] 1.2 配置 application.properties
    - 配置 MySQL 数据源连接（url, username, password）
    - 配置 JPA/Hibernate 属性（ddl-auto=update, show-sql, naming-strategy）
    - 配置 JSON 日期格式序列化
    - _需求: 3.2_

  - [x] 1.3 创建 JPA 实体类 Order
    - 创建 `com.example.cake.entity.Order` 实体类
    - 映射到 `cake_order` 表，包含所有字段（id, customerName, phone, cakeType, orderDate, price, address, remark, deleted, createdAt, updatedAt）
    - 使用 `@PrePersist` 和 `@PreUpdate` 自动设置 createdAt 和 updatedAt
    - _需求: 1.1, 1.6_

  - [x] 1.4 创建 JPA 实体类 RevisitTask
    - 创建 `com.example.cake.entity.RevisitTask` 实体类
    - 映射到 `cake_revisit_task` 表，包含所有字段（id, orderId, customerName, phone, originalOrderDate, revisitDate, status, completedAt, createdAt）
    - 使用 `@PrePersist` 自动设置 createdAt，status 默认值为 "PENDING"
    - _需求: 2.1, 2.2_

  - [x] 1.5 创建统一响应类 ApiResponse 和自定义异常
    - 创建 `com.example.cake.dto.ApiResponse<T>` 统一响应包装类（code, message, data）
    - 创建 `com.example.cake.exception.ResourceNotFoundException` 自定义异常
    - _需求: 3.5, 3.6, 3.7_

  - [x] 1.6 创建全局异常处理器 GlobalExceptionHandler
    - 创建 `com.example.cake.exception.GlobalExceptionHandler`，使用 `@RestControllerAdvice`
    - 处理 `MethodArgumentNotValidException` → 400，提取字段校验错误列表
    - 处理 `ResourceNotFoundException` → 404
    - 处理兜底 `Exception` → 500，不暴露内部细节
    - _需求: 3.6, 3.7_

- [x] 2. 订单管理模块实现
  - [x] 2.1 创建 OrderRepository 接口
    - 创建 `com.example.cake.repository.OrderRepository`，继承 `JpaRepository<Order, Long>`
    - 添加按姓名或手机号模糊搜索的分页查询方法（排除已删除记录）
    - 添加查询未删除订单的分页方法
    - _需求: 1.2, 1.3, 1.5_

  - [x] 2.2 创建订单请求 DTO
    - 创建 `com.example.cake.dto.OrderCreateRequest`，包含 JSR 380 校验注解（@NotBlank, @Pattern, @NotNull, @DecimalMin）
    - 创建 `com.example.cake.dto.OrderUpdateRequest`，字段与 CreateRequest 相同
    - _需求: 1.1, 1.4, 3.6_

  - [x] 2.3 创建 OrderService 接口及实现类
    - 创建 `com.example.cake.service.OrderService` 接口，定义 createOrder, listOrders, getOrder, updateOrder, deleteOrder 方法
    - 创建 `com.example.cake.service.impl.OrderServiceImpl` 实现类
    - createOrder：保存订单后调用 RevisitService.createRevisitTask 生成回访任务
    - listOrders：支持 keyword 模糊搜索（姓名或手机号），分页返回未删除订单
    - getOrder：按 ID 查询，不存在时抛出 ResourceNotFoundException
    - updateOrder：更新订单字段，不存在时抛出 ResourceNotFoundException
    - deleteOrder：设置 deleted=true 进行逻辑删除
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.4 创建 OrderController
    - 创建 `com.example.cake.controller.OrderController`，映射 `/api/orders`
    - POST / → 创建订单，使用 @Valid 校验请求体，返回 201
    - GET / → 分页查询订单列表，支持 page, size, keyword 参数
    - GET /{id} → 查询订单详情
    - PUT /{id} → 更新订单，使用 @Valid 校验请求体
    - DELETE /{id} → 逻辑删除订单，返回 204
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.3, 3.5, 3.8, 3.9_

  - [ ]* 2.5 编写订单模块单元测试
    - 使用 MockMvc 测试 OrderController 各端点的 HTTP 方法映射和状态码
    - 测试参数校验失败返回 400
    - 测试查询不存在的订单返回 404
    - _需求: 1.1, 1.4, 3.5, 3.6, 3.7_

  - [ ]* 2.6 编写订单模块属性测试
    - **属性 1：订单创建与查询的往返一致性**
    - **验证需求: 1.1, 1.6**
    - **属性 2：分页查询默认页大小不超过 10**
    - **验证需求: 1.2**
    - **属性 3：搜索结果过滤正确性**
    - **验证需求: 1.3**
    - **属性 4：订单更新的往返一致性**
    - **验证需求: 1.4**
    - **属性 5：逻辑删除后订单不出现在列表中**
    - **验证需求: 1.5**
    - **属性 6：同一手机号可创建多条订单**
    - **验证需求: 1.7**

- [x] 3. 检查点 - 订单模块验证
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. 回访提醒模块实现
  - [x] 4.1 创建 RevisitRepository 接口
    - 创建 `com.example.cake.repository.RevisitRepository`，继承 `JpaRepository<RevisitTask, Long>`
    - 添加按状态分页查询方法
    - _需求: 2.3, 2.5_

  - [x] 4.2 创建 RevisitService 接口及实现类
    - 创建 `com.example.cake.service.RevisitService` 接口，定义 createRevisitTask, listTasks, getTask, completeTask 方法
    - 创建 `com.example.cake.service.impl.RevisitServiceImpl` 实现类
    - createRevisitTask：根据订单生成回访任务，revisitDate = orderDate.plusYears(1)，冗余存储客户姓名和手机号
    - listTasks：按状态分页查询回访任务
    - getTask：按 ID 查询回访任务详情，不存在时抛出 ResourceNotFoundException
    - completeTask：将 PENDING 状态的任务标记为 COMPLETED，设置 completedAt
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_

  - [x] 4.3 创建 RevisitController
    - 创建 `com.example.cake.controller.RevisitController`，映射 `/api/revisits`
    - GET / → 分页查询回访任务列表，支持 page, size, status 参数
    - GET /{id} → 查询回访任务详情（含关联订单信息）
    - PUT /{id}/complete → 标记回访任务为已完成
    - _需求: 2.3, 2.4, 2.5, 2.6, 3.1, 3.4, 3.5, 3.8, 3.9_

  - [ ]* 4.4 编写回访模块单元测试
    - 使用 MockMvc 测试 RevisitController 各端点
    - 测试回访任务标记完成后状态变更
    - 测试闰年日期回访计算（2024-02-29 → 2025-02-28）
    - _需求: 2.1, 2.4, 2.8_

  - [ ]* 4.5 编写回访模块属性测试
    - **属性 7：回访任务自动生成与日期计算正确性**
    - **验证需求: 2.1, 2.2, 2.8**
    - **属性 8：回访任务状态筛选正确性**
    - **验证需求: 2.3, 2.5**
    - **属性 9：回访任务标记完成的状态变更**
    - **验证需求: 2.4**
    - **属性 10：已删除订单不生成回访任务**
    - **验证需求: 2.7**

- [x] 5. 检查点 - 回访模块验证
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 6. API 通用功能完善
  - [x] 6.1 实现分页响应结构
    - 确保分页查询响应包含：当前页数据列表（content）、总记录数（totalElements）、总页数（totalPages）、当前页码（number）
    - 在 OrderController 和 RevisitController 中统一分页响应格式
    - _需求: 3.8, 3.9_

  - [ ]* 6.2 编写 API 通用属性测试
    - **属性 11：JSON 序列化往返一致性**
    - **验证需求: 3.2**
    - **属性 12：错误响应正确性**
    - **验证需求: 3.6, 3.7**
    - **属性 13：分页响应结构完整性**
    - **验证需求: 3.8, 3.9**

- [x] 7. H5 移动端页面实现
  - [x] 7.1 创建 H5 页面主框架和公共样式
    - 在 `src/main/resources/static/` 下创建 H5 页面文件
    - 实现响应式布局基础样式，适配 320px 至 768px 屏幕宽度
    - 确保可点击元素最小触控区域为 44px × 44px
    - 实现加载状态指示器组件
    - _需求: 4.1, 4.4, 4.5, 4.6_

  - [x] 7.2 实现订单管理 H5 页面
    - 实现订单列表页面（分页加载、搜索功能）
    - 实现订单创建表单页面（含表单校验）
    - 实现订单详情查看页面
    - 通过 fetch API 调用后端 RESTful 接口
    - _需求: 4.2, 4.6_

  - [x] 7.3 实现回访任务 H5 页面
    - 实现回访任务列表页面（分页加载、状态筛选）
    - 实现回访任务标记完成功能
    - 通过 fetch API 调用后端 RESTful 接口
    - _需求: 4.3, 4.6_

- [x] 8. 集成与最终验证
  - [x] 8.1 整合所有模块并验证端到端流程
    - 验证订单创建后自动生成回访任务的完整流程
    - 验证 H5 页面与后端 API 的交互正确性
    - 清理示例代码（demos 包下的 BasicController、PathVariableController、User 等）
    - _需求: 1.1, 2.1, 2.8, 4.2, 4.3_

- [x] 9. 最终检查点 - 全部测试通过
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了对应的需求编号，确保需求可追溯
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
