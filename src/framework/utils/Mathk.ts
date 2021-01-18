import Mathf from "./Mathf";
import Vector3Util from "./Vector3Util";
/** 数学类 */
export default class Mathk{
	
	private static _tempV3=new Laya.Vector3();
	private static _temp1V3=new Laya.Vector3();
	private static _temp2V3=new Laya.Vector3();
	private static _temp3V3=new Laya.Vector3();
	private static _temp4V3=new Laya.Vector3();
	private static _temp5V3=new Laya.Vector3();
	private static _lineDirection1=new Laya.Vector3();
	private static _lineDirection2=new Laya.Vector3();
	/**
	 * 将任意角度转换为[-180°,180°]，并返回转换后的角度
	 * @param rotation 需要转换的角度
	 */
	public static getRotationTo180(rotation:number):number{
		rotation%=360.0;
		if     (rotation>180.0)rotation-=360.0;
		else if(rotation<-180.0)rotation+=360.0;
		return rotation;
	}
	
	/**
	 * 计算出目标角减当前角的差（取到达目标角度的最近旋转方向）,并返回这个差
	 * @param rotation 当前角度
	 * @param targetRotation 目标角度
	 */
	public static getRotationDifference(rotation:number,targetRotation:number):number{
		rotation=this.getRotationTo360(rotation);
		targetRotation=this.getRotationTo360(targetRotation);
		let offset:number=targetRotation-rotation;
		if(Math.abs(offset)>180.0){
			let reDir:number=offset>=0?-1:1;
			offset=reDir*(360.0-Math.abs(offset));
		}
		return offset;
	}
	
	/**
	 * 将任意角度转换为[0°,360°]的值,并返回转换后的值
	 * @param rotation 需要转换的角度
	 */
	public static getRotationTo360(rotation:number):number{
		rotation=this.getRotationTo180(rotation);
		if(rotation<0) rotation+=360.0;
		return rotation;
	}
	
	/**
	 * 获取点在线段的垂足（垂足会超出线段）
	 */
	public static getPerpendicularPoint(point:Laya.Vector3,lineStart:Laya.Vector3,lineEnd:Laya.Vector3):Laya.Vector3{
		let rhs=this._tempV3;
		Laya.Vector3.subtract(point,lineStart,rhs);
		
		let vector=this._temp2V3;
		Laya.Vector3.subtract(lineEnd,lineStart,vector);
		
		let magnitude=Laya.Vector3.scalarLength(vector);
		let vector2=vector;
		if(magnitude>1E-06){
			Laya.Vector3.scale(vector2,1/magnitude,vector2);
		}
		let value=Laya.Vector3.dot(vector2,rhs);
		
		Laya.Vector3.scale(vector2,value,vector2);
		Laya.Vector3.add(lineStart,vector2,vector2);
		return vector2;
	}

	/**
	 * 点到线段的最小距离点（垂足不超出线段）
	 * @param point 
	 * @param lineStart 
	 * @param lineEnd 
	 */
	public static projectPointLine(point:Laya.Vector3,lineStart:Laya.Vector3,lineEnd:Laya.Vector3):Laya.Vector3{
		let rhs=this._tempV3;
		Laya.Vector3.subtract(point,lineStart,rhs);
		
		let vector=this._temp2V3;
		Laya.Vector3.subtract(lineEnd,lineStart,vector);
		
		let magnitude=Laya.Vector3.scalarLength(vector);
		let vector2=vector;
		if(magnitude>1E-06){
			Laya.Vector3.scale(vector2,1/magnitude,vector2);
		}
		let value=Laya.Vector3.dot(vector2,rhs);
		value=Mathf.clamp(value,0,magnitude);
		
		Laya.Vector3.scale(vector2,value,vector2);
		Laya.Vector3.add(lineStart,vector2,vector2);
		return vector2;
	}

	/**
	 * 点到线段的最小距离（垂足不超出线段）
	 * @param point 
	 * @param lineStart 
	 * @param lineEnd 
	 */
	public static distancePointLine(point:Laya.Vector3,lineStart:Laya.Vector3,lineEnd:Laya.Vector3):number{
		Laya.Vector3.subtract(this.projectPointLine(point,lineStart,lineEnd),point,this._tempV3);
		let length=Laya.Vector3.scalarLength(this._tempV3);
		return length;
	}
	
