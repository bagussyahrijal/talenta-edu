<<<<<<<< HEAD:public/build/assets/data-table-column-header-BfaXvBr2.js
import{j as s}from"./app-C3Frf0el.js";import{c as n}from"./utils-BxSLavnc.js";import{B as c}from"./button-lWTJTxkb.js";import{D as p,a as l,b as x,c as r,d as j}from"./dropdown-menu-DaPn_dsb.js";import{c as d}from"./createLucideIcon-CCBuzl4u.js";import{C as m}from"./chevrons-up-down-B0gREB6e.js";import{E as h}from"./eye-off-19a7ZEoz.js";/**
========
import{j as s}from"./app-BiziCeSQ.js";import{c as n}from"./utils-Dfw14OBc.js";import{B as c}from"./button-CNQntT7c.js";import{D as p,a as l,b as x,c as r,d as j}from"./dropdown-menu-CQprenmq.js";import{c as d}from"./createLucideIcon-BQz0TcG1.js";import{C as m}from"./chevrons-up-down-BfivUYS2.js";import{E as h}from"./eye-off-gyVxAFrm.js";/**
>>>>>>>> 7cb14ada532b27fb255d257fbc002ab36b5e4fc0:public/build/assets/data-table-column-header-C7ASZtz6.js
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],a=d("ArrowDown",g);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],i=d("ArrowUp",f);function y({column:e,title:o,className:t}){return e.getCanSort()?s.jsx("div",{className:n("flex items-center gap-2",t),children:s.jsxs(p,{children:[s.jsx(l,{asChild:!0,children:s.jsxs(c,{variant:"ghost",size:"sm",className:"data-[state=open]:bg-accent -ml-3 h-8",children:[s.jsx("span",{children:o}),e.getIsSorted()==="desc"?s.jsx(a,{}):e.getIsSorted()==="asc"?s.jsx(i,{}):s.jsx(m,{})]})}),s.jsxs(x,{align:"start",children:[s.jsxs(r,{onClick:()=>e.toggleSorting(!1),children:[s.jsx(i,{}),"Asc"]}),s.jsxs(r,{onClick:()=>e.toggleSorting(!0),children:[s.jsx(a,{}),"Desc"]}),s.jsx(j,{}),s.jsxs(r,{onClick:()=>e.toggleVisibility(!1),children:[s.jsx(h,{}),"Hide"]})]})]})}):s.jsx("div",{className:n(t),children:o})}export{y as D};
