/**
 * 三角形图形类库。
 *
 * 支持基于HTML元素画布的三角形绘制。
 *
 * 默认的△ABC绘制，A点位于上方，B点位于左下侧，C点位于右下侧，BC边平行于x轴。
 *
 * 边BC等同于边a，边AB等同于边c，边AC等同于边b。
 *
 * 此类库支持对绘制的三角形对象进行如下操作：
 * - 平移
 * - 基于某一点旋转
 * - 基于某一直线翻转
 * - 缩放
 * - 基于当前三角形复制一个新的三角形
 * - 获取/设置三角形的边框颜色
 * - 获取/设置三角形的填充颜色
 * - 获取/设置三角形的各边边长
 * - 将三角形某一顶点移动到其他位置
 *
 * 此类库支持如下的三角形绘制和创建方式：
 * - 创建默认的等边三角形
 * - 基于SSS三角形全等定理创建三角形
 * - 基于SAS三角形全等定理创建三角形(∠A,b,c)
 * - 基于ASA三角形全等定理创建三角形(∠B,a,∠C)
 * - 基于AAS三角形全等定理创建三角形(∠A,∠B,a)
 * - 基于HL三角形全等定理创建直角三角形(∠B为直角,a,b)
 *
 * @author Kai Liu
 */
export class Triangle {
  /**
   * 在给定的画布中，构造并绘制一个等边三角形。
   * @param name 三字母命名的三角形名称，支持字母后缀数字或'号
   * @param canvas 画布元素
   */
  constructor(name?: string, canvas?: HTMLElement);

  /**
   * 获取三角形的描边颜色。
   */
  getStrokeColor(): string;

  /**
   * 设置三角形的描边颜色。
   * @param color 颜色
   */
  setStrokeColor(color: string): void;

  /**
   * 获取三角形的描边宽度。
   */
  getStrokeWidth(): number;

  /**
   * 设置三角形的描边宽度。
   * @param width 宽度
   */
  setStrokeWidth(width: number): void;

  /**
   * 获取三角形的填充颜色。
   */
  getFillColor(): string;

  /**
   * 设置三角形的填充颜色。
   * @param color 颜色
   */
  setFillColor(color: string): void;

  /**
   * 取得三角形边长。
   * @param name 边名称，支持端点式和对角式
   */
  getSideLength(name: string): number;

  /**
   * 设置三角形边长。
   * @param sides 以边名称为key，长度为值的map
   *
   * 边名称，支持端点式和对角式
   */
  setSideLength(sides: Record<string, number>): void;

  /**
   * 将三角形某一顶点平移到其他位置（其余两点不变）。
   * @param name 点名称
   * @param deltaX 平移向量的x分量
   * @param deltaY 平移向量的y分量
   */
  movePoint(name: string, deltaX: number, deltaY: number): void;

  /**
   * 将当前三角形按照给定的向量平移。
   * @param deltaX 平移向量的x分量
   * @param deltaY 平移向量的y分量
   */
  move(deltaX: number, deltaY: number): void;

  /**
   * 保持三角形重心位置不变，按比例缩放当前三角形。
   * @param factor 缩放比例
   */
  scale(factor: number): void;

  /**
   * 将三角形以给定点为中心旋转。
   * @param angle 旋转角度（正数为顺时针旋转，负数为逆时针旋转）
   */
  rotate(angle: number): void;

  /**
   * 将三角形以给定直线为对称中翻转。
   * @param line 翻转线
   */
  flip(line: Line): void;

  /**
   * 复制当前三角形。
   *
   * 复制后的三角形会根据画布边界出现在当前三角形的附近。
   */
  copy(): Triangle;

  /**
   * 根据SSS三角形全等定理绘制三角形
   * @param length1 a边边长
   * @param length2 b边边长
   * @param length3 c边边长
   * @param name 三字母命名的三角形名称，支持字母后缀数字或'号
   * @param canvas 画布元素
   */
  static fromSSS(
    length1: number,
    length2: number,
    length3: number,
    name?: string,
    canvas?: HTMLElement
  ): Triangle;

  /**
   * 根据SAS三角形全等定理绘制三角形
   * @param length1 b边边长
   * @param angle ∠A角度
   * @param length2 c边边长
   * @param name 三字母命名的三角形名称，支持字母后缀数字或'号
   * @param canvas 画布元素
   */
  static fromSAS(
    length1: number,
    angle: number,
    length2: number,
    name?: string,
    canvas?: HTMLElement
  ): Triangle;

  /**
   * 根据ASA三角形全等定理绘制三角形
   * @param angle1 ∠B角度
   * @param length a边边长
   * @param angle2 ∠C角度
   * @param name 三字母命名的三角形名称，支持字母后缀数字或'号
   * @param canvas 画布元素
   */
  static fromASA(
    angle1: number,
    length: number,
    angle2: number,
    name?: string,
    canvas?: HTMLElement
  ): Triangle;

  /**
   * 根据AAS三角形全等定理绘制三角形
   * @param canvas 画布元素
   * @param angle1 ∠A角度
   * @param angle2 ∠B角度
   * @param length a边边长
   * @param name 三字母命名的三角形名称，支持字母后缀数字或'号
   * @param canvas 画布元素
   */
  static fromAAS(
    angle1: number,
    angle2: number,
    length: number,
    name?: string,
    canvas?: HTMLElement
  ): Triangle;

  /**
   * 根据HL三角形全等定理绘制直角三角形(∠B为直角)
   * @param hypotenuse 斜边b边长
   * @param leg 直角边a边长
   * @param name 三字母命名的三角形名称，支持字母后缀数字或'号
   * @param canvas 画布元素
   */
  static fromHL(
    hypotenuse: number,
    leg: number,
    name?: string,
    canvas?: HTMLElement
  ): Triangle;
}

/**
 * 直线类。
 *
 * 此直线类对象满足，ax+by+c=0直线方程
 */
interface Line {
  a: number;
  b: number;
  c: number;
}
