import React from './react';
import ReactDOM from './react-dom';
//useState是个语法糖   是基于useReducer实现的

// let style = {border: '1px solid red',margin: '6px'};
// let element1 = (
//   <div id="A1" style={style}>A1
//     <div id="B1" style={style}>B1
//       <div id="C1" style={style}>C1</div>
//       <div id="C2" style={style}>C2</div>
//     </div>
//     <div id="B2" style={style}>B2</div>
//   </div>
// )

// ReactDOM.render(
//   element1,
//   document.getElementById('root')
// );

// let render2 = document.getElementById('render2');
// render2.addEventListener('click',()=>{
//   let element2 = (
//     <div id="A1-new" style={style}>A1-new
//       <div id="B1-new" style={style}>B1-new
//         <div id="C1-new" style={style}>C1-new</div>
//         <div id="C2-new" style={style}>C2-new</div>
//       </div>
//       <div id="B2-new" style={style}>B2-new</div>
//       <div id="B3" style={style}>B3</div>
//     </div>
//   )
  
//   ReactDOM.render(
//     element2,
//     document.getElementById('root')
//   );
// })

// let render3 = document.getElementById('render3');
// render3.addEventListener('click',()=>{
//   let element3 = (
//     <div id="A1-new-3" style={style}>A1-new-3
//       <div id="B1-new-3" style={style}>B1-new-3
//         <div id="C1-new-3" style={style}>C1-new-3</div>
//         <div id="C2-new-3" style={style}>C2-new-3</div>
//       </div>
//       <div id="B2-new-3" style={style}>B2-new-3</div>
//     </div>
//   )
  
//   ReactDOM.render(
//     element3,
//     document.getElementById('root')
//   );
// })

class ClassCounter extends React.Component {
  constructor(props){
    super(props);
    this.state = { number: 0 };
  }
  onClick = ()=>{
    this.setState(state=>({number: state.number + 1}));
  }
  render(){
    return (
      <div id="counter">
        <span>{this.state.number}</span>
        <button onClick={this.onClick}>click+1</button>
      </div>
    )
  }
}
const ADD = 'ADD';
function reducer(state, action){
  switch (action.type) {
    case ADD:
      return {...state,count: state.count+1};
    default:
      return state;
  }
}
function FunctionCounter(){
  const [countState, dispatch] = React.useReducer(reducer,{count:0})//hooks
  return (
    <div id="counter">
      <div>
        <span>{countState.count}</span>
      </div>
      <button onClick={()=>{dispatch({type:ADD})}}>click+1</button>
    </div>
  )
}
// ReactDOM.render(<ClassCounter name="计数器"/>, document.getElementById('root'));
ReactDOM.render(<FunctionCounter name="计数器"/>, document.getElementById('root'));