import Mathf from "./Mathf";

/** 数学类 */
export default class Mathk{
	
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
		let rhs=new Laya.Vector3();
		Laya.Vector3.subtract(point,lineStart,rhs);
		
		let vector=new Laya.Vector3();
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
		let rhs=new Laya.Vector3();
		Laya.Vector3.subtract(point,lineStart,rhs);
		
		let vector=new Laya.Vector3();
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
/*
	/// <summary> 点到线段的最小距离（垂足不超出线段） </summary>
	public static float DistancePointLine(Vector3 point,Vector3 lineStart,Vector3 lineEnd){
		return Vector3.Magnitude(ProjectPointLine(point,lineStart,lineEnd)-point);
	}
	
	/// <summary>
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
	}
	
	/// <summary>
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
	}

	/// <summary>
	/// 获取两条直线的交点。如果直线相交，则返回true，否则返回false。
	/// 注意：使用此方法必须两直线都在同一个平面上
	/// </summary>
	public static bool GetTwoLineIntersection(Vector3 lineStart1,Vector3 lineDirection1,Vector3 lineStart2,Vector3 lineDirection2,out Vector3 intersection){
		Vector3 lineVec3=lineStart2-lineStart1;
		Vector3 crossVec1and2=Vector3.Cross(lineDirection1,lineDirection2);
		Vector3 crossVec3and2=Vector3.Cross(lineVec3,lineDirection2);

		float planarFactor=Vector3.Dot(lineVec3,crossVec1and2);
		//在同一个平面，且不平行
		if(Mathf.Abs(planarFactor)<0.0001f && crossVec1and2.sqrMagnitude>0.0001f){
			float s=Vector3.Dot(crossVec3and2,crossVec1and2) / crossVec1and2.sqrMagnitude;
			intersection=lineStart1 + (lineDirection1*s);
			return true;
		}else{
			intersection=Vector3.zero;
			return false;
		}
	}

	/// <summary> 输出3D空间中不平行的两条直线距离彼此最近的两个点，如果两条直线不平行则返回True </summary>
	public static bool GetClosestPointsOnTwo3DLines(Vector3 lineStart1,Vector3 lineDirection1,Vector3 lineStart2,Vector3 lineDirection2,out Vector3 closestPointLine1,out Vector3 closestPointLine2){
		closestPointLine1=Vector3.zero;
		closestPointLine2=Vector3.zero;

		float a=Vector3.Dot(lineDirection1,lineDirection1);
		float b=Vector3.Dot(lineDirection1,lineDirection2);
		float e=Vector3.Dot(lineDirection2,lineDirection2);

		float d=a*e - b*b;

		//线段不平行
		if(d!=0.0f){
			Vector3 r=lineStart1-lineStart2;
			float c=Vector3.Dot(lineDirection1,r);
			float f=Vector3.Dot(lineDirection2,r);

			float s=(b*f-c*e)/d;
			float t=(a*f-c*b)/d;

			closestPointLine1=lineStart1+lineDirection1*s;
			closestPointLine2=lineStart2+lineDirection2*t;
			return true;
		}else{
			return false;
		}
	} 

	/// <summary>
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
	
}