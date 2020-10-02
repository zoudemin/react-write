import { ELEMENT_TEXT } from './constants.js';
import { Update } from './updateQueue.js';
import { scheduleRoot, useReducer } from './scheduler.js';

/**
 * @param {} type 元素类型span div
 * @param {*} config 配置对象属性 key ref
 * @param {...any} children 所有子元素  数组
*/
function createElement(type, config, ...children){
  delete config.__self;
  delete config.__source;//表示此元素在哪行哪列哪个文件生成
  return {
    type,
    props: {
      ...config,
      children: children.map((item)=>{
        return typeof item === 'object'?item:{
          type:ELEMENT_TEXT,
          props:{
            text: item,
            children: [],
          }
        }
      })
    }
  }
}
class Component {
  constructor(props){
    this.props = props;
    // this.updateQueue = new UpdateQueue();
  }

  setState(payload){//对象  函数  都有可能
    let update = new Update(payload);
    //updateQueue其实是放在此类组件对应的fiber节点的 internalFiber上的
    this.internalFiber.updateQueue.enqueueUpdate(update);
    // this.updateQueue.enqueueUpdate(update);
    scheduleRoot();//从根节点开始调度
  }
}

Component.prototype.isReactComponent = {};//标明是类组件


const React = {
  createElement,
  Component,
  useReducer,
}
export default React;