#  描述不全更多逻辑请祥看代码逻辑  或官网源码
## 1. 实现虚拟DOM
## 2. 实现fiber
## 3. 实现状态管理
## 4. 实现ReactDOM
## 5. 实现render
## 6. 实现scheduleRoot
## 7. 实现createElement
## 8. 实现update enqueueUpdate单链表类封装
## 9. 实现Component
## 10. 实现utils(解析设置props属性 attr 样式 事件等)
## 11. 实现effect副作用收集
## 12. 实现订阅发布设计模式
## 13. 实现组件更新逻辑
## 14. 实现类组件
## 15. 实现函数组件
## 16. 实现方法深度结合
## 17 scheduleRoot(从根节点开始调度根据虚拟DOM生成fiber等工作的开始进行页面生成或更新渲染)
## 18 requestIdleCallback(谷歌浏览器每帧执行空余时间利用函数 兼容性问题 react利用MessageChannel进行模拟)
## 19 workLoop(循环执行工作开始)
## 20 performUnitOfWork(结合beginWork 递归 完成此节点的同时收集其副作用completeUnitOfWork)
## 21 beginWork(创建DOM元素 生成子fiber)
## 22 updateHostRoot(查找 创建子fiber)
## 23 updateHostText(查找 创建内容 创建子fiber)
## 24 updateHost(查找 创建DOM 创建子fiber)
## 25 updateClassComponent(查找 创建类实例 创建子fiber 类组件的stateNode 是类实例 挂载的时候需注意类实例所属的fiber避免重复挂载 跳跃处理等)
## 26 updateFunctionComponent(查找 创建函数fiber 创建子fiber 注意hooks索引以及函数组件hooks清空问题处理)
## 27 结合剩下的方法共同创建react: reconcileChildren,commitRoot,createDOM,updateDOM,updateHostText,updateHostRoot,reconcileChildren,hooks(每个hook都有自己的state和updateQueue)）
## 28. 实现react hooks
## 29. 实现react hooks useState （useState是个语法糖   是基于useReducer实现的）
## 30. 实现react hooks useReducer
## 31. 实现react hooks useMemo(缓存属性处理防止错乱更新)
## 32. 实现react hooks useCallback(缓存方法处理防止错乱更新)
## 33. 实现react hooks useContext(跨组件传递)
## 34. 实现react hooks useEffect(非阻塞 操作副作用  宏微任务逻辑  此方法为宏任务处理 useLayoutEffect微任务处理)
## 35. 实现react hooks useLayoutEffect(阻塞浏览器 queueMicrotask)
## 36. 实现react hooks useRef(缓存)