	/*/// <summary>
	/// 获取点距离顶点列表的最近的线段的索引（顺时针方向查找），当顶点列表长度小于2时返回(-1,-1)
	/// </summary>
	/// <param name="point">点</param>
	/// <param name="vertices">顶点列表（顺时针方向）</param>
	/// <param name="isClosed">顶点列表是否闭合</param>
	/// <returns></returns>
	public static (int startIndex, int endIndex) GetClosestPolyLineToPoint(Vector3 point,Vector3[] vertices,bool isClosed){
		var result=(-1,-1);
		float minDistance=float.MaxValue;
		for(int i=0,len=vertices.Length;i<len;i++){
			int lineStartIndex=i;
			int lineEndIndex=(i>=len-1&&isClosed)?0:i+1;
			if(lineEndIndex>=len)break;
			Vector3 lineStart=vertices[lineStartIndex];
			Vector3 lineEnd=vertices[lineEndIndex];

			float distance=DistancePointLine(point,lineStart,lineEnd);
			if(distance<minDistance){
				minDistance=distance;
				result=(lineStartIndex,lineEndIndex);
			}
		}
		return result;
	}*/
	
	/*/// <summary>
	/// 获取射线发射方向与顶点列表相交的所有线段中，射线原点与交点距离最近的线段索引顺时针方向查找），当顶点列表长度小于2时返回(-1,-1)。
	/// 注意：使用此方法必须保证顶点列表中的所有顶点与及射线的原点和方向都在同一个平面上
	/// </summary>
	/// <param name="rayOrigin">射线的原点</param>
	/// <param name="rayDirection">射线的方向</param>
	/// <param name="vertices">顶点列表（顺时针方向）</param>
	/// <param name="isClosed">顶点列表是否闭合</param>
	/// <returns></returns>
	public static (int startIndex, int endIndex) GetClosestPolyLineToRayOrigin(Vector3 rayOrigin,Vector3 rayDirection,Vector3[] vertices,bool isClosed){
		Vector3 rayEnd=rayOrigin+rayDirection.normalized*10;//随意定一个射线的结束点
		var result=(-1,-1);
		float minDistance=float.MaxValue;
		for(int i=0,len=vertices.Length;i<len;i++){
			int lineStartIndex=i;
			int lineEndIndex=(i>=len-1&&isClosed)?0:i+1;
			if(lineEndIndex>=len)break;
			Vector3 lineStart=vertices[lineStartIndex];
			Vector3 lineEnd=vertices[lineEndIndex];
			Vector3 lineDirection=lineEnd-lineStart;
			if(GetTwoLineIntersection(rayOrigin,rayDirection,lineStart,lineDirection,out Vector3 intersection)){
				if(PointOnWhichSideOfLineSegment(intersection,lineStart,lineEnd)==0){
					if(PointOnWhichSideOfLineSegment(intersection,rayOrigin,rayEnd)!=1){
						float distance=Vector3.Distance(rayOrigin,intersection);
						if(distance<minDistance){
							minDistance=distance;
							result=(lineStartIndex,lineEndIndex);
						}
					}
				}
			}
		}
		return result;
	}*/

	/**
	 * 获取两条直线的交点。如果直线相交，则返回true，否则返回false。
	 * 注意：使用此方法必须两直线都在同一个平面上，交点会超出线段范围
	 * @param lineStart1 
	 * @param lineEnd1 
	 * @param lineStart2 
	 * @param lineEnd2 
	 * @param outIntersection 输出的交点
	 */
	public static getTwoLineIntersection(lineStart1:Laya.Vector3,lineEnd1:Laya.Vector3,lineStart2:Laya.Vector3,lineEnd2:Laya.Vector3,outIntersection:Laya.Vector3):boolean{
		let lineDirection1=this._lineDirection1;
		let lineDirection2=this._lineDirection2;
		Laya.Vector3.subtract(lineStart1,lineEnd1,lineDirection1);
		Laya.Vector3.subtract(lineStart2,lineEnd2,lineDirection2);
		
		let lineVec3=this._tempV3;
		Laya.Vector3.subtract(lineStart2,lineStart1,lineVec3);
		let crossVec1and2=this._temp1V3;
		Laya.Vector3.cross(lineDirection1,lineDirection2,crossVec1and2);
		let crossVec3and2=this._temp2V3;
		Laya.Vector3.cross(lineVec3,lineDirection2,crossVec3and2);

		let planarFactor=Laya.Vector3.dot(lineVec3,crossVec1and2);
		//在同一个平面，且不平行
		if(Math.abs(planarFactor)<0.0001 && Laya.Vector3.scalarLengthSquared(crossVec1and2)>0.0001){
			let s=Laya.Vector3.dot(crossVec3and2,crossVec1and2) / Laya.Vector3.scalarLengthSquared(crossVec1and2);
			Laya.Vector3.scale(lineDirection1,s,this._temp3V3);
			Laya.Vector3.add(lineStart1,this._temp3V3,outIntersection);
			return true;
		}
		return false;
	}
	
