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

function drawCube(cvsID)
{
  var g = new Cango3D(cvsID),  // create a graphics context
      width = 50,
      colors = ["red", "green", "blue", "yellow", "silver", "sienna"],
      cube, drag, movedCube,
      radius = 50,         // sensitivity of dragging action
      savMouse,
      dragPt,
      csrPt,
      u, theta;

  function grabCube(mousePos)
  {
    savMouse = mousePos;
  }

  function dragCube(mousePos)
  {
    // This drag function rotates an object around its drawing origin
    // assume a lever from drawing origin to drag point z=radius is moved by csr
    var dragPt = {x:savMouse.x-this.grabOfs.x, y:savMouse.y-this.grabOfs.y, z:radius},
        csrPt = {x:mousePos.x-this.grabOfs.x, y:mousePos.y-this.grabOfs.y, z:radius},
        u, theta;

    savMouse = mousePos;    // save these as reference for next drag
    // axis to rotate lever is the normal to plane defined by the 3 points
    u = this.cgo.calcNormal(this.dwgOrg, dragPt, csrPt);
    // calc angle between dragPt and csrPt (amount of rotation needed about axis 'u')
    theta = this.cgo.calcIncAngle(this.dwgOrg, dragPt, csrPt);    // degrees
    // apply this drag rotation to 'cube' Group3D
    cube.transform.rotate(u.x, u.y, u.z, theta);
    // redraw with rotation applied
    g.renderFrame(movedCube);
  }

  g.clearCanvas();
  //g.setPropertyDefault("backgroundColor", "lightyellow");
  g.setWorldCoords3D(-150, -100, 300);
  g.setLightSource(0, 100, 200);

  cube = buildCube(g, width, colors);
  // move the cube so cnter is over the drawing origin for nice drag rotation
  cube.translate(-width/2, -width/2, width/2);

  // enable dragging
  drag = new Drag3D(g, grabCube, dragCube, null);
  cube.enableDrag(drag);

  // make a group to move the cube independent of turning
  movedCube = g.createGroup3D(cube);
  movedCube.transform.rotate(1, 2, 1, 35);

  g.render(movedCube);
}
