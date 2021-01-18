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
	
	public static min(lhs:Laya.Vector3,rhs:Laya.Vector3,o:Laya.Vector3):void{
		o.x=Math.min(lhs.x,rhs.x);
		o.y=Math.min(lhs.y,rhs.y);
		o.z=Math.min(lhs.z,rhs.z);
	}
	
	public static max(lhs:Laya.Vector3,rhs:Laya.Vector3,o:Laya.Vector3):void{
		o.x=Math.max(lhs.x,rhs.x);
		o.y=Math.max(lhs.y,rhs.y);
		o.z=Math.max(lhs.z,rhs.z);
	}
}