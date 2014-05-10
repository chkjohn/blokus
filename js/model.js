function buildCube(g, width, colors) // pass width and array of 6 colors
{
  var sq = ['M',0,0,0, 'L',width,0,0, width,width,0, 0,width,0, 'z'],
      foldTbl = [-90, 90, -90, 90, -90, 90],
      bend = -90,
      moveTbl_1 = [-width, 0, -width, 0, -width, 0],
      moveTbl_2 = [width, 0, width, 0, width, 0],
      faces = g.createGroup3D(),
      i;

  for (i=0; i<6; i++)
  {
    side = g.compileShape3D(sq, colors[i]);
    faces.addObj(side);
    faces.translate(0, moveTbl_1[i], 0);
    faces.rotate(0, 0, 1, foldTbl[i]);
    faces.rotate(0, 1, 0, bend);
    faces.translate(0, moveTbl_2[i], 0);
  }
  return faces;
}
