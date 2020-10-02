//从根节点开始调度
//diff阶段对比新旧虚拟DOM  
//两个阶段
//可以拆分  中断

import { TAG_ROOT, TAG_TEXT, ELEMENT_TEXT, TAG_HOST, PLACEMENT,UPDATE, DELETION, TAG_CLASS, TAG_FUNCTION_COMPONENT } from "./constants";
import { setProps } from './utils';
import { UpdateQueue, Update } from './updateQueue'

//commit阶段不可中断
let nextUnitOfWork = null;
let workInProgressRoot = null;//正在渲染的跟fiber root
let currentRoot=null;//渲染成功之后 的当前跟root fiber
let deletions = [];//删除的节点需要特殊处理
let workInProgressFiber = null;//正在工作中的fiber
let hookIndex = 0;//hooks索引  useReducer /useCallback/usecombakball等
function performUnitOfWork(currentFiber){
  beginWork(currentFiber);
  if(currentFiber.child){
    return currentFiber.child;
  }

  while(currentFiber){
    completeUnitOfWork(currentFiber)
    if(currentFiber.sibling){
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.return;
  }
}
//完成节点回调   effect链 顺序等于完成链
function completeUnitOfWork(currentFiber){
  let returnFiber = currentFiber.return;
  if(returnFiber){
    /////////////////////////////将自己儿子的effect链  挂载到父亲身上
    if(!returnFiber.firstEffect){
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if(currentFiber.lastEffect){
      if(returnFiber.lastEffect){
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }
    ////////////////////////////有副作用的话将自己的fiber挂载到父亲身上
    const effectTag = currentFiber.effectTag;
    if(effectTag){//自己有副作用
      if(returnFiber.lastEffect){
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      //每一个fiber有两个属性firstEffect指向第一个有副作用的子fiber  lastEffect指向最后一个有副作用的子fiber
      //中间的用nextEffect做成一个单链表
      returnFiber.lastEffect = currentFiber;
    }
  }
}

//创建真实DOM
//创建子fiber  没有叔叔 只找儿子
function beginWork(currentFiber){
  if(currentFiber.tag === TAG_ROOT){
    updateHostRoot(currentFiber);
  }else if(currentFiber.tag === TAG_TEXT){
    updateHostText(currentFiber);
  }else if(currentFiber.tag === TAG_HOST){
    updateHost(currentFiber);
  }else if(currentFiber.tag === TAG_CLASS){
    updateClassComponent(currentFiber);
  }else if(currentFiber.tag === TAG_FUNCTION_COMPONENT){
    updateFunctionComponent(currentFiber);
  }
}

function updateFunctionComponent(currentFiber){
  workInProgressFiber = currentFiber;
  hookIndex = 0;
  workInProgressFiber.hooks = [];
  const newChildren = [currentFiber.type(currentFiber.props)];
  // console.log(newChildren)
  reconcileChildren(currentFiber,newChildren);
}

function updateClassComponent(currentFiber){
  if(!currentFiber.stateNode){//类组件的stateNode 是类实例
    currentFiber.stateNode = new currentFiber.type(currentFiber.props);
    currentFiber.stateNode.internalFiber = currentFiber;
    currentFiber.updateQueue = new UpdateQueue();
  }
  //给类组件的实例的state赋值
  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state);
  let newElement = currentFiber.stateNode.render();
  const newChildren = [newElement];
  reconcileChildren(currentFiber,newChildren);
}

function updateHost(currentFiber){
  if(!currentFiber.stateNode){
    currentFiber.stateNode = createDOM(currentFiber);
  }
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}

function createDOM(currentFiber){
  if(currentFiber.tag === TAG_TEXT){
    return document.createTextNode(currentFiber.props.text);
  }else if(currentFiber.tag === TAG_HOST){
    let stateNode = document.createElement(currentFiber.type);
    updateDOM(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}

function updateDOM(stateNode, oldProps, newProps){
  //stateNode.setAttribute 属性是否存在 判断是否是类实例
  if(stateNode&&stateNode.setAttribute) setProps(stateNode, oldProps, newProps);
}

function updateHostText(currentFiber){
  if(!currentFiber.stateNode){//如果没有创建DOM节点  就创建DOM节点
    currentFiber.stateNode = createDOM(currentFiber);
  }
}

function updateHostRoot(currentFiber){
  //先处理自己  如果是一个原生节点 创建真实DOM 然后创建子fiber
  let newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber,newChildren);
}

function reconcileChildren(currentFiber,newChildren){
  let newChildIndex = 0;
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  oldFiber&&(oldFiber.lastEffect = oldFiber.nextEffect = oldFiber.firstEffect = null);
  let prevSibling;
  while(newChildIndex<newChildren.length||oldFiber){
    let newChild = newChildren[newChildIndex];
    let tag;
    let newFiber;
    const sameType = oldFiber&&newChild&&oldFiber.type===newChild.type;
    if(newChild && typeof newChild.type === 'function' &&newChild.type.prototype.isReactComponent){
      tag = TAG_CLASS;
    }else if(newChild && typeof newChild.type === 'function'){
      tag = TAG_FUNCTION_COMPONENT;
    }else if(newChild&&newChild.type === ELEMENT_TEXT){
      tag = TAG_TEXT;
    }else if(newChild&&typeof newChild.type==='string'){
      tag = TAG_HOST;
    }
    if(sameType){
      if(oldFiber.alternate){
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.updateQueue = oldFiber.updateQueue||new UpdateQueue();
        newFiber.nextEffect = null;
      }else{
          newFiber = {
            tag: oldFiber.tag,//TAG_HOST
            type:oldFiber.type,//div
            props:newChild.props,//
            stateNode:oldFiber.stateNode,//表示还没有创建type类型的元素   div
            alternate: oldFiber,
            updateQueue: oldFiber.updateQueue||new UpdateQueue(),
            return:currentFiber,//父节点
            effectTag:UPDATE,//副作用标识
            nextEffect:null,//effect list 是一个单链表 副作用链里指向下一个副作用节点 顺序和完成顺序是一样的 但是节点可能会少
          }
      }
    }else{
      if(newChild){//判断新节点是否为null
        newFiber = {
          tag,//TAG_HOST
          type:newChild.type,//div
          props:newChild.props,//
          stateNode:null,//表示还没有创建type类型的元素   div
          return:currentFiber,//父节点
          updateQueue: new UpdateQueue(),
          effectTag:PLACEMENT,//副作用标识
          nextEffect:null,//effect list 是一个单链表 副作用链里指向下一个副作用节点 顺序和完成顺序是一样的 但是节点可能会少
        }
      }
      if(oldFiber){
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
      }
    }
    if(oldFiber){
      oldFiber = oldFiber.sibling;
    }
    if(newFiber){//最后一个子元素无sibling属性
      if(newChildIndex === 0){//索引为0说明为第一个子元素
        currentFiber.child = newFiber;
      }else{
        prevSibling.sibling = newFiber;//上个元素指向下个兄弟元素
      }
      prevSibling = newFiber;
    }
    newChildIndex+=1;
  }
}

export function scheduleRoot(rootFiber){
  if(currentRoot&&currentRoot.alternate){
    workInProgressRoot = currentRoot.alternate;
    workInProgressRoot.alternate = currentRoot;
    if(rootFiber) workInProgressRoot.props = rootFiber.props;
  }else if(currentRoot){
    if(rootFiber){
      rootFiber.alternate = currentRoot;
      workInProgressRoot = rootFiber;
    } else {
      workInProgressRoot = {
        ...currentRoot,
        alternate:currentRoot,
      }
    }
  }else{
    workInProgressRoot = rootFiber;
  }
  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.lastEffect = null;
  nextUnitOfWork = workInProgressRoot;
}
//循环执行工作nextUnitOfWork;
function workLoop(deadline){
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining()<1;
  }
  if(!nextUnitOfWork&&workInProgressRoot){
    console.log('render阶段结束！')
    commitRoot();//提交
  }
  requestIdleCallback(workLoop,{timeout:500});
}

function commitRoot(){
  deletions.forEach(commitWork);//删除   执行effect list 之前
  let currentFiber = workInProgressRoot.firstEffect;
  while(currentFiber){
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  deletions.length = 0;
  currentRoot = workInProgressRoot;//当前渲染的跟fiber
  workInProgressRoot = null;
}

function commitWork(currentFiber){
  if(!currentFiber) return;
  let returnFiber = currentFiber.return;
  while(returnFiber.tag !== TAG_HOST&&returnFiber.tag!==TAG_ROOT&&returnFiber.tag!==TAG_TEXT){
    returnFiber = returnFiber.return;
  }
  let domReturn = returnFiber.stateNode;
  if(currentFiber.effectTag === PLACEMENT){//增加节点
    let nextFiber = currentFiber;
    if(nextFiber.tag === TAG_CLASS){
      return ;
    }
    //如果挂载的不是文本节点和DOM节点的话  那么可能是类组件fiber  那么久取他的第一个儿子  child  一直找  
    //直到找到真实DOM节点位置
    while (nextFiber.tag !== TAG_HOST&&nextFiber.tag!==TAG_TEXT){
      nextFiber = nextFiber.child;
    }
    domReturn.appendChild(nextFiber.stateNode);
  } else if (currentFiber.effectTag === DELETION){//删除
    return commitDeletion(currentFiber,domReturn);
  } else if (currentFiber.effectTag === UPDATE){//更新
    if(currentFiber.type === ELEMENT_TEXT){
      currentFiber.alternate.props.text != currentFiber.props.text&&(currentFiber.stateNode.textContent = currentFiber.props.text);
    } else {
      // if(currentFiber.type === TAG_CLASS){
      //   return currentFiber.effectTag = null;
      // }
      updateDOM(currentFiber.stateNode,currentFiber.alternate.props,currentFiber.props);
    }
  }
  currentFiber.effectTag = null;
}

function commitDeletion(currentFiber,domReturn){
  if(currentFiber.tag==TAG_HOST||currentFiber.tag==TAG_TEXT){
    domReturn.removeChild(currentFiber.stateNode);
  }
  commitDeletion(currentFiber.child,domReturn);
}
/**
 * workInProgressFiber = currentFiber;
  hookIndex = 0;
  workInProgressFiber.hooks = [];
*/
export function useReducer(reducer, initialValue){//只有函数组建的fiber才会有 hooks  专属   他的子节点都是TAG_HOST
  let oldHook = workInProgressFiber.alternate&&workInProgressFiber.alternate.hooks&&workInProgressFiber.alternate.hooks[hookIndex];
  let newHook = oldHook;//只用newHook删掉oldHook
  if(oldHook){
    oldHook.state = oldHook.updateQueue.forceUpdate(oldHook.state);
  } else {
    newHook = {
      state:initialValue,
      updateQueue: new UpdateQueue(),
    }
  }
  const dispatch = action =>{
    newHook.updateQueue.enqueueUpdate(
      new Update(reducer?reducer(newHook.state, action):action)
    );
    scheduleRoot();
  }
  workInProgressFiber.hooks[hookIndex++] = newHook;
  return [newHook.state, dispatch];
}

requestIdleCallback(workLoop, {timeout:500});