	/**
	 * 获取两条线段的交点。如果线段相交，则返回true，否则返回false。
	 * 注意：使用此方法必须两线段都在同一个平面上，交点不会超出线段范围
	 * @param lineStart1 
	 * @param lineEnd1 
	 * @param lineStart2 
	 * @param lineEnd2 
	 * @param outIntersection 输出的交点
	 */
	public static getTwoLineSegmentsIntersection(lineStart1:Laya.Vector3,lineEnd1:Laya.Vector3,lineStart2:Laya.Vector3,lineEnd2:Laya.Vector3,outIntersection:Laya.Vector3):boolean{
		let lineDirection1=this._lineDirection1;
		let lineDirection2=this._lineDirection2;
		Laya.Vector3.subtract(lineStart1,lineEnd1,lineDirection1);
		Laya.Vector3.subtract(lineStart2,lineEnd2,lineDirection2);
		
		let lineVec3=this._tempV3;
		Laya.Vector3.subtract(lineStart2,lineStart1,lineVec3);
		let crossVec1and2=this._temp1V3;
		Laya.Vector3.cross(lineDirection1,lineDirection2,crossVec1and2);
		let crossVec3and2=this._temp2V3;
		Laya.Vector3.cross(lineVec3,lineDirection2,crossVec3and2);

		let planarFactor=Laya.Vector3.dot(lineVec3,crossVec1and2);
		//在同一个平面，且不平行
		if(Math.abs(planarFactor)<0.0001 && Laya.Vector3.scalarLengthSquared(crossVec1and2)>0.0001){
			let s=Laya.Vector3.dot(crossVec3and2,crossVec1and2) / Laya.Vector3.scalarLengthSquared(crossVec1and2);
			let isInLineSegment1=s>=-1&&s<=0;
			if(isInLineSegment1){
				Laya.Vector3.scale(lineDirection1,s,this._temp3V3);
				Laya.Vector3.add(lineStart1,this._temp3V3,outIntersection);
				
				let lineSegment2Min=this._temp4V3;
				let lineSegment2Max=this._temp5V3;
				Vector3Util.min(lineStart2,lineEnd2,lineSegment2Min);
				Vector3Util.max(lineStart2,lineEnd2,lineSegment2Max);
				let isInLineSegment2=outIntersection.x>=lineSegment2Min.x && 
									 outIntersection.y>=lineSegment2Min.y &&
									 outIntersection.z>=lineSegment2Min.z &&
									 outIntersection.x<=lineSegment2Max.x && 
									 outIntersection.y<=lineSegment2Max.y &&
									 outIntersection.z<=lineSegment2Max.z;
				if(isInLineSegment2){ 
					return true;
				}
			}
		}
		//console.log("line2Distance",Laya.Vector3.distance(lineStart2,lineEnd2));
		return false;
	}
	
	/**
	 * 输出3D空间中不平行的两条直线距离彼此最近的两个点，如果两条直线不平行则返回 true
	 * @param lineStart1 
	 * @param lineEnd1 
	 * @param lineStart2 
	 * @param lineEnd2 
	 * @param outClosestPointLine1 
	 * @param outClosestPointLine2 
	 */
	public static getClosestPointsOnTwo3DLines(lineStart1:Laya.Vector3,lineEnd1:Laya.Vector3,lineStart2:Laya.Vector3,lineEnd2:Laya.Vector3,outClosestPointLine1:Laya.Vector3,outClosestPointLine2:Laya.Vector3):boolean{
		let lineDirection1=this._lineDirection1;
		let lineDirection2=this._lineDirection2;
		Laya.Vector3.subtract(lineStart1,lineEnd1,lineDirection1);
		Laya.Vector3.subtract(lineStart2,lineEnd2,lineDirection2);
		
		let a=Laya.Vector3.dot(lineDirection1,lineDirection1);
		let b=Laya.Vector3.dot(lineDirection1,lineDirection2);
		let e=Laya.Vector3.dot(lineDirection2,lineDirection2);

		let d=a*e - b*b;

		//线段不平行
		if(d!=0){
			let r=this._tempV3;
			Laya.Vector3.subtract(lineStart1,lineStart2,r);
			let c=Laya.Vector3.dot(lineDirection1,r);
			let f=Laya.Vector3.dot(lineDirection2,r);

			let s=(b*f-c*e)/d;
			let t=(a*f-c*b)/d;
			
			Laya.Vector3.scale(lineDirection1,s,lineDirection1);
			Laya.Vector3.add(lineStart1,lineDirection1,outClosestPointLine1);
			
			Laya.Vector3.scale(lineDirection2,t,lineDirection2);
			Laya.Vector3.add(lineStart2,lineDirection2,outClosestPointLine2);
			return true;
		}
		return false;
	}
	
