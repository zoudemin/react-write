import { TAG_ROOT } from './constants';
import { scheduleRoot } from './scheduler';
/**
 * render 把一个元素渲染到一个容器内部
*/

function render(element, container){
  let rootfiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props:{children: [element]}
  }
  scheduleRoot(rootfiber);
}
const ReactDOM = {
  render
}
export default ReactDOM;