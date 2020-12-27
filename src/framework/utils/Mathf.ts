export default class Mathf{
	
	/** 度到弧度换算常量（只读）。 */
	public static readonly deg2Rad=Math.PI/180;
	
	/** 弧度到度换算常量（只读）。 */
	public static readonly rad2Deg=180/Math.PI;
	
	/** 返回最小值到最大值之间的浮点值结果。 */
	public static clamp(value:number,min:number,max:number):number{
		return value<min?min:value>max?max:value;
	}
	
	/** 将值限制在 0 与 1 之间并返回值。如果值为负，则返回 0。如果值大于 1，则返回 1。 */
	public static clamp01(value:number):number{
		return value<0?0:value>1?1:value;
	}
	
	/** 计算两个给定角度（以度为单位给定）之间的最短差异。 */
	public static deltaAngle (current:number,target:number):number{
		return 0;
	}
	
	/** 计算在范围 [a, b] 内生成插值 value 的线性参数 t */
	public static inverseLerp (a:number,b:number,value:number):number{
		return 0;
	}
	
	/** 在 a 与 b 之间按 t 进行线性插值。 */
	public static lerp(a:number,b:number,t:number):number{
		return 0;
	}
	
	/** 与 Lerp 相同，但是在值环绕 360 度时确保值正确插入。 */
	public static lerpAngle(a:number,b:number,t:number):number{
		return 0;
	}
	
	/** 在 a 与 b 之间按 t 进行线性插值，t 没有限制。 */
	public static LerpUnclamped (a:number,b:number,t:number):number{
		return 0;
	}
	
	/** 将值 current 向 target 靠近。 */
	public static moveTowards(current:number,target:number,maxDelta:number):number{
		return 0;
	}
	
	/** 随时间推移将以度为单位给定的角度逐渐改变为所需目标角度。 */
	public static moveTowardsAngle(current:number,target:number,maxDelta:number):number{
		return 0;
	}
	
	/** 对值 t 进行 pingPong 操作，使它不会大于长度，并且不会小于 0。 */
	public static pingpong(t:number,length:number):number{
		return 0;
	}
	
	/** 对值 t 进行循环，使它不会大于长度，并且不会小于 0。 */
	public static repeat(t:number,length:number):number{
		return 0;
	}
	
}