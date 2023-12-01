var canvas = document.getElementById('view')
var gl = canvas.getContext('webgl2')

console.log(gl);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

function frame() {
    console.log('tick frame');
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

requestAnimationFrame(frame);
