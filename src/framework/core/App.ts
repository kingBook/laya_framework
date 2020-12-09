import BaseGame from "./BaseGame";
import PlayerPrefs from "./PlayerPrefs";

export enum Language{ AUTO,CN,EN }

/** 整个应用程序的单例 */
export default class App extends Laya.Script{
	
	public static s_instance:App;
	public static get instance():App{
		return App.s_instance; 
	}
	public static set instance(value){
		App.s_instance=value;
	}
	
	/** @prop {name:games,type:Nodes,accept:BaseGame,tips:"游戏列表"} */
	private games:BaseGame[]=new BaseGame[0];
	

	private _language:Language=Language.AUTO;
	private _openCount:number;
	
	/** 应用程序的语言 */
	public get language():Language{
		return this._language;
	}
	
	/** 打开应用的次数 */
	public get openCount():number{
		return this._openCount;
	}
	

	public onAwake():void{
		App.s_instance=this;
		this.addOpenCount();
		
		if(this._language==Language.AUTO){
			this.initLanguage();
		}
	}
	
	public onEnable():void{
		
	}
	
	public onStart():void{
		console.log("App::onStart();");
		/*setTimeout(() => {
			console.log("open level");
			Laya.Scene.open("level.scene");
			Laya.Scene.destroy("main.scene");
		}, 3000);*/
	}
	
	public onDestroy():void{
		console.log("App::onDestroy();");
	}

	private addOpenCount():void{
		const key:string="ApplicationOpenCount";
		this._openCount=PlayerPrefs.getInt(key,0)+1;
		PlayerPrefs.setInt(key,this._openCount);
	}
	
	private initLanguage():void{
		console.log("language:"+navigator.language);
		let isCN=navigator.language=="zh-CN";
		this._language=isCN?Language.CN:Language.EN;
	}
}