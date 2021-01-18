export default class Vector2Util{
	
	public static add(a:Laya.Vector2,b:Laya.Vector2,o:Laya.Vector2):void{
		o.x=a.x+b.x;
		o.y=a.y+b.y;
	}
	
	public static subtract(a:Laya.Vector2,b:Laya.Vector2,o:Laya.Vector2):void{
		o.x=a.x-b.x;
		o.y=a.y-b.y;
	}
	
	public static scale(a:Laya.Vector2,b:number,o:Laya.Vector2):void{
		o.x=a.x*b;
		o.y=a.y*b;
	}
	
}