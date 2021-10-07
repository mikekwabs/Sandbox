import sphereShaderVertex from '../shaders/sphere/vertex.glsl'
import sphereShaderFragment from '../shaders/sphere/fragment.glsl'
import planeShaderVertex from '../shaders/plane/vertex.glsl'
import planeShaderFragment from '../shaders/plane/fragment.glsl'

import Sandbox from './modules/Sandbox.js'

/*const SPECTOR = require('spectorjs')
const spector = new SPECTOR.Spector()
spector.displayUI()*/

let aspectRatio = window.innerWidth / window.innerHeight
const canvas = document.getElementById('webgl')
const renderer = new Sandbox.Renderer(canvas)

const jellyfish = new Sandbox.ImageTexture(renderer.gl, './img/jellyfish.jpg')
const fbTex = new Sandbox.DataTexture(renderer.gl, 'rgba', 256 * renderer.pixelRatio, 256 * renderer.pixelRatio, null, 'linear')

const cubeFaceFrameBuffer = new Sandbox.FrameBuffer(renderer.gl, fbTex)

const volume = new Sandbox.Volume()

const PointLight = {
	x: 0.00,
	y: 0.00,
	z: 1.25
}

const pointLight = new Sandbox.Light('point', [0.00, 0.00, 1.25])

const planeShader = new Sandbox.Program(renderer.gl, planeShaderVertex, planeShaderFragment)
planeShader.surfaceNormals = true
planeShader.setUniform('uTexture', jellyfish, 'tex')
planeShader.setUniform('uPointLight', pointLight.position, '3f')
planeShader.setUniform('uCameraPosition', [0, 0, 5])

//Cube
const cube = new Sandbox.Cube(2, 2, 2, 1, 1, 1)
const cubeMesh = new Sandbox.Mesh(cube, planeShader)
volume.add(cubeMesh)

cubeMesh.setPosition(0, 0, -1)

//Sphere
const sphere = new Sandbox.Sphere(0.25, 64)
const sphereShader = new Sandbox.Program(renderer.gl, sphereShaderVertex, sphereShaderFragment)
const sphereMesh = new Sandbox.Mesh(sphere, sphereShader)
volume.add(sphereMesh)


//Set Viewport
const camera = new Sandbox.Perspective(70, aspectRatio, 0.1, 100)
camera.position.z = 5
renderer.resize()

let time = 0

const translateX = document.getElementById('translateX')
const translateY = document.getElementById('translateY')

translateX.addEventListener('input', event => {
	camera.position.x = event.target.value
})

translateY.addEventListener('input', event => {
	camera.position.y = event.target.value
})

const buttons = document.querySelectorAll('button')

buttons.forEach(button => {
	button.addEventListener('click', event => {
		buttons.forEach(item => item.classList.remove('active'))
		button.classList.add('active')
		switch (button.id) {
			case 'none':
				camera.lookAtEnabled = false
				break
			case 'sphere':
				camera.lookAt(cubeMesh)
				break
			case 'light':
				camera.lookAt(sphereMesh)
				break
			default:
				break
		}
	})
})

let then = 0
const draw = (now) => {
	renderer.setFrameBuffer(cubeFaceFrameBuffer)
	renderer.gl.clearColor(0.09, 0.2, 0.2, 1)
	camera.setAspectRatio(1)
	renderer.gl.viewport(0, 0, fbTex.width, fbTex.height)
	planeShader.uniforms.uTexture.value = jellyfish
	cubeMesh.setRotationY(time*15)
	cubeMesh.setRotationX(time*15)
	renderer.render(volume, camera)
	cubeMesh.setRotationX(0)
	renderer.setFrameBuffer(null)
	renderer.gl.clearColor(0, 0, 0, 1)
	camera.setAspectRatio(renderer.gl.canvas.width / renderer.gl.canvas.height)
	renderer.gl.viewport(0, 0, renderer.gl.canvas.width, renderer.gl.canvas.height)
	planeShader.uniforms.uTexture.value = fbTex
	renderer.render(volume, camera)
	now *= 0.001
	time += now - then
 	pointLight.setPosition(Math.sin(time * 1.5) * 6, Math.cos(time * 1.5) * 3, Math.sin(time * 1) * 3)
 	planeShader.uniforms.uPointLight.value = pointLight.position
 	planeShader.uniforms.uCameraPosition.value = [camera.position.x, camera.position.y, camera.position.z]
 	cubeMesh.setRotationY(time*10)
 	sphereMesh.setPosition(Math.sin(time * 1.5) * 6, Math.cos(time * 1.5) * 3, Math.sin(time * 1) * 3)
 	then = now
	window.requestAnimationFrame(draw)
}

window.addEventListener('resize', () => {
	if (renderer.resize()) {
		aspectRatio = renderer.gl.canvas.width / renderer.gl.canvas.height
		camera.setAspectRatio(aspectRatio)
	}
})
window.requestAnimationFrame(draw)

const controls = document.querySelector('.controls')

const mouse = {
	x1: 0,
	y1: 0,
	x2: 0,
	y2: 0
}

controls.addEventListener('mousedown', event => {
	if (event.target.classList.contains('controls')) {
		event.preventDefault()
		mouse.x1 = event.clientX
		mouse.y1 = event.clientY
		document.onmouseup = removeDrag
		document.onmousemove = dragControls
	}
})

const dragControls = (event) => {
	event.preventDefault()
	mouse.x2 = mouse.x1 - event.clientX
	mouse.y2 = mouse.y1 - event.clientY
	mouse.x1 = event.clientX
	mouse.y1 = event.clientY

	controls.style.top = `${controls.offsetTop - mouse.y2}px`
	controls.style.bottom = `auto`
	controls.style.left = `${controls.offsetLeft - mouse.x2}px`
}

const removeDrag = () => {
	document.onmouseup = null
	document.onmousemove = null
}

const resetButton = document.querySelector('button')

window.setTimeout(() => {
	controls.classList.add('active')
	/*translateX.classList.add('active')
 	translateY.classList.add('active')
 	lightX.classList.add('active')
 	lightY.classList.add('active')
 	lightZ.classList.add('active')*/
 	resetButton.classList.add('active')
}, 500)
