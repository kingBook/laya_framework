import BaseGame from "../framework/core/BaseGame";

export default class Game extends BaseGame{
	
	private _levelNumber:number;
	
	public get levelNumber():number{ return this._levelNumber; }
	
	protected onAwake():void{
		
	}
	
	protected onEnable():void{
		
	}
	
	protected onStart():void{
		
	}
	
	public gotoLevel(levelNumber:number){
		this._levelNumber=levelNumber;
		
		Laya.Scene3D.load('res/unityExport/Conventional/Level_1.ls',Laya.Handler.create(null,(scene:Laya.Scene3D)=>{
			Laya.stage.addChild(scene);
		}));
	}
	
}