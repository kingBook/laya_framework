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
	
	/** @prop {name:gameNodes,type:Nodes,tips:"游戏节点列表"} */
	public gameNodes:Laya.Node[];
	

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
	

	protected onAwake():void{
		App.s_instance=this;
		this.addOpenCount();
		
		if(this._language==Language.AUTO){
			this.initLanguage();
		}
	}
	
	protected onEnable():void{
	}
	
	protected onStart():void{
	}
	
	protected onUpdate():void{
	}
	
	protected onDestroy():void{
	}
	
	/** 返回指定索引的游戏实例 */
	public getGame<T extends BaseGame>(index:number=0):T{
		return <T>this.gameNodes[index].getComponent(BaseGame);
	}

	private addOpenCount():void{
		const key:string="ApplicationOpenCount";
		this._openCount=PlayerPrefs.getInt(key,0)+1;
		PlayerPrefs.setInt(key,this._openCount);
	}
	
	private initLanguage():void{
		let isCN=navigator.language=="zh-CN";
		this._language=isCN?Language.CN:Language.EN;
	}
}