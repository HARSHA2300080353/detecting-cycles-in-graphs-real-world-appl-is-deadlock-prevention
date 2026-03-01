let originalAdj=[], adj=[];
let V=0;
let cyclePath=[];

function analyzeSystem(){

V=parseInt(vertices.value);

originalAdj=Array.from({length:V+1},()=>Array(V+1).fill(0));
adj=Array.from({length:V+1},()=>Array(V+1).fill(0));

edgesInput.value.trim().split("\n").forEach(line=>{
let [u,v]=line.split(" ").map(Number);
if(u && v){
originalAdj[u][v]=1;
adj[u][v]=1;
}
});

drawGraph(originalAdj,"originalSVG");

detectConditions();

drawGraph(adj,"updatedSVG");
}

/* ---------- CONDITION DETECTOR ---------- */

function detectConditions(){

let status=document.getElementById("status");
let cond=document.getElementById("condition");
let path=document.getElementById("path");

cyclePath=[];

/* MUTUAL EXCLUSION (Self Loop) */
for(let i=1;i<=V;i++){
if(adj[i][i]){
status.innerHTML="<span class='danger'>Deadlock Risk</span>";
cond.innerHTML="Condition: Mutual Exclusion";
path.innerHTML="Self Loop detected at Process P"+i;
return;
}
}

/* CIRCULAR WAIT (Cycle Detection) */

let visited=Array(V+1).fill(false);
let stack=Array(V+1).fill(false);
let temp=[];

function dfs(v){

visited[v]=true;
stack[v]=true;
temp.push(v);

for(let i=1;i<=V;i++){

if(adj[v][i]){

if(!visited[i] && dfs(i)) return true;

else if(stack[i]){
let idx=temp.indexOf(i);
cyclePath=temp.slice(idx);
cyclePath.push(i);
return true;
}
}
}

stack[v]=false;
temp.pop();
return false;
}

for(let i=1;i<=V;i++){
if(!visited[i] && dfs(i)){

status.innerHTML="<span class='danger'>Deadlock Detected</span>";
cond.innerHTML="Condition: Circular Wait";
path.innerHTML="Deadlock Path: "+cyclePath.join(" → ");

adj[cyclePath[0]][cyclePath[1]]=0;
return;
}
}

/* HOLD & WAIT */
let hold=false;
for(let i=1;i<=V;i++){
for(let j=1;j<=V;j++){
if(adj[i][j]) hold=true;
}
}

if(hold){
status.innerHTML="<span class='warn'>Potential Deadlock</span>";
cond.innerHTML="Condition: Hold and Wait";
path.innerHTML="Processes holding resources while waiting.";
return;
}

/* NO PREEMPTION (SAFE STATE) */

status.innerHTML="<span class='safe'>Safe State</span>";
cond.innerHTML="Condition: No Preemption";
path.innerHTML="";
}

/* ---------- GRAPH DRAW ---------- */

function drawGraph(matrix,id){

let svg=document.getElementById(id);
svg.innerHTML="";

let cx=260,cy=190,r=130,nodeR=22;
let pos={};

svg.innerHTML+=`
<defs>
<marker id="arrow" markerWidth="12" markerHeight="12"
refX="10" refY="6" orient="auto">
<path d="M2,2 L10,6 L2,10 Z" fill="#333"/>
</marker>
</defs>`;

for(let i=1;i<=V;i++){
let ang=2*Math.PI*(i-1)/V;
pos[i]={x:cx+r*Math.cos(ang),y:cy+r*Math.sin(ang)};
}

for(let i=1;i<=V;i++){
for(let j=1;j<=V;j++){
if(matrix[i][j]){

let color="#444";

for(let k=0;k<cyclePath.length-1;k++){
if(cyclePath[k]===i && cyclePath[k+1]===j)
color="red";
}

let line=document.createElementNS("http://www.w3.org/2000/svg","line");
line.setAttribute("x1",pos[i].x);
line.setAttribute("y1",pos[i].y);
line.setAttribute("x2",pos[j].x);
line.setAttribute("y2",pos[j].y);
line.setAttribute("stroke",color);
line.setAttribute("stroke-width",color==="red"?"4":"2");
line.setAttribute("marker-end","url(#arrow)");
svg.appendChild(line);
}
}
}

for(let i=1;i<=V;i++){

let c=document.createElementNS("http://www.w3.org/2000/svg","circle");
c.setAttribute("cx",pos[i].x);
c.setAttribute("cy",pos[i].y);
c.setAttribute("r",nodeR);
c.setAttribute("fill","#00c6ff");
svg.appendChild(c);

let t=document.createElementNS("http://www.w3.org/2000/svg","text");
t.setAttribute("x",pos[i].x);
t.setAttribute("y",pos[i].y+5);
t.setAttribute("text-anchor","middle");
t.setAttribute("fill","white");
t.setAttribute("font-weight","bold");
t.textContent="P"+i;
svg.appendChild(t);
}
}   