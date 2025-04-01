import { EditorControls } from '../EditorControls.js';
var APP = {

	Player: function () {

		const This = this
		var renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
		renderer.setPixelRatio( window.devicePixelRatio ); // TODO: Use player.setPixelRatio()
		renderer.outputEncoding = THREE.sRGBEncoding;

		var loader = new THREE.ObjectLoader();
		var camera, scene;
		var avatar; //2024-4-25新增

		var vrButton = VRButton.createButton( renderer ); // eslint-disable-line no-undef

		var events = {};

		var dom = document.createElement( 'div' );
		dom.appendChild( renderer.domElement );

		this.dom = dom;
		window.g_3d_render = renderer;
		window.g_3d_domElement = renderer.domElement;
		window.g_3d_player = this;

		this.width = 500;
		this.height = 500;
		var popMap = new Map()

		this.load =function ( json , dxib = null ) {
			// let oldJson = json
			This.json = json//JSON.parse( JSON.stringify( json ) )
			This.dxib = dxib
			// json = This.json
			console.log('app-Player.load--json:',json)//,oldJson)

			var project = json.project;

			if ( project.vr !== undefined ) renderer.xr.enabled = project.vr;
			if ( project.shadows !== undefined ) renderer.shadowMap.enabled = project.shadows;
			if ( project.shadowType !== undefined ) renderer.shadowMap.type = project.shadowType;
			if ( project.toneMapping !== undefined ) renderer.toneMapping = project.toneMapping;
			if ( project.toneMappingExposure !== undefined ) renderer.toneMappingExposure = project.toneMappingExposure;
			if ( project.physicallyCorrectLights !== undefined ) renderer.physicallyCorrectLights = project.physicallyCorrectLights;

			console.log('json.scene:',json.scene  ) //, JSON.parse( JSON.stringify(json.scene) )
			try{
				this.setScene( loader.parse( json.scene ) );
			}catch(ex)
			{
				console.log('setScene-loader.parse-ex:'+ex,ex)
			}
			this.setCamera( loader.parse( json.camera ) );

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				pointerdown: [],
				pointerup: [],
				pointermove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( let uuid in json.scripts ) {

				let object = scene.getObjectByProperty( 'uuid', uuid, true );
				object.scripts = json.scripts[ uuid ];
				console.log('scripts:',object.scripts,uuid)

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}
				This.init_object_scripts(object)
			}

			dispatch( events.init, arguments ,'init');

		};

		this.init_object_scripts = function(object)
		{
			if(!object) return false
			let scripts = object.scripts
			let dxib    = This.dxib
			if(!scripts ||scripts.length<=0) return false

			let uuid = object.uuid
			console.log('scripts:',scripts,uuid,object)

			let popScriptCode = ''
			for ( var i = 0; i < scripts.length; i ++ ) {

				let script = scripts[ i ];
				//如果不是js开头或结尾，则判断是poplang（与原来的逻辑正好相反）
				if(!(script.name &&  (script.name.startsWith('js') ||script.name.endsWith('js'))))   //script.name && script.name.startsWith('pop')){
				{
					popScriptCode = popScriptCode+ '\n' + script.source
					continue
				}

				try{
					let functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

					for ( let name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}
				}catch(ex){
					console.log('app-Player.load()->new Function-exception:'+ex,ex,'source:',script.source)
				}

			}

			if(popScriptCode.length<=0 ) return false//continue
			let  poplang =  new PopRuntime(object)
			if(dxib && typeof dxib.initDXIBRuntime == 'function')
			{
				dxib.initDXIBRuntime(poplang) //绑定与dxib的关系（启动了相应的dxibManager的dxib.play等的事件）
				console.log('into app.js-init-object-dxib:',dxib,poplang)
			}
			popMap.set(uuid,poplang)

			//绑定object.poplang实例，并且初始化之（执行他的init函数）
			setTimeout(async ()=>{
				let runPoplangRet = await poplang.runScript(null, popScriptCode, true)
				console.log('object-uuid:'+uuid,object,'runPoplangRet:',runPoplangRet,popScriptCode)

				let opRet = await poplang.op(null, 'init')
				console.log('object-uuid:'+uuid,object,'poplang.op-init-func-ret:',opRet)
			},1)
			return true
		}

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();
			This.camera = camera
			This.initPlayer(camera)
		};

		this.startRecord = window.g_3d_player_start_record = function()
		{
			console.log('g_3d_domElement.getElementsByTagName:',g_3d_domElement,g_3d_domElement.getElementsByTagName('canvas'))
			let canvas =g_3d_domElement// g_3d_domElement.getElementsByTagName('canvas')[0]
			// for (const child of g_3d_domElement.children) {
			// 	console.log('child of g_3d_domElement.children:',child.tagName,child);
			// 	canvas = child
			// }
			// const base64 = g_3d_domElement.toDataURL( 'image/webp', 0.9 );
			// console.log( 'app.player.js-shortcut-base64:', base64 );
			// window.ifileDb.deleteDataByKey( 'from.dtns.3d.creator.img' );
			// window.ifileDb.addData( { key: 'from.dtns.3d.creator.img', data: base64 } );
			
			console.log('startRecord-canvas:',canvas)
			if(!canvas) return 
			if(typeof g_3d_recorder!='undefined') g_3d_recorder.stop(0)
			let allChunks=[];
			let stream=canvas.captureStream(24); // 60 FPS recording
			let recorder=new MediaRecorder(stream, {
				mimeType: 'video/webm;codecs=vp9',
			});
			window.g_3d_recorder = recorder
			window.g_3d_recorder_chunks = allChunks
			// canvas 录制回调
			recorder.ondataavailable=e=>{
				allChunks.push(e.data);
			}
			recorder.start(10);
		}
		this.stopRecord = window.g_3d_player_stop_record = function()
		{
			if(typeof g_3d_recorder=='undefined' || !window.g_3d_recorder){
				console.log('recorder is null')
				return 
			}
			g_3d_recorder.stop(0)
			const videoBlob = new Blob(g_3d_recorder_chunks, { 'type' : 'video/webm' })
			var myUrl = URL.createObjectURL(videoBlob)
			rpc_client.downloadFile(myUrl,'3dplayer-record-'+Date.now()+'.webm')
			window.g_3d_recorder_chunks = null
			return videoBlob
		}

		this.showMode = window.g_3d_player_showMode =  function (mode = 'normal')
		{
			console.log('g_3d_player_showMode-showMode:',mode)
			This.mode = mode
			if(mode=='normal')
			{
				if(This.controls)
				{
					This.controls.dispose()
					This.controls = null
				}
			}else{
				if(!This.controls){
					setTimeout(()=>{
						console.log('init EditorControls:',This.camera ,This.dom)
						This.controls = new EditorControls( This.camera, This.dom );
						This.controls.addEventListener( 'change', function () {

							// signals.cameraChanged.dispatch( camera );
							// signals.refreshSidebarObject3D.dispatch( camera );

						} );
					},300)
				}else{
					setTimeout(()=>{
						This.controls.dispose()
						This.controls = null
						console.log('init EditorControls:',This.camera ,This.dom)
						This.controls = new EditorControls( This.camera, This.dom );
						This.controls.addEventListener( 'change', function () {
						} );
					},300)
				}
			}
		}


		this.setScene = function ( value ) {

			scene = value;
			avatar = scene.getObjectByName('avatar',true)
		};

		this.setPixelRatio = function ( pixelRatio ) {

			renderer.setPixelRatio( pixelRatio );

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			renderer.setSize( width, height );

		};
		
		function dispatch( array, event ,event_name ) {

			if(array && event)//2024-5-21新增（以便dispatch 'move'）
			try{
				for ( var i = 0, l = array.length; i < l; i ++ ) {

					array[ i ]( event );
					
				}
			}catch(e){
				console.error( ( e.message || e ), ( e.stack || '' ) );
			}

			//2024-5-13新增
			//调用poplang中的update函数（这个函数非常有用！）
			popMap.forEach(function(value,key,map){
				//console.log('call-app.js-poplang-update:',value)
				try{
					const event_name_tmp = '3d_'+event_name //前缀为x3d
					if(value && value.$$[event_name_tmp]  )
					{
						value.context[event_name_tmp+'_event'] = event
						value.op(null,event_name_tmp)
						//console.log('poplang-update:'+key+' success!')
					}
				}catch(e){
					console.log('poplang-key:'+key+' exception:'+e)
					console.error( ( e.message || e ), ( e.stack || '' ) );
				}
			})

		}

		var time, startTime, prevTime;
		const clock = new THREE.Clock();//2023-3-7新增
		function animate() {

			time = performance.now();

			try {

				dispatch( events.update, { time: time - startTime, delta: time - prevTime } ,'update' );

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || '' ) );

			}

			//2024-3-7新增
			const delta = clock.getDelta();
			This.updatePlayer(delta)
			///----------------render之前调用

			renderer.render( scene, camera );

			prevTime = time;
		}

		this.play = function () {

			if ( renderer.xr.enabled ) dom.append( vrButton );

			startTime = prevTime = performance.now();

			document.addEventListener( 'keydown', onKeyDown );
			document.addEventListener( 'keyup', onKeyUp );
			document.addEventListener( 'pointerdown', onPointerDown );
			document.addEventListener( 'pointerup', onPointerUp );
			document.addEventListener( 'pointermove', onPointerMove );
			if(This.mode!='normal')
			{
				document.addEventListener( 'mousedown',onMouseDown)
				This.dom.addEventListener( 'touchstart', onTouchStart );
			}

			dispatch( events.start, arguments ,'start' );

			renderer.setAnimationLoop( animate );

		};

		this.stop = function (g_stop = false) {

			if ( renderer.xr.enabled ) vrButton.remove();

			document.removeEventListener( 'keydown', onKeyDown );
			document.removeEventListener( 'keyup', onKeyUp );
			document.removeEventListener( 'pointerdown', onPointerDown );
			document.removeEventListener( 'pointerup', onPointerUp );
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'mousedown',onMouseDown)
			This.dom.removeEventListener( 'touchstart', onTouchStart );

			if(!g_stop)
			{
				dispatch( events.stop, arguments ,'stop');
				renderer.setAnimationLoop( null );
			}else{
				renderer.setAnimationLoop( null );
				renderer.dispose()
			}

			//清理掉poplang（避免死循环函数继续运行）
			popMap.forEach(function(value,key,map){
				console.log('quit-poplang:',value)
				if(value && typeof value.quit == 'function')
				{
					dispatch( events.stop, arguments ,'stop');//2024-5-16新增
					setTimeout(()=>value.quit(),2000)//延迟2s 2024-5-17新增
					console.log('quit-poplang:'+key+' success!')
				}
			})
		};
		window.g_player_stop_func = this.stop 
		//2024-4-28新增，用于解析3dEditor中的player无法释放gpu资源的BUG---在floor.vue进行emit事件操作
		const ThatI = this
		if(window.g_pop_event_bus) g_pop_event_bus.on('g_player_stop_call',function(){
			console.log('recv g_player_stop_call')
			ThatI.stop()
		  })

		this.render = function ( time ) {

			dispatch( events.update, { time: time * 1000, delta: 0 /* TODO */ } ,'update');

			renderer.render( scene, camera );

		};

		this.dispose = function () {

			renderer.dispose();

			camera = undefined;
			scene = undefined;

		};

		//

		function onKeyDown( event ) {

			dispatch( events.keydown, event ,'keydown' );

		}

		function onKeyUp( event ) {

			dispatch( events.keyup, event ,'keyup');

		}

		function onPointerDown( event ) {

			dispatch( events.pointerdown, event ,'pointerdown' );

		}

		function onPointerUp( event ) {

			dispatch( events.pointerup, event  , 'pointerup' );

		}

		function onPointerMove( event ) {

			dispatch( events.pointermove, event ,'pointermove' );

		}

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		function getIntersects( point ) {

			mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
	
			raycaster.setFromCamera( mouse, camera );
	
			const objects = [];
	
			scene.traverseVisible( function ( child ) {
	
				objects.push( child );
	
			} );
	
			// sceneHelpers.traverseVisible( function ( child ) {
	
			// 	if ( child.name === 'picker' ) objects.push( child );
	
			// } );
	
			return raycaster.intersectObjects( objects, false );
	
			
		}

		const box = new THREE.Box3();
		const selectionBox = new THREE.Box3Helper( box );
		selectionBox.material.depthTest = false;
		selectionBox.material.transparent = true;
		selectionBox.visible = false;

		function showSelectedObj(object)
		{
			selectionBox.visible = false;

			if ( object !== null && object !== scene && object !== camera ) {

				box.setFromObject( object, true );

				if ( box.isEmpty() === false ) {

					selectionBox.visible = true;

				}

				scene.add(selectionBox)

			}else{
				scene.remove(selectionBox)
			}

			// this.render()

		}
	
		const onDownPosition = new THREE.Vector2();
		const onUpPosition = new THREE.Vector2();
		const onDoubleClickPosition = new THREE.Vector2();
	
		function getMousePosition( dom, x, y ) {
	
			const rect = dom.getBoundingClientRect();
			return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
	
		}
	
		async function handleClick() {
	
			if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {
	
				const intersects = getIntersects( onUpPosition );
				// signals.intersectionsDetected.dispatch( intersects );
				if(intersects && intersects.length>0)
				{
					console.log('intersects-script:',This.json.scripts[intersects[0].object.uuid],intersects,This.json.scripts)
					showSelectedObj(intersects[0].object)

					let poplang = popMap.get(intersects[0].object.uuid)
					console.log('click-object-uuid:'+intersects[0].object.uuid,intersects[0].object,poplang)
					if(poplang ){
						let clickRet = await poplang.op(null,'onclick')
						console.log('intersects-object-poplang-onclick-ret:',clickRet,intersects[0].object,poplang)
					}
				}else{
					showSelectedObj(null)
				}
	
				// render();
	
			}
	
		}

		function onMouseDown( event ) {

			// event.preventDefault();
	
			const array = getMousePosition( This.dom, event.clientX, event.clientY );
			onDownPosition.fromArray( array );
	
			document.addEventListener( 'mouseup', onMouseUp );
	
		}
	
		function onMouseUp( event ) {
	
			const array = getMousePosition( This.dom, event.clientX, event.clientY );
			onUpPosition.fromArray( array );
	
			handleClick();
	
			document.removeEventListener( 'mouseup', onMouseUp );
	
		}

		function onTouchStart( event ) {

			const touch = event.changedTouches[ 0 ];
	
			const array = getMousePosition( This.dom, touch.clientX, touch.clientY );
			onDownPosition.fromArray( array );
	
			document.addEventListener( 'touchend', onTouchEnd );
	
		}
	
		function onTouchEnd( event ) {
	
			const touch = event.changedTouches[ 0 ];
	
			const array = getMousePosition( This.dom, touch.clientX, touch.clientY );
			onUpPosition.fromArray( array );
	
			handleClick();
	
			document.removeEventListener( 'touchend', onTouchEnd );
	
		}

		let that  = this
		this.initPlayer = function(c)
		{
			let camera = c, renderer //, scene = This.scene
			if(typeof g_3d_editor_stop_player_flag == 'undefined')
			window.g_3d_editor_stop_player_flag = false
			// let controls
			let that = this
			let clock = new THREE.Clock()

			let player, activeCamera
			let speed = 6 //移动速度
			let turnSpeed = 2
			let move = {
				forward: 0,
				turn: 0
			}

			let colliders = [] //碰撞物
			let debugMaterial = new THREE.MeshBasicMaterial({
				color:0xff0000,
				wireframe: true
			})

			let arrowHelper1, arrowHelper2
			let joystick //移动设备控制器

			function init() {
				// createScene()
				// createObjects()
				createColliders()
				createPlayer()
				createCamera()
				// createLights()
				//createLightHelpers()
				//createControls()
				createEvents()
				createJoyStick()
				// render()
			}

			function createJoyStick() {
			
				This.x3dplayerJoyStick_instance = new window.x3dplayerJoyStick({
					onMove: function(forward, turn) {
						turn = -turn
						if(Math.abs(forward) < 0.3) forward = 0
						if(Math.abs(turn) < 0.1) turn = 0
						move.forward = forward
						move.turn = turn
					}
				})
				if(window.g_3d_editor_stop_player_flag){
					This.x3dplayerJoyStick_instance.circleElement.style.opacity = 0
				}
			}

			function createEvents() {
				document.addEventListener('keydown', onKeyDown)
				document.addEventListener('keyup', onKeyUp)
			}
			function removeEvents()
			{
				document.removeEventListener('keydown', onKeyDown)
				document.removeEventListener('keyup', onKeyUp)
				// console.log('removeEvents:',window.g_x3dplayerJoyStick_instance)
				// This.dom.removeChild(window.g_x3dplayerJoyStick_instance.circleElement)
				// document.removeEventListener('touchmove',window.g_x3dplayerJoyStick_instance.onTouchMoved)
				// document.removeEventListener('touchend',window.g_x3dplayerJoyStick_instance.onTouchEnded)
				// document.removeEventListener('mousemove',window.g_x3dplayerJoyStick_instance.onTouchMoved)
				// document.removeEventListener('mouseup',window.g_x3dplayerJoyStick_instance.onTouchEnded)
			}

			function createColliders() {
				colliders = []
				const children = scene.children;
				console.log('createColliders-scene:',scene)

				for ( let i = 0, l = children.length; i < l; i ++ ) {
					if(children[ i ].collider == '1' ) colliders.push( children[ i ] )
				}
				console.log('createColliders-colliders:',colliders)
			}
			window.g_3d_create_colliders = createColliders

			this.val2vector = function(val)
			{
				if( val  && typeof val.x !='undefined'  && typeof val.y !='undefined'   && typeof val.z !='undefined' )
				{
					let tmpVal = new THREE.Vector3()
					tmpVal.x = val.x
					tmpVal.y = val.y
					tmpVal.z = val.z
					val = tmpVal
					console.log('val2vector val is vector :',val)
				}
				return val
			}
			window.g_3d_object_mod = function(name,property,val)
			{
				let obj = scene.getObjectByName(name,true)
				console.log('g_3d_object_mod:',name,property,val,obj)
				if(!obj) return false
				obj[property] = This.val2vector(val)
			}

			window.g_3d_object_rotate = function(name,val,pi)
			{
				let obj = scene.getObjectByName(name,true)
				console.log('g_3d_object_rotate:',name,val,pi)
				if(!obj) return false
				obj.rotateOnAxis(This.val2vector(val),Math.PI * pi)
			}

			//2024-5-20新增——添加3D对象——poplang可编程（可用于后续的前后端联动————添加游客的人物3D对象等）
			window.g_3d_object_add = async function( json )
			{
				console.log('g_3d_object_add-json:',json)
				try{
					let object = loader.parse(json)
					console.log('g_3d_object_add-object:',object)
					object.scripts = json.scripts
					scene.add(object)
					let ret = This.init_object_scripts(object)
					console.log('g_3d_object_add-init-scripts:',ret)
					return true
				}catch(ex)
				{
					console.log('g_3d_object_add-ex:'+ex,ex)
					return false
				}
			}
			window.g_3d_object_exist = function(name)
			{
				let obj = scene.getObjectByName(name,true)
				if(obj) return true
				else return false
			}
			window.g_3d_object_scripts_init = This.init_object_scripts

			async function loadImg(src)
			{
				let img_id = src
				let params = img_id && img_id.startsWith('dtns://') ? {}:{user_id:localStorage.user_id,s_id:localStorage.s_id,filename:img_id,img_kind:'open'}//,img_p:'min200'}
				let reqUrl = img_id && img_id.startsWith('dtns://')  ? img_id.replace('&amp;','&') :'dtns://web3:'+rpc_client.roomid+'/image/view'
				let isBaseUrl = img_id && img_id.startsWith('data:image/')
		
				let item = await imageDb.getDataByKey(img_id)//localStorage.getItem('chatlogo-'+chatInfo.chatlogo)
				let imgData = null
				if(item){ imgData = item.data;}
				else if(isBaseUrl){
				  imgData = img_id
				}
				else{
					// queryImg(reqUrl,params).then(async (data)=>{
					let data = await g_dtnsManager.run(reqUrl,params)
					console.log('3d-app.js-loadRemote-img:',data)
					if(data && data.data){
						imgData = 'data:image/png;base64,'+ data.data
						imageDb.addData({img_id,data:imgData })
					} 
				}
				return imgData
			}
			//window.g_3d_create_text_image =async function(input,setting)
			window.g_3d_object_texture_image_set =async function(name,val,flipY = true)
			{
				
				let obj = scene.getObjectByName(name,true)
				console.log('g_3d_object_texture_image_set:',name,val,obj)
				if(!obj) return false
				//
				// console.log('g_3d_object_texture_image_set loadImg:',name,val,obj)
				let imgData = await loadImg(val)
				if(!imgData){
					console.log('imgData is null')
					return false
				} 
				const image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' )
				image.src = imgData

				const texture = new window.THREE.Texture();
				texture.image = image
				texture.needsUpdate = true;
				texture.flipY = flipY
				obj.material.map = texture
				return true
			}

			function onKeyDown(event) {
				if(window.g_3d_editor_stop_player_flag) return 
				switch ( event.code ) {
					case 'ArrowUp':
					case 'KeyW':
					move.forward = 1
					break

					case 'ArrowLeft':
					case 'KeyA':
					move.turn = turnSpeed
					break

					case 'ArrowDown':
					case 'KeyS':
					move.forward = -1
					break

					case 'ArrowRight':
					case 'KeyD':
					move.turn = -turnSpeed
					break
					case 'Space':
					break
				}
			}

			function onKeyUp(event) {
				switch ( event.code ) {

					case 'ArrowUp':
					case 'KeyW':
					move.forward = 0
					break

					case 'ArrowLeft':
					case 'KeyA':
					move.turn = 0
					break

					case 'ArrowDown':
					case 'KeyS':
					move.forward = 0
					break

					case 'ArrowRight':
					case 'KeyD':
					move.turn = 0
					break

				}
			}

			function createPlayer() {
				const geometry = new THREE.BoxGeometry(1, 2, 1)
				const material = new THREE.MeshBasicMaterial({
					color: 0xff0000,
					wireframe: true
				})
				player = new THREE.Mesh(geometry, material)
				player.name = 'player'
				geometry.translate(0, 1, 0)
				player.position.set(-5, 0, 5)
				//scene.add(player)
				This.player = player
			}

			function createCamera() {
				const back = new THREE.Object3D()
				back.position.set(0, 2, 1)
				back.parent = player
				//player.add(back)
				activeCamera = back

				//2024-3-8新增（与发布的作品的入口摄像机位置一致）
				// if(camera && !window.g_3d_editor_stop_player_flag)
				// let tmpScene = scene.getObjectByName('Scene',true)
					// console.log('createCamera:',camera,scene)
					// if(scene && scene.userData && scene.userData.player)
					// {
					// 	player.position.set(scene.userData.player.x,scene.userData.player.y,scene.userData.player.z)
					// 	console.log('update-player-position:',player.position.clone(),scene.userData,scene)
						
					// 	let pdir = scene.userData.player.pdir
					// 	if(pdir)
					// 	{
					// 		let dir = new THREE.Vector3()
					// 		dir.set(pdir.x,pdir.y,pdir.z )
					// 		// player.lookAt(dir)
					// 		player.up.set(dir.x,dir.y,dir.z)
					// 	}
						
					// 	// player.matrix.fromArray(scene.userData.player)
					// }
					// else 
				if(camera)
				{
					console.log('update-player-use-camera!',camera.position.clone())
					let {x,y,z} = camera.position
					player.position.set(x,player.position.y,z)
				}
			}
			function onResize() {
				const w = window.innerWidth
				const h = window.innerHeight
				camera.aspect = w / h
				camera.updateProjectionMatrix()
				renderer.setSize(w, h)
			}

			function render() {
				const dt = clock.getDelta()
				update(dt)
				renderer.render(scene, camera)
				window.requestAnimationFrame(render)
			}

			function update(dt) {
				updatePlayer(dt)
				updateCamera(dt)
			}

			window.g_move_player_pos = window.g_player_move_pos = function(x,y,z)
			{
				player.position.set(x,player.position.y,z)
				console.log('g_move_player_pos:',x,player.position.y,z)
			}

			window.g_object_move_pos  = window.g_3d_object_pos_move = window.g_3d_object_move_pos =
			function(name,x,y,z)
			{
				let obj = scene.getObjectByName(name,true)
				console.log('g_object_move_pos:',name,x,y,z,obj)
				if(!obj) return false
				obj.position.set(x,y,z)	
			}
			//2024-5-21新增，获得当前pos的位置，以便在3d_move事件时，将该位置同步至rt3dplayer频道
			window.g_3d_player_pos_now = window.g_3d_player_pos = function()
			{
			 	const pos = player.position.clone()
				console.log('g_3d_player_pos_now:',pos)
				return {x:pos.x,  y : pos.y , z:pos.z}
			}

			async function updatePlayer(dt) {
				const pos = player.position.clone()
				pos.y += 2
				let dir = new THREE.Vector3()
				
				player.getWorldDirection(dir)
				dir.negate()

				if (move.forward < 0) dir.negate()
				let raycaster = new THREE.Raycaster(pos, dir)
				let blocked = false

				if(colliders.length > 0) {
					const intersect = raycaster.intersectObjects(colliders)
					if (intersect.length > 0) {
					if (intersect[0].distance < 1) {
						blocked = true
					}
					}
				}

				//进行碰撞检测，以及进行碰撞函数调用poplang.op collide
				// if(!window.last_near_check_time || window.last_near_check_time+10<Date.now())//50ms检测一次
				// {
				// 	window.last_near_check_time = Date.now()
				try{
					raycaster = new THREE.Raycaster(pos, dir)
					raycaster.camera = camera // 2024-5-16 fix the bug THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites. Cannot read properties of null (reading 'matrixWorld')
					const intersect = raycaster.intersectObjects(scene.children)
					// console.log('check-collide-intersects:',intersect,scene.children)
					if (intersect.length > 0) 
					{
						for(let i=0;i<intersect.length;i++)
						{
							if(intersect[i].distance>10) break //由1修改为10（可用于near事件处理）
							let object = intersect[i].object
							console.log('collid-check-poplang-script:',intersect[i],object.uuid,popMap.has(object.uuid))
							try{
								if(popMap.has(object.uuid))
								{
									let poplang = popMap.get(object.uuid)
									console.log('collide to object-uuid:',object.uuid,object,poplang)
									
									//使用await 确保顺序执行
									poplang.context['near_distance'] = intersect[i].distance
									poplang.op(null,'near','near_distance')//先执行near，再执行collide

									if(intersect[i].distance <=1)
										poplang.op(null,'collide')

								}
							}catch(ex){
								console.log('collide-ex:'+ex,ex)
							}
						}
					}
				}catch(er){
					console.log('raycaster-ex:'+er,er)
				}
				// }
				// if(colliders.length > 0) {
				//   //左方向碰撞监测
				//   dir.set(-1, 0, 0)
				//   dir.applyMatrix4(player.matrix)
				//   dir.normalize()
				//   raycaster = new THREE.Raycaster(pos, dir)

				//   let intersect = raycaster.intersectObjects(colliders)
				//   if(intersect.length > 0) {
				//     if(intersect[0].distance < 2) {
				//       player.translateX(2 - intersect[0].distance)
				//     }
				//   }

				//   //右方向碰撞监测
				//   dir.set(1, 0, 0)
				//   dir.applyMatrix4(player.matrix)
				//   dir.normalize()
				//   raycaster = new THREE.Raycaster(pos, dir)

				//   intersect = raycaster.intersectObjects(colliders)
				//   if(intersect.length > 0) {
				//     if(intersect[0].distance < 2) {
				//       player.translateX(intersect[0].distance - 2)
				//     }
				//   }
				// }
				
				let updatePlayerPosFlag = false
				if(!blocked) {
					if(move.forward !== 0) { 
					if (move.forward > 0) {
						player.translateZ(-dt * speed)
						updatePlayerPosFlag = true
					} else {
						player.translateZ(dt * speed * 0.5)
						updatePlayerPosFlag = true
					}
					}
				}

				if(move.turn !== 0) {
					player.rotateY(move.turn * dt)
					updatePlayerPosFlag = true
				}
				//avatar设置位置 
				if(avatar && updatePlayerPosFlag){//2024-5-21新增updatePlayerPosFlag的判断
					const apos = player.position.clone()
					avatar.position.set(apos.x,avatar.position.y,apos.z)//不改变y坐标
					// console.log('avatar-pos:',avatar.position.clone(),player.position.clone())
					if(!window.g_3d_player_on_move_last_time)  window.g_3d_player_on_move_last_time = Date.now()
					if(window.g_3d_player_on_move_last_time + 100 < Date.now())//100ms发送一次位置信息
					{
						window.g_3d_player_on_move_last_time = Date.now()
						dispatch(null,Object.assign({},move),'move') //新增'move'事件派发
					}
				}
			}

			function updateCamera(dt) {
				//更新摄像机
				camera.position.lerp(
					activeCamera.getWorldPosition(
					new THREE.Vector3()
					), 
					0.08
				)
				const pos = player.position.clone()
				pos.y += 2 
				camera.lookAt(pos)
			}

			that.setPlayerControlCamera = function(c){
				camera = c
			}
			that.updatePlayer = function(dt)
			{
				if(window.g_3d_editor_stop_player_flag)
				{
					removeEvents()
					return false
				} 
				updatePlayer(dt)
				updateCamera(dt)
			}
			that.stopPlayer = function()
			{
				window.g_3d_editor_stop_player_flag = true
				removeEvents()
				This.x3dplayerJoyStick_instance.circleElement.style.opacity = 0
			}
			window.g_3d_player_stop_player = that.stopPlayer
			that.startPlayer = function()
			{
				if(camera)
				{
					let {x,y,z} = camera.position
					player.position.set(x,player.position.y,z)
				}
				window.g_3d_editor_stop_player_flag = false
				createEvents()
				createColliders()
				This.x3dplayerJoyStick_instance.circleElement.style.opacity = 1
			}
			window.g_3d_player_start_player = that.startPlayer

			// ( function () {
				const touchEnabled = !!('ontouchstart' in window);
				class x3dplayerJoyStick {
				
					constructor(options) {
						this.createDom()
						this.maxRadius = options.maxRadius || 40
						this.maxRadiusSquared = this.maxRadius * this.maxRadius
						this.onMove = options.onMove
						this.game = options.game
						this.origin = {
						left: this.domElement.offsetLeft,
						top: this.domElement.offsetTop
						}
						console.log(this.origin)
						this.rotationDamping = options.rotationDamping || 0.06
						this.moveDamping = options.moveDamping || 0.01
						this.createEvent()
					}
			
					createEvent() {
						const joystick = this
						if(touchEnabled) {
							window.x3dplayerJoyStick_touchstart = function(e) {
								console.log('touchstart...')
								// e.preventDefault()
								joystick.tap(e)
								// e.stopPropagation()
							}
							this.domElement.addEventListener('touchstart', window.x3dplayerJoyStick_touchstart)
						} else {
							window.x3dplayerJoyStick_mousedown = function(e) {
								// e.preventDefault()
								console.log('mousedown...')
								joystick.tap(e)
								// e.stopPropagation()
							}
							this.domElement.addEventListener('mousedown',window.x3dplayerJoyStick_mousedown )
						}
					}
			
					getMousePosition(e) {
						const clientX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
							const clientY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY
							return {
						x:clientX, 
						y:clientY
						}
					}
			
					tap(e) {
						this.offset = this.getMousePosition(e)
						const joystick = this
						this.onTouchMoved = function(e) {
						// e.preventDefault()
						joystick.move(e)
						}
						this.onTouchEnded = function(e) {
						// e.preventDefault()
						joystick.up(e)
						}
						if(touchEnabled) {
						document.addEventListener('touchmove', this.onTouchMoved)
						document.addEventListener('touchend', this.onTouchEnded)
						} else {
						document.addEventListener('mousemove', this.onTouchMoved)
						document.addEventListener('mouseup', this.onTouchEnded)
						}
					}
			
					move(e) {
						if(window.g_3d_editor_stop_player_flag) return 
							const mouse = this.getMousePosition(e)
			
							let left = mouse.x - this.offset.x
							let top = mouse.y - this.offset.y
			
							const sqMag = left * left + top * top
			
							if (sqMag > this.maxRadiusSquared){
								const magnitude = Math.sqrt(sqMag)
								left /= magnitude
								top /= magnitude
								left *= this.maxRadius
								top *= this.maxRadius
							}
			
							this.domElement.style.top = `${ top + this.domElement.clientHeight / 2 }px`
							this.domElement.style.left = `${ left + this.domElement.clientWidth / 2 }px`
							
							const forward = -(top - this.origin.top + this.domElement.clientHeight / 2) / this.maxRadius
							const turn = (left - this.origin.left + this.domElement.clientWidth / 2) / this.maxRadius
			
						if(this.onMove) {
						this.onMove(forward, turn)
						}
			
					}
			
					up() {
							if (touchEnabled){
						document.removeEventListener('touchmove', this.onTouchMoved)
						document.removeEventListener('touchend', this.onTouchEned)
							}else{
								document.removeEventListener('mousemove', this.onTouchMoved)
						document.removeEventListener('mouseup', this.onTouchEned)
							}
							this.domElement.style.top = `${this.origin.top}px`
							this.domElement.style.left = `${this.origin.left}px`
						if(this.onMove) {
						this.onMove(0, 0)
						}
						}
					
					createDom() {
						const circle = document.createElement('div')
						circle.style.cssText = `
						position: absolute;
						bottom: 35px;
						width: 80px;
						height: 80px;
						background: rgba(126, 126, 126, 0.2);
						border: #444 solid medium;
						border-radius: 50%;
						left: 50%;
						transform: translateX(-50%);
						`
						const thumb = document.createElement('div')
						thumb.style.cssText = `
						position: absolute;
						left: 18px;
						top: 17px;
						width: 40px;
						height: 40px;
						border-radius: 50%;
						background: #fff;
						`
						circle.appendChild(thumb)
						// document.body.appendChild(circle)
						const container = This.dom//document.querySelector('#vrgallery_container')
						container.appendChild(circle)
						this.domElement = thumb
						thumb.addEventListener('dblclick',function(){
							console.log('JoyStick-dblclick is clicked!')
							window.history.go(-1)
						})
						this.circleElement = circle
						window.x3dplayer_joystickCicle = circle
					} 
				}
			
				window.x3dplayerJoyStick = x3dplayerJoyStick;
			// } )();

			init()
		}
	}
};

export { APP };
