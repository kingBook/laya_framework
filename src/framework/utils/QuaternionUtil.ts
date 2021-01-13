import Mathf from "./Mathf";

export default class QuaternionUtil{
	
	public static getEulerAngles(quat:Laya.Quaternion,out:Laya.Vector3):void{
		quat.getYawPitchRoll(out);
		let x=out.x*Mathf.rad2Deg;
		let y=out.y*Mathf.rad2Deg;
		let z=out.z*Mathf.rad2Deg;
		out.x=y;
		out.y=x;
		out.z=z;
	}
}