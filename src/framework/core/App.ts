import PlayerPrefs from "./PlayerPrefs";

export default class App extends Laya.Script{
	
	public static s_instance:App;
	public static get instance():App{
		return App.s_instance; 
	}
	public static set instance(value){
		App.s_instance=value;
	}

	private _openCount:number;

	public onAwake():void{
		App.s_instance=this;
		this.addOpenCount();
	}
	
	public onEnable():void{
		console.log("App::onEnable();");
	}
	
	public onStart():void{
		console.log("App::onStart();");
		setTimeout(() => {
			console.log("open level");
			Laya.Scene.open("level.scene");
			Laya.Scene.destroy("main.scene");
		}, 3000);
	}
	
	public onDestroy():void{
		console.log("App::onDestroy();");
	}

	private addOpenCount():void{
		const key:string="ApplicationOpenCount";
		this._openCount=PlayerPrefs.getInt(key,0)+1;
		PlayerPrefs.setInt(key,this._openCount);
	}
		
}