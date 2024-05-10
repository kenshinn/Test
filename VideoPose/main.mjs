import { Engine } from "./engine.mjs"
import { Retargeter, VRMSkeleton } from "./retargeter.mjs";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE_VRM from 'three-vrm';
import * as THREE from 'three';

class App {
	constructor() {
		this.engine = new Engine(document.getElementById("three"));
		(async () => {
			//load vrm and add to threejs main scene
			//fake url handled in shouldInterceptRequest
			//const [vrm, script] = await this.loadVRM('VRM1_Constraint_Twist_Sample.vrm');
			const [vrm, script] = await this.loadVRM('sora.vrm');

			this.vrm = vrm;
			this.model = vrm.scene;
			this.engine.addObject(vrm.scene);
			this.engine.addScript(vrm.scene, script);
			return this;
		})();
	}
	initGUI() {
		this.gui = new GUI({ autoplace: false, width: 120 });
	}
	//VRM
	async loadVRM(path) {
		const loader = new GLTFLoader();
		// const helperRoot = new THREE.Group();// helperRoot is for debugging only
		// helperRoot.renderOrder = 10000;
		loader.register(parser => new THREE_VRM.VRMLoaderPlugin(parser, {
			// helperRoot: helperRoot
		}));

		// loading
		const gltf = await loader.loadAsync(path);
		THREE_VRM.VRMUtils.removeUnnecessaryVertices(gltf.scene);
		THREE_VRM.VRMUtils.removeUnnecessaryJoints(gltf.scene);
		const vrm = gltf.userData.vrm;
		vrm.scene.traverse((obj) => { obj.frustumCulled = false });
		const model = vrm.scene;
		// model.add(helperRoot);
		// THREE_VRM.VRMUtils.rotateVRM0( vrm );
		if (vrm.meta?.metaVersion === '0')//this is neccessary since old VRM spec is different
			vrm.humanoid.getNormalizedBoneNode("hips").rotation.y = Math.PI;

		// prepare retargeter
		const retargeter = new Retargeter();
		retargeter.scanBones(VRMSkeleton.getBones(vrm));

		// set morph
		model.addEventListener("morph", (e) => {
			for (const [key, value] of Object.entries(VRMSkeleton.morph_map))
				vrm.expressionManager.setValue(key, e.data[value]);
		});
		// set motion data to retargeter
		model.addEventListener("rotations", (e) => {
			retargeter.setRotations(e.data);
		});
		model.addEventListener("translations", (e) => {
			retargeter.setTranslation(...e.data);
		});

		return [vrm, (delta) => {//this will be called in render loop
			retargeter.update();
			vrm.update(delta);
		}];
	}
}

(async () => {
	let app = await new App();
	window.app = app;

	addEventListener("pose", (event) => {
		//console.log(event.data.length);
		const pose = JSON.parse(event.data);
		if (pose.rotations.length != 0) {
			const rotations = pose.rotations.map(r => [...r.slice(1), r[0]]);
			app.model?.dispatchEvent({ type: "rotations", data: rotations });
		}
		if (pose.positions.length != 0) {
			const positions = [
				pose.positions[0],
				pose.positions.slice(1).map(p => Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]))
			];
			app.model?.dispatchEvent({ type: "translations", data: positions });
		}
	});
})();