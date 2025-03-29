// Set solver :)

// Properties
// Shapes: 0=oval, 1=rhombus, 2=squigle
// color: 0=red, 1=green, 2=purple
// filling: 0=none, 1=partial, 2=full
// [shape,color,filling,number]

function setsolve(a){
  len=a.length;
  for (let i=0;i<len;i++){
    for (let j=i+1;j<len;j++){
      for (let k=j+1;k<len;k++){
        if (!((a[i][0]==a[j][0] && a[i][0]==a[k][0])||
              (a[i][0]!=a[j][0] && a[i][0]!=a[k][0]
               && a[j][0]!=a[k][0]))){
          continue;
        }
        if (!((a[i][1]==a[j][1] && a[i][1]==a[k][1])||
              (a[i][1]!=a[j][1] && a[i][1]!=a[k][1]
               && a[j][1]!=a[k][1]))){
          continue;
        }
        if (!((a[i][2]==a[j][2] && a[i][2]==a[k][2])||
              (a[i][2]!=a[j][2] && a[i][2]!=a[k][2]
               && a[j][2]!=a[k][2]))){
          continue;
        }
        if (!((a[i][3]==a[j][3] && a[i][3]==a[k][3])||
              (a[i][3]!=a[j][3] && a[i][3]!=a[k][3]
               && a[j][3]!=a[k][3]))){
          continue;
        }
        alert("SET FOUND!!!!!!"+[i,j,k].toString());
      }
    }
  }
}