	/**
	 * 输出3D空间中不平行的两条线段彼此最近的两个点，如果两条线段不平行且有交点则返回 true
	 * @param lineStart1 
	 * @param lineEnd1 
	 * @param lineStart2 
	 * @param lineEnd2 
	 * @param outClosestPointLine1 
	 * @param outClosestPointLine2 
	 */
	public static getClosestPointsOnTwo3DLineSegments(lineStart1:Laya.Vector3,lineEnd1:Laya.Vector3,lineStart2:Laya.Vector3,lineEnd2:Laya.Vector3,outClosestPointLine1:Laya.Vector3,outClosestPointLine2:Laya.Vector3):boolean{
		let lineDirection1=this._lineDirection1;
		let lineDirection2=this._lineDirection2;
		Laya.Vector3.subtract(lineStart1,lineEnd1,lineDirection1);
		Laya.Vector3.subtract(lineStart2,lineEnd2,lineDirection2);
		
		let a=Laya.Vector3.dot(lineDirection1,lineDirection1);
		let b=Laya.Vector3.dot(lineDirection1,lineDirection2);
		let e=Laya.Vector3.dot(lineDirection2,lineDirection2);

		let d=a*e - b*b;

		//线段不平行
		if(d!=0){
			let r=this._tempV3;
			Laya.Vector3.subtract(lineStart1,lineStart2,r);
			let c=Laya.Vector3.dot(lineDirection1,r);
			let f=Laya.Vector3.dot(lineDirection2,r);

			let s=(b*f-c*e)/d;
			let t=(a*f-c*b)/d;
			
			if(s>=-1&&s<=0 && t>=-1&&t<=0){
				Laya.Vector3.scale(lineDirection1,s,lineDirection1);
				Laya.Vector3.add(lineStart1,lineDirection1,outClosestPointLine1);
				
				Laya.Vector3.scale(lineDirection2,t,lineDirection2);
				Laya.Vector3.add(lineStart2,lineDirection2,outClosestPointLine2);
				return true;
			}
		}
		return false;
	}

	/*/// <summary>
	/// 此函数用于找出点位于线段的哪一侧。
	/// 假设该点位于由 linePoint1 和 linePoint2 创建的直线上。如果这个点不在线段，
	/// 首先使用 ProjectPointLine() 将其投影到线上。
	/// 如果点在线段上，则返回0。
	/// 如果点在线段之外且位于 linePoint1 的一侧，则返回1。
	/// 如果点在线段之外且位于 linePoint2 的一侧，则返回2。
	/// </summary>
	public static int PointOnWhichSideOfLineSegment(Vector3 point,Vector3 linePoint1,Vector3 linePoint2){
		Vector3 lineVec=linePoint2-linePoint1;
		Vector3 pointVec=point-linePoint1;

		float dot=Vector3.Dot(pointVec,lineVec);

		//与linePoint1相比，点位于linePoint2的侧面
		if(dot>0){
			if(pointVec.magnitude<=lineVec.magnitude){
				//点在线段上
				return 0;
			}else{
				//点不在线段上，它在linePoint2的侧面
				return 2;
			}
		}else{
			//与linePoint1相比，点不在linePoint2的一侧。
			//点不在线段上，它在linePoint1的一侧。
			return 1;
		}
	}*/
	
	/**
	 * 计算点在线段的哪一侧，-1:在左侧; 0:共线; 1:在右侧;
	 * @param point 点
	 * @param lineStart 线段起始点
	 * @param lineEnd 线段结束点
	 */
	public static pointOnLine(point:Laya.Vector3,lineStart:Laya.Vector3,lineEnd:Laya.Vector3):number{
		let a=new Laya.Vector3();
		let b=new Laya.Vector3();
		let crossValue=this._tempV3;
		//求叉积
		Laya.Vector3.subtract(point,lineStart,a);
		Laya.Vector3.subtract(lineEnd,lineStart,b);
		Laya.Vector3.cross(a,b,crossValue);
		return crossValue.z;
	}
	
}