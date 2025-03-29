// Set solver :)

// Properties
// Shapes: 0=oval, 1=rhombus, 2=squigle
// color: 0=red, 1=green, 2=purple
// filling: 0=none, 1=partial, 2=full
// [shape,color,filling]

function setsolve(a){
  len=a.length;
  for (let i=0;i<len;i++){
    for (let j=i+1;j<len;j++){
      for (let k=j+1;k<len;k++){
        if (!((a[i][0]==a[j][0] && a[i][0]==a[k][0])||
              (a[i][0]!=a[j][0] && a[i][0]!=a[k][0]
      }
    }
  }
}
