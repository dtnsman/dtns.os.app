import * as THREE from '../../build/three.module.js';

import { zipSync, strToU8 } from '../../examples/jsm/libs/fflate.module.js';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

function MenubarFile( editor ) {

	const config = editor.config;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/file' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// New

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/new' ) );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Import

	const form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	const fileInput = document.createElement( 'input' );
	fileInput.multiple = true;
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function () {

		editor.loader.loadFiles( fileInput.files );
		form.reset();

	} );
	form.appendChild( fileInput );

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/import' ) );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	options.add( new UIHorizontalRule() );


	sendXMSGNow('上传文件（网络）',false,false,false,async function(){
		const a = document.createElement('input')
		a.setAttribute('type', 'file')
		let This = this
		a.addEventListener('change', async function selectedFileChanged() {
			console.log('data:' + this.files)
			if (this.files.length == 0) return alert('请选择文件')
			console.log('upload-files:' ,this.files)//+ JSON.stringify(this.files[0].name))
			let data = {file:this.files[0]}
			let filename = data.file.name
            let fileInfo = {fieldname:"file",encoding:'fromfile_binary',originalname:filename,
                mimetype:data.file.type,filename,path:'file-path',
                size:data.file.size,user_id:localStorage.user_id,s_id:localStorage.s_id,
                file_kind:'file',random:Math.random(),data:data.file}

            console.log('3D.creator-upload-File:',data.file)
            let res = await new Promise((resolve)=>{
                rpc_client.sendFile(fileInfo,function(udata){
                    console.log('sendFile-callback-data:'+JSON.stringify(udata))
                    if(udata && udata.data) resolve(udata.data)
                    else resolve(null)
                })
            })
			console.log('3d.creator-upload-file-res:',res)
			if(res && res.ret)
			{
				g_dchatManager.viewContext.$dialog.confirm({
					title: '上传文件成功（'+filename+'）：',
					message: ''+res.filename,
					messageAlign: 'left'
				  })
				//以便在cd文件夹中粘贴它。
				window.g_folder_copy_data = {url: res.filename}
			}else{
				g_dchatManager.viewContext.$toast('上传文件失败，原因：'+(res && res.msg ? res.msg:'未知网络原因'))
			}
		})

		a.click()
	})
	options.add( new UIHorizontalRule() );


	window.g_send_xmsg_locked_time = 0
	function sendXMSGNow(title,playerFlag = false,showHelpTools = false,isProduct = false, onclickFunc = null)
	{
		let option = new UIRow();
		option.setClass( 'option' );
		option.setTextContent( title ); // strings.getKey( 'menubar/file/new' ) );
		if(typeof onclickFunc == 'function') option.onClick(onclickFunc) 
		else option.onClick( function () {

			if(Date.now() - g_send_xmsg_locked_time<=6000) //限3秒点击一次
			{
				return console.log('[Notice]menubar.file sendXMSG-onclick false: is send_xmsg_locked_time now!')
			}
			g_send_xmsg_locked_time = Date.now()

			console.log( 'sendXMSG onclick! title:',title );
			let json = editor.toJSON();//editor.scene.toJSON();---参考【发布】菜单
			json.metadata.type = 'App';
			delete json.history;

			console.log( '3d-editor-to-json:', json );
			if ( typeof ifileDb != 'undefined' ) {

				window.ifileDb.deleteDataByKey( 'from.dtns.3d.creator.json' );

				window.ifileDb.addData( { key: 'from.dtns.3d.creator.json', data: json } );

				console.log( ' sendXMSG ok!' );

				// const viewPort = document.getElementById( 'viewport' );
				// const cs = viewPort.getElementsByTagName( 'canvas' );

				if ( playerFlag ) {

					// g_3d_player.render( 0.1 );
					//以下这个是基于player的（不如基于viewport直接）
					editor.signals.startPlayer.dispatch();//参考了Menubar.Play.js --> title.onClick函数
					setTimeout( () => {

						const base64 = g_3d_domElement.toDataURL( 'image/webp', 0.9 );
						console.log( 'shortcut-base64:', base64 );
						editor.signals.stopPlayer.dispatch();
						window.ifileDb.deleteDataByKey( 'from.dtns.3d.creator.img' );
						window.ifileDb.addData( { key: 'from.dtns.3d.creator.img', data: base64 } );
						const xmsgObj = { xtype: 'dtns.3d.creator2xverse2', xmsg: 'from dtns.3d.creator' ,isProduct };
						window.top.postMessage( JSON.stringify( xmsgObj ), '*' );
					}, 100 );
				}
				else{
					//截图的是viewport.js中的container（包含了helpGrid）
					if(typeof g_editor_render_func == 'function')
					g_editor_render_func(showHelpTools) //不显示grid为false，默认为true
					const base64 = g_editor_render.domElement.toDataURL( 'image/webp', 0.9 );
					console.log( 'shortcut-base64:', base64 );
					window.ifileDb.deleteDataByKey( 'from.dtns.3d.creator.img' );
					window.ifileDb.addData( { key: 'from.dtns.3d.creator.img', data: base64 } );
					const xmsgObj = { xtype: 'dtns.3d.creator2xverse2', xmsg: 'from dtns.3d.creator',showHelpTools,isProduct };
					window.top.postMessage( JSON.stringify( xmsgObj ), '*' );
				}
			} else {

				console.log( ' sendXMSG failed! ifileDb is null ' );

			}
		} );
		options.add( option );
	}
	//

	// sendXMSGNow('推送头榜（运行）',true)
	sendXMSGNow('推送头榜（预览）',false,false)
	sendXMSGNow('推送头榜（编辑）',false,true)
	sendXMSGNow('推送头榜（作品）',false,false,true)//发布的是作品
	
	
	options.add( new UIHorizontalRule() );

	// Export Geometry

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/geometry' ) );
	option.onClick( function () {

		const object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		const geometry = object.geometry;

		if ( geometry === undefined ) {

			alert( 'The selected object doesn\'t have geometry.' );
			return;

		}

		let output = geometry.toJSON();

		try {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'geometry.json' );

	} );
	options.add( option );

	// Export Object

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/object' ) +'（插件分享）');
	option.onClick(async function () {

		const object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected' );
			return;

		}

		let output = object.toJSON();
		//2024-5-21新增（用于app.js中恢复object对象的poplang脚本）
		output.scripts = editor.scripts[object.uuid]

		try {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'model.json' );


		let img_url = null
		let img_name = null
		if(true)
		{
			const imgBase64 = await new Promise((resolve)=>{
				editor.signals.startPlayer.dispatch();//参考了Menubar.Play.js --> title.onClick函数
				setTimeout( () => {
					const base64 = g_3d_domElement.toDataURL( 'image/webp', 0.9 );
					console.log( 'shortcut-base64:', base64 );
					resolve(base64)
				}, 100 );
			})

			let u8arr = rpc_client.dataURLtoBinary(imgBase64.substring('data:image/webp;base64,'.length,imgBase64.length))
			let file = new File([u8arr], img_name = '3d-plugin-'+Date.now()+'.webp', {type: 'image/webp'});
			let data = {file}
			let fileInfo = {fieldname:"file",encoding:'fromfile_binary',originalname:data.file.name,
				mimetype:data.file.type,filename:data.file.name,path:'file-path',
				size:data.file.size,user_id:localStorage.user_id,s_id:localStorage.s_id,
				img_kind:'open',random:Math.random(),data:data.file,img_q:1}

			console.log('3d-plugin-xverse-webp-File:',file)
			let res = await new Promise((resolve)=>{
				rpc_client.sendImage(fileInfo,function(udata){
					console.log('3d-plugin-sendImg-callback-data:'+JSON.stringify(udata))
					if(udata && udata.data) resolve(udata.data)
					else resolve(null)
				})
			})
			console.log('3d-plugin-xverse-webp-send-res:',res)
			img_url = res && res.ret ? res.filename : null
		}


		const encoder = new TextEncoder();
		let u8arr = encoder.encode(output)
		const filename = '3d-plugin-'+Date.now()+'.object.xverse.json'
		var file = new File([u8arr], filename, {type: 'application/json'});
		let data = {file}
		let fileInfo = {fieldname:"file",encoding:'fromfile_binary',originalname:filename,
		mimetype:data.file.type,filename,path:'file-path',
		size:data.file.size,user_id:localStorage.user_id,s_id:localStorage.s_id,
		file_kind:'file',random:Math.random(),data:data.file}

		console.log('3d-editor-Menubar.file.js-xverse-File:',data.file)
		let res = await new Promise((resolve)=>{
			rpc_client.sendFile(fileInfo,function(udata){
				console.log('sendFile-callback-data:'+JSON.stringify(udata))
				if(udata && udata.data) resolve(udata.data)
				else resolve(null)
			})
		})

		console.log('send-xverse-plugin-file-res:',res)
		if(!res || !res.ret){
			return g_dchatManager.viewContext.$toast('上传xverse插件源码文件失败' +(res ?res.msg:'未知网络错误'))
		}

		let xvalue = {
			"xtype":"normal",
			"xmsg": "插件名称：我分享的3D轻应用插件",
			files:[{"type":"file","name":filename,"status":"done","uid":"vc-upload-1722480545666-5",
				"url":res.filename}],"plugin":"3d","class":"search"
		}
		if(img_url)
		{
			xvalue.pics = [{ url:img_url,name:img_name,dtns_url:'dtns://web3:'+rpc_client.roomid+'/image/view?filename='+img_url+'&img_kind=open'}]
		}

		// if(img_url)
		// {
		//   xvalue = Object.assign({},xvalue,
		// 	{'xverse_img_url':img_url,
		// 	'xverse_img_dtns_url':'dtns://web3:'+rpc_client.roomid+'/image/view?filename='+img_url+'&img_kind=open'})
		// }
		// localStorage.setItem('poster_value',JSON.stringify(xvalue))
		imDb.addData({key:'dweb_poster_init_data',data:xvalue})
		localStorage.setItem('poster_type','xmsg')
		localStorage.setItem('poster_value','xmsg')
		localStorage.setItem('from_label_type','new_xmsg')
		g_dchatManager.viewContext.$router.push('/poster/xmsg')

	} );
	options.add( option );

	// Export Scene

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/scene' ) );
	option.onClick( function () {

		let output = editor.scene.toJSON();

		try {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'scene.json' );

	} );
	options.add( option );


	// Export app

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( '导出（Export）app');
	option.onClick( function () {

		let output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		try {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'app-'+new Date().toLocaleString()+'.json' );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Export DAE

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/dae' ) );
	option.onClick( async function () {

		const { ColladaExporter } = await import( '../../examples/jsm/exporters/ColladaExporter.js' );

		const exporter = new ColladaExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveString( result.data, 'scene.dae' );

		} );

	} );
	options.add( option );

	// Export DRC

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/drc' ) );
	option.onClick( async function () {

		const object = editor.selected;

		if ( object === null || object.isMesh === undefined ) {

			alert( 'No mesh selected' );
			return;

		}

		const { DRACOExporter } = await import( '../../examples/jsm/exporters/DRACOExporter.js' );

		const exporter = new DRACOExporter();

		const options = {
			decodeSpeed: 5,
			encodeSpeed: 5,
			encoderMethod: DRACOExporter.MESH_EDGEBREAKER_ENCODING,
			quantization: [ 16, 8, 8, 8, 8 ],
			exportUvs: true,
			exportNormals: true,
			exportColor: object.geometry.hasAttribute( 'color' )
		};

		// TODO: Change to DRACOExporter's parse( geometry, onParse )?
		const result = exporter.parse( object, options );
		saveArrayBuffer( result, 'model.drc' );

	} );
	options.add( option );

	// Export GLB

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/glb' ) );
	option.onClick( async function () {

		const scene = editor.scene;
		const animations = getAnimations( scene );

		const { GLTFExporter } = await import( '../../examples/jsm/exporters/GLTFExporter.js' );

		const exporter = new GLTFExporter();

		exporter.parse( scene, function ( result ) {

			saveArrayBuffer( result, 'scene.glb' );

		}, undefined, { binary: true, animations: animations } );

	} );
	options.add( option );

	// Export GLTF

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/gltf' ) );
	option.onClick( async function () {

		const scene = editor.scene;
		const animations = getAnimations( scene );

		const { GLTFExporter } = await import( '../../examples/jsm/exporters/GLTFExporter.js' );

		const exporter = new GLTFExporter();

		exporter.parse( scene, function ( result ) {

			saveString( JSON.stringify( result, null, 2 ), 'scene.gltf' );

		}, undefined, { animations: animations } );


	} );
	options.add( option );

	// Export OBJ

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/obj' ) );
	option.onClick( async function () {

		const object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		const { OBJExporter } = await import( '../../examples/jsm/exporters/OBJExporter.js' );

		const exporter = new OBJExporter();

		saveString( exporter.parse( object ), 'model.obj' );

	} );
	options.add( option );

	// Export PLY (ASCII)

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/ply' ) );
	option.onClick( async function () {

		const { PLYExporter } = await import( '../../examples/jsm/exporters/PLYExporter.js' );

		const exporter = new PLYExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveArrayBuffer( result, 'model.ply' );

		} );

	} );
	options.add( option );

	// Export PLY (Binary)

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/ply_binary' ) );
	option.onClick( async function () {

		const { PLYExporter } = await import( '../../examples/jsm/exporters/PLYExporter.js' );

		const exporter = new PLYExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveArrayBuffer( result, 'model-binary.ply' );

		}, { binary: true } );

	} );
	options.add( option );

	// Export STL (ASCII)

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/stl' ) );
	option.onClick( async function () {

		const { STLExporter } = await import( '../../examples/jsm/exporters/STLExporter.js' );

		const exporter = new STLExporter();

		saveString( exporter.parse( editor.scene ), 'model.stl' );

	} );
	options.add( option );

	// Export STL (Binary)

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/stl_binary' ) );
	option.onClick( async function () {

		const { STLExporter } = await import( '../../examples/jsm/exporters/STLExporter.js' );

		const exporter = new STLExporter();

		saveArrayBuffer( exporter.parse( editor.scene, { binary: true } ), 'model-binary.stl' );

	} );
	options.add( option );

	// Export USDZ

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/usdz' ) );
	option.onClick( async function () {

		const { USDZExporter } = await import( '../../examples/jsm/exporters/USDZExporter.js' );

		const exporter = new USDZExporter();

		saveArrayBuffer( await exporter.parse( editor.scene, { binary: true } ), 'model.usdz' );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Publish

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/publish' ) );
	option.onClick( function () {

		const toZip = {};

		//

		let output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		toZip[ 'app.json' ] = strToU8( output );

		//

		const title = config.getKey( 'project/title' );

		const manager = new THREE.LoadingManager( function () {

			const zipped = zipSync( toZip, { level: 9 } );

			const blob = new Blob( [ zipped.buffer ], { type: 'application/zip' } );

			save( blob, ( title !== '' ? title : 'untitled' ) + '.zip' );

		} );

		const loader = new THREE.FileLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			content = content.replace( '<!-- title -->', title );

			const includes = [];

			content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );

			let editButton = '';

			if ( config.getKey( 'project/editable' ) ) {

				editButton = [
					'			let button = document.createElement( \'a\' );',
					'			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
					'			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 10px 16px; color: #fff; border: 1px solid #fff; border-radius: 20px; text-decoration: none;\';',
					'			button.target = \'_blank\';',
					'			button.textContent = \'EDIT\';',
					'			document.body.appendChild( button );',
				].join( '\n' );

			}

			content = content.replace( '\t\t\t/* edit button */', editButton );

			toZip[ 'index.html' ] = strToU8( content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			toZip[ 'js/app.js' ] = strToU8( content );

		} );
		loader.load( '../build/three.module.js', function ( content ) {

			toZip[ 'js/three.module.js' ] = strToU8( content );

		} );
		loader.load( '../examples/jsm/webxr/VRButton.js', function ( content ) {

			toZip[ 'js/VRButton.js' ] = strToU8( content );

		} );

	} );
	options.add( option );

	//

	const link = document.createElement( 'a' );
	function save( blob, filename ) {

		if ( link.href ) {

			URL.revokeObjectURL( link.href );

		}

		link.href = URL.createObjectURL( blob );
		link.download = filename || 'data.json';
		link.dispatchEvent( new MouseEvent( 'click' ) );

	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	function getAnimations( scene ) {

		const animations = [];

		scene.traverse( function ( object ) {

			animations.push( ... object.animations );

		} );

		return animations;

	}

	return container;

}

export { MenubarFile };
