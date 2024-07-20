import {REACT_NUMBER_DATA_TYPES} from "../react-nums/react-nums-props.js";
import {ReactNumbersHandler,ReactNumber, ReactEquation} from "../react-nums/react-nums.js";

const groupA=new ReactNumbersHandler()

const a=new ReactNumber(1, REACT_NUMBER_DATA_TYPES.NUMBER, "a", groupA)
const b=new ReactNumber(2, REACT_NUMBER_DATA_TYPES.NUMBER, "b", groupA)

const z=new ReactEquation(groupA)
z.eq="a+b"

console.log(z.result)

a.number=10
b.number=20

console.log(a+b)
console.log(z.result)

const c=new ReactNumber(3, REACT_NUMBER_DATA_TYPES.NUMBER, "c", groupA)

z.eq = "(a+b*c+(a*b)/c-c)*c*2.5"

console.log(z.valueOf())

c.number=5

console.log(z.valueOf())

z.eq="a"

console.log(String(z))