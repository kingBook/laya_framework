import App from "../framework/core/App";
import Game from "./Game";

export default class Level extends Laya.Script{
	
	protected _game:Game;
	
	protected onAwake():void{
		this._game=App.instance.getGame<Game>();
	}
	
	protected onStart():void{
		
	}
	
	protected onDestroy():void{
		
	}
	
	public victory():void{
		
	}
	
	public failure():void{
		
	}
}