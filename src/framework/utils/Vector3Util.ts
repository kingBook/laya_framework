export default class Vector3Util{
	
	public static readonly zero=new Laya.Vector3(0,0,0);
	public static readonly forward=new Laya.Vector3(0,0,-1);
	public static readonly up=new Laya.Vector3(0,1,0);
	public static readonly right=new Laya.Vector3(1,0,0);
	
	public static get newZero():Laya.Vector3{
		return new Laya.Vector3(0,0,0);
	}
	
	public static get newForward():Laya.Vector3{
		return new Laya.Vector3(0,0,-1);
	}
	
	public static get newUp():Laya.Vector3{
		return new Laya.Vector3(0,1,0);
	}
	
	public static get newRight():Laya.Vector3{
		return new Laya.Vector3(1,0,0);
	}
	
	
